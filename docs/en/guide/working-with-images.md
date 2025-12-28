---
description: Learn how to import images as cross-stitch patterns and use reference images to trace designs in Embroiderly.
head:
  - - meta
    - name: keywords
      content: image import, reference image, pattern from photo, dithering, color quantization, image tracing
---

# Working with Images

Embroiderly provides two powerful ways to work with images in your cross-stitch patterns.
You can convert photos into complete patterns, or use reference images as visual guides while creating your patterns manually.

## Converting Images to Patterns

Image import transforms any photo or graphic into a cross-stitch pattern by analyzing the colors and mapping them to thread colors from your chosen palette.

### Opening the Import Dialog

To import an image:

1. Open the **File** menu in the menu bar
2. Select **Import -> Image**
3. Choose the image file you want to convert

The image import window opens with your selected image ready to process.

<figure>
  <img src="/images/guide/working-with-images/image-import-modal.png">
  <figcaption>The image import window showing options and live preview.</figcaption>
</figure>

> You can also select a different image or drag and drop it into the preview area to replace the current image.

The import window is divided into two main sections.

The **left panel** contains all import options.
You can adjust these settings to fine-tune how your image converts into stitches.

The **right panel** shows a live preview of your pattern.
The preview updates automatically as you change settings, so you can see exactly how your final pattern will look before importing.

At the bottom of the preview, you'll see two important statistics: the number of colors in the pattern and the total number of stitches.
These numbers help you estimate the complexity and time required to complete the physical embroidery.

### Pattern Size

The **Width** and **Height** fields determine how many stitches your pattern will contain.

Embroiderly automatically calculates an initial size based on your image dimensions, scaled down to approximately 10% of the original.
For example, a 1000x800 pixel image starts at roughly 100x80 stitches.

You can adjust these values to make your pattern larger (more detail, longer stitching time) or smaller (less detail, quicker to stitch).

The aspect ratio lock maintains your image's original proportions as you change one dimension.
Click the lock icon to disable this feature if you need to stretch or compress the image.

> [!NOTE]
> The maximum pattern size matches your original image dimensions.
> You can't create a pattern larger than the source image.

### Palette Selection

The palette selector determines which thread colors are available for your pattern.

