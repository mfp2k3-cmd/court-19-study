import type { CreateClubInput, CreateClubOptions, RgbColor } from '../../../domain/club-creation-models.js';
import type { EaDatabase, EaRecord } from '../../../domain/models.js';
import { ClubPlan } from './club-plan.js';
export interface ClubContext {
    readonly database: EaDatabase;
    readonly input: CreateClubInput;
    readonly plan: ClubPlan;
    readonly teamId: number;
    readonly donor: EaRecord;
    readonly league: EaRecord;
    readonly countryId: number;
    readonly gender: number;
    readonly stadium: EaRecord;
    readonly colors: readonly RgbColor[];
    readonly year: number;
}
export declare function clubContext(database: EaDatabase, input: CreateClubInput, options: CreateClubOptions, year: number): ClubContext;
