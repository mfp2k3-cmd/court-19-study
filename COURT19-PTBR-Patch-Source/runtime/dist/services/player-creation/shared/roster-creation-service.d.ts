import type { EaDatabase } from '../../../domain/models.js';
import type { CreatePlayerInput, CreatePlayerOptions, CreatePlayerResult, PlayerCreationProfile } from '../../../domain/player-creation-models.js';
export declare class RosterCreationService {
    readonly profile: PlayerCreationProfile;
    private readonly referenceYear;
    private readonly defaults;
    constructor(profile: PlayerCreationProfile, referenceYear: number, defaults: Readonly<Record<string, number>>);
    create(database: EaDatabase, input: CreatePlayerInput, options: CreatePlayerOptions): CreatePlayerResult;
}
