import type { EaDatabase } from '../../../domain/models.js';
import type { PlayerTransferProfile, TransferPlayerOptions, TransferPlayerResult } from '../../../domain/transfer-models.js';
export declare class RosterTransferService {
    readonly profile: PlayerTransferProfile;
    private readonly roles;
    constructor(profile: PlayerTransferProfile, roles: readonly string[]);
    transfer(database: EaDatabase, playerId: number, targetTeamId: number, options: TransferPlayerOptions): TransferPlayerResult;
}
