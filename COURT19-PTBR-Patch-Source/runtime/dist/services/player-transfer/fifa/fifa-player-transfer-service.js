import { RosterTransferService } from '../shared/roster-transfer-service.js';
import { extendedRoles } from '../shared/team-sheets.js';
export class FifaPlayerTransferService extends RosterTransferService {
    constructor(profile = 'fifa-db') { super(profile, extendedRoles); }
}
