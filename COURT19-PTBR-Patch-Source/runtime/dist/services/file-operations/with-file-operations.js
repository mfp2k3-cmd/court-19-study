import { PlayerTransferService } from '../player-transfer/player-transfer-service.js';
import { PlayerCreationService } from '../player-creation/player-creation-service.js';
import { ClubCreationService } from '../club-creation/club-creation-service.js';
export function withFileOperations(file, profile = 'schema') {
    const service = new PlayerTransferService(profile);
    const transferPlayer = (playerId, teamId, options) => service.transfer(file, playerId, teamId, options);
    const creation = new PlayerCreationService(profile);
    const createPlayer = (input, options) => creation.create(file, input, options);
    const clubs = new ClubCreationService(profile);
    const createClub = (input, options) => clubs.create(file, input, options);
    Object.defineProperty(file, 'transferPlayer', { value: transferPlayer, enumerable: false, configurable: true });
    Object.defineProperty(file, 'createPlayer', { value: createPlayer, enumerable: false, configurable: true });
    Object.defineProperty(file, 'createClub', { value: createClub, enumerable: false, configurable: true });
    return file;
}
