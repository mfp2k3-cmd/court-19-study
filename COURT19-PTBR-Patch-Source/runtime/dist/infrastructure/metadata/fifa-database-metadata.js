import { EaFileError } from '../../domain/errors.js';
import { DecodeBudget } from '../../domain/limits.js';
import { BinaryReader } from '../binary/binary-reader.js';
import { hasDatabaseSignature, parseDatabase } from '../binary/database-parser.js';
import { indexMetadata } from './schema-index.js';
import { parseMetadataXml } from './xml-metadata.js';
export function fifaMetadata(xml, maxBytes) {
    if (typeof xml !== 'string')
        throw new EaFileError('INVALID_OPTIONS', 'A metadata XML string is required.');
    if (new TextEncoder().encode(xml).length > maxBytes) {
        throw new EaFileError('LIMIT_EXCEEDED', 'Metadata XML exceeds maxFileBytes.');
    }
    const schema = parseMetadataXml(xml);
    const names = new Set();
    for (const table of schema.tables) {
        if (names.has(table.name))
            throw new EaFileError('INVALID_METADATA', `Duplicate XML table name: ${table.name}.`);
        names.add(table.name);
    }
    return indexMetadata(schema);
}
export function inspectFifaDatabase(bytes, metadata, limits) {
    if (!(bytes instanceof Uint8Array))
        throw new EaFileError('INVALID_OPTIONS', 'Database bytes must be a Uint8Array.');
    if (bytes.length > limits.maxFileBytes)
        throw new EaFileError('LIMIT_EXCEEDED', 'Database exceeds maxFileBytes.');
    if (!hasDatabaseSignature(bytes, 0)) {
        throw new EaFileError('INVALID_FORMAT', 'FIFA database services require a standalone DB database at offset zero.', 0);
    }
    const layout = parseDatabase(bytes, 0, 0, metadata, new DecodeBudget(limits), [], new Set());
    const reader = new BinaryReader(bytes, layout.endianness, 0, layout.byteLength);
    const base = 28 + layout.tableCount * 8;
    for (let index = 0; index < layout.tableCount; index++) {
        const entry = 24 + index * 8;
        const code = reader.text(entry, 4);
        const offset = base + reader.u32(entry + 4);
        const definition = metadata.get(code);
        if (definition === undefined) {
            throw new EaFileError('INVALID_METADATA', `XML does not map database table ${code}.`, entry);
        }
        const count = reader.u8(offset + 24);
        reader.ensure(offset + 36, count * 16);
        const codes = new Set();
        for (let field = 0; field < count; field++) {
            const position = offset + 36 + field * 16 + 8;
            const fieldCode = reader.text(position, 4);
            if (codes.has(fieldCode))
                throw new EaFileError('INVALID_FORMAT', `Duplicate field code: ${code}.${fieldCode}.`, position);
            codes.add(fieldCode);
            if (!definition.fields.has(fieldCode)) {
                throw new EaFileError('INVALID_METADATA', `XML does not map database field ${code}.${fieldCode}.`, position);
            }
        }
    }
    return layout;
}
export function validateFifaRecordMapping(database, metadata) {
    if (!Array.isArray(database.tables))
        throw new EaFileError('INVALID_WRITE', 'Database tables must be an array.');
    for (const table of database.tables) {
        const definition = metadata.get(table.shortName);
        if (definition === undefined || table.name !== definition.definition.name || !Array.isArray(table.fields)) {
            throw new EaFileError('INVALID_WRITE', 'Written table names must match the supplied XML.');
        }
        for (const field of table.fields) {
            const expected = definition.fields.get(field.shortName);
            if (expected === undefined || field.name !== expected.name || field.rangeLow !== expected.rangeLow ||
                field.rangeHigh !== expected.rangeHigh) {
                throw new EaFileError('INVALID_WRITE', `Written field mapping must match the supplied XML: ${table.shortName}.${field.shortName}.`);
            }
        }
    }
}