Click the palette selector to browse available palettes.
Embroiderly includes both system palettes (pre-installed professional thread collections from major manufacturers) and custom palettes (ones you've imported yourself).

> For more information about palette catalogs and how to import custom palettes, see the [Palette & Symbols](./palette-and-symbols#managing-the-palette-catalog) chapter.

### Palette Size

This slider controls the maximum number of different thread colors in your final pattern.

Fewer colors create simpler patterns that are quicker to stitch but may lose subtle color details.
More colors preserve detail and smooth gradients but make the pattern more complex.

> You can use up to 256 colors from your selected palette, though patterns with that many threads are extremely time-consuming to complete.

### Advanced Options

The image import process provides two advanced option groups that control how your image is converted to stitches.

#### Color Reduction

Color reduction determines how Embroiderly analyzes and simplifies the colors in your image.

The conversion process uses a technique called [color quantization](https://en.wikipedia.org/wiki/Color_quantization) to reduce thousands or millions of colors in your image down to a manageable palette.
This works by grouping similar colors together and finding the best representative colors for your pattern.

##### Sampling Precision

This slider controls how thoroughly Embroiderly analyzes your image's colors during the quantization process.

When sampling precision is set to lower values (like 30%), Embroiderly analyzes a random subset of pixels rather than every single pixel.
This speeds up processing while still producing good results for most images.

Higher precision values (like 100%) analyze more pixels, which produces more accurate color mapping but takes longer to process.

**When to adjust sampling precision:**

- **Lower precision (30-50%).**
  Faster previews when experimenting with options.
  Works well for images with large areas of similar colors.
- **Medium precision (50-80%).**
  Good balance for most photos.
  Provides accurate results without long processing times
- **Higher precision (80-100%).**
  Best for images with complex color gradients or important subtle details.
  Use when you notice color banding or inaccurate color mapping

<figure>
  <img src="/images/guide/working-with-images/sampling-precision-comparison.png">
  <figcaption>Comparison of low sampling precision (10%, left) versus high sampling precision (100%, right).</figcaption>
</figure>

#### Dithering

[Dithering](https://en.wikipedia.org/wiki/Dither) is a technique that creates the illusion of additional colors by arranging stitches of different colors in alternating patterns.

When dithering _is disabled_, solid areas of each color are placed next to each other.
This creates sharp boundaries between colors and may produce visible "bands" in gradients.

When dithering _is enabled_, Embroiderly places stitches of different colors adjacent to each other in a scattered or checkerboard-like pattern.
Each individual stitch still uses a single thread color, but when you view the pattern from a distance, your eyes optically blend these neighboring stitches together.
This creates the appearance of smoother color transitions and intermediate colors that aren't actually in your palette.

##### Apply Dithering

Check this box to enable dithering for your pattern.
Uncheck it to convert the image without any dithering.

##### Error Diffusion

This slider controls how aggressively Embroiderly applies dithering.

Lower values (like 25%) apply subtle dithering.
Color transitions remain relatively smooth, but you may still notice some banding in gradients.

Higher values (like 87.5%, the default) apply stronger dithering.
This creates the smoothest gradients and best color blending, though individual stitches may look more speckled when viewed up close.

**When to adjust dithering:**

- **Disabled or low error diffusion (0-40%).**
  Images with solid color areas and sharp edges, like logos or simple graphics where you want clean color boundaries.
- **Medium error diffusion (40-70%).**
  General photos where you want some gradient smoothing without too much color speckle.
- **High error diffusion (70-100%).**
  Portrait photos or images with smooth gradients where subtle color transitions are important.

<figure>
  <img src="/images/guide/working-with-images/dithering-strength-comparison.png">
  <figcaption>Comparison of no dithering (left) versus high dithering strength (87.5%, right).</figcaption>
</figure>

### Importing the Pattern

Once you're satisfied with your preview, click the **Import Image** button at the bottom of the window.

Embroiderly creates a new pattern from your image and opens it in the pattern editor.
You can now edit it like any other pattern---add or remove stitches, edit the palette, or adjust the fabric settings.

## Working with Reference Images

Reference images let you display a picture on your canvas as a visual guide while drawing your pattern.
This is useful when you want to trace over an image or use it as inspiration while working.

Unlike imported patterns, reference images don't automatically convert to stitches.
They appear beneath all stitches on your canvas, allowing you to trace over them manually while always seeing your work on top.

### Adding a Reference Image

To add a reference image to your pattern:

1. Right-click anywhere on the canvas
2. Select **Set Reference Image** from the menu
3. Choose an image file from your computer

The image appears on your canvas, positioned at the top-left corner and scaled to approximately match your pattern dimensions.

> [!NOTE]
> Only one reference image can be active at a time.
> Adding a new reference image replaces the previous one.

### Removing Reference Images

To remove a reference image:

1. Right-click on the canvas
2. Select **Remove Reference Image**

The reference image is deleted immediately.
This doesn't affect any stitches you've already drawn.

### Manipulating Reference Images

The **Cursor** tool lets you adjust your reference image's position, size, rotation, and transparency.

<figure>
  <img src="/images/guide/working-with-images/cursor-tool.png">
  <figcaption>The Cursor tool in the palette toolbar.</figcaption>
</figure>

Select the Cursor tool from the palette toolbar (press `C`) to begin working with your reference image.

#### Focusing the Image

Click directly on the reference image to focus it.
When focused, the image gains a selection outline with control handles around it.

<figure>
  <img src="/images/guide/working-with-images/reference-image-focused.png">
  <figcaption>A focused reference image with visible selection controls and opacity slider.</figcaption>
</figure>

Click anywhere outside the reference image to unfocus it and hide the controls.

#### Moving the Image

To move the reference image:

1. Focus the image by clicking on it
2. Click and drag anywhere inside the selection outline
3. Release the mouse button to place it

The image moves freely across your canvas.
You can position it anywhere, even partially outside the visible pattern area.

#### Resizing the Image

To resize the reference image:

1. Focus the image by clicking on it
2. Click and drag any corner handle or edge
3. Release to finish resizing

As you drag, the opposite corner or edge remains anchored in place while the image scales.
You can resize the image to any dimension, from very small to much larger than your pattern.

> [!WARNING]
> Currently, resizing doesn't maintain the image's aspect ratio.
> You can stretch or compress the image freely in any direction.

#### Rotating the Image

To rotate the reference image:

1. Focus the image by clicking on it
2. Locate the rotation control (a small dot at the middle of the top edge)
3. Click and drag the rotation control
4. Release to finish rotating

The image rotates around its center point.
You can rotate to any angle, allowing you to align the reference image with your pattern grid however you need.

#### Adjusting Opacity

The opacity slider controls how transparent the reference image appears.

To adjust opacity:

1. Focus the image by clicking on it
2. Locate the opacity slider at the bottom-right (it looks like a sun icon)
3. Click and drag the slider left (more transparent) or right (more opaque)

Lower opacity makes the reference image more subtle, which can be helpful when you want to focus primarily on your stitches while still seeing the reference guide beneath them.

Higher opacity makes the reference image more prominent and easier to see in detail.

Since reference images are always rendered beneath your stitches, your embroidery work remains visible on top regardless of the opacity setting.

### Reference Image Persistence

Reference images are saved as part of your pattern file.

When you save your pattern, Embroiderly includes the image itself (embedded in your `.embproj` file) and all of its settings.

When you reopen the pattern later, your reference image appears exactly as you left it.
You don't need to keep the original image file---everything is stored in your pattern.

> [!NOTE]
> Reference images increase your pattern file size.
> Large photos may create notably bigger `.embproj` files.
