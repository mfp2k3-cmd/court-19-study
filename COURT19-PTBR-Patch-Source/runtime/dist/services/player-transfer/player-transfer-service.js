import { EaFileError } from '../../domain/errors.js';
import { Fc25PlayerTransferService } from './fc25/fc25-player-transfer-service.js';
import { Fc26PlayerTransferService } from './fc26/fc26-player-transfer-service.js';
import { Fc27PlayerTransferService } from './fc27/fc27-player-transfer-service.js';
import { FifaPlayerTransferService } from './fifa/fifa-player-transfer-service.js';
import { transferFailure } from './shared/transfer-plan.js';
export class PlayerTransferService {
    profile;
    constructor(profile = 'schema') {
        this.profile = profile;
    }
    transfer(file, playerId, teamId, options = {}) {
        const positiveId = (value) => Number.isSafeInteger(value) && value > 0 && value <= 2147483647;
        if (!positiveId(playerId) || !positiveId(teamId) || options === null || typeof options !== 'object' || Array.isArray(options) ||
            Object.keys(options).some(name => !['fromTeamId', 'jerseyNumber', 'databaseIndex'].includes(name)) ||
            (options.fromTeamId !== undefined && !positiveId(options.fromTeamId)) ||
            (options.jerseyNumber !== undefined && (!positiveId(options.jerseyNumber) || options.jerseyNumber > 99)) ||
            (options.databaseIndex !== undefined && (!Number.isSafeInteger(options.databaseIndex) || options.databaseIndex < 0))) {
            throw new EaFileError('INVALID_OPTIONS', 'Transfer IDs must be positive integers; options support fromTeamId, jerseyNumber, and databaseIndex.');
        }
        if (file.source.kind !== 'database' && file.source.kind !== 'squad') {
            throw new EaFileError('UNSUPPORTED_OPERATION', 'This transfer operation supports standalone databases and squads; career transfers require a dedicated adapter.');
        }
        const candidates = file.databases.filter(database => options.databaseIndex !== undefined
            ? database.index === options.databaseIndex
            : ['players', 'teams', 'teamplayerlinks'].every(name => database.tables.some(table => table.name === name)));
        if (candidates.length !== 1)
            transferFailure(`Expected one target database; found ${candidates.length}. Use databaseIndex when needed and read all tables.`);
        const database = candidates[0];
        switch (this.profile) {
            case 'FC 25': return new Fc25PlayerTransferService().transfer(database, playerId, teamId, options);
            case 'FC 26': return new Fc26PlayerTransferService().transfer(database, playerId, teamId, options);
            case 'FC 27': return new Fc27PlayerTransferService().transfer(database, playerId, teamId, options);
            case 'fifa-db':
            case 'schema': return new FifaPlayerTransferService(this.profile).transfer(database, playerId, teamId, options);
            default: throw new EaFileError('UNSUPPORTED_OPERATION', 'Unsupported player transfer profile.');
        }
    }
}
