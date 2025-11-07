/// Distributes a total palette size across pyramid levels using exponential weighting.
/// Fractional parts are cascaded from higher to lower levels to avoid loosing colors.
/// The distribution sum is guaranteed to be equal to the total size of the palette.
/// Higher pyramid levels receive exponentially less colors since they contain less details.
pub fn calculate_palette_size_per_pyramid_level(levels: usize, palette_size: usize) -> Vec<usize> {
  // Calculate exponentially-weighted components for each level.
  let components = (0..levels)
    .map(|_| {
      // Apply base formula: palette_size divided by normalization constant.
      (palette_size as f64) / (1.0f64 + std::f64::consts::E + 2.0f64.exp())
    })
    .enumerate()
    .map(|(i, n)| {
      // Multiply by `e^i` to create exponential growth.
      let n = n * (i as f64).exp();
      // Then split into integer and fractional parts.
      (n.trunc(), n.fract())
    })
    .collect::<Vec<_>>();

  // Redistribute fractional parts to avoid losing colors during rounding
  // Process in reverse order (highest to lowest pyramid level).
  let mut sizes = Vec::with_capacity(levels);
  for (i, (n, f)) in components.into_iter().rev().enumerate() {
    if i == 0 {
      // On the first iteration (the highest level), keep both integer and fractional parts.
      sizes.push(n + f);
    } else {
      // On subsequent iterations, cascade fractional part to previous (lower) level.
      sizes[i - 1] += f;
      sizes.push(n);
    }
  }

  // Round accumulated values.
  let distribution: Vec<usize> = sizes.into_iter().map(|s| s.round() as usize).collect();
  debug_assert_eq!(distribution.iter().sum::<usize>(), palette_size);

  distribution
}
