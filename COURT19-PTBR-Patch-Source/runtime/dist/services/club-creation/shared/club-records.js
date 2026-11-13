import { clubFailure, clubFields, clubKey, clubTable, emptyRecord, setClubValue } from './club-plan.js';
import { clearClubPlayers } from './club-tactics.js';
export function addClubTeam(context) {
    const { database, plan, input, teamId, donor, colors, gender, stadium, year } = context;
    const teams = clubTable(database, 'teams'), row = { ...donor };
    clearClubPlayers(teams, row);
    const rival = input.rivalTeamId ?? donor.teamid;
    if (!teams.records.some(t => t.teamid === rival && t.gender === gender))
        clubFailure('rivalTeamId must identify an existing team of the same gender.');
    const values = { teamid: teamId, teamname: input.name, assetid: input.assetId ?? teamId, gender,
        foundationyear: input.foundationYear ?? year, rivalteam: rival, trainingstadium: stadium.stadiumid,
        teamstadiumcapacity: stadium.capacity ?? 0, cityid: stadium.cityid ?? 0, defensivedepth: input.defensiveDepth ?? 50,
        buildupplay: 1, favoriteteamsheetid: -1, genericbanner: 1 };
    for (const name of ['overallrating', 'attackrating', 'midfieldrating', 'defenserating', 'matchdayoverallrating',
        'matchdayattackrating', 'matchdaymidfieldrating', 'matchdaydefenserating'])
        values[name] = input.baseRating ?? 70;
    for (const [index, color] of [colors[0], colors[1] ?? colors[0], colors[2] ?? colors[0]].entries()) {
        for (const channel of ['r', 'g', 'b'])
            values[`teamcolor${index + 1}${channel}`] = color[channel];
    }
    for (const field of teams.fields)
        if (/^(uefa_|prev_)/.test(field.name) || ['domesticcups', 'leaguetitles', 'numtransfersin', 'form',
            'presassetone', 'presassettwo', 'powid', 'hastifo', 'haslargeflag', 'skinnyflags', 'hasvikingclap', 'hassuncanthem',
            'iscompetitionscarfenabled', 'iscompetitionpoleflagenabled', 'iscompetitioncrowdcardsenabled', 'flamethrowercannon', 'stanchionflamethrower'].includes(field.name)) {
            setClubValue(row, field.name, field.name === 'powid' ? -1 : 0);
        }
    for (const [key, value] of Object.entries(values))
        if (Object.hasOwn(row, key))
            row[key] = value;
    const managed = new Set([...Object.keys(values), ...teams.fields.filter(f => /playerid|takerid|captainid|cksupport|thrower/.test(f.name)).map(f => f.name)]);
    clubFields(teams, row, input.fields, managed);
    plan.insert(teams, row);
    const temporary = database.tables.find(t => t.name === 'temp_teams');
    if (temporary?.records.length) {
        const mirror = emptyRecord(temporary);
        for (const key of Object.keys(mirror))
            if (Object.hasOwn(row, key))
                mirror[key] = row[key];
        plan.insert(temporary, mirror);
    }
    return row;
}
export function addClubRelations(context) {
    const { database, plan, input, teamId, stadium, countryId } = context;
    const links = clubTable(database, 'leagueteamlinks'), league = emptyRecord(links);
    const members = links.records.filter(r => r.leagueid === input.leagueId);
    for (const [key, value] of Object.entries({ teamid: teamId, leagueid: input.leagueId, prevleagueid: input.leagueId,
        currenttableposition: Math.max(0, ...members.map(r => Number(r.currenttableposition) || 0)) + 1,
        previousyeartableposition: Math.max(0, ...members.map(r => Number(r.previousyeartableposition) || 0)) + 1 }))
        setClubValue(league, key, value);
    if (Object.hasOwn(league, 'artificialkey'))
        league.artificialkey = clubKey(plan, links, 'artificialkey');
    for (const field of links.fields)
        if (/^lastgameresult/.test(field.name) && field.rangeLow !== null && field.rangeLow <= -1)
            league[field.name] = -1;
    plan.insert(links, league);
    const nations = database.tables.find(t => t.name === 'teamnationlinks');
    if (nations) {
        const row = emptyRecord(nations);
        for (const [key, value] of Object.entries({ teamid: teamId, leagueid: input.leagueId, nationid: countryId })) {
            if (!Object.hasOwn(row, key))
                clubFailure(`Missing teamnationlinks.${key}.`);
            row[key] = value;
        }
        plan.insert(nations, row);
    }
    const stadiumLinks = clubTable(database, 'teamstadiumlinks'), stadiumLink = emptyRecord(stadiumLinks);
    for (const [key, value] of Object.entries({ teamid: teamId, stadiumid: stadium.stadiumid, stadiumname: input.stadiumName ?? stadium.name ?? '' })) {
        if (Object.hasOwn(stadiumLink, key))
            stadiumLink[key] = value;
    }
    plan.insert(stadiumLinks, stadiumLink);
    const assignments = database.tables.find(t => t.name === 'stadiumassignments');
    if (input.stadiumName !== undefined) {
        if (assignments)
            plan.insert(assignments, { ...emptyRecord(assignments), teamid: teamId, stadiumcustomname: input.stadiumName });
        else if (!Object.hasOwn(stadiumLink, 'stadiumname'))
            clubFailure('This schema cannot store a custom stadium name.');
    }
    const cache = database.tables.find(t => t.name === 'teamstadiumlinkscache');
    if (cache?.records.length)
        plan.insert(cache, { ...emptyRecord(cache), teamid: teamId, stadiumid: stadium.stadiumid });
    const manager = database.tables.find(t => t.name === 'manager');
    if (!manager && input.manager !== undefined)
        clubFailure('The database has no manager table.');
}
export function addClubManager(context) {
    const { database, plan, input, teamId, countryId, gender, year } = context;
    const table = database.tables.find(t => t.name === 'manager');
    if (!table)
        return null;
    const seed = table.records.find(r => r.gender === gender && r.headclasscode === 1) ?? table.records.find(r => r.gender === gender);
    if (!seed)
        clubFailure('No manager appearance template for this gender.');
    const reserved = new Set();
    for (const t of database.tables)
        for (const r of t.records)
            if (typeof r.managerid === 'number')
                reserved.add(r.managerid);
    const managerId = clubKey(plan, table, 'managerid', input.manager?.managerId, reserved);
    const row = { ...seed };
    const values = { managerid: managerId, teamid: teamId, firstname: input.manager?.firstName ?? 'Club',
        surname: input.manager?.lastName ?? 'Manager', commonname: '', nationality: input.manager?.nationality ?? countryId,
        gender, islicensed: 0, isrewardable: 0, headclasscode: 1, hashighqualityhead: 0, trait1vweak: 0, trait1vequal: 0, trait1vstrong: 0,
        birthdate: Math.floor((Date.UTC(year - 45, 0, 1) - Date.UTC(1582, 9, 14)) / 86400000),
        managerjointeamdate: Math.floor((Date.UTC(year, 6, 1) - Date.UTC(1582, 9, 14)) / 86400000), starrating: 3 };
    if (seed.headclasscode !== 1)
        Object.assign(values, { headassetid: 0, headtypecode: 1505 });
    const nations = database.tables.find(t => t.name === 'nations');
    if (nations && !nations.records.some(r => r.nationid === values.nationality))
        clubFailure('Unknown manager nationality.');
    for (const [key, value] of Object.entries(values))
        if (Object.hasOwn(row, key))
            row[key] = value;
    clubFields(table, row, input.manager?.fields, new Set(['managerid', 'teamid', 'firstname', 'surname', 'nationality', 'gender']));
    plan.insert(table, row);
    return managerId;
}
