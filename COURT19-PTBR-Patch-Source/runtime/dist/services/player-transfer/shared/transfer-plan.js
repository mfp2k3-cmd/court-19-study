import { EaFileError } from '../../../domain/errors.js';
export function transferFailure(message) {
    throw new EaFileError('INVALID_TRANSFER', message);
}
export function integerField(table, name, value) {
    const field = table.fields.find(field => field.name === name);
    if (!field || field.type !== 'integer' || field.rangeLow === null) {
        throw new EaFileError('UNSUPPORTED_OPERATION', `A mapped integer field is required: ${table.name}.${name}.`);
    }
    const minimum = field.rangeLow;
    const maximum = Math.min(field.rangeHigh ?? 2147483647, minimum + 2 ** field.depth - 1, 2147483647);
    if (!Number.isSafeInteger(value) || value < minimum || value > maximum) {
        transferFailure(`Value ${value} does not fit ${table.name}.${name}.`);
    }
}
export class TransferPlan {
    edits = new Map();
    removals = new Map();
    row(table, original) {
        let edit = this.edits.get(original);
        if (!edit) {
            edit = { table, values: { ...original } };
            this.edits.set(original, edit);
        }
        return edit.values;
    }
    set(table, original, name, value) {
        if (!Object.hasOwn(original, name))
            transferFailure(`Record is missing ${table.name}.${name}.`);
        integerField(table, name, value);
        this.row(table, original)[name] = value;
    }
    remove(table, original) {
        let rows = this.removals.get(table);
        if (!rows) {
            rows = new Set();
            this.removals.set(table, rows);
        }
        rows.add(original);
    }
    commit() {
        const assignments = [];
        const counts = new Map();
        for (const [row, edit] of this.edits) {
            if (this.removals.get(edit.table)?.has(row))
                continue;
            for (const [name, value] of Object.entries(edit.values)) {
                if (Object.is(row[name], value))
                    continue;
                const descriptor = Object.getOwnPropertyDescriptor(row, name);
                if (!descriptor || !('value' in descriptor) || !descriptor.writable) {
                    transferFailure(`Transfer records must be writable: ${edit.table.name}.${name}.`);
                }
                if (typeof value !== 'number')
                    transferFailure('Transfer updates must contain integer values.');
                integerField(edit.table, name, value);
                assignments.push({ row, name, value, table: edit.table });
            }
        }
        const replacements = [];
        for (const [table, removed] of this.removals) {
            const descriptor = Object.getOwnPropertyDescriptor(table, 'records');
            if (!descriptor || !('value' in descriptor) || !descriptor.writable) {
                transferFailure(`Transfer table records must be writable: ${table.name}.`);
            }
            replacements.push({ table, records: table.records.filter(row => !removed.has(row)) });
            counts.set(table, { updated: new Set(), removed: removed.size });
        }
        for (const { row, name, value, table } of assignments) {
            row[name] = value;
            let count = counts.get(table);
            if (!count) {
                count = { updated: new Set(), removed: 0 };
                counts.set(table, count);
            }
            count.updated.add(row);
        }
        for (const { table, records } of replacements)
            table.records = records;
        return [...counts].map(([table, count]) => ({ name: table.name, updatedRecords: count.updated.size, removedRecords: count.removed }));
    }
}
