import type { EaFileSnapshot } from '../../domain/models.js';
import type { CreatePlayerInput, CreatePlayerOptions, CreatePlayerResult, PlayerCreationProfile } from '../../domain/player-creation-models.js';
export declare class PlayerCreationService {
    readonly profile: PlayerCreationProfile;
    constructor(profile?: PlayerCreationProfile);
    create(file: EaFileSnapshot, input: CreatePlayerInput, options?: CreatePlayerOptions): CreatePlayerResult;
}
