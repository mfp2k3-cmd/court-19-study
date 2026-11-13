import { resolveTemplateFiles } from '../infrastructure/templates/template-files.js';
import { readEaFile } from './read-ea-file.js';
export async function readTemplateDatabase(options) {
    const { databasePath } = resolveTemplateFiles(options.version, options.database);
    return readEaFile(databasePath, options);
}
