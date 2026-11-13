import { ClubDatabaseService } from '../shared/club-database-service.js';
export class FifaClubCreationService extends ClubDatabaseService {
    constructor(profile) { super(profile, 2026, 'detect'); }
}
