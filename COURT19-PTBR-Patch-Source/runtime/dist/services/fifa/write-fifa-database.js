import { resolve } from 'node:path';
import { EaFileError } from '../../domain/errors.js';
import { resolveLimits } from '../../domain/limits.js';
import { atomicWriteFile } from '../../infrastructure/filesystem/atomic-write-file.js';
import { fifaOptions, fifaPath, readFifaInputs } from './database-inputs.js';
import { serializeFifaDatabase } from './serialize-fifa-database.js';
export async function writeFifaDatabase(databasePath, xmlPath, outputPath, file, options = {}) {
    fifaOptions(options, ['limits', 'overwrite']);
    fifaPath(databasePath, 'Database path');
    fifaPath(xmlPath, 'XML path');
    fifaPath(outputPath, 'Output path');
    if (options.overwrite !== undefined && typeof options.overwrite !== 'boolean') {
        throw new EaFileError('INVALID_OPTIONS', 'overwrite must be a boolean.');
    }
    const path = resolve(outputPath);
    const descriptor = resolve(xmlPath);
    if ((process.platform === 'win32' ? path.toLowerCase() === descriptor.toLowerCase() : path === descriptor)) {
        throw new EaFileError('INVALID_OPTIONS', 'The database output cannot replace its XML descriptor.');
    }
    const limits = resolveLimits(options.limits);
    const { bytes, xml } = await readFifaInputs(databasePath, xmlPath, limits.maxFileBytes);
    const encoded = serializeFifaDatabase(bytes, xml, file, { limits });
    await atomicWriteFile(path, encoded, options.overwrite ?? false);
    return { path, byteLength: encoded.length };
}
