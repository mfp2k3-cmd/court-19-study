import { RosterCreationService } from '../shared/roster-creation-service.js';
export class Fc27PlayerCreationService extends RosterCreationService {
    constructor() {
        super('FC 27', 2026, { bodytypecode: 1, headtypecode: 1505, skinsurfacepack: 223101,
            skintonecode: 20, skincomplexion: 1, eyecolorcode: 2, emotion: 3, growthprofile: 6 });
    }
}
