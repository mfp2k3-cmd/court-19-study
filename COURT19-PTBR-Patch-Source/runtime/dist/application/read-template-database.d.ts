import type { EaFile, ReadTemplateOptions } from '../domain/models.js';
import type { TemplateDatabase } from '../domain/templates.js';
import type { Fc25File, Fc25ReadTemplateOptions } from '../domain/fc25/schema.js';
import type { Fc26File, Fc26ReadTemplateOptions } from '../domain/fc26/schema.js';
import type { Fc27File, Fc27ReadTemplateOptions } from '../domain/fc27/schema.js';
export declare function readTemplateDatabase<D extends TemplateDatabase = 'main'>(options: Fc25ReadTemplateOptions<D>): Promise<Fc25File<D>>;
export declare function readTemplateDatabase<D extends TemplateDatabase = 'main'>(options: Fc26ReadTemplateOptions<D>): Promise<Fc26File<D>>;
export declare function readTemplateDatabase<D extends TemplateDatabase = 'main'>(options: Fc27ReadTemplateOptions<D>): Promise<Fc27File<D>>;
export declare function readTemplateDatabase(options: ReadTemplateOptions): Promise<EaFile>;
