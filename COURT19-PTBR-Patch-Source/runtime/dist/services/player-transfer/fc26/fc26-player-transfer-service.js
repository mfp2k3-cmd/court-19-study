import { RosterTransferService } from '../shared/roster-transfer-service.js';
import { extendedRoles } from '../shared/team-sheets.js';
export class Fc26PlayerTransferService extends RosterTransferService {
    constructor() { super('FC 26', extendedRoles); }
}
