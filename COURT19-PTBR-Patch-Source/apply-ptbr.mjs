import { FifaDatabaseService } from './runtime/dist/index.js';
import fs from 'node:fs/promises';
import path from 'node:path';
import os from 'node:os';
import readline from 'node:readline/promises';
import { stdin as input, stdout as output } from 'node:process';

const argValue = name => { const i = process.argv.indexOf(name); return i >= 0 ? process.argv[i + 1] : ''; };
const dumpArg = argValue('--dump');
const outArg = argValue('--out');
if (Boolean(dumpArg) !== Boolean(outArg)) { console.error('Use os argumentos --dump e --out juntos.'); process.exit(2); }
const rl = dumpArg ? null : readline.createInterface({ input, output });
const ask = async label => rl ? (await rl.question(label)).trim().replace(/^"|"$/g, '') : '';
const fail = message => { throw new Error(message); };
const align16 = value => Math.ceil(value / 16) * 16;
const djb2 = value => {
  let hash = 5381;
  for (const byte of Buffer.from(value, 'latin1')) hash = (Math.imul(hash, 33) + byte) >>> 0;
  return hash >>> 0;
};

async function readAt(handle, position, length) {
  const buffer = Buffer.alloc(length);
  const { bytesRead } = await handle.read(buffer, 0, length, position);
  if (bytesRead !== length) fail('Arquivo BIG truncado ao ler índice/cabeçalho.');
  return buffer;
}

async function findLanguageMembers(root) {
  const candidates = [];
  const pending = [root];
  while (pending.length) {
    const dir = pending.pop();
    let entries;
    try { entries = await fs.readdir(dir, { withFileTypes: true }); }
    catch { continue; }
    for (const entry of entries) {
      const full = path.join(dir, entry.name);
      if (entry.isDirectory()) pending.push(full);
      else if (entry.isFile() && entry.name.toLowerCase().endsWith('.big')) {
        let handle;
        try {
          handle = await fs.open(full, 'r');
          const stat = await handle.stat();
          if (stat.size < 48) continue;
          const h = await readAt(handle, 0, 32);
          if (h[0] !== 0x45 || h[1] !== 0x42 || h[2] !== 0 || h[3] !== 3) continue;
          const count = h.readUInt32BE(4);
          const shift = h[10];
          const base = h.readUInt32BE(12);
          const nameHeaderSize = h.readUInt32BE(16);
          const pathSize = h[20];
          const dirSize = h[21];
          const dirCount = h.readUInt16BE(22);
          const declaredSize = Number(h.readBigUInt64BE(24));
          if (!count || count > 1000000 || shift > 31 || pathSize < 3 || !dirSize || declaredSize !== stat.size) continue;

          // NBA LIVE 19 uses NewBig entries with a 20-byte hash index plus one flag byte.
          const expectedBase = align16(48 + count * 21);
          if (base !== expectedBase) continue;
          const pathEnd = base + count * pathSize;
          const dirsStart = align16(pathEnd);
          const dirsEnd = align16(dirsStart + dirCount * dirSize);
          if (dirsEnd > stat.size || nameHeaderSize !== dirsEnd - base) continue;

          const dirsBuffer = await readAt(handle, dirsStart, dirCount * dirSize);
          const dirs = [];
          for (let i = 0; i < dirCount; i++) {
            const entryBytes = dirsBuffer.subarray(i * dirSize, (i + 1) * dirSize);
            const nul = entryBytes.indexOf(0);
            if (nul < 0) fail('Diretório BIG inválido (sem terminador).');
            dirs.push(entryBytes.subarray(0, nul).toString('latin1'));
          }
          const paths = await readAt(handle, base, count * pathSize);
          const alignment = 2 ** shift;
          for (let i = 0; i < count; i++) {
            const record = paths.subarray(i * pathSize, (i + 1) * pathSize);
            const directoryIndex = record.readUInt16BE(0);
            const nul = record.indexOf(0, 2);
            if (directoryIndex >= dirs.length || nul < 0) continue;
            const filename = record.subarray(2, nul).toString('latin1');
            const memberPath = (dirs[directoryIndex] ? dirs[directoryIndex] + '/' : '') + filename;
            if (filename.toLowerCase() !== 'eng_us.db' && !memberPath.toLowerCase().endsWith('/eng_us.db')) continue;

            const index = await readAt(handle, 48 + i * 20, 20);
            const offset = index.readUInt32BE(0) * alignment;
            const refpackSize = index.readUInt32BE(4);
            const dataSize = index.readUInt32BE(8);
            const storedHash = index.readUInt32BE(16);
            if (storedHash !== djb2(memberPath) && storedHash !== djb2(filename)) continue;
            if (offset > stat.size || dataSize > stat.size - offset || !dataSize) continue;
            const prefix = await readAt(handle, offset, Math.min(dataSize, 8));
            candidates.push({
              archive: full,
              display: path.relative(root, full),
              memberPath,
              offset,
              refpackSize,
              dataSize,
              prefix: prefix.toString('latin1'),
              priority: /(^|[\\/])patch_b\.big$/i.test(full) ? 3 :
                        /(^|[\\/])patch\.big$/i.test(full) ? 2 :
                        /(^|[\\/])fe_fix_demo\.big$/i.test(full) ? 1 : 0,
            });
          }
        } catch (e) {
          if (e.message?.includes('truncado')) throw e;
        } finally {
          await handle?.close().catch(() => {});
        }
      }
    }
  }
  candidates.sort((a, b) => b.priority - a.priority || a.display.localeCompare(b.display));
  return candidates;
}

