import type { EaDatabase, EaRecord, EaTable } from '../../../domain/models.js';
import { CreationPlan } from './creation-plan.js';
export declare function unusedInteger(table: EaTable, fieldName: string, used: ReadonlySet<number>, minimum?: number): number;
export declare function reservedPlayerIds(database: EaDatabase): Set<number>;
export declare function addPlayerNames(plan: CreationPlan, tables: ReadonlyMap<string, EaTable>, players: EaTable, names: {
    firstName: string;
    lastName: string;
    commonName: string;
    jerseyName: string;
}, player: EaRecord): void;
