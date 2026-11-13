import { ClubPlan, clubFailure, clubKey, clubTable, reservedClubIds } from './club-plan.js';
import { clubColors } from './club-inputs.js';
export function clubContext(database, input, options, year) {
    const names = new Set();
    if (database.tableCount !== database.tables.length || database.tables.some(t => !t.metadataComplete)) {
        clubFailure('Read the complete database with matching XML mappings; omit the tables filter.');
    }
    for (const table of database.tables) {
        if (names.has(table.name))
            clubFailure(`Duplicate table: ${table.name}.`);
        names.add(table.name);
    }
    const required = {
        leagueteamlinks: ['teamid', 'leagueid'], teamstadiumlinks: ['teamid', 'stadiumid'],
        formations: ['teamid', 'formationid'], default_teamsheets: ['teamid', 'playerid0'],
        default_mentalities: ['teamid', 'mentalityid', 'playerid0'],
        teamkits: ['teamkitid', 'teamtechid', 'teamkittypetechid',
            ...['teamcolorprim', 'teamcolorsec', 'teamcolortert'].flatMap(p => ['r', 'g', 'b'].map(c => `${p}${c}`))],
    };
    if (names.has('manager'))
        required.manager = ['managerid', 'teamid'];
    for (const [name, fields] of Object.entries(required)) {
        const table = clubTable(database, name);
        for (const field of fields)
            if (!table.fields.some(f => f.name === field && f.type === 'integer'))
                clubFailure(`Missing mapped integer ${name}.${field}.`);
    }
    if (['career_playercontract', 'career_presignedcontract'].some(name => database.tables.find(t => t.name === name)?.records.length))
        clubFailure('Active career databases are not supported.');
    const teams = clubTable(database, 'teams'), leagues = clubTable(database, 'leagues');
    for (const [table, fields] of [[teams, ['teamid', 'teamname', 'gender', 'assetid', ...[1, 2, 3].flatMap(i => ['r', 'g', 'b'].map(c => `teamcolor${i}${c}`))]],
        [leagues, ['leagueid', 'isinternationalleague']]]) {
        for (const name of fields)
            if (!table.fields.some(f => f.name === name))
                clubFailure(`Missing ${table.name}.${name} mapping.`);
    }
    const matches = leagues.records.filter(r => r.leagueid === input.leagueId);
    if (matches.length !== 1 || matches[0].isinternationalleague !== 0)
        clubFailure('Choose one existing domestic club league.');
    const league = matches[0], links = clubTable(database, 'leagueteamlinks');
    const leagueGender = league.iswomencompetition;
    const gender = input.gender ?? (leagueGender === 0 || leagueGender === 1 ? leagueGender : undefined);
    if (gender === undefined || (leagueGender !== undefined && leagueGender !== gender))
        clubFailure('Specify a gender compatible with the destination league.');
    const candidates = teams.records.filter(t => t.gender === gender && links.records.some(l => l.teamid === t.teamid &&
        leagues.records.some(g => g.leagueid === l.leagueid && g.isinternationalleague === 0)));
    const usable = (t) => clubTable(database, 'formations').records.some(f => f.teamid === t.teamid) &&
        clubTable(database, 'teamkits').records.some(k => k.teamtechid === t.teamid);
    const donor = input.templateTeamId === undefined ? candidates.find(t => usable(t) && links.records.some(l => l.teamid === t.teamid && l.leagueid === input.leagueId)) ?? candidates.find(usable) : candidates.find(t => t.teamid === input.templateTeamId);
    if (!donor)
        clubFailure('No compatible club template; provide templateTeamId from an existing club of the same gender.');
    const countryId = input.countryId ?? league.countryid;
    if (typeof countryId !== 'number' || !Number.isSafeInteger(countryId) || countryId <= 0)
        clubFailure('Provide countryId; the league has no usable country.');
    const nations = database.tables.find(t => t.name === 'nations');
    if (nations && !nations.records.some(n => n.nationid === countryId))
        clubFailure(`Unknown countryId: ${countryId}.`);
    const stadiums = clubTable(database, 'stadiums');
    const donorStadiumId = clubTable(database, 'teamstadiumlinks').records.find(r => r.teamid === donor.teamid)?.stadiumid;
    const stadium = input.stadiumId === undefined ? stadiums.records.find(s => s.islicensed === 0 && s.isstadiumavailable === 1 && s.issmallsided !== 1) ??
        stadiums.records.find(s => s.stadiumid === donorStadiumId) : stadiums.records.find(s => s.stadiumid === input.stadiumId);
    if (!stadium || typeof stadium.stadiumid !== 'number')
        clubFailure('Provide an existing stadiumId. Stadium assets are reused.');
    const plan = new ClubPlan();
    const teamId = clubKey(plan, teams, 'teamid', options.autoGenerateId === false ? input.teamId : undefined, reservedClubIds(database));
    return { database, input, plan, teamId, donor, league, countryId, gender, stadium, colors: clubColors(input.colors), year: options.referenceYear ?? year };
}
