import { EaFileError } from '../../../domain/errors.js';
import { integerRange, RecordCreationPlan } from '../../shared/record-creation-plan.js';
export { emptyRecord } from '../../shared/record-creation-plan.js';
export function clubFailure(message) { throw new EaFileError('INVALID_CLUB_CREATION', message); }
export class ClubPlan extends RecordCreationPlan {
    constructor() { super('INVALID_CLUB_CREATION'); }
}
export function clubTable(database, name) {
    return database.tables.find(t => t.name === name) ?? clubFailure(`Read the complete mapped club database, including ${name}.`);
}
export function clubKey(plan, table, name, requested, reserved = new Set(), count = 1) {
    const field = table.fields.find(f => f.name === name) ?? clubFailure(`Missing ${table.name}.${name}.`);
    const [low, max] = integerRange(field), min = Math.max(1, low);
    const used = new Set(reserved);
    for (const row of plan.records(table))
        if (typeof row[name] === 'number')
            used.add(row[name]);
    const free = (value) => Number.isSafeInteger(value) && value >= min && value + count - 1 <= max &&
        Array.from({ length: count }, (_, i) => value + i).every(id => !used.has(id));
    if (requested !== undefined)
        return free(requested) ? requested : clubFailure(`Unavailable ${table.name}.${name}: ${requested}.`);
    let next = min;
    for (const value of used)
        if (value >= next && value <= max)
            next = value + 1;
    if (free(next))
        return next;
    for (next = min; next <= max - count + 1; next++)
        if (free(next))
            return next;
    return clubFailure(`No unused ${table.name}.${name} remains.`);
}
export function reservedClubIds(database) {
    const ids = new Set();
    for (const table of database.tables)
        for (const field of table.fields) {
            if (!/team_?id\d*$/.test(field.name) && field.name !== 'teamtechid' && field.name !== 'rivalteam' &&
                !(table.name === 'teams' && field.name === 'assetid'))
                continue;
            for (const row of table.records) {
                const value = row[field.name];
                if (typeof value === 'number' && value > 0)
                    ids.add(value);
            }
        }
    return ids;
}
export function clubFields(table, row, fields, managed) {
    for (const [name, value] of Object.entries(fields ?? {})) {
        if (!Object.hasOwn(row, name) || managed.has(name))
            clubFailure(`Use the dedicated option for managed fields; unknown field: ${table.name}.${name}.`);
        row[name] = value;
    }
}
export function setClubValue(row, name, value) {
    if (Object.hasOwn(row, name))
        row[name] = value;
}
