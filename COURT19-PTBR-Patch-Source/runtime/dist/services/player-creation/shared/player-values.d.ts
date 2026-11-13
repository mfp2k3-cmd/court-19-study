import { type CreatePlayerInput, type CreatePlayerOptions, type PlayerPositionId, type PlayerCreationValues, type RandomizablePlayerField } from '../../../domain/player-creation-models.js';
export declare const RANDOMIZABLE_PLAYER_FIELDS: readonly RandomizablePlayerField[];
export declare function playerValueLimits(field: RandomizablePlayerField): readonly [number, number];
export declare function positionId(position: CreatePlayerInput['position']): PlayerPositionId;
export declare function playerValues(input: CreatePlayerInput, options: CreatePlayerOptions): {
    position: PlayerPositionId;
    baseValues: PlayerCreationValues;
    values: PlayerCreationValues;
    randomSeed: number | null;
    randomizedFields: RandomizablePlayerField[];
};
