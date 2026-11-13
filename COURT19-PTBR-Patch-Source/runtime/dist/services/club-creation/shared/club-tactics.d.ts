import type { EaRecord, EaTable } from '../../../domain/models.js';
import type { ClubContext } from './club-context.js';
export declare function clearClubPlayers(table: EaTable, row: EaRecord): void;
export declare function addClubTactics(context: ClubContext, mentalitiesPerClub: number | 'detect'): number;
