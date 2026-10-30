/* tslint:disable */
/* eslint-disable */

export class PdfExporter {
    free(): void;
    [Symbol.dispose](): void;
    compileDocument(pattern_pdf: Uint8Array): any;
    export(pattern_pdf: Uint8Array): any;
    constructor(embproj: Uint8Array, font_data: Uint8Array[]);
    preview(page: number): RenderedPage | undefined;
}

export class RenderedPage {
    private constructor();
    free(): void;
    [Symbol.dispose](): void;
    height: number;
    width: number;
    readonly len: number;
    readonly ptr: number;
}

export type InitInput = RequestInfo | URL | Response | BufferSource | WebAssembly.Module;

export interface InitOutput {
    readonly memory: WebAssembly.Memory;
    readonly __wbg_get_renderedpage_height: (a: number) => number;
    readonly __wbg_get_renderedpage_width: (a: number) => number;
    readonly __wbg_pdfexporter_free: (a: number, b: number) => void;
    readonly __wbg_renderedpage_free: (a: number, b: number) => void;
    readonly __wbg_set_renderedpage_height: (a: number, b: number) => void;
    readonly __wbg_set_renderedpage_width: (a: number, b: number) => void;
    readonly pdfexporter_compileDocument: (a: number, b: number, c: number) => [number, number, number];
    readonly pdfexporter_export: (a: number, b: number, c: number) => [number, number, number];
    readonly pdfexporter_new: (a: number, b: number, c: number, d: number) => [number, number, number];
    readonly pdfexporter_preview: (a: number, b: number) => number;
    readonly renderedpage_len: (a: number) => number;
    readonly renderedpage_ptr: (a: number) => number;
    readonly __wbindgen_malloc: (a: number, b: number) => number;
    readonly __wbindgen_realloc: (a: number, b: number, c: number, d: number) => number;
    readonly __wbindgen_externrefs: WebAssembly.Table;
    readonly __externref_table_dealloc: (a: number) => void;
    readonly __externref_table_alloc: () => number;
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
