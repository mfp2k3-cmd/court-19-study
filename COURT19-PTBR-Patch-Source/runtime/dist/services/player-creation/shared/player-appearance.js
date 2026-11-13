import { CreationPlan, creationFailure, emptyRecord } from './creation-plan.js';
export function addPlayerAppearance(plan, tables, playerId, originalHeadAssetId) {
    for (const part of ['skeletal', 'flesh', 'fat']) {
        const table = tables.get(`cp_${part}`);
        if (!table)
            continue;
        if (!table.fields.some(field => field.name === 'assetid' && field.type === 'integer')) {
            creationFailure(`Created appearance requires ${table.name}.assetid.`);
        }
        const row = emptyRecord(table);
        let donor;
        if (originalHeadAssetId !== undefined) {
            for (const name of [`cp_${part}`, `dc_${part}`]) {
                const matches = tables.get(name)?.records.filter(row => row.assetid === originalHeadAssetId) ?? [];
                if (matches.length > 1)
                    creationFailure(`Ambiguous appearance donor in ${name}.`);
                if (matches.length) {
                    donor = matches[0];
                    break;
                }
            }
        }
        for (const field of table.fields)
            if (donor && Object.hasOwn(donor, field.name))
                row[field.name] = donor[field.name];
        row.assetid = playerId;
        plan.insert(table, row);
    }
}
