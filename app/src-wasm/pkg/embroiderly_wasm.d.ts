/* tslint:disable */
/* eslint-disable */

export interface ImportFilesItem {
    name: string;
    data: Uint8Array;
}



export class EditorWrapper {
    private constructor();
    free(): void;
    [Symbol.dispose](): void;
    /**
     * Adds a new layer to the pattern.
     */
    addLayer(project_id: string): Promise<void>;
    /**
     * Adds a new palette item.
     */
    addPaletteItem(project_id: string, palitem_data: Uint8Array): Promise<void>;
    /**
     * Adds a Borsh-serialized `EmbroiderlyProject` and persists it without a file handle.
     */
    addPattern(data: Uint8Array): Promise<OpenPatternResult>;
    /**
     * Adds a stitch to the pattern layer.
     */
    addStitch(project_id: string, layer_index: number, stitch_data: Uint8Array): Promise<void>;
    /**
     * Removes the pattern from the editor and cleans up its persisted entry from IndexedDB.
     * Throws an error if the pattern has unsaved changes and `force` is false.
     */
    closePattern(project_id: string, force: boolean): Promise<void>;
    /**
     * Creates a new `EditorWrapper`.
     */
    static create(callback: Function): Promise<EditorWrapper>;
    /**
     * Creates a blank pattern from the provided Borsh-serialized `Fabric` data.
     * Returns `[id, title]` --- the pattern UUID and its title.
     */
    createPattern(fabric_data: Uint8Array): Promise<OpenPatternResult>;
    /**
     * Ends the current transaction in the pattern with the given ID.
     */
    endTransaction(project_id: string): Promise<void>;
    /**
     * Encodes the pattern and writes it to the given handle without updating the stored handle.
     * Use this for one-off exports (e.g. OXS). Does not checkpoint.
     */
    exportPattern(project_id: string, file_handle: FileSystemFileHandle): Promise<void>;
    /**
     * Checks if the pattern with the given ID has unsaved changes.
     */
    hasUnsavedChanges(project_id: string): boolean;
    /**
     * Returns the Borsh-serialized `EmbroiderlyProject`.
     * If the pattern is not in memory, it is automatically restored from IndexedDB before being returned.
     */
    loadPattern(project_id: string): Promise<Uint8Array>;
    /**
     * Moves a layer from `old_position` to `new_position`.
     */
    moveLayer(project_id: string, old_position: number, new_position: number): Promise<void>;
    /**
     * Reads the file from the provided file handle, parses it, and registers the pattern in the editor.
     *
     * The file name extension determines the pattern format.
     * The handle is persisted in IndexedDB so later saves can reuse it.
     *
     * Returns `[id, title]` --- the pattern UUID and its title (falling back to the file name if empty).
     */
    openPattern(file_handle: FileSystemFileHandle): Promise<OpenPatternResult>;
    /**
     * Parses pattern bytes directly without associating a file handle.
     * Use this for templates or platform-specific file reads where no `FileSystemFileHandle` is available.
     *
     * Returns `[id, title]` --- the pattern UUID and its title (falling back to `file_name` if empty).
     */
    openPatternFromData(data: Uint8Array, file_name: string): Promise<OpenPatternResult>;
    /**
     * Redoes the last undone edit or transaction in the pattern with the given ID.
     */
    redo(project_id: string, single: boolean): Promise<void>;
    /**
     * Removes the layer at the given index.
     */
    removeLayer(project_id: string, layer_index: number): Promise<void>;
    /**
     * Removes palette items by their indexes.
     */
    removePaletteItems(project_id: string, palindexes: Uint32Array): Promise<void>;
    /**
     * Removes the reference image.
     */
    removeReferenceImage(project_id: string): Promise<void>;
    /**
     * Removes a known stitch from the pattern layer.
     */
    removeStitch(project_id: string, layer_index: number, stitch_data: Uint8Array): Promise<void>;
    /**
     * Removes all stitches (Full, Petite, Half, Quarter) at the given raw pattern coordinates.
     */
    removeStitchAt(project_id: string, layer_index: number, x: number, y: number): Promise<void>;
    /**
     * Renames the layer at the given index.
     */
    renameLayer(project_id: string, layer_index: number, name: string): Promise<void>;
    /**
     * Reorders a palette item from `old_position` to `new_position`.
     */
    reorderPaletteItems(project_id: string, old_position: number, new_position: number): Promise<void>;
    /**
     * Encodes the pattern and writes it to the associated file handle.
     * If `handle` is provided it is persisted in IndexedDB and used for this write.
     * If `handle` is `null` and no handle is stored, returns a `NoFileHandle` error.
     * Checkpoints the pattern on success.
     */
    savePattern(project_id: string, file_handle?: FileSystemFileHandle | null): Promise<void>;
    /**
     * Sets the auto-save interval replacing any existing interval immediately.
     */
    setAutoSaveInterval(millis: number): void;
    /**
     * Sets the stitch symbol for a palette item.
     */
    setPaletteItemSymbol(project_id: string, symbol_data: Uint8Array): Promise<void>;
    /**
     * Sets the reference image.
     */
    setReferenceImage(project_id: string, image_data: Uint8Array): Promise<void>;
    /**
     * Sorts palette items by the given criterion.
     */
    sortPalette(project_id: string, sort_by: string): Promise<void>;
    /**
     * Starts a new transaction in the pattern with the given ID.
     */
    startTransaction(project_id: string): Promise<void>;
    /**
     * Undoes the last edit or transaction in the pattern with the given ID.
     */
    undo(project_id: string, single: boolean): Promise<void>;
    /**
     * Updates display settings.
     */
    updateDisplaySettings(project_id: string, settings_data: Uint8Array): Promise<void>;
    /**
     * Updates fabric properties.
     */
    updateFabric(project_id: string, fabric_data: Uint8Array): Promise<void>;
    /**
     * Updates grid properties.
     */
    updateGrid(project_id: string, grid_data: Uint8Array): Promise<void>;
    /**
     * Updates layer visibility flags.
     */
    updateLayerVisibility(project_id: string, layer_index: number, visibility_data: Uint8Array): Promise<void>;
    /**
     * Updates palette display settings.
     */
    updatePaletteDisplaySettings(project_id: string, settings_data: Uint8Array): Promise<void>;
    /**
     * Updates pattern info.
     */
    updatePatternInfo(project_id: string, info_data: Uint8Array): Promise<void>;
    /**
     * Updates Typst template.
     */
    updatePatternPdf(project_id: string, pattern_pdf_data: Uint8Array): Promise<void>;
    /**
     * Updates reference image display settings.
     */
    updateReferenceImageSettings(project_id: string, settings_data: Uint8Array): Promise<void>;
}

