import { EaFileError } from '../../../domain/errors.js';
import { clearRoles, updateTeamSheets } from './team-sheets.js';
import { updateTeamMentalities } from './team-mentalities.js';
import { integerField, TransferPlan, transferFailure } from './transfer-plan.js';
const requiredFields = {
    players: ['playerid', 'preferredposition1'],
    teams: ['teamid'],
    teamplayerlinks: ['playerid', 'teamid', 'jerseynumber', 'position'],
    leagues: ['leagueid', 'isinternationalleague'],
    leagueteamlinks: ['leagueid', 'teamid'],
};
const statistics = ['leagueappearances', 'leaguegoals', 'leaguegoalsprevmatch', 'leaguegoalsprevthreematches',
    'reds', 'yellows', 'isamongtopscorers', 'isamongtopscorersinteam', 'istopscorer'];
export class RosterTransferService {
    profile;
    roles;
    constructor(profile, roles) {
        this.profile = profile;
        this.roles = roles;
    }
    transfer(database, playerId, targetTeamId, options) {
        if (database.tables.length !== database.tableCount || database.tables.some(table => !table.metadataComplete)) {
            throw new EaFileError('UNSUPPORTED_OPERATION', 'Player transfers require a complete database read with matching XML mappings for every table; omit the tables filter.');
        }
        const tables = new Map();
        for (const table of database.tables) {
            if (tables.has(table.name))
                transferFailure(`Ambiguous table name: ${table.name}.`);
            tables.set(table.name, table);
        }
        for (const [name, fields] of Object.entries(requiredFields)) {
            const table = tables.get(name);
            if (!table || !table.metadataComplete || fields.some(name => !table.fields.some(field => field.name === name && field.type === 'integer'))) {
                throw new EaFileError('UNSUPPORTED_OPERATION', `Player transfers require mapped ${name} fields: ${fields.join(', ')}.`);
            }
        }
        const players = tables.get('players');
        const teams = tables.get('teams');
        const links = tables.get('teamplayerlinks');
        const leagues = tables.get('leagues');
        const leagueTeams = tables.get('leagueteamlinks');
        const matches = players.records.filter(row => row.playerid === playerId);
        if (matches.length !== 1)
            transferFailure(`Expected exactly one player ${playerId}; found ${matches.length}.`);
        const player = matches[0];
        const destinations = teams.records.filter(row => row.teamid === targetTeamId);
        if (destinations.length !== 1)
            transferFailure(`Expected exactly one destination team ${targetTeamId}; found ${destinations.length}.`);
        const destination = destinations[0];
        integerField(links, 'teamid', targetTeamId);
        if ((player.gender === 0 || player.gender === 1) && (destination.gender === 0 || destination.gender === 1) &&
            player.gender !== destination.gender)
            transferFailure('The player and destination team have different genders.');
        const leagueIndex = new Map(leagues.records.map(row => [row.leagueid, row]));
        const classify = (teamId) => {
            const flags = leagueTeams.records.filter(row => row.teamid === teamId).map(row => leagueIndex.get(row.leagueid)?.isinternationalleague);
            if (flags.length === 0 || flags.some(flag => flag !== 0 && flag !== 1) || new Set(flags).size !== 1) {
                transferFailure(`Cannot determine club/national membership for team ${teamId} from its league mappings.`);
            }
            return flags[0] === 1 ? 'national' : 'club';
        };
        if (classify(targetTeamId) !== 'club')
            transferFailure('A club transfer cannot target a national team.');
        const memberships = links.records.filter(row => row.playerid === playerId);
        const clubs = memberships.filter(row => {
            if (typeof row.teamid !== 'number')
                transferFailure('Player memberships require numeric team IDs.');
            return classify(row.teamid) === 'club';
        });
        const sources = options.fromTeamId === undefined ? clubs : clubs.filter(row => row.teamid === options.fromTeamId);
        if (sources.length !== 1) {
            transferFailure(`Expected one source club membership; found ${sources.length}. Use fromTeamId to select a specific membership.`);
        }
        const source = sources[0];
        const sourceTeamId = source.teamid;
        if (teams.records.filter(row => row.teamid === sourceTeamId).length !== 1)
            transferFailure('The source team is missing or duplicated.');
        const result = (changed, jerseyNumber, changes) => ({
            profile: this.profile, databaseIndex: database.index, playerId, fromTeamId: sourceTeamId,
            toTeamId: targetTeamId, jerseyNumber, changed, tables: changes,
        });
        if (sourceTeamId === targetTeamId) {
            if (options.jerseyNumber !== undefined && options.jerseyNumber !== source.jerseynumber) {
                transferFailure('The player already belongs to the destination; jerseyNumber only applies to a transfer.');
            }
            return result(false, source.jerseynumber, []);
        }
        if (memberships.some(row => row.teamid === targetTeamId))
            transferFailure('The player already has a separate destination membership.');
        for (const name of ['career_playercontract', 'career_presignedcontract']) {
            if (tables.get(name)?.records.some(row => row.playerid === playerId)) {
                throw new EaFileError('UNSUPPORTED_OPERATION', `Active ${name} state requires a career transfer adapter.`);
            }
        }
        const targetRoster = links.records.filter(row => row.teamid === targetTeamId);
        const sheetTables = ['default_teamsheets', 'teamsheets', 'cm_teamsheets'].flatMap(name => {
            const table = tables.get(name);
            return table ? [table] : [];
        });
        const limits = sheetTables.filter(table => table.records.some(row => row.teamid === targetTeamId))
            .map(table => table.fields.filter(field => /^playerid\d+$/.test(field.name)).length).filter(count => count > 0);
        const maximumSquad = Math.min(52, ...limits);
        if (targetRoster.length >= maximumSquad)
            transferFailure(`The destination squad is full (${maximumSquad} players).`);
        const usedNumbers = new Set(targetRoster.map(row => row.jerseynumber));
        const jerseyField = links.fields.find(field => field.name === 'jerseynumber');
        const minJersey = Math.max(1, jerseyField.rangeLow ?? 1);
        const maxJersey = Math.min(99, jerseyField.rangeHigh ?? 99);
        let jersey = options.jerseyNumber;
        if (jersey === undefined && typeof source.jerseynumber === 'number' && source.jerseynumber >= minJersey &&
            source.jerseynumber <= maxJersey && !usedNumbers.has(source.jerseynumber))
            jersey = source.jerseynumber;
        if (jersey === undefined) {
            for (let number = minJersey; number <= maxJersey; number++) {
                if (!usedNumbers.has(number)) {
                    jersey = number;
                    break;
                }
            }
        }
        if (jersey === undefined || usedNumbers.has(jersey))
            transferFailure('The requested shirt number is unavailable.');
        integerField(links, 'jerseynumber', jersey);
        const plan = new TransferPlan();
        const move = (table, row) => {
            plan.set(table, row, 'teamid', targetTeamId);
            plan.set(table, row, 'jerseynumber', jersey);
            plan.set(table, row, 'position', 29);
            for (const field of statistics)
                if (Object.hasOwn(row, field))
                    plan.set(table, row, field, 0);
        };
        move(links, source);
        for (const name of ['temp_teamplayerlinks', 'teamplayerlinks_vh']) {
            const table = tables.get(name);
            if (!table)
                continue;
            const rows = table.records.filter(row => row.playerid === playerId && row.teamid === sourceTeamId);
            if (rows.length && table.records.some(row => row.playerid === playerId && row.teamid === targetTeamId)) {
                transferFailure(`Duplicate destination membership in ${name}.`);
            }
            for (const row of rows)
                move(table, row);
        }
        const positions = new Map(players.records.map(row => [row.playerid, row.preferredposition1]));
        const remaining = links.records.filter(row => row.teamid === sourceTeamId && row.playerid !== playerId)
            .map(row => row.playerid).filter((id) => typeof id === 'number' && positions.has(id));
        const sourceTeam = teams.records.find(row => row.teamid === sourceTeamId);
        clearRoles(plan, teams, sourceTeam, playerId, this.roles, remaining.find(id => positions.get(id) !== 0) ?? remaining[0]);
        let replacement = updateTeamSheets(plan, sheetTables, playerId, sourceTeamId, targetTeamId, remaining, this.roles, positions);
        if (replacement === undefined && !tables.get('default_teamsheets')?.records.some(row => row.teamid === sourceTeamId) &&
            typeof source.position === 'number' && source.position >= 0 && source.position < 28) {
            const candidates = links.records.filter(row => row.teamid === sourceTeamId && row.playerid !== playerId &&
                typeof row.position === 'number' && row.position >= 28 && typeof row.playerid === 'number' &&
                positions.has(row.playerid) && (positions.get(row.playerid) === 0) === (source.position === 0));
            const selected = candidates.find(row => positions.get(row.playerid) === positions.get(playerId)) ?? candidates[0];
            if (!selected)
                transferFailure('The source club has no reserve to replace the departing starter.');
            replacement = selected.playerid;
        }
        if (replacement !== undefined) {
            for (const name of ['teamplayerlinks', 'temp_teamplayerlinks', 'teamplayerlinks_vh']) {
                const table = tables.get(name);
                for (const row of table?.records ?? []) {
                    if (row.playerid === replacement && row.teamid === sourceTeamId)
                        plan.set(table, row, 'position', source.position);
                }
            }
        }
        updateTeamMentalities(plan, tables, playerId, sourceTeamId, remaining, positions);
        const loans = tables.get('playerloans');
        for (const row of loans?.records ?? [])
            if (row.playerid === playerId)
                plan.remove(loans, row);
        return result(true, jersey, plan.commit());
    }
}
