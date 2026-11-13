import { parseFifaDatabase } from './parse-fifa-database.js';
import { readFifaDatabase } from './read-fifa-database.js';
import { serializeFifaDatabase } from './serialize-fifa-database.js';
import { writeFifaDatabase } from './write-fifa-database.js';
export class FifaDatabaseService {
    parse = parseFifaDatabase;
    read = readFifaDatabase;
    serialize = serializeFifaDatabase;
    write = writeFifaDatabase;
}
export const fifaDatabaseService = new FifaDatabaseService();
