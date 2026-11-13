import type { ClubColor, CreateClubInput, CreateClubOptions, RgbColor } from '../../../domain/club-creation-models.js';
export declare function clubColor(value: ClubColor): RgbColor;
export declare function clubColors(value: unknown): readonly RgbColor[];
export declare function validateClubInputs(input: CreateClubInput, options: CreateClubOptions): void;
export declare function contrastColor(color: RgbColor): RgbColor;
