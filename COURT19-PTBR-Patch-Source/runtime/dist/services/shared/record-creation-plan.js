import { EaFileError } from '../../domain/errors.js';
export function integerRange(field) {
    if (field.type !== 'integer' || field.rangeLow === null) {
        throw new EaFileError('UNSUPPORTED_OPERATION', `A mapped integer field is required: ${field.name}.`);
    }
    return [field.rangeLow, Math.min(field.rangeHigh ?? 2147483647, field.rangeLow + 2 ** field.depth - 1, 2147483647)];
}
export function validateValue(table, field, value, fail) {
    if (field.type === 'integer') {
        const [min, max] = integerRange(field);
        if (typeof value !== 'number' || !Number.isSafeInteger(value) || value < min || value > max) {
            fail(`Value ${String(value)} does not fit ${table.name}.${field.name} (${min}..${max}).`);
        }
    }
    else if (field.type === 'float') {
        if (typeof value !== 'number' || !Number.isFinite(value) || !Number.isFinite(Math.fround(value))) {
            fail(`A finite float32 is required: ${table.name}.${field.name}.`);
        }
    }
    else {
        if (typeof value !== 'string' || value.includes('\0') || new TextDecoder().decode(new TextEncoder().encode(value)) !== value) {
            fail(`Valid text without null characters is required: ${table.name}.${field.name}.`);
        }
        const limit = field.type === 'string' ? field.depth / 8 : field.type === 'short-compressed-string' ? 255 : 65535;
        if (new TextEncoder().encode(value).length > limit)
            fail(`Text exceeds ${table.name}.${field.name} (${limit} UTF-8 bytes).`);
    }
}
export function emptyRecord(table) {
    return Object.fromEntries(table.fields.map(field => [field.name, field.type === 'integer'
            ? Math.max(0, integerRange(field)[0]) : field.type === 'float' ? 0 : '']));
}
export class RecordCreationPlan {
    errorCode;
    constructor(errorCode) {
        this.errorCode = errorCode;
    }
    fail(message) { throw new EaFileError(this.errorCode, message); }
    edits = new Map();
    records(table) { return this.edits.get(table)?.records ?? table.records; }
    edit(table) {
        let edit = this.edits.get(table);
        if (!edit) {
            edit = { records: [...table.records], added: 0, updated: 0 };
            this.edits.set(table, edit);
        }
        return edit;
    }
    insert(table, values) {
        this.validate(table, values);
        const edit = this.edit(table);
        if (edit.records.length >= 65535 || table.recordSize === 0)
            this.fail(`No record space is supported in ${table.name}.`);
        edit.records.push(values);
        edit.added++;
    }
    update(table, original, values) {
        const edit = this.edit(table);
        const index = edit.records.indexOf(original);
        if (index < 0)
            this.fail(`Cannot locate the source row in ${table.name}.`);
        const row = { ...original, ...values };
        this.validate(table, row);
        edit.records[index] = row;
        edit.updated++;
    }
    validate(table, row) {
        if (Object.keys(row).length !== table.fields.length || Object.keys(row).some(name => !table.fields.some(f => f.name === name))) {
            this.fail(`Records must contain exactly the mapped fields of ${table.name}.`);
        }
        for (const field of table.fields)
            validateValue(table, field, row[field.name], message => this.fail(message));
    }
    finish(apply) {
        for (const table of this.edits.keys()) {
            const descriptor = Object.getOwnPropertyDescriptor(table, 'records');
            if (!descriptor || !('value' in descriptor) || !descriptor.writable)
                this.fail(`Table records must be writable: ${table.name}.`);
        }
        if (apply)
            for (const [table, edit] of this.edits)
                table.records = edit.records;
        return [...this.edits].map(([table, edit]) => ({ name: table.name, addedRecords: edit.added, updatedRecords: edit.updated }));
    }
}
