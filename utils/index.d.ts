/// <reference types="node" />
import { WriteStream } from 'fs-extra';
export declare const exec: (cmd?: string) => Promise<unknown>;
export declare function upload(host: string, port: number, path: string, Cookie: string, uploadFilePath: string): Promise<unknown>;
export declare const firstUpperCase: (str: string) => string;
export declare function writeAsync(output: WriteStream, content: string): Promise<unknown>;
export declare function getCachePath(): string;
