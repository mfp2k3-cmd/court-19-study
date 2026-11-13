import { RosterCreationService } from '../shared/roster-creation-service.js';
export class Fc26PlayerCreationService extends RosterCreationService {
    constructor() {
        super('FC 26', 2025, { bodytypecode: 1, headtypecode: 1505, skinsurfacepack: 223101,
            skintonecode: 2, eyecolorcode: 2, emotion: 3, growthprofile: 6 });
    }
}
