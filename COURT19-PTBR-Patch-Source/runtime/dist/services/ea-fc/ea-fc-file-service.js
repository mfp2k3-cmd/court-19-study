import { loadTemplateMetadata } from '../../application/load-template-metadata.js';
import { parseCareerData } from '../../application/parse-career-data.js';
import { parseEaFile } from '../../application/parse-ea-file.js';
import { readCareerData } from '../../application/read-career-data.js';
import { readEaFile } from '../../application/read-ea-file.js';
import { readTemplateDatabase } from '../../application/read-template-database.js';
import { serializeEaFile } from '../../application/serialize-ea-file.js';
import { writeEaFile } from '../../application/write-ea-file.js';
export class EaFcFileService {
    parse = parseEaFile;
    read = readEaFile;
    serialize = serializeEaFile;
    write = writeEaFile;
    readTemplate = readTemplateDatabase;
    loadMetadata = loadTemplateMetadata;
    parseCareer = parseCareerData;
    readCareer = readCareerData;
}
export const eaFcFileService = new EaFcFileService();
