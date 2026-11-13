import { EaFileError } from '../../../domain/errors.js';
import { CreationPlan, creationFailure, emptyRecord } from './creation-plan.js';
import { addPlayerNames, reservedPlayerIds, unusedInteger } from './player-identifiers.js';
import { buildPlayerRecord } from './player-record.js';
import { addRosterMembership, targetTeam } from './player-roster.js';
import { playerValues } from './player-values.js';
import { addPlayerAppearance } from './player-appearance.js';
export class RosterCreationService {
    profile;
    referenceYear;
    defaults;
    constructor(profile, referenceYear, defaults) {
        this.profile = profile;
        this.referenceYear = referenceYear;
        this.defaults = defaults;
    }
    create(database, input, options) {
        if (database.tables.length !== database.tableCount || database.tables.some(table => !table.metadataComplete)) {
            throw new EaFileError('UNSUPPORTED_OPERATION', 'Player creation requires a complete database with matching XML mappings; omit the tables filter.');
        }
        const tables = new Map();
        for (const table of database.tables) {
            if (tables.has(table.name))
                creationFailure(`Duplicate table name: ${table.name}.`);
            tables.set(table.name, table);
        }
        const required = {
            players: ['playerid', 'preferredposition1', 'nationality', 'overallrating'], teams: ['teamid'],
            teamplayerlinks: ['playerid', 'teamid', 'jerseynumber', 'position'],
            leagues: ['leagueid', 'isinternationalleague'], leagueteamlinks: ['teamid', 'leagueid'],
        };
        for (const [name, fields] of Object.entries(required)) {
            const table = tables.get(name);
            if (!table || fields.some(name => !table.fields.some(field => field.name === name && field.type === 'integer'))) {
                throw new EaFileError('UNSUPPORTED_OPERATION', `Player creation requires mapped ${name} fields: ${fields.join(', ')}.`);
            }
        }
        if (['career_playercontract', 'career_presignedcontract'].some(name => (tables.get(name)?.records.length ?? 0) > 0)) {
            throw new EaFileError('UNSUPPORTED_OPERATION', 'Active career contracts require a dedicated player creation adapter.');
        }
        const team = targetTeam(tables, input.teamId, 'club');
        if (team.gender !== 0 && team.gender !== 1)
            throw new EaFileError('UNSUPPORTED_OPERATION', 'The destination team requires a mapped male/female gender.');
        if (input.nationalTeamId !== undefined && targetTeam(tables, input.nationalTeamId, 'national').gender !== team.gender) {
            creationFailure('Club and national team must have the same gender.');
        }
        const players = tables.get('players'), used = reservedPlayerIds(database);
        const generated = options.autoGenerateId ?? true;
        const playerId = generated ? unusedInteger(players, 'playerid', used) : input.playerId;
        if (used.has(playerId))
            creationFailure(`Player ID ${playerId} is already used or referenced.`);
        const year = options.referenceYear ?? this.referenceYear;
        if (input.birthDate !== undefined && input.birthDate >= `${year}-07-01`)
            creationFailure('birthDate must precede the reference season.');
        const generatedValues = playerValues(input, options);
        const { row: player, originalPlayerId, originalHeadAssetId } = buildPlayerRecord(players, input, playerId, generatedValues.position, generatedValues.values, team.gender, year, this.defaults);
        const plan = new CreationPlan();
        addPlayerNames(plan, tables, players, { firstName: input.firstName, lastName: input.lastName,
            commonName: input.commonName ?? '', jerseyName: input.jerseyName ?? input.lastName }, player);
        plan.insert(players, player);
        addPlayerAppearance(plan, tables, playerId, originalHeadAssetId);
        const temporary = tables.get('temp_players');
        if (temporary?.records.length) {
            const row = emptyRecord(temporary);
            for (const field of temporary.fields)
                if (Object.hasOwn(player, field.name))
                    row[field.name] = player[field.name];
            plan.insert(temporary, row);
        }
        const registry = tables.get('createplayer');
        if (registry) {
            if (!registry.fields.some(field => field.name === 'create_playerid'))
                throw new EaFileError('UNSUPPORTED_OPERATION', 'Missing createplayer.create_playerid mapping.');
            const row = emptyRecord(registry);
            for (const [name, value] of Object.entries({ create_playerid: playerId, create_originalplayerid: originalPlayerId ?? 0,
                commentaryid: 900000, skincolor: -1 }))
                if (Object.hasOwn(row, name))
                    row[name] = value;
            if (Object.hasOwn(row, 'create_artificialkey'))
                row.create_artificialkey = unusedInteger(registry, 'create_artificialkey', new Set(registry.records.map(row => row.create_artificialkey)), 0);
            plan.insert(registry, row);
        }
        const nameMap = tables.get('playernamemap');
        if (nameMap)
            plan.insert(nameMap, { ...emptyRecord(nameMap), playerid: playerId, commentaryid: 900000 });
        const jerseyNumber = addRosterMembership(plan, tables, playerId, input.teamId, input.jerseyNumber);
        const nationalJerseyNumber = input.nationalTeamId === undefined ? null :
            addRosterMembership(plan, tables, playerId, input.nationalTeamId, input.nationalJerseyNumber);
        const changes = plan.finish(!options.dryRun);
        return { profile: this.profile, databaseIndex: database.index, playerId, teamId: input.teamId, jerseyNumber,
            nationalJerseyNumber, idGenerated: generated, created: !options.dryRun, randomSeed: generatedValues.randomSeed,
            randomizedFields: generatedValues.randomizedFields, baseValues: generatedValues.baseValues,
            values: generatedValues.values, player, tables: changes };
    }
}
