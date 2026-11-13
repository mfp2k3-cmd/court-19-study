import type { ClubCreationProfile, CreateClubInput, CreateClubOptions, CreateClubResult } from '../../../domain/club-creation-models.js';
import type { EaDatabase } from '../../../domain/models.js';
export declare class ClubDatabaseService {
    readonly profile: ClubCreationProfile;
    private readonly year;
    private readonly mentalitiesPerClub;
    constructor(profile: ClubCreationProfile, year: number, mentalitiesPerClub: number | 'detect');
    create(database: EaDatabase, input: CreateClubInput, options: CreateClubOptions): CreateClubResult;
}
