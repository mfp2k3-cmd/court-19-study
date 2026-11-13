import type { EaRecord, EaTable } from '../../../domain/models.js';
import { CreationPlan } from './creation-plan.js';
export declare function targetTeam(tables: ReadonlyMap<string, EaTable>, id: number, kind: 'club' | 'national'): EaRecord;
export declare function addRosterMembership(plan: CreationPlan, tables: ReadonlyMap<string, EaTable>, playerId: number, teamId: number, requestedJersey: number | undefined): number;
