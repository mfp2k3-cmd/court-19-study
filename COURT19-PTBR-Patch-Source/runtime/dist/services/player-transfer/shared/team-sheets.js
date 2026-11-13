import { TransferPlan, transferFailure } from './transfer-plan.js';
export const baseRoles = ['captainid', 'penaltytakerid', 'freekicktakerid', 'leftfreekicktakerid',
    'rightfreekicktakerid', 'leftcornerkicktakerid', 'rightcornerkicktakerid', 'longkicktakerid',
    'cksupport1', 'cksupport2', 'cksupport3'];
export const extendedRoles = [...baseRoles, 'cksupport4', 'cksupport5', 'cksupport6', 'cksupport7',
    'cksupport8', 'cksupport9', 'throwerleft', 'throwerright'];
function emptyValue(table, name) {
    const minimum = table.fields.find(field => field.name === name)?.rangeLow;
    if (minimum === null || minimum === undefined || minimum > 0) {
        transferFailure(`No supported empty value exists for ${table.name}.${name}.`);
    }
    return minimum < 0 ? -1 : 0;
}
export function clearRoles(plan, table, original, playerId, roles, replacement) {
    for (const name of roles) {
        if (original[name] === playerId)
            plan.set(table, original, name, replacement ?? emptyValue(table, name));
    }
}
export function updateTeamSheets(plan, tables, playerId, sourceTeamId, targetTeamId, remaining, roles, positions) {
    const remainingIds = new Set(remaining);
    let defaultReplacement;
    for (const table of tables) {
        const slots = table.fields.map(field => field.name).filter(name => /^playerid\d+$/.test(name))
            .sort((a, b) => Number(a.slice(8)) - Number(b.slice(8)));
        for (const original of table.records) {
            if (original.teamid !== sourceTeamId && original.teamid !== targetTeamId)
                continue;
            const row = plan.row(table, original);
            if (original.teamid === sourceTeamId) {
                if (slots.filter(name => row[name] === playerId).length > 1) {
                    transferFailure(`The source has duplicate player slots in ${table.name}.`);
                }
                for (const name of slots) {
                    if (row[name] !== playerId)
                        continue;
                    if (Number(name.slice(8)) < 11) {
                        const starterIds = new Set(slots.filter(slot => Number(slot.slice(8)) < 11).map(slot => row[slot]));
                        const goalkeeperSlot = Number(name.slice(8)) === 0;
                        const eligible = (id) => (positions.get(id) === 0) === goalkeeperSlot;
                        const benchSlots = slots.filter(slot => Number(slot.slice(8)) >= 11 && typeof row[slot] === 'number' &&
                            remainingIds.has(row[slot]) && !starterIds.has(row[slot]) && eligible(row[slot]));
                        const bench = benchSlots.find(slot => positions.get(row[slot]) === positions.get(playerId)) ?? benchSlots[0];
                        const replacement = bench ? row[bench] : remaining.find(id => eligible(id) && !slots.some(slot => row[slot] === id));
                        if (replacement === undefined)
                            transferFailure(`The source team has no replacement for starting slot ${table.name}.${name}.`);
                        if (table.name === 'default_teamsheets') {
                            if (defaultReplacement !== undefined && defaultReplacement !== replacement) {
                                transferFailure('Source default team sheets disagree on the replacement player.');
                            }
                            defaultReplacement = replacement;
                        }
                        plan.set(table, original, name, replacement);
                        if (bench)
                            plan.set(table, original, bench, emptyValue(table, bench));
                    }
                    else
                        plan.set(table, original, name, emptyValue(table, name));
                }
                for (let index = 0; index < 3; index++) {
                    const names = [`customsub${index}in`, `customsub${index}out`];
                    if (!names.some(name => row[name] === playerId))
                        continue;
                    for (const name of names) {
                        if (Object.hasOwn(original, name))
                            plan.set(table, original, name, emptyValue(table, name));
                    }
                }
                const candidates = slots.map(slot => row[slot]).filter((id) => typeof id === 'number' && remainingIds.has(id));
                const replacement = candidates.find(id => positions.get(id) !== 0) ?? candidates[0];
                clearRoles(plan, table, original, playerId, roles, replacement ?? remaining[0]);
            }
            else {
                const matches = slots.filter(name => row[name] === playerId);
                if (matches.length > 1)
                    transferFailure(`The destination has duplicate player slots in ${table.name}.`);
                if (matches.length === 1 || slots.length === 0)
                    continue;
                const empty = slots.find(name => Number(name.slice(8)) >= 11 && typeof row[name] === 'number' && row[name] <= 0);
                if (!empty)
                    transferFailure(`The destination has no free reserve slot in ${table.name}.`);
                plan.set(table, original, empty, playerId);
            }
        }
    }
    return defaultReplacement;
}
