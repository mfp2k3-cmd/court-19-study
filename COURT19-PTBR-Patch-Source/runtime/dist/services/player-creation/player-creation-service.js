import { EaFileError } from '../../domain/errors.js';
import { Fc25PlayerCreationService } from './fc25/fc25-player-creation-service.js';
import { Fc26PlayerCreationService } from './fc26/fc26-player-creation-service.js';
import { Fc27PlayerCreationService } from './fc27/fc27-player-creation-service.js';
import { FifaPlayerCreationService } from './fifa/fifa-player-creation-service.js';
import { creationInputs } from './shared/creation-inputs.js';
import { creationFailure } from './shared/creation-plan.js';
export class PlayerCreationService {
    profile;
    constructor(profile = 'schema') {
        this.profile = profile;
    }
    create(file, input, options = {}) {
        creationInputs(input, options);
        if (file.source.kind !== 'database' && file.source.kind !== 'squad') {
            throw new EaFileError('UNSUPPORTED_OPERATION', 'Player creation supports standalone databases and squads.');
        }
        const candidates = file.databases.filter(database => options.databaseIndex !== undefined ? database.index === options.databaseIndex :
            ['players', 'teams', 'teamplayerlinks'].every(name => database.tables.some(table => table.name === name)));
        if (candidates.length !== 1)
            creationFailure(`Expected one roster database; found ${candidates.length}. Use databaseIndex and read all tables.`);
        const database = candidates[0];
        switch (this.profile) {
            case 'FC 25': return new Fc25PlayerCreationService().create(database, input, options);
            case 'FC 26': return new Fc26PlayerCreationService().create(database, input, options);
            case 'FC 27': return new Fc27PlayerCreationService().create(database, input, options);
            case 'fifa-db':
            case 'schema': return new FifaPlayerCreationService(this.profile).create(database, input, options);
            default: throw new EaFileError('UNSUPPORTED_OPERATION', 'Unsupported player creation profile.');
        }
    }
}
