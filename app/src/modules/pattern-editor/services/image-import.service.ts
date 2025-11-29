import { FilesApi } from "~/pattern-editor/api/";
import type { ImageImportOptions } from "~/pattern-editor/api/";
import type { Pattern } from "~/pattern-editor/lib/pattern";

/** Manages the lifecycle of an image import session. */
export class ImageImportService {
  #id: number | null = null;

  /**
   * Starts the image import session.
   * This method must be called before using getPreview or finalize.
   */
  async start(): Promise<void> {
    if (this.#id !== null) return;
    this.#id = await FilesApi.startImageImportServer();
  }

  /**
   * Returns a preview of the pattern with the given parameters.
   * The session must be started before calling this method.
   *
   * @param imagePath - Path to the source image file
   * @param palettePath - Path to the palette file
   * @param options - Image import options
   * @returns Preview pattern
   */
  async getPreview(imagePath: string, palettePath: string, options: ImageImportOptions): Promise<Pattern> {
    if (this.#id === null) throw new Error("Session not started. Call start() first.");
    return await FilesApi.getImageImportPreview(this.#id, imagePath, palettePath, options);
  }

  /**
   * Returns the final pattern.
   * The session is automatically stopped after the finalization.
   *
   * @param imagePath - Path to the source image file
   * @param palettePath - Path to the palette file
   * @param options - Image import options
   */
  async finalize(imagePath: string, palettePath: string, options: ImageImportOptions): Promise<string> {
    if (this.#id === null) throw new Error("Session not started. Call start() first.");
    const pattern = await FilesApi.finalizeImageImport(this.#id, imagePath, palettePath, options);

    this.#id = null;

    return pattern;
  }

  /**
   * Stops the session and cleans up resources.
   * This method should be called when the session is no longer needed.
   */
  async destroy(): Promise<void> {
    if (this.#id === null) return;
    await FilesApi.stopImageImportServer(this.#id);
    this.#id = null;
  }
}
