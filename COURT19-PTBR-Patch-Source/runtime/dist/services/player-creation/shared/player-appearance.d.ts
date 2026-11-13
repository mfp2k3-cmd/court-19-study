import type { EaTable } from '../../../domain/models.js';
import { CreationPlan } from './creation-plan.js';
export declare function addPlayerAppearance(plan: CreationPlan, tables: ReadonlyMap<string, EaTable>, playerId: number, originalHeadAssetId: number | undefined): void;
