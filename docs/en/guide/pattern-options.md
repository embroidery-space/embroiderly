---
description: Learn how to configure pattern information, fabric properties, and grid display settings in Embroiderly.
---

# Pattern Options

Embroiderly allows you to customize various aspects of your pattern, including pattern information, fabric properties, and grid display settings.
You can access these options through the **Pattern** menu in the menu bar.

<figure>
  <img src="/images/guide/pattern-options/pattern-menu.png"/>
  <figcaption>The <strong>Pattern</strong> menu in the menu bar.</figcaption>
</figure>

## Pattern Information

Pattern information includes metadata about your pattern, such as the title, author, copyright notice, and description.
This information is embedded in your pattern file and exported PDF documents.

<figure>
  <img src="/images/guide/pattern-options/pattern-info-modal.png"/>
  <figcaption>The <strong>Pattern Information</strong> window showing pattern title, author, copyright, and description.</figcaption>
</figure>

The **Pattern Information** window contains a form with four text fields:

- **Title**. The name of your pattern.
- **Author**. The name of the pattern designer.
- **Copyright**. Copyright notice or license information.
- **Description**. A longer text area for additional details about the pattern.

Filling the pattern information helps you organize your patterns and provides useful information when sharing patterns with others.

## Fabric Properties

Fabric properties define the physical characteristics of the fabric you'll stitch on.
These settings determine the final size of your pattern and how it appears on the screen.

<figure>
  <img src="/images/guide/pattern-options/fabric-modal.png" />
  <figcaption>The <strong>Fabric Properties</strong> window showing fabric count, kind, size, and color options.</figcaption>
</figure>

### Fabric Count and Kind

The **Count** specifies how many stitches fit per inch of fabric.
Common values include 14, 16, 18, and 20 count.

The **Kind** indicates the type of the fabric material.
Common options include Aida, Evenweave, and Linen.

> At the moment, the fabric kind is purely informational property.
> It doesn't affect any other aspect of the pattern.

### Fabric Size

The **Size** determines how large your pattern is.

You can specify the size in three different units: stitches, inches, or millimeters.
Use the radio buttons on the right to switch between units.
When you change units, Embroiderly automatically converts the values based on your fabric count.

Enter the width and height values in the input fields.

Below the input fields, you'll see a summary showing the total fabric size in all three units.
This helps you visualize the physical dimensions of your pattern.

> [!NOTE]
> If you reduce the fabric size below the current pattern dimensions, any stitches outside the new bounds will be removed.
> The fabric bounds are defined from the top left corner (i.e., the 0x0 point) to the bottom right corner (i.e., the WxH point).

### Fabric Color

In the **Color** section, there is a palette of common fabric colors.
Click any to select it.

The selected color name appears below the palette.
The color affects how your pattern appears on the screen and in exported PDFs, helping you visualize how the final pattern will look on the chosen fabric.

## Grid Properties

The grid overlays your pattern to help you count stitches and navigate within the pattern.
You can customize the grid's appearance by adjusting line intervals, thickness, and colors.

<figure>
  <img src="/images/guide/pattern-options/grid-modal.png"/>
  <figcaption>The <strong>Grid Properties</strong> window showing major and minor lines settings.</figcaption>
</figure>

The **Major Lines Interval** controls how often major lines appear.

**Major Lines** are the thicker grid lines that help you identify larger blocks of stitches.
They're easier to see and help you orient within the pattern.

**Minor Lines** are the thinner grid lines that appear between all stitches.
They help you count individual stitches.

Both **Major Lines** and **Minor Lines** share the same set of options:

- **Pixel Line**. When enabled, the line is always drawn as a single pixel regardless of the canvas zoom level.
  This gives a crisp, hair-thin appearance at any zoom.
  When **Pixel Line** is on, the **Thickness** input is disabled, because a pixel-perfect line can't be scaled.
- **Thickness**. A relative value between 50% and 500% that controls the line width when **Pixel Line** is off.
- **Color**. The color of the grid line.

  > [!TIP]
  > Click on the color swatch to open a color picker.
