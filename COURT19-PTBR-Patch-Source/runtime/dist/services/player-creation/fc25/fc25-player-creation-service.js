import { RosterCreationService } from '../shared/roster-creation-service.js';
export class Fc25PlayerCreationService extends RosterCreationService {
    constructor() {
        super('FC 25', 2024, { height: 180, weight: 77, bodytypecode: 1, headtypecode: 1505,
            skinsurfacepack: 223101, skintonecode: 2, eyecolorcode: 2, emotion: 3, growthprofile: 6 });
    }
}
