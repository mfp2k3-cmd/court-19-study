import { RosterCreationService } from '../shared/roster-creation-service.js';
export class FifaPlayerCreationService extends RosterCreationService {
    constructor(profile = 'fifa-db') {
        super(profile, 2026, { bodytypecode: 1, headtypecode: 1505, skinsurfacepack: 223101, skintonecode: 2,
            eyecolorcode: 2, emotion: 3, growthprofile: 6 });
    }
}
