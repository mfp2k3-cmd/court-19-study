import type { EaFileSnapshot } from '../../domain/models.js';
import type { ClubCreationProfile, CreateClubInput, CreateClubOptions, CreateClubResult } from '../../domain/club-creation-models.js';
export declare class ClubCreationService {
    readonly profile: ClubCreationProfile;
    constructor(profile?: ClubCreationProfile);
    create(file: EaFileSnapshot, input: CreateClubInput, options?: CreateClubOptions): CreateClubResult;
}
