import { basename } from 'node:path';
import { resolveLimits } from '../../domain/limits.js';
import { fifaOptions, readFifaInputs } from './database-inputs.js';
import { parseFifaDatabase } from './parse-fifa-database.js';
export async function readFifaDatabase(databasePath, xmlPath, options = {}) {
    fifaOptions(options, ['fileName', 'tables', 'limits']);
    const limits = resolveLimits(options.limits);
    const { bytes, xml } = await readFifaInputs(databasePath, xmlPath, limits.maxFileBytes);
    return parseFifaDatabase(bytes, xml, { ...options, fileName: options.fileName ?? basename(databasePath) });
}
