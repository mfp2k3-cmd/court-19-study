import type { PlayerCreationProfile } from '../../../domain/player-creation-models.js';
import { RosterCreationService } from '../shared/roster-creation-service.js';
export declare class FifaPlayerCreationService extends RosterCreationService {
    constructor(profile?: Extract<PlayerCreationProfile, 'fifa-db' | 'schema'>);
}
