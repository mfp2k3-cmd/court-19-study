import type { EaTable } from '../../../domain/models.js';
import { TransferPlan } from './transfer-plan.js';
export declare function updateTeamMentalities(plan: TransferPlan, tables: ReadonlyMap<string, EaTable>, playerId: number, sourceTeamId: number, remaining: readonly number[], positions: ReadonlyMap<number, number>): void;
