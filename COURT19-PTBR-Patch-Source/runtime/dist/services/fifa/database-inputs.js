import { EaFileError } from '../../domain/errors.js';
import { readOnlyFile } from '../../infrastructure/filesystem/read-only-file.js';
export function fifaOptions(options, allowed) {
    if (options === null || typeof options !== 'object' || Array.isArray(options) ||
        Object.keys(options).some(key => !allowed.includes(key))) {
        throw new EaFileError('INVALID_OPTIONS', `FIFA database options support only: ${allowed.join(', ')}.`);
    }
}
export function fifaPath(path, name) {
    if (typeof path !== 'string' || path.trim().length === 0) {
        throw new EaFileError('INVALID_OPTIONS', `${name} must be a nonempty file path.`);
    }
}
export async function readFifaInputs(databasePath, xmlPath, maxBytes) {
    fifaPath(databasePath, 'Database path');
    fifaPath(xmlPath, 'XML path');
    const [bytes, descriptor] = await Promise.all([
        readOnlyFile(databasePath, maxBytes),
        readOnlyFile(xmlPath, maxBytes),
    ]);
    try {
        return { bytes, xml: new TextDecoder('utf-8', { fatal: true }).decode(descriptor) };
    }
    catch (error) {
        throw new EaFileError('INVALID_METADATA', 'The metadata XML must contain valid UTF-8.', undefined, error);
    }
}
