/* tslint:disable */
/* eslint-disable */

export class ImageDimensions {
    private constructor();
    free(): void;
    [Symbol.dispose](): void;
    height: number;
    width: number;
}

export class ImageImportSession {
    free(): void;
    [Symbol.dispose](): void;
    getPreview(palette_bytes: Uint8Array, options_bytes: Uint8Array): Uint8Array;
    imageDimensions(): ImageDimensions;
    constructor(image_bytes: Uint8Array);
}

export type InitInput = RequestInfo | URL | Response | BufferSource | WebAssembly.Module;

export interface InitOutput {
    readonly memory: WebAssembly.Memory;
    readonly __wbg_get_imagedimensions_height: (a: number) => number;
    readonly __wbg_get_imagedimensions_width: (a: number) => number;
    readonly __wbg_imagedimensions_free: (a: number, b: number) => void;
    readonly __wbg_imageimportsession_free: (a: number, b: number) => void;
    readonly __wbg_set_imagedimensions_height: (a: number, b: number) => void;
    readonly __wbg_set_imagedimensions_width: (a: number, b: number) => void;
    readonly imageimportsession_getPreview: (a: number, b: number, c: number, d: number, e: number) => [number, number, number, number];
    readonly imageimportsession_imageDimensions: (a: number) => number;
    readonly imageimportsession_new: (a: number, b: number) => [number, number, number];
    readonly __wbindgen_exn_store: (a: number) => void;
    readonly __externref_table_alloc: () => number;
    readonly __wbindgen_externrefs: WebAssembly.Table;
    readonly __wbindgen_malloc: (a: number, b: number) => number;
    readonly __externref_table_dealloc: (a: number) => void;
    readonly __wbindgen_free: (a: number, b: number, c: number) => void;
    readonly __wbindgen_start: () => void;
}

export type SyncInitInput = BufferSource | WebAssembly.Module;

/**
 * Instantiates the given `module`, which can either be bytes or
 * a precompiled `WebAssembly.Module`.
 *
 * @param {{ module: SyncInitInput }} module - Passing `SyncInitInput` directly is deprecated.
 *
 * @returns {InitOutput}
 */
export function initSync(module: { module: SyncInitInput } | SyncInitInput): InitOutput;

/**
 * If `module_or_path` is {RequestInfo} or {URL}, makes a request and
 * for everything else, calls `WebAssembly.instantiate` directly.
 *
 * @param {{ module_or_path: InitInput | Promise<InitInput> }} module_or_path - Passing `InitInput` directly is deprecated.
 *
 * @returns {Promise<InitOutput>}
 */
export default function __wbg_init (module_or_path?: { module_or_path: InitInput | Promise<InitInput> } | InitInput | Promise<InitInput>): Promise<InitOutput>;
