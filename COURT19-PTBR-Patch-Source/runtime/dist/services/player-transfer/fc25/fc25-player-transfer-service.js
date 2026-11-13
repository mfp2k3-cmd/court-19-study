import { RosterTransferService } from '../shared/roster-transfer-service.js';
import { baseRoles } from '../shared/team-sheets.js';
export class Fc25PlayerTransferService extends RosterTransferService {
    constructor() { super('FC 25', baseRoles); }
}