async function extractRawMember(candidate, destination) {
  if (!candidate.prefix.startsWith('DB\\0') && !candidate.prefix.startsWith('DB')) {
    fail('O eng_us.db encontrado em ' + candidate.display + ' usa compressão/formato não previsto (' +
      JSON.stringify(candidate.prefix) + '). Nenhum arquivo do dump foi alterado.');
  }
  const handle = await fs.open(candidate.archive, 'r');
  try {
    const data = await readAt(handle, candidate.offset, candidate.dataSize);
    if (data.length < 16 || data.subarray(0, 2).toString('ascii') !== 'DB') {
      fail('A entrada localizada não parece ser um banco eng_us.db válido.');
    }
    await fs.writeFile(destination, data, { flag: 'wx' });
  } finally {
    await handle.close();
  }
}

function validateAndApply(db, patch) {
  const tables = db.databases?.[0]?.tables;
  const table = tables?.find(t => t.name === 'LanguageStrings') || tables?.[0];
  const records = table?.records;
  if (!Array.isArray(records) || records.length !== patch.expectedRecordCount) {
    return 'Banco incompatível: esperava ' + patch.expectedRecordCount + ' registros de idioma.';
  }
  const byId = new Map(records.map(record => [record.stringid, record]));
  const seen = new Set();
  for (const [id, text] of patch.changedStrings) {
    if (seen.has(id)) return 'Identificador duplicado no patch: ' + id;
    seen.add(id);
    if (!byId.has(id)) return 'Banco sem o identificador ' + id + '.';
    if (typeof text !== 'string') return 'Texto inválido no patch para ' + id + '.';
  }
  for (const [id, text] of patch.changedStrings) byId.get(id).sourcetext = text;
  return null;
}

try {
  if (Number(process.versions.node.split('.')[0]) < 24) fail('Este instalador precisa do Node.js 24 ou mais recente.');
  console.log('COURT 19 — Patch local de textos PT-BR');
  console.log('Selecione a pasta do dump CUSA11355. O original e os arquivos BIG serão somente lidos.');
  const dumpRoot = path.resolve(dumpArg || await ask('\nPasta do dump NBA LIVE 19 (ex.: F:\\shadPS4\\ROMS\\CUSA11355): '));
  const dumpStat = await fs.stat(dumpRoot).catch(() => null);
  if (!dumpStat?.isDirectory()) fail('Não encontrei a pasta do dump informada.');

  const defaultModRoot = path.join(path.dirname(dumpRoot), path.basename(dumpRoot) + '-mods');
  const modRoot = path.resolve(outArg || await ask('Pasta do mod [Enter para ' + defaultModRoot + ']: ') || defaultModRoot);
  const outDir = path.join(modRoot, 'data', 'kettle', 'loc');
  const patch = JSON.parse(await fs.readFile(new URL('./pt-BR-diff.json', import.meta.url), 'utf8'));
  const { fileURLToPath } = await import('node:url');
  const meta = fileURLToPath(new URL('./eng_us-meta.xml', import.meta.url));
  const members = await findLanguageMembers(dumpRoot);
  if (!members.length) fail('Não encontrei data/kettle/loc/eng_us.db em arquivos BIG compatíveis dentro da pasta escolhida.');

  console.log('\nEntradas encontradas:');
  for (const [i, item] of members.entries()) {
    console.log('  ' + (i + 1) + '. ' + item.display + ' — ' + item.memberPath +
      ' (' + item.dataSize.toLocaleString('pt-BR') + ' bytes)');
  }

  const tempDir = await fs.mkdtemp(path.join(os.tmpdir(), 'court19-ptbr-'));
  let chosen = null;
  let chosenDb = null;
  let lastProblem = '';
  try {
    const svc = new FifaDatabaseService();
    for (const item of members) {
      const extracted = path.join(tempDir, 'eng_us-' + members.indexOf(item) + '.db');
      try {
        await extractRawMember(item, extracted);
        const db = await svc.read(extracted, meta);
        const problem = validateAndApply(db, patch);
        if (!problem) {
          chosen = item;
          chosenDb = db;
          break;
        }
        lastProblem = item.display + ': ' + problem;
      } catch (e) {
        lastProblem = item.display + ': ' + e.message;
      }
    }
    if (!chosen) fail('Não encontrei uma versão compatível do banco. ' + lastProblem);

    await fs.mkdir(outDir, { recursive: true });
    const dest = path.join(outDir, 'eng_us.db');
    const tempOutput = path.join(tempDir, 'eng_us-ptbr.db');
    await svc.write(path.join(tempDir, 'eng_us-' + members.indexOf(chosen) + '.db'), meta, tempOutput, chosenDb);

    const stamp = new Date().toISOString().replace(/[-:TZ.]/g, '').slice(0, 14);
    let backup = '';
    if (await fs.stat(dest).catch(() => null)) {
      backup = path.join(outDir, 'eng_us.db.backup-' + stamp + '.bak');
      await fs.copyFile(dest, backup);
    }
    await fs.copyFile(tempOutput, dest);
    console.log('\nConcluído: ' + patch.changedStrings.length.toLocaleString('pt-BR') + ' textos aplicados.');
    console.log('Banco extraído automaticamente de: ' + chosen.display);
    console.log('Sobreposição gerada: ' + dest);
    if (backup) console.log('Cópia anterior preservada: ' + backup);
    console.log('O dump original e os BIG não foram modificados.');
  } finally {
    await fs.rm(tempDir, { recursive: true, force: true });
  }
} catch (e) {
  console.error('\nNão foi possível aplicar: ' + e.message);
  process.exitCode = 1;
} finally {
  rl?.close();
}