export class FileManager {
    private constructor();
    free(): void;
    [Symbol.dispose](): void;
    /**
     * Opens (and creates if needed) the OPFS subdirectories for palettes and fonts.
     */
    static create(): Promise<FileManager>;
    /**
     * Deletes the startup pattern template file with the given name from OPFS.
     */
    deletePatternTemplate(name: string): Promise<void>;
    /**
     * Returns a complete list of the available symbol fonts.
     */
    getFontsList(): Promise<GroupedFilesList>;
    /**
     * Returns a complete list of the available palettes.
     */
    getPalettesList(): Promise<GroupedFilesList>;
    /**
     * Processes the provided font files and saves them to the OPFS.
     */
    importFonts(files: ImportFilesItem[]): Promise<ImportFilesResult>;
    /**
     * Processes the provided palettes and saves them to the OPFS.
     */
    importPalettes(files: ImportFilesItem[]): Promise<ImportFilesResult>;
    /**
     * Returns a Borsh-encoded list of fabric colors.
     */
    loadFabricColors(): Promise<Uint8Array>;
    /**
     * Returns the Unicode code points present in the given font.
     */
    loadFontCodePoints(name: string): Promise<Uint32Array>;
    /**
     * Returns the raw TTF/OTF bytes for the given font name.
     */
    loadFontContent(name: string): Promise<Uint8Array>;
    /**
     * Returns a Borsh-encoded brand palette.
     */
    loadPalette(group: string, name: string): Promise<Uint8Array>;
    /**
     * Returns the bytes of the startup pattern template with the given name.
     */
    loadPatternTemplate(name: string): Promise<Uint8Array>;
    /**
     * Saves the given Borsh-encoded list of fabric colors to the OPFS root.
     */
    saveFabricColors(data: Uint8Array): Promise<void>;
    /**
     * Saves the given bytes as the startup pattern template file.
     * Any previously saved template with the same name is overwritten.
     */
    savePatternTemplate(name: string, data: Uint8Array): Promise<void>;
}

export class GroupedFilesList {
    private constructor();
    free(): void;
    [Symbol.dispose](): void;
    custom: string[];
    system: string[];
}

export class ImportFilesResult {
    private constructor();
    free(): void;
    [Symbol.dispose](): void;
    failedFiles: string[];
}

export class OpenPatternResult {
    private constructor();
    free(): void;
    [Symbol.dispose](): void;
    id: string;
    snapshot: Uint8Array;
    title: string;
}

export function init(): void;

export type InitInput = RequestInfo | URL | Response | BufferSource | WebAssembly.Module;

