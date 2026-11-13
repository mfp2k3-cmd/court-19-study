import { EaFileError } from '../../domain/errors.js';
import { DecodeBudget, resolveLimits } from '../../domain/limits.js';
import { parseDatabase } from '../../infrastructure/binary/database-parser.js';
import { encodeDatabase } from '../../infrastructure/binary/database-writer.js';
import { fifaMetadata, inspectFifaDatabase, validateFifaRecordMapping } from '../../infrastructure/metadata/fifa-database-metadata.js';
import { fifaOptions } from './database-inputs.js';
export function serializeFifaDatabase(bytes, xml, file, options = {}) {
    try {
        return serialize(bytes, xml, file, options);
    }
    catch (error) {
        if (error instanceof EaFileError)
            throw error;
        throw new EaFileError('INVALID_WRITE', 'Invalid FIFA database data or write options.', undefined, error);
    }
}
function serialize(bytes, xml, file, options) {
    fifaOptions(options, ['limits']);
    const limits = resolveLimits(options.limits);
    const metadata = fifaMetadata(xml, limits.maxFileBytes);
    const layout = inspectFifaDatabase(bytes, metadata, limits);
    if (file.format !== 'fifa-db' || file.formatVersion !== 1 || file.container !== 'database' ||
        file.inGameName !== null || file.source.kind !== 'database' || file.source.byteLength !== bytes.length ||
        !Array.isArray(file.databases) || file.databases.length !== 1) {
        throw new EaFileError('INVALID_WRITE', 'FIFA database data must come from the supplied standalone database and XML.');
    }
    const database = file.databases[0];
    validateFifaRecordMapping(database, metadata);
    const selected = new Set(database.tables.map(table => table.shortName));
    const original = parseDatabase(bytes, 0, 0, new Map(), new DecodeBudget(limits), [], selected);
    const encoded = encodeDatabase(bytes, database, original, false, new DecodeBudget(limits));
    if (encoded === undefined)
        return Uint8Array.from(bytes);
    const length = encoded.length + bytes.length - layout.byteLength;
    if (length > limits.maxFileBytes)
        throw new EaFileError('LIMIT_EXCEEDED', 'Encoded database exceeds maxFileBytes.');
    const result = new Uint8Array(length);
    result.set(encoded);
    result.set(bytes.subarray(layout.byteLength), encoded.length);
    return result;
}
