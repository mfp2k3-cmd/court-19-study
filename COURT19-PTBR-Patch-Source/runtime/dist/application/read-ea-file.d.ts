import type { EaFile, ReadFileOptions } from '../domain/models.js';
import type { TemplateDatabase } from '../domain/templates.js';
import type { Fc25File, Fc25ReadFileOptions } from '../domain/fc25/schema.js';
import type { Fc26File, Fc26ReadFileOptions } from '../domain/fc26/schema.js';
import type { Fc27File, Fc27ReadFileOptions } from '../domain/fc27/schema.js';
export declare function readEaFile<D extends TemplateDatabase = 'main'>(path: string, options: Fc25ReadFileOptions<D>): Promise<Fc25File<D>>;
export declare function readEaFile<D extends TemplateDatabase = 'main'>(path: string, options: Fc26ReadFileOptions<D>): Promise<Fc26File<D>>;
export declare function readEaFile<D extends TemplateDatabase = 'main'>(path: string, options: Fc27ReadFileOptions<D>): Promise<Fc27File<D>>;
export declare function readEaFile(path: string, options?: ReadFileOptions): Promise<EaFile>;
