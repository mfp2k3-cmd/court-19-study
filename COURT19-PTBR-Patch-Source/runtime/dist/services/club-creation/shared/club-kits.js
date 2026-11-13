import { clubColor, clubColors, contrastColor } from './club-inputs.js';
import { clubFailure, clubFields, clubKey, clubTable, emptyRecord, setClubValue } from './club-plan.js';
function palette(type, colors) {
    const first = colors[0], second = colors[1] ?? contrastColor(first);
    if (type === 'home')
        return colors;
    if (type === 'away')
        return [second, first, colors[2] ?? second];
    if (type === 'goalkeeper') {
        const complement = { r: 255 - first.r, g: 255 - first.g, b: 255 - first.b };
        return [complement, contrastColor(complement), first];
    }
    return [colors[2] ?? contrastColor(second), first, second];
}
export function addClubKits(context) {
    const { database, plan, teamId, donor, input, colors } = context;
    const table = clubTable(database, 'teamkits'), results = [];
    for (const name of ['teamkitid', 'teamtechid', 'teamkittypetechid'])
        if (!table.fields.some(f => f.name === name))
            clubFailure(`Missing teamkits.${name}.`);
    const reserved = new Set();
    for (const t of database.tables)
        if (t.name !== table.name && t.fields.some(f => f.name === 'teamkitid')) {
            for (const row of t.records)
                if (typeof row.teamkitid === 'number')
                    reserved.add(row.teamkitid);
        }
    for (const [typeId, type] of ['home', 'away', 'goalkeeper', 'third'].entries()) {
        const settings = input.kits?.[type];
        if (settings === false)
            continue;
        const config = settings ?? {};
        const donorKit = config.templateKitId === undefined ?
            table.records.find(r => r.teamtechid === donor.teamid && r.teamkittypetechid === typeId && r.year === 0) ??
                table.records.find(r => r.teamtechid === donor.teamid && r.teamkittypetechid === typeId) ??
                table.records.find(r => r.teamtechid === donor.teamid) : table.records.find(r => r.teamkitid === config.templateKitId);
        if (!donorKit)
            clubFailure(`No kit template for ${type}; provide templateKitId.`);
        const row = { ...donorKit }, kitId = clubKey(plan, table, 'teamkitid', config.kitId, reserved);
        const kitColors = config.colors === undefined ? palette(type, colors) : clubColors(config.colors);
        const generic = config.generic ?? Object.hasOwn(row, 'isgeneric');
        if (generic && !Object.hasOwn(row, 'isgeneric'))
            clubFailure('This schema requires external kit textures and does not support generic kits.');
        const generated = { teamkitid: kitId, teamtechid: teamId, teamkittypetechid: typeId, year: config.year ?? 0 };
        for (const [name, value] of Object.entries(generated))
            setClubValue(row, name, value);
        for (const name of ['chestbadge', 'jerseyleftsleevebadge', 'jerseyrightsleevebadge', 'hasadvertisingkit', 'islocked', 'isembargoed', 'dlc', 'powid'])
            setClubValue(row, name, 0);
        setClubValue(row, 'isgeneric', Number(generic));
        for (const [option, field] of [['jerseyTemplateIndex', 'jerseytemplateindex'], ['shortsTemplateIndex', 'shortstemplateindex'], ['socksTemplateIndex', 'sockstemplateindex']]) {
            if (config[option] !== undefined && !Object.hasOwn(row, field))
                clubFailure(`Unsupported kit option: ${option}.`);
            setClubValue(row, field, config[option] ?? 0);
        }
        for (const [index, prefix] of ['teamcolorprim', 'teamcolorsec', 'teamcolortert'].entries()) {
            const color = kitColors[index] ?? kitColors[0];
            for (const channel of ['r', 'g', 'b'])
                setClubValue(row, `${prefix}${channel}`, color[channel]);
            setClubValue(row, `${prefix}percent`, kitColors.length === 1 ? (index === 0 ? 100 : 0) :
                kitColors.length === 2 ? ([70, 30, 0][index]) : ([70, 20, 10][index]));
        }
        const numberColor = config.numberColor === undefined ? contrastColor(kitColors[0]) : clubColor(config.numberColor);
        const outline = contrastColor(numberColor);
        for (const channel of ['r', 'g', 'b']) {
            for (const prefix of ['jerseynumbercolorprim', 'jerseynumbercolorsec', 'shortsnumbercolorprim', 'shortsnumbercolorsec', 'jerseynamecolor'])
                setClubValue(row, `${prefix}${channel}`, numberColor[channel]);
            for (const prefix of ['jerseynumbercolorter', 'shortsnumbercolorter', 'jerseynameoutlinecolor'])
                setClubValue(row, `${prefix}${channel}`, outline[channel]);
        }
        const managed = new Set([...Object.keys(generated), ...table.fields.filter(f => /^(teamcolor|jerseynumbercolor|shortsnumbercolor|jerseynamecolor|jerseynameoutlinecolor)/.test(f.name)).map(f => f.name),
            'isgeneric', 'jerseytemplateindex', 'shortstemplateindex', 'sockstemplateindex']);
        clubFields(table, row, config.fields, managed);
        plan.insert(table, row);
        const hud = database.tables.find(t => t.name === 'teamkithudvalues');
        if (config.hudPattern !== undefined && !hud)
            clubFailure('hudPattern requires teamkithudvalues.');
        if (hud) {
            const hudRow = emptyRecord(hud);
            for (const [key, value] of Object.entries({ teamkitid: kitId, teamid: teamId, kittype: typeId, pattern: config.hudPattern ?? 0 })) {
                if (!Object.hasOwn(hudRow, key))
                    clubFailure(`Missing teamkithudvalues.${key}.`);
                hudRow[key] = value;
            }
            plan.insert(hud, hudRow);
        }
        results.push({ type, typeId, kitId, colors: kitColors, generic, record: row });
    }
    return results;
}
