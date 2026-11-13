import type { EaRecord, RecordValue } from './models.js';
import type { EaFcVersion } from './templates.js';
export declare const PLAYER_POSITIONS: {
    readonly GK: 0;
    readonly SW: 1;
    readonly RWB: 2;
    readonly RB: 3;
    readonly RCB: 4;
    readonly CB: 5;
    readonly LCB: 6;
    readonly LB: 7;
    readonly LWB: 8;
    readonly RDM: 9;
    readonly CDM: 10;
    readonly LDM: 11;
    readonly RM: 12;
    readonly RCM: 13;
    readonly CM: 14;
    readonly LCM: 15;
    readonly LM: 16;
    readonly RAM: 17;
    readonly CAM: 18;
    readonly LAM: 19;
    readonly RF: 20;
    readonly CF: 21;
    readonly LF: 22;
    readonly RW: 23;
    readonly RS: 24;
    readonly ST: 25;
    readonly LS: 26;
    readonly LW: 27;
};
export type PlayerPosition = keyof typeof PLAYER_POSITIONS;
export type PlayerPositionId = typeof PLAYER_POSITIONS[PlayerPosition];
export type PlayerCreationProfile = EaFcVersion | 'fifa-db' | 'schema';
export declare const PLAYER_ATTRIBUTES: readonly ['acceleration', 'sprintspeed', 'agility', 'balance', 'jumping', 'stamina', 'strength', 'reactions', 'aggression', 'composure', 'interceptions', 'positioning', 'vision', 'ballcontrol', 'crossing', 'curve', 'dribbling', 'finishing', 'freekickaccuracy', 'headingaccuracy', 'longpassing', 'longshots', 'penalties', 'shortpassing', 'shotpower', 'slidingtackle', 'standingtackle', 'volleys', 'defensiveawareness', 'gkdiving', 'gkhandling', 'gkkicking', 'gkpositioning', 'gkreflexes'];
export type PlayerAttribute = typeof PLAYER_ATTRIBUTES[number];
export type RandomizablePlayerField = PlayerAttribute | 'height' | 'weight' | 'potential' | 'skillmoves' | 'weakfootabilitytypecode';
export type PlayerCreationValues = Readonly<Record<RandomizablePlayerField, number>>;
export interface PlayerRandomizationOptions {
    readonly seed?: number;
    readonly variation?: number;
    readonly fields?: readonly RandomizablePlayerField[];
    readonly ranges?: Readonly<Partial<Record<RandomizablePlayerField, {
        readonly min: number;
        readonly max: number;
    }>>>;
}
export interface CreatePlayerInput {
    readonly firstName: string;
    readonly lastName: string;
    readonly teamId: number;
    readonly position: PlayerPosition | PlayerPositionId;
    readonly nationality: number;
    readonly playerId?: number;
    readonly commonName?: string;
    readonly jerseyName?: string;
    readonly jerseyNumber?: number;
    readonly nationalTeamId?: number;
    readonly nationalJerseyNumber?: number;
    readonly baseRating?: number;
    readonly potential?: number;
    readonly birthDate?: string;
    readonly height?: number;
    readonly weight?: number;
    readonly preferredFoot?: 'left' | 'right';
    readonly skillMoves?: number;
    readonly weakFootAbility?: number;
    readonly attributes?: Readonly<Partial<Record<PlayerAttribute, number>>>;
    readonly fields?: Readonly<Record<string, RecordValue>>;
}
export interface CreatePlayerOptions {
    readonly autoGenerateId?: boolean;
    readonly randomize?: boolean | PlayerRandomizationOptions;
    readonly databaseIndex?: number;
    readonly referenceYear?: number;
    readonly dryRun?: boolean;
}
export interface PlayerCreationTableChange {
    readonly name: string;
    readonly addedRecords: number;
    readonly updatedRecords: number;
}
export interface CreatePlayerResult {
    readonly profile: PlayerCreationProfile;
    readonly databaseIndex: number;
    readonly playerId: number;
    readonly teamId: number;
    readonly jerseyNumber: number;
    readonly nationalJerseyNumber: number | null;
    readonly idGenerated: boolean;
    readonly created: boolean;
    readonly randomSeed: number | null;
    readonly randomizedFields: readonly RandomizablePlayerField[];
    readonly baseValues: PlayerCreationValues;
    readonly values: PlayerCreationValues;
    readonly player: EaRecord;
    readonly tables: readonly PlayerCreationTableChange[];
}
export interface PlayerCreationOperations {
    readonly createPlayer: (input: CreatePlayerInput, options?: CreatePlayerOptions) => CreatePlayerResult;
}
