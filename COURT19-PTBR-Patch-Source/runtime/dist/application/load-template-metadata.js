import { DEFAULT_LIMITS, resolveLimits } from '../domain/limits.js';
import { readOnlyFile } from '../infrastructure/filesystem/read-only-file.js';
import { parseMetadataXml } from '../infrastructure/metadata/xml-metadata.js';
import { resolveTemplateFiles } from '../infrastructure/templates/template-files.js';
export async function loadTemplateMetadata(version, database = 'main', maxFileBytes = DEFAULT_LIMITS.maxFileBytes) {
    const { xmlPath } = resolveTemplateFiles(version, database);
    const limits = resolveLimits({ maxFileBytes });
    const bytes = await readOnlyFile(xmlPath, limits.maxFileBytes);
    return parseMetadataXml(new TextDecoder('utf-8').decode(bytes));
}
