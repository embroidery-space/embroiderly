---
description: Learn how to use reference images as visual guides while designing cross-stitch patterns in Embroiderly.
head:
  - - meta
    - name: keywords
      content: reference image, image tracing, visual guide, canvas overlay, image manipulation
---

# Reference Images

Reference images let you display a picture on your canvas as a visual guide while drawing your pattern.
This is useful when you want to trace over an image or use it as inspiration while working.

Unlike imported patterns, reference images don't automatically convert to stitches.
They appear beneath all stitches on your canvas, allowing you to trace over them manually while always seeing your work on top.

## Adding a Reference Image

To add a reference image to your pattern:

1. Right-click anywhere on the canvas
2. Select **Set Reference Image** from the menu
3. Choose an image file from your computer

The image appears on your canvas, positioned at the top-left corner and scaled to approximately match your pattern dimensions.

> [!NOTE]
> Only one reference image can be active at a time.
> Adding a new reference image replaces the previous one.

## Removing Reference Images

To remove a reference image:

1. Right-click on the canvas
2. Select **Remove Reference Image**

The reference image is deleted immediately.
This doesn't affect any stitches you've already drawn.

## Manipulating Reference Images

The **Cursor** tool lets you adjust your reference image's position, size, rotation, and transparency.

<figure>
  <img src="/images/guide/reference-images/cursor-tool.png">
  <figcaption>The Cursor tool in the palette toolbar.</figcaption>
</figure>

Select the Cursor tool from the palette toolbar (press `C`) to begin working with your reference image.

### Focusing the Image

Click directly on the reference image to focus it.
When focused, the image gains a selection outline with control handles around it.

<figure>
  <img src="/images/guide/reference-images/reference-image-focused.png">
  <figcaption>A focused reference image with visible selection controls and opacity slider.</figcaption>
</figure>

Click anywhere outside the reference image to unfocus it and hide the controls.

### Moving the Image

To move the reference image:

1. Focus the image by clicking on it
2. Click and drag anywhere inside the selection outline
3. Release the mouse button to place it

The image moves freely across your canvas.
You can position it anywhere, even partially outside the visible pattern area.

### Resizing the Image

To resize the reference image:

1. Focus the image by clicking on it
2. Click and drag any corner handle or edge
3. Release to finish resizing

As you drag, the opposite corner or edge remains anchored in place while the image scales.
You can resize the image to any dimension, from very small to much larger than your pattern.

> [!WARNING]
> Currently, resizing doesn't maintain the image's aspect ratio.
> You can stretch or compress the image freely in any direction.

### Rotating the Image

To rotate the reference image:

1. Focus the image by clicking on it
2. Locate the rotation control (a small dot at the middle of the top edge)
3. Click and drag the rotation control
4. Release to finish rotating

The image rotates around its center point.
You can rotate to any angle, allowing you to align the reference image with your pattern grid however you need.

### Adjusting Opacity

The opacity slider controls how transparent the reference image appears.

To adjust opacity:

1. Focus the image by clicking on it
2. Locate the opacity slider at the bottom-right (it looks like a sun icon)
3. Click and drag the slider left (more transparent) or right (more opaque)

Lower opacity makes the reference image more subtle, which can be helpful when you want to focus primarily on your stitches while still seeing the reference guide beneath them.

Higher opacity makes the reference image more prominent and easier to see in detail.

Since reference images are always rendered beneath your stitches, your embroidery work remains visible on top regardless of the opacity setting.

## Reference Image Persistence

Reference images are saved as part of your pattern file.

When you save your pattern, Embroiderly includes the image itself (embedded in your `.embproj` file) and all of its settings.

When you reopen the pattern later, your reference image appears exactly as you left it.
You don't need to keep the original image file---everything is stored in your pattern.

> [!NOTE]
> Reference images increase your pattern file size.
> Large photos may create notably bigger `.embproj` files.
