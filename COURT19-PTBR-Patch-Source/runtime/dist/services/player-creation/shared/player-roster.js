import { EaFileError } from '../../../domain/errors.js';
import { CreationPlan, creationFailure, emptyRecord, integerRange } from './creation-plan.js';
import { unusedInteger } from './player-identifiers.js';
export function targetTeam(tables, id, kind) {
    const matches = tables.get('teams').records.filter(row => row.teamid === id);
    if (matches.length !== 1)
        creationFailure(`Expected one team ${id}; found ${matches.length}.`);
    const leagues = tables.get('leagues'), leagueTeams = tables.get('leagueteamlinks');
    const flags = leagueTeams.records.filter(row => row.teamid === id).map(row => {
        const matches = leagues.records.filter(league => league.leagueid === row.leagueid);
        return matches.length === 1 ? matches[0].isinternationalleague : undefined;
    });
    if (!flags.length || flags.some(flag => flag !== (kind === 'club' ? 0 : 1)))
        creationFailure(`Team ${id} must have unambiguous ${kind} league mappings.`);
    return matches[0];
}
export function addRosterMembership(plan, tables, playerId, teamId, requestedJersey) {
    const links = tables.get('teamplayerlinks');
    const roster = plan.records(links).filter(row => row.teamid === teamId);
    const sheets = ['default_teamsheets', 'teamsheets', 'cm_teamsheets'].flatMap(name => tables.has(name) ? [tables.get(name)] : []);
    const limits = sheets.filter(table => table.records.some(row => row.teamid === teamId))
        .map(table => table.fields.filter(field => /^playerid\d+$/.test(field.name)).length).filter(count => count > 0);
    const maximum = Math.min(52, ...limits);
    if (roster.length >= maximum)
        creationFailure(`Team ${teamId} has a full squad (${maximum} players).`);
    const shirt = links.fields.find(f => f.name === 'jerseynumber');
    if (!shirt)
        throw new EaFileError('UNSUPPORTED_OPERATION', 'Missing shirt number mapping.');
    const [low, high] = integerRange(shirt), used = new Set(roster.map(row => row.jerseynumber));
    let jersey = requestedJersey;
    if (jersey === undefined)
        for (let number = Math.max(1, low); number <= Math.min(99, high); number++) {
            if (!used.has(number)) {
                jersey = number;
                break;
            }
        }
    if (jersey === undefined || used.has(jersey))
        creationFailure(`No available requested shirt number for team ${teamId}.`);
    const insertLink = (table) => {
        const row = { ...emptyRecord(table), playerid: playerId, teamid: teamId, jerseynumber: jersey, position: 29 };
        if (Object.hasOwn(row, 'artificialkey'))
            row.artificialkey = unusedInteger(table, 'artificialkey', new Set(plan.records(table).map(row => row.artificialkey)), 0);
        if (Object.hasOwn(row, 'form'))
            row.form = 3;
        plan.insert(table, row);
    };
    insertLink(links);
    for (const name of ['temp_teamplayerlinks', 'teamplayerlinks_vh']) {
        const table = tables.get(name);
        if (table?.records.some(row => row.teamid === teamId))
            insertLink(table);
    }
    for (const table of sheets) {
        const slots = table.fields.map(f => f.name).filter(name => /^playerid\d+$/.test(name) && Number(name.slice(8)) >= 11)
            .sort((a, b) => Number(a.slice(8)) - Number(b.slice(8)));
        for (const row of table.records) {
            if (row.teamid !== teamId)
                continue;
            const free = slots.find(name => typeof row[name] === 'number' && row[name] <= 0);
            if (!free)
                creationFailure(`Team ${teamId} has no free reserve slot in ${table.name}.`);
            plan.update(table, row, { [free]: playerId });
        }
    }
    return jersey;
}
