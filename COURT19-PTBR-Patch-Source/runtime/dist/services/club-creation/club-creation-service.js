import { EaFileError } from '../../domain/errors.js';
import { Fc25ClubCreationService } from './fc25/fc25-club-creation-service.js';
import { Fc26ClubCreationService } from './fc26/fc26-club-creation-service.js';
import { Fc27ClubCreationService } from './fc27/fc27-club-creation-service.js';
import { FifaClubCreationService } from './fifa/fifa-club-creation-service.js';
import { validateClubInputs } from './shared/club-inputs.js';
import { clubFailure } from './shared/club-plan.js';
export class ClubCreationService {
    profile;
    constructor(profile = 'schema') {
        this.profile = profile;
    }
    create(file, input, options = {}) {
        validateClubInputs(input, options);
        if (file.source.kind !== 'database' && file.source.kind !== 'squad') {
            throw new EaFileError('UNSUPPORTED_OPERATION', 'Club creation supports standalone databases and squads.');
        }
        const candidates = file.databases.filter(database => options.databaseIndex === undefined ?
            ['teams', 'teamkits', 'leagueteamlinks'].every(name => database.tables.some(t => t.name === name)) : database.index === options.databaseIndex);
        if (candidates.length !== 1)
            clubFailure(`Expected one club database; found ${candidates.length}. Use databaseIndex and read all tables.`);
        const database = candidates[0];
        switch (this.profile) {
            case 'FC 25': return new Fc25ClubCreationService().create(database, input, options);
            case 'FC 26': return new Fc26ClubCreationService().create(database, input, options);
            case 'FC 27': return new Fc27ClubCreationService().create(database, input, options);
            case 'fifa-db':
            case 'schema': return new FifaClubCreationService(this.profile).create(database, input, options);
            default: throw new EaFileError('UNSUPPORTED_OPERATION', 'Unsupported club creation profile.');
        }
    }
}
