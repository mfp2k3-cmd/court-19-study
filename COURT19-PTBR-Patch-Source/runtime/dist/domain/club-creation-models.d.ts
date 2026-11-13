import type { EaRecord, RecordValue } from './models.js';
import type { EaFcVersion } from './templates.js';
export interface RgbColor {
    readonly r: number;
    readonly g: number;
    readonly b: number;
}
export type ClubColor = `#${string}` | RgbColor;
export type ClubColors = readonly [ClubColor, ...ClubColor[]];
export type ClubCreationProfile = EaFcVersion | 'fifa-db' | 'schema';
export type ClubKitType = 'home' | 'away' | 'goalkeeper' | 'third';
export interface ClubKitInput {
    readonly kitId?: number;
    readonly templateKitId?: number;
    readonly colors?: ClubColors;
    readonly numberColor?: ClubColor;
    readonly generic?: boolean;
    readonly year?: number;
    readonly jerseyTemplateIndex?: number;
    readonly shortsTemplateIndex?: number;
    readonly socksTemplateIndex?: number;
    readonly hudPattern?: number;
    readonly fields?: Readonly<Record<string, RecordValue>>;
}
export interface ClubFormationInput {
    readonly formationId?: number;
    readonly templateFormationId?: number;
    readonly fields?: Readonly<Record<string, RecordValue>>;
}
export interface ClubManagerInput {
    readonly managerId?: number;
    readonly firstName?: string;
    readonly lastName?: string;
    readonly nationality?: number;
    readonly fields?: Readonly<Record<string, RecordValue>>;
}
export interface CreateClubInput {
    readonly name: string;
    readonly leagueId: number;
    readonly colors: ClubColors;
    readonly teamId?: number;
    readonly assetId?: number;
    readonly countryId?: number;
    readonly gender?: 0 | 1;
    readonly templateTeamId?: number;
    readonly stadiumId?: number;
    readonly stadiumName?: string;
    readonly foundationYear?: number;
    readonly baseRating?: number;
    readonly defensiveDepth?: number;
    readonly rivalTeamId?: number;
    readonly kits?: {
        readonly home?: ClubKitInput;
        readonly away?: ClubKitInput;
        readonly goalkeeper?: ClubKitInput;
        readonly third?: ClubKitInput | false;
    };
    readonly formation?: ClubFormationInput;
    readonly manager?: ClubManagerInput;
    readonly fields?: Readonly<Record<string, RecordValue>>;
}
export interface CreateClubOptions {
    readonly autoGenerateId?: boolean;
    readonly databaseIndex?: number;
    readonly referenceYear?: number;
    readonly dryRun?: boolean;
}
export interface CreatedClubKit {
    readonly type: ClubKitType;
    readonly typeId: number;
    readonly kitId: number;
    readonly colors: readonly RgbColor[];
    readonly generic: boolean;
    readonly record: EaRecord;
}
export interface ClubCreationTableChange {
    readonly name: string;
    readonly addedRecords: number;
    readonly updatedRecords: number;
}
export interface CreateClubResult {
    readonly profile: ClubCreationProfile;
    readonly databaseIndex: number;
    readonly teamId: number;
    readonly assetId: number;
    readonly templateTeamId: number;
    readonly leagueId: number;
    readonly countryId: number;
    readonly stadiumId: number;
    readonly formationId: number;
    readonly managerId: number | null;
    readonly colors: readonly RgbColor[];
    readonly kits: readonly CreatedClubKit[];
    readonly team: EaRecord;
    readonly idGenerated: boolean;
    readonly created: boolean;
    readonly rosterSize: 0;
    readonly assets: {
        readonly badgeAssetId: number;
        readonly badgeAssetProvided: boolean;
        readonly kitAssetTeamId: number;
        readonly externalKitTexturesRequired: boolean;
    };
    readonly tables: readonly ClubCreationTableChange[];
}
export interface ClubCreationOperations {
    readonly createClub: (input: CreateClubInput, options?: CreateClubOptions) => CreateClubResult;
}
