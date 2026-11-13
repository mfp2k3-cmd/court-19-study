import type { EaTable } from '../../../domain/models.js';
import { type CreatePlayerInput, type PlayerCreationValues } from '../../../domain/player-creation-models.js';
export declare function databaseDate(date: string): number;
export declare function buildPlayerRecord(table: EaTable, input: CreatePlayerInput, playerId: number, position: number, values: PlayerCreationValues, gender: number, year: number, defaults: Readonly<Record<string, number>>): {
    row: import("../../../domain/models.js").EaRecord;
    originalPlayerId: number | undefined;
    originalHeadAssetId: number | undefined;
};
