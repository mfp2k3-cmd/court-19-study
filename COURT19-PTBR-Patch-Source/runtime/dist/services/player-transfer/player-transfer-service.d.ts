import type { EaFileSnapshot } from '../../domain/models.js';
import type { PlayerTransferProfile, TransferPlayerOptions, TransferPlayerResult } from '../../domain/transfer-models.js';
export declare class PlayerTransferService {
    readonly profile: PlayerTransferProfile;
    constructor(profile?: PlayerTransferProfile);
    transfer(file: EaFileSnapshot, playerId: number, teamId: number, options?: TransferPlayerOptions): TransferPlayerResult;
}
