import type { PlayerTransferProfile } from '../../../domain/transfer-models.js';
import { RosterTransferService } from '../shared/roster-transfer-service.js';
export declare class FifaPlayerTransferService extends RosterTransferService {
    constructor(profile?: Extract<PlayerTransferProfile, 'fifa-db' | 'schema'>);
}
