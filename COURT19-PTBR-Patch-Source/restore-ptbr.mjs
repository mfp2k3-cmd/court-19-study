import fs from 'node:fs/promises';
import path from 'node:path';
import readline from 'node:readline/promises';
import { stdin as input, stdout as output } from 'node:process';

const rl = readline.createInterface({ input, output });
const ask = async q => (await rl.question(q)).trim().replace(/^"|"$/g, '');
const pruneEmpty = async (start, root) => {
  const rootFull = path.resolve(root);
  let current = path.resolve(start);
  while (current.startsWith(rootFull + path.sep) || current === rootFull) {
    let entries;
    try { entries = await fs.readdir(current); } catch { return; }
    if (entries.length) return;
    await fs.rmdir(current);
    if (current === rootFull) return;
    current = path.dirname(current);
  }
};

try {
  const dump = path.resolve(await ask('Pasta do dump NBA LIVE 19 (CUSA11355): '));
  const stat = await fs.stat(dump).catch(() => null);
  if (!stat?.isDirectory() || path.basename(dump).toUpperCase() !== 'CUSA11355') {
    throw new Error('Selecione a pasta CUSA11355 do dump.');
  }
  const mod = path.join(path.dirname(dump), path.basename(dump) + '-mods');
  const locale = path.join(mod, 'data', 'kettle', 'loc');
  const db = path.join(locale, 'eng_us.db');
  if (!(await fs.stat(db).catch(() => null))) throw new Error('Não encontrei o banco PT-BR na pasta -mods.');

  console.log('\nIsso removerá a tradução e os backups do instalador em:');
  console.log(mod);
  console.log('O dump não será alterado. Arquivos alheios ao instalador serão preservados.');
  if ((await ask('\nDigite SIM para confirmar: ')).toUpperCase() !== 'SIM') {
    console.log('Cancelado.');
    process.exitCode = 1;
  } else {
    await fs.rm(db);
    for (const name of await fs.readdir(locale)) {
      if (/^eng_us\.db\.(?:backup-.*|before-restore-.*)\.bak$/i.test(name)) {
        await fs.rm(path.join(locale, name));
      }
    }
    await pruneEmpty(locale, mod);
    console.log('\nTradução removida. O dump original permaneceu intacto.');
  }
} catch (e) {
  console.error('\nNão foi possível restaurar: ' + e.message);
  process.exitCode = 1;
} finally {
  rl.close();
}
