import type { EaRecord } from '../../../domain/models.js';
import type { ClubContext } from './club-context.js';
export declare function addClubTeam(context: ClubContext): EaRecord;
export declare function addClubRelations(context: ClubContext): void;
export declare function addClubManager(context: ClubContext): number | null;