export interface InitOutput {
    readonly memory: WebAssembly.Memory;
    readonly __wbg_editorwrapper_free: (a: number, b: number) => void;
    readonly __wbg_get_openpatternresult_id: (a: number) => [number, number];
    readonly __wbg_get_openpatternresult_snapshot: (a: number) => [number, number];
    readonly __wbg_get_openpatternresult_title: (a: number) => [number, number];
    readonly __wbg_openpatternresult_free: (a: number, b: number) => void;
    readonly __wbg_set_openpatternresult_id: (a: number, b: number, c: number) => void;
    readonly __wbg_set_openpatternresult_snapshot: (a: number, b: number, c: number) => void;
    readonly __wbg_set_openpatternresult_title: (a: number, b: number, c: number) => void;
    readonly editorwrapper_addLayer: (a: number, b: number, c: number) => any;
    readonly editorwrapper_addPaletteItem: (a: number, b: number, c: number, d: number, e: number) => any;
    readonly editorwrapper_addPattern: (a: number, b: number, c: number) => any;
    readonly editorwrapper_addStitch: (a: number, b: number, c: number, d: number, e: number, f: number) => any;
    readonly editorwrapper_closePattern: (a: number, b: number, c: number, d: number) => any;
    readonly editorwrapper_create: (a: any) => any;
    readonly editorwrapper_createPattern: (a: number, b: number, c: number) => any;
    readonly editorwrapper_endTransaction: (a: number, b: number, c: number) => any;
    readonly editorwrapper_exportPattern: (a: number, b: number, c: number, d: any) => any;
    readonly editorwrapper_hasUnsavedChanges: (a: number, b: number, c: number) => [number, number, number];
    readonly editorwrapper_loadPattern: (a: number, b: number, c: number) => any;
    readonly editorwrapper_moveLayer: (a: number, b: number, c: number, d: number, e: number) => any;
    readonly editorwrapper_openPattern: (a: number, b: any) => any;
    readonly editorwrapper_openPatternFromData: (a: number, b: number, c: number, d: number, e: number) => any;
    readonly editorwrapper_redo: (a: number, b: number, c: number, d: number) => any;
    readonly editorwrapper_removeLayer: (a: number, b: number, c: number, d: number) => any;
    readonly editorwrapper_removePaletteItems: (a: number, b: number, c: number, d: number, e: number) => any;
    readonly editorwrapper_removeReferenceImage: (a: number, b: number, c: number) => any;
    readonly editorwrapper_removeStitch: (a: number, b: number, c: number, d: number, e: number, f: number) => any;
    readonly editorwrapper_removeStitchAt: (a: number, b: number, c: number, d: number, e: number, f: number) => any;
    readonly editorwrapper_renameLayer: (a: number, b: number, c: number, d: number, e: number, f: number) => any;
    readonly editorwrapper_reorderPaletteItems: (a: number, b: number, c: number, d: number, e: number) => any;
    readonly editorwrapper_savePattern: (a: number, b: number, c: number, d: number) => any;
    readonly editorwrapper_setAutoSaveInterval: (a: number, b: number) => void;
    readonly editorwrapper_setPaletteItemSymbol: (a: number, b: number, c: number, d: number, e: number) => any;
    readonly editorwrapper_setReferenceImage: (a: number, b: number, c: number, d: number, e: number) => any;
    readonly editorwrapper_sortPalette: (a: number, b: number, c: number, d: number, e: number) => any;
    readonly editorwrapper_startTransaction: (a: number, b: number, c: number) => any;
    readonly editorwrapper_undo: (a: number, b: number, c: number, d: number) => any;
    readonly editorwrapper_updateDisplaySettings: (a: number, b: number, c: number, d: number, e: number) => any;
    readonly editorwrapper_updateFabric: (a: number, b: number, c: number, d: number, e: number) => any;
    readonly editorwrapper_updateGrid: (a: number, b: number, c: number, d: number, e: number) => any;
    readonly editorwrapper_updateLayerVisibility: (a: number, b: number, c: number, d: number, e: number, f: number) => any;
    readonly editorwrapper_updatePaletteDisplaySettings: (a: number, b: number, c: number, d: number, e: number) => any;
    readonly editorwrapper_updatePatternInfo: (a: number, b: number, c: number, d: number, e: number) => any;
    readonly editorwrapper_updatePatternPdf: (a: number, b: number, c: number, d: number, e: number) => any;
    readonly editorwrapper_updateReferenceImageSettings: (a: number, b: number, c: number, d: number, e: number) => any;
    readonly __wbg_filemanager_free: (a: number, b: number) => void;
    readonly __wbg_get_groupedfileslist_custom: (a: number) => [number, number];
    readonly __wbg_get_groupedfileslist_system: (a: number) => [number, number];
    readonly __wbg_get_importfilesresult_failedFiles: (a: number) => [number, number];
    readonly __wbg_groupedfileslist_free: (a: number, b: number) => void;
    readonly __wbg_importfilesresult_free: (a: number, b: number) => void;
    readonly __wbg_set_groupedfileslist_custom: (a: number, b: number, c: number) => void;
    readonly __wbg_set_groupedfileslist_system: (a: number, b: number, c: number) => void;
    readonly __wbg_set_importfilesresult_failedFiles: (a: number, b: number, c: number) => void;
    readonly filemanager_create: () => any;
    readonly filemanager_deletePatternTemplate: (a: number, b: number, c: number) => any;
    readonly filemanager_getFontsList: (a: number) => any;
    readonly filemanager_getPalettesList: (a: number) => any;
    readonly filemanager_importFonts: (a: number, b: number, c: number) => any;
    readonly filemanager_importPalettes: (a: number, b: number, c: number) => any;
    readonly filemanager_loadFabricColors: (a: number) => any;
    readonly filemanager_loadFontCodePoints: (a: number, b: number, c: number) => any;
    readonly filemanager_loadFontContent: (a: number, b: number, c: number) => any;
    readonly filemanager_loadPalette: (a: number, b: number, c: number, d: number, e: number) => any;
    readonly filemanager_loadPatternTemplate: (a: number, b: number, c: number) => any;
    readonly filemanager_saveFabricColors: (a: number, b: number, c: number) => any;
    readonly filemanager_savePatternTemplate: (a: number, b: number, c: number, d: number, e: number) => any;
    readonly init: () => void;
    readonly wasm_bindgen_79dd4db9834a31a4___convert__closures_____invoke___wasm_bindgen_79dd4db9834a31a4___JsValue__core_608f92abc48d28da___result__Result_____wasm_bindgen_79dd4db9834a31a4___JsError___true_: (a: number, b: number, c: any) => [number, number];
    readonly wasm_bindgen_79dd4db9834a31a4___convert__closures_____invoke___web_sys_b122567ad5b21cdb___features__gen_Event__Event__core_608f92abc48d28da___result__Result_____web_sys_b122567ad5b21cdb___features__gen_Event__Event___true_: (a: number, b: number, c: any) => [number, number];
    readonly wasm_bindgen_79dd4db9834a31a4___convert__closures_____invoke___js_sys_b6d8ea9dbf822c4b___IteratorNext__core_608f92abc48d28da___result__Result_____wasm_bindgen_79dd4db9834a31a4___JsError___true_: (a: number, b: number, c: any) => [number, number];
    readonly wasm_bindgen_79dd4db9834a31a4___convert__closures_____invoke___js_sys_b6d8ea9dbf822c4b___Function_fn_wasm_bindgen_79dd4db9834a31a4___JsValue_____wasm_bindgen_79dd4db9834a31a4___sys__Undefined___js_sys_b6d8ea9dbf822c4b___Function_fn_wasm_bindgen_79dd4db9834a31a4___JsValue_____wasm_bindgen_79dd4db9834a31a4___sys__Undefined_______true_: (a: number, b: number, c: any, d: any) => void;
    readonly wasm_bindgen_79dd4db9834a31a4___convert__closures_____invoke___web_sys_b122567ad5b21cdb___features__gen_Event__Event______true_: (a: number, b: number, c: any) => void;
    readonly wasm_bindgen_79dd4db9834a31a4___convert__closures_____invoke___web_sys_b122567ad5b21cdb___features__gen_IdbVersionChangeEvent__IdbVersionChangeEvent______true_: (a: number, b: number, c: any) => void;
    readonly wasm_bindgen_79dd4db9834a31a4___convert__closures_____invoke___bool__true_: (a: number, b: number) => number;
    readonly wasm_bindgen_79dd4db9834a31a4___convert__closures_____invoke_______true_: (a: number, b: number) => void;
    readonly __wbindgen_malloc: (a: number, b: number) => number;
    readonly __wbindgen_realloc: (a: number, b: number, c: number, d: number) => number;
    readonly __wbindgen_exn_store: (a: number) => void;
    readonly __externref_table_alloc: () => number;
    readonly __wbindgen_externrefs: WebAssembly.Table;
    readonly __wbindgen_free: (a: number, b: number, c: number) => void;
    readonly __wbindgen_destroy_closure: (a: number, b: number) => void;
    readonly __externref_table_dealloc: (a: number) => void;
    readonly __externref_drop_slice: (a: number, b: number) => void;
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
