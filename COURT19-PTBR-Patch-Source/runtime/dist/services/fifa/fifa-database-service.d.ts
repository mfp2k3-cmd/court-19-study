import { parseFifaDatabase } from './parse-fifa-database.js';
import { readFifaDatabase } from './read-fifa-database.js';
import { serializeFifaDatabase } from './serialize-fifa-database.js';
import { writeFifaDatabase } from './write-fifa-database.js';
export declare class FifaDatabaseService {
    readonly parse: typeof parseFifaDatabase;
    readonly read: typeof readFifaDatabase;
    readonly serialize: typeof serializeFifaDatabase;
    readonly write: typeof writeFifaDatabase;
}
export declare const fifaDatabaseService: FifaDatabaseService;
