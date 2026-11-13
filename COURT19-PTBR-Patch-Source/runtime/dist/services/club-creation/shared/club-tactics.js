import { clubFailure, clubFields, clubKey, clubTable, emptyRecord, setClubValue } from './club-plan.js';
export function clearClubPlayers(table, row) {
    for (const field of table.fields)
        if (/^(playerid\d*|customsub\d+(in|out)|cksupport\d+)$/.test(field.name) ||
            /^(captainid|.*kicktakerid|penaltytakerid|throwerleft|throwerright)$/.test(field.name)) {
            row[field.name] = field.rangeLow !== null && field.rangeLow <= -1 ? -1 : 0;
        }
}
function matchingFormation(row, formation) {
    for (const name of Object.keys(row))
        if (/^(offset\d+[xy]|position\d+|pos\d+role|formationaudioid|formationfullnameid)$/.test(name) &&
            Object.hasOwn(formation, name))
            row[name] = formation[name];
}
export function addClubTactics(context, mentalitiesPerClub) {
    const { database, plan, input, donor, teamId } = context;
    const formations = clubTable(database, 'formations');
    const source = input.formation?.templateFormationId === undefined ? formations.records.find(r => r.teamid === donor.teamid) ??
        formations.records.find(r => r.teamid === -1) : formations.records.find(r => r.formationid === input.formation.templateFormationId);
    if (!source)
        clubFailure('No formation template; provide formation.templateFormationId.');
    const reserved = new Set();
    for (const table of database.tables)
        for (const field of table.fields.filter(f => /^(sourceformationid|formationid)$/.test(f.name))) {
            for (const row of table.records) {
                const value = row[field.name];
                if (typeof value === 'number')
                    reserved.add(value);
            }
        }
    const formationId = clubKey(plan, formations, 'formationid', input.formation?.formationId, reserved);
    const formation = { ...source, teamid: teamId, formationid: formationId };
    clubFields(formations, formation, input.formation?.fields, new Set(['teamid', 'formationid']));
    plan.insert(formations, formation);
    for (const table of database.tables.filter(t => ['default_teamsheets', 'teamsheets', 'cm_teamsheets'].includes(t.name))) {
        const originals = table.records.filter(r => r.teamid === donor.teamid);
        const seeds = table.name === 'default_teamsheets' ? [originals[0] ?? emptyRecord(table)] : originals;
        for (const seed of seeds) {
            const row = { ...seed, teamid: teamId };
            clearClubPlayers(table, row);
            const sheetKeys = ['teamsheetid', 'sheetid'].filter(key => Object.hasOwn(row, key));
            for (const key of sheetKeys)
                row[key] = clubKey(plan, table, key);
            setClubValue(row, 'sourceformationid', formationId);
            plan.insert(table, row);
            if (table.name !== 'default_teamsheets') {
                const mentalityTable = database.tables.find(t => t.name === (table.name === 'cm_teamsheets' ? 'cm_mentalities' : 'mentalities'));
                if (mentalityTable)
                    for (const original of mentalityTable.records.filter(r => r.teamid === donor.teamid &&
                        sheetKeys.every(key => r[key] === seed[key]) && (seed.profileid === undefined || r.profileid === seed.profileid))) {
                        const mentality = { ...original, teamid: teamId };
                        for (const key of sheetKeys)
                            setClubValue(mentality, key, row[key]);
                        clearClubPlayers(mentalityTable, mentality);
                        matchingFormation(mentality, formation);
                        setClubValue(mentality, 'sourceformationid', formationId);
                        plan.insert(mentalityTable, mentality);
                    }
            }
        }
    }
    clubTable(database, 'default_teamsheets');
    const mentalities = clubTable(database, 'default_mentalities');
    const headIndex = mentalities.records.findIndex(r => r.teamid === donor.teamid);
    const head = mentalities.records[headIndex];
    if (!head)
        clubFailure('The template club has no default mentality.');
    const count = mentalitiesPerClub === 'detect' ? (head.mentalityid === 0 && mentalities.records.some(r => r.teamid !== donor.teamid && r.teamid !== -1 && r.mentalityid === 0) ? 1 : 5) : mentalitiesPerClub;
    const start = count === 1 ? 0 : clubKey(plan, mentalities, 'mentalityid', undefined, new Set(), count);
    for (let i = 0; i < count; i++) {
        const candidate = mentalities.records[headIndex + i];
        const seed = i === 0 || candidate?.teamid === -1 && candidate.mentalityid === Number(head.mentalityid) + i ? candidate : head;
        const row = { ...seed, teamid: i === 0 ? teamId : -1, mentalityid: start + i };
        clearClubPlayers(mentalities, row);
        matchingFormation(row, formation);
        setClubValue(row, 'sourceformationid', formationId);
        setClubValue(row, 'defensivedepth', input.defensiveDepth ?? 50);
        plan.insert(mentalities, row);
    }
    const mirror = database.tables.find(t => t.name === 'cm_default_mentalities');
    if (mirror?.records.some(r => r.teamid === donor.teamid)) {
        const index = mirror.records.findIndex(r => r.teamid === donor.teamid), first = mirror.records[index];
        for (let i = 0; i < count; i++) {
            const candidate = mirror.records[index + i];
            const seed = i === 0 || candidate?.teamid === -1 && candidate.mentalityid === Number(first.mentalityid) + i ? candidate : first;
            const row = { ...seed, teamid: i === 0 ? teamId : -1, mentalityid: start + i };
            clearClubPlayers(mirror, row);
            matchingFormation(row, formation);
            setClubValue(row, 'sourceformationid', formationId);
            setClubValue(row, 'defensivedepth', input.defensiveDepth ?? 50);
            plan.insert(mirror, row);
        }
    }
    for (const table of database.tables.filter(t => ['defaultteamdata', 'temp_formations', 'teamformationteamstylelinks'].includes(t.name))) {
        const originals = table.records.filter(r => r.teamid === donor.teamid);
        const seeds = table.name === 'defaultteamdata' ? [originals[0] ?? emptyRecord(table)] : originals;
        for (const seed of seeds) {
            const row = { ...seed, teamid: teamId };
            matchingFormation(row, formation);
            setClubValue(row, 'formationid', formationId);
            setClubValue(row, 'defensivedepth', input.defensiveDepth ?? 50);
            plan.insert(table, row);
        }
    }
    return formationId;
}
