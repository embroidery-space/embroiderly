use rstest::rstest;

use super::*;

/// Helper function to create a test palette item.
fn create_test_item(brand: &str, number: &str, name: &str, color: &str) -> PaletteItem {
  PaletteItem {
    brand: brand.to_string(),
    number: number.to_string(),
    name: name.to_string(),
    color: color.to_string(),
    blends: None,
    symbol: None,
  }
}

/// Helper function to create a blend palette item.
fn create_blend_item(brand: &str, number: &str, blends: Vec<Blend>) -> PaletteItem {
  PaletteItem {
    brand: brand.to_string(),
    number: number.to_string(),
    name: format!("{} {} Blend", brand, number),
    color: "000000".to_string(),
    blends: Some(blends),
    symbol: None,
  }
}

mod palette {
  use super::*;

  mod creation {
    use super::*;

    #[test]
    fn test_new_palette_is_empty() {
      let palette = Palette::new();
      assert!(palette.is_empty());
      assert_eq!(palette.len(), 0);
      assert_eq!(palette.positions().len(), 0);
    }

    #[test]
    fn test_default_palette_is_empty() {
      let palette = Palette::default();
      assert!(palette.is_empty());
      assert_eq!(palette.len(), 0);
      assert_eq!(palette.positions().len(), 0);
    }

    #[test]
    fn test_from_vec() {
      let items = vec![
        create_test_item("DMC", "310", "Black", "000000"),
        create_test_item("DMC", "3865", "White", "FFFFFF"),
      ];

      let palette = Palette::from(items.clone());
      assert_eq!(palette.len(), 2);
      assert_eq!(palette.positions().len(), 2);
      assert_eq!(palette.get(0).unwrap(), &items[0]);
      assert_eq!(palette.get(1).unwrap(), &items[1]);
    }

    #[test]
    fn test_from_iterator() {
      let items = vec![
        create_test_item("DMC", "310", "Black", "000000"),
        create_test_item("DMC", "2865", "White", "FFFFFF"),
      ];

      let palette: Palette = items.clone().into_iter().collect();
      assert_eq!(palette.len(), 2);
      assert_eq!(palette.positions().len(), 2);
      assert_eq!(palette.get(0).unwrap(), &items[0]);
      assert_eq!(palette.get(1).unwrap(), &items[1]);
    }
  }

  mod access {
    use super::*;

    #[test]
    fn test_get_valid_index() {
      let mut palette = Palette::new();

      let item = create_test_item("DMC", "310", "Black", "000000");
      palette.push(item.clone());

      assert_eq!(palette.get(0), Some(&item));
    }

    #[test]
    fn test_get_invalid_index() {
      let palette = Palette::new();
      assert_eq!(palette.get(0), None);
      assert_eq!(palette.get(999), None);
    }

    #[test]
    fn test_get_mut() {
      let mut palette = Palette::new();
      palette.push(create_test_item("DMC", "310", "Black", "000000"));

      if let Some(item) = palette.get_mut(0) {
        item.name = "Modified".to_string();
      }

      assert_eq!(palette.get(0).unwrap().name, "Modified");
    }

    #[test]
    fn test_index_operator() {
      let mut palette = Palette::new();

      let item = create_test_item("DMC", "310", "Black", "000000");
      palette.push(item.clone());

      assert_eq!(&palette[0], &item);
    }

    #[test]
    fn test_index_mut_operator() {
      let mut palette = Palette::new();
      palette.push(create_test_item("DMC", "310", "Black", "000000"));

      palette[0].name = "Modified".to_string();
      assert_eq!(palette[0].name, "Modified");
    }

    #[test]
    fn test_contains() {
      let mut palette = Palette::new();
      let item = create_test_item("DMC", "310", "Black", "000000");
      let other_item = create_test_item("DMC", "3865", "White", "FFFFFF");

      palette.push(item.clone());

      assert!(palette.contains(&item));
      assert!(!palette.contains(&other_item));
    }
  }

  mod mutation {
    use super::*;

    #[test]
    fn test_push() {
      let mut palette = Palette::new();

      let idx1 = palette.push(create_test_item("DMC", "310", "Black", "000000"));
      assert_eq!(idx1, 0);
      assert_eq!(palette.len(), 1);

      let idx2 = palette.push(create_test_item("DMC", "3865", "White", "FFFFFF"));
      assert_eq!(idx2, 1);
      assert_eq!(palette.len(), 2);

      assert_eq!(palette.positions(), &[0, 1]);
    }

    #[test]
    fn test_insert_at_beginning() {
      let mut palette = Palette::new();
      palette.push(create_test_item("DMC", "310", "Black", "000000"));
      palette.push(create_test_item("DMC", "3865", "White", "FFFFFF"));

      // Insert at index 0.
      palette.insert(0, create_test_item("DMC", "321", "Christmas Red", "B1272A"));

      assert_eq!(palette.len(), 3);
      assert_eq!(palette.get(0).unwrap().number, "321"); // New item at index 0.
      assert_eq!(palette.get(1).unwrap().number, "310"); // Old index 0 moved to 1.
      assert_eq!(palette.get(2).unwrap().number, "3865"); // Old index 1 moved to 2.

      // Visual order should be maintained in actual positions.
      assert_eq!(palette.positions(), &[0, 1, 2]);
    }

    #[test]
    fn test_insert_in_middle() {
      let mut palette = Palette::new();
      palette.push(create_test_item("DMC", "310", "Black", "000000"));
      palette.push(create_test_item("DMC", "3865", "White", "FFFFFF"));

      palette.insert(1, create_test_item("DMC", "321", "Christmas Red", "B1272A"));

      assert_eq!(palette.len(), 3);
      assert_eq!(palette.get(0).unwrap().number, "310");
      assert_eq!(palette.get(1).unwrap().number, "321"); // New item.
      assert_eq!(palette.get(2).unwrap().number, "3865"); // Shifted.
    }

    #[test]
    fn test_remove() {
      let mut palette = Palette::new();
      palette.push(create_test_item("DMC", "310", "Black", "000000"));
      palette.push(create_test_item("DMC", "3865", "White", "FFFFFF"));
      palette.push(create_test_item("DMC", "321", "Christmas Red", "B1272A"));

      let removed = palette.remove(1);
      assert_eq!(removed.number, "3865");
      assert_eq!(palette.len(), 2);

      // After removal, what was at index 2 is now at index 1.
      assert_eq!(palette.get(0).unwrap().number, "310");
      assert_eq!(palette.get(1).unwrap().number, "321");
    }

    #[test]
    fn test_remove_first() {
      let mut palette = Palette::new();
      palette.push(create_test_item("DMC", "310", "Black", "000000"));
      palette.push(create_test_item("DMC", "3865", "White", "FFFFFF"));
      palette.push(create_test_item("DMC", "321", "Christmas Red", "B1272A"));

      palette.remove(0);
      assert_eq!(palette.len(), 2);
      assert_eq!(palette.get(0).unwrap().number, "3865");
      assert_eq!(palette.get(1).unwrap().number, "321");
    }

    #[test]
    fn test_remove_last() {
      let mut palette = Palette::new();
      palette.push(create_test_item("DMC", "310", "Black", "000000"));
      palette.push(create_test_item("DMC", "3865", "White", "FFFFFF"));

      palette.remove(1);
      assert_eq!(palette.len(), 1);
      assert_eq!(palette.get(0).unwrap().number, "310");
    }

    #[test]
    fn test_pop_empty() {
      let mut palette = Palette::new();
      assert_eq!(palette.pop(), None);
    }

    #[test]
    fn test_pop_non_empty() {
      let mut palette = Palette::new();
      palette.push(create_test_item("DMC", "310", "Black", "000000"));
      palette.push(create_test_item("DMC", "3865", "White", "FFFFFF"));

      let popped = palette.pop();
      assert!(popped.is_some());
      assert_eq!(popped.unwrap().number, "3865");
      assert_eq!(palette.len(), 1);
    }

    #[test]
    fn test_insert_remove_preserves_references() {
      let mut palette = Palette::new();
      let idx0 = palette.push(create_test_item("DMC", "310", "Black", "000000"));
      let idx1 = palette.push(create_test_item("DMC", "3865", "White", "FFFFFF"));
      palette.push(create_test_item("DMC", "321", "Christmas Red", "B1272A"));

      // Store reference to item at index 0.
      let original_item = palette.get(idx0).unwrap().clone();

      // Remove middle item.
      palette.remove(idx1);

      // Item at index 0 should still be the same.
      assert_eq!(palette.get(idx0).unwrap(), &original_item);

      // Item originally at index 2 is now at index 1.
      assert_eq!(palette.get(1).unwrap().number, "321");
    }

    #[test]
    fn test_multiple_inserts_and_removes() {
      let mut palette = Palette::new();

      // Add three items.
      palette.push(create_test_item("DMC", "310", "Black", "000000"));
      palette.push(create_test_item("DMC", "3865", "White", "FFFFFF"));
      palette.push(create_test_item("DMC", "321", "Christmas Red", "B1272A"));

      // Remove middle.
      palette.remove(1);
      assert_eq!(palette.len(), 2);

      // Insert at beginning.
      palette.insert(0, create_test_item("DMC", "336", "Navy Blue", "344661"));
      assert_eq!(palette.len(), 3);
      assert_eq!(palette.get(0).unwrap().number, "336");
      assert_eq!(palette.get(1).unwrap().number, "310");
      assert_eq!(palette.get(2).unwrap().number, "321");
    }
  }

  mod iteration {
    use super::*;

    #[test]
    fn test_iter() {
      let mut palette = Palette::new();
      palette.push(create_test_item("DMC", "310", "Black", "000000"));
      palette.push(create_test_item("DMC", "3865", "White", "FFFFFF"));
      palette.push(create_test_item("DMC", "321", "Christmas Red", "B1272A"));

      let items: Vec<_> = palette.iter().collect();
      assert_eq!(items.len(), 3);
      assert_eq!(items[0].number, "310");
      assert_eq!(items[1].number, "3865");
      assert_eq!(items[2].number, "321");
    }

    #[test]
    fn test_iter_empty() {
      let palette = Palette::new();
      let items: Vec<_> = palette.iter().collect();
      assert_eq!(items.len(), 0);
    }
  }

  mod conversion {
    use super::*;

    #[test]
    fn test_as_ref() {
      let mut palette = Palette::new();
      palette.push(create_test_item("DMC", "310", "Black", "000000"));
      palette.push(create_test_item("DMC", "3865", "White", "FFFFFF"));

      let slice: &[PaletteItem] = palette.as_ref();
      assert_eq!(slice.len(), 2);
      assert_eq!(slice[0].number, "310");
    }

    #[test]
    fn test_as_mut() {
      let mut palette = Palette::new();
      palette.push(create_test_item("DMC", "310", "Black", "000000"));

      let vec: &mut Vec<PaletteItem> = palette.as_mut();
      vec[0].name = "Modified".to_string();

      assert_eq!(palette.get(0).unwrap().name, "Modified");
    }

    #[test]
    fn test_into_vec() {
      let mut palette = Palette::new();
      palette.push(create_test_item("DMC", "310", "Black", "000000"));
      palette.push(create_test_item("DMC", "3865", "White", "FFFFFF"));

      let vec: Vec<PaletteItem> = palette.into();
      assert_eq!(vec.len(), 2);
      assert_eq!(vec[0].number, "310");
      assert_eq!(vec[1].number, "3865");
    }
  }

  mod ordering {

    use super::*;

    #[test]
    fn test_sort_by_brand_and_number_basic() {
      let mut palette = Palette::new();
      let idx0 = palette.push(create_test_item("DMC", "321", "Christmas Red", "B1272A"));
      let idx1 = palette.push(create_test_item("DMC", "310", "Black", "000000"));
      let idx2 = palette.push(create_test_item("DMC", "3865", "White", "FFFFFF"));

      // Store items before sorting
      let item0 = palette.get(idx0).unwrap().clone();
      let item1 = palette.get(idx1).unwrap().clone();
      let item2 = palette.get(idx2).unwrap().clone();

      let new_positions = palette.sort_by_brand_and_number();

      // Items should be sorted: DMC 310, DMC 321, DMC 3865
      assert_eq!(new_positions, vec![1, 0, 2]);
      assert_eq!(palette.positions(), &[1, 0, 2]);

      // Items should still be accessible by their original indexes
      assert_eq!(palette.get(idx0).unwrap(), &item0);
      assert_eq!(palette.get(idx1).unwrap(), &item1);
      assert_eq!(palette.get(idx2).unwrap(), &item2);
    }

    #[test]
    fn test_sort_by_brand_and_number_multiple_brands() {
      let mut palette = Palette::new();
      palette.push(create_test_item("DMC", "321", "Christmas Red", "B1272A"));
      palette.push(create_test_item("Anchor", "403", "Black", "000000"));
      palette.push(create_test_item("Madeira", "1", "White", "FFFFFF"));
      palette.push(create_test_item("DMC", "310", "Black", "000000"));

      let new_positions = palette.sort_by_brand_and_number();

      // Sorted: Anchor 403, DMC 310, DMC 321, Madeira 1
      assert_eq!(new_positions, vec![1, 3, 0, 2]);
      assert_eq!(palette.positions(), &[1, 3, 0, 2]);
    }

    #[test]
    fn test_sort_by_brand_and_number_already_sorted() {
      let mut palette = Palette::new();
      palette.push(create_test_item("DMC", "310", "Black", "000000"));
      palette.push(create_test_item("DMC", "321", "Christmas Red", "B1272A"));
      palette.push(create_test_item("DMC", "3865", "White", "FFFFFF"));

      let new_positions = palette.sort_by_brand_and_number();

      // Already sorted, positions should remain unchanged
      assert_eq!(new_positions, vec![0, 1, 2]);
      assert_eq!(palette.positions(), &[0, 1, 2]);
    }

    #[test]
    fn test_sort_by_brand_and_number_empty() {
      let mut palette = Palette::new();

      let new_positions = palette.sort_by_brand_and_number();

      assert_eq!(new_positions, Vec::<u32>::new());
      assert_eq!(palette.positions(), &[]);
    }

    #[test]
    fn test_sort_by_brand_and_number_single_item() {
      let mut palette = Palette::new();
      palette.push(create_test_item("DMC", "310", "Black", "000000"));

      let new_positions = palette.sort_by_brand_and_number();

      assert_eq!(new_positions, vec![0]);
      assert_eq!(palette.positions(), &[0]);
    }

    #[test]
    fn test_sort_by_brand_and_number_with_blanc() {
      let mut palette = Palette::new();
      palette.push(create_test_item("DMC", "321", "Christmas Red", "B1272A"));
      palette.push(create_test_item("DMC", "blanc", "White", "FFFFFF"));
      palette.push(create_test_item("DMC", "310", "Black", "000000"));

      let new_positions = palette.sort_by_brand_and_number();

      // Alphanumeric sort: DMC 310, DMC 321, DMC blanc
      assert_eq!(new_positions, vec![2, 0, 1]);
      assert_eq!(palette.positions(), &[2, 0, 1]);
    }

    #[rstest]
    #[case(1, 1, vec![0, 1, 2])]
    #[case(0, 2, vec![1, 2, 0])]
    #[case(2, 0, vec![2, 0, 1])]
    #[case(1, 0, vec![1, 0, 2])]
    #[case(1, 2, vec![0, 2, 1])]
    #[case(0, 1, vec![1, 0, 2])]
    fn test_reorder_palette_items(
      #[case] old_position: u32,
      #[case] new_position: u32,
      #[case] expected_positions: Vec<u32>,
    ) {
      let mut palette = Palette::new();
      palette.push(create_test_item("DMC", "310", "Black", "000000"));
      palette.push(create_test_item("DMC", "3865", "White", "FFFFFF"));
      palette.push(create_test_item("DMC", "321", "Christmas Red", "B1272A"));

      let new_positions = palette.reorder_palette_items(old_position, new_position);

      assert_eq!(new_positions, expected_positions);
      assert_eq!(palette.positions(), expected_positions.as_slice());

      // Items should still be accessible by their original indexes.
      assert_eq!(palette.get(0).unwrap().number, "310");
      assert_eq!(palette.get(1).unwrap().number, "3865");
      assert_eq!(palette.get(2).unwrap().number, "321");
    }
  }

  mod utility {
    use super::*;

    #[test]
    fn test_blends_number_empty() {
      let palette = Palette::new();
      assert_eq!(palette.blends_number(), 0);
    }

    #[test]
    fn test_blends_number_no_blends() {
      let mut palette = Palette::new();
      palette.push(create_test_item("DMC", "310", "Black", "000000"));
      palette.push(create_test_item("DMC", "3865", "White", "FFFFFF"));

      assert_eq!(palette.blends_number(), 0);
    }

    #[test]
    fn test_blends_number_with_blends() {
      let mut palette = Palette::new();
      palette.push(create_test_item("DMC", "310", "Black", "000000"));
      palette.push(create_blend_item(
        "DMC",
        "Black & White",
        vec![
          Blend {
            brand: "DMC".to_string(),
            number: "310".to_string(),
          },
          Blend {
            brand: "DMC".to_string(),
            number: "3865".to_string(),
          },
        ],
      ));
      palette.push(create_test_item("DMC", "3865", "White", "FFFFFF"));

      assert_eq!(palette.blends_number(), 1);
    }

    #[test]
    fn test_blends_number_multiple_blends() {
      let mut palette = Palette::new();
      palette.push(create_blend_item(
        "DMC",
        "Black & White",
        vec![
          Blend {
            brand: "DMC".to_string(),
            number: "310".to_string(),
          },
          Blend {
            brand: "DMC".to_string(),
            number: "3865".to_string(),
          },
        ],
      ));
      palette.push(create_blend_item(
        "DMC",
        "Red & White",
        vec![
          Blend {
            brand: "DMC".to_string(),
            number: "321".to_string(),
          },
          Blend {
            brand: "DMC".to_string(),
            number: "3865".to_string(),
          },
        ],
      ));

      assert_eq!(palette.blends_number(), 2);
    }

    #[test]
    fn test_blends_number_with_empty_blend_vec() {
      let mut palette = Palette::new();
      let mut item = create_test_item("DMC", "310", "Black", "000000");
      item.blends = Some(vec![]); // Empty blend vec should not count.
      palette.push(item);

      assert_eq!(palette.blends_number(), 0);
    }

    #[test]
    fn test_used_brands_empty() {
      let palette = Palette::new();
      assert_eq!(palette.used_brands().len(), 0);
    }

    #[test]
    fn test_used_brands_single_brand() {
      let mut palette = Palette::new();
      palette.push(create_test_item("DMC", "310", "Black", "000000"));
      palette.push(create_test_item("DMC", "3865", "White", "FFFFFF"));

      let brands = palette.used_brands();
      assert_eq!(brands.len(), 1);
      assert!(brands.contains(&"DMC".to_string()));
    }

    #[test]
    fn test_used_brands_multiple_brands() {
      let mut palette = Palette::new();
      palette.push(create_test_item("DMC", "310", "Black", "000000"));
      palette.push(create_test_item("Anchor", "403", "Black", "000000"));
      palette.push(create_test_item("DMC", "3865", "White", "FFFFFF"));
      palette.push(create_test_item("Madeira", "1234", "Red", "#FF0000"));

      let brands = palette.used_brands();
      assert_eq!(brands.len(), 3);
      assert!(brands.contains(&"DMC".to_string()));
      assert!(brands.contains(&"Anchor".to_string()));
      assert!(brands.contains(&"Madeira".to_string()));
    }

    #[test]
    fn test_used_symbol_fonts_empty() {
      let palette = Palette::new();
      assert_eq!(palette.used_symbol_fonts().len(), 0);
    }

    #[test]
    fn test_used_symbol_fonts_no_fonts() {
      let mut palette = Palette::new();
      palette.push(create_test_item("DMC", "310", "Black", "000000"));
      palette.push(create_test_item("DMC", "3865", "White", "FFFFFF"));

      assert_eq!(palette.used_symbol_fonts().len(), 0);
    }

    #[test]
    fn test_used_symbol_fonts_with_fonts() {
      let mut palette = Palette::new();

      let mut item1 = create_test_item("DMC", "310", "Black", "000000");
      item1.symbol = Some(Symbol {
        char: 'A',
        font: "Ursasoftware".to_string(),
      });
      palette.push(item1);

      let mut item2 = create_test_item("DMC", "3865", "White", "FFFFFF");
      item2.symbol = Some(Symbol {
        char: 'B',
        font: "CrossStitch3".to_string(),
      });
      palette.push(item2);

      let mut item3 = create_test_item("DMC", "321", "Christmas Red", "B1272A");
      item3.symbol = Some(Symbol {
        char: 'C',
        font: "Ursasoftware".to_string(),
      });
      palette.push(item3);

      let fonts = palette.used_symbol_fonts();
      assert_eq!(fonts.len(), 2);
      assert!(fonts.contains(&"Ursasoftware".to_string()));
      assert!(fonts.contains(&"CrossStitch3".to_string()));
    }
  }
}

mod palette_item {
  use super::*;

  #[test]
  fn test_is_blend_false() {
    let item = create_test_item("DMC", "310", "Black", "000000");
    assert!(!item.is_blend());
  }

  #[test]
  fn test_is_blend_empty_vec() {
    let mut item = create_test_item("DMC", "310", "Black", "000000");
    item.blends = Some(vec![]);
    assert!(!item.is_blend());
  }

  #[test]
  fn test_is_blend_true() {
    let item = create_blend_item(
      "DMC",
      "310+White",
      vec![
        Blend {
          brand: "DMC".to_string(),
          number: "310".to_string(),
        },
        Blend {
          brand: "DMC".to_string(),
          number: "White".to_string(),
        },
      ],
    );
    assert!(item.is_blend());
  }

  #[test]
  fn test_from_brand_item() {
    let brand_item = BrandPaletteItem {
      brand: "DMC".to_string(),
      number: "310".to_string(),
      name: "Black".to_string(),
      color: "000000".to_string(),
      blends: None,
    };

    let palette_item = PaletteItem::from(brand_item.clone());
    assert_eq!(palette_item.brand, brand_item.brand);
    assert_eq!(palette_item.number, brand_item.number);
    assert_eq!(palette_item.name, brand_item.name);
    assert_eq!(palette_item.color, brand_item.color);
    assert_eq!(palette_item.blends, brand_item.blends);
    assert_eq!(palette_item.symbol, None);
  }

  #[test]
  fn test_from_brand_item_with_blends() {
    let brand_item = BrandPaletteItem {
      brand: "DMC".to_string(),
      number: "310+White".to_string(),
      name: "Gray Blend".to_string(),
      color: "#808080".to_string(),
      blends: Some(vec![
        Blend {
          brand: "DMC".to_string(),
          number: "310".to_string(),
        },
        Blend {
          brand: "DMC".to_string(),
          number: "White".to_string(),
        },
      ]),
    };

    let palette_item = PaletteItem::from(brand_item.clone());
    assert_eq!(palette_item.blends, brand_item.blends);
    assert!(palette_item.is_blend());
  }
}

mod symbol {
  use super::*;

  #[test]
  fn test_symbol_creation_valid_char() {
    let symbol = Symbol::new('A', "Arial".to_string());
    assert!(symbol.is_some());

    let symbol = symbol.unwrap();
    assert_eq!(symbol.char, 'A');
    assert_eq!(symbol.font, "Arial");
  }

  #[test]
  fn test_symbol_creation_valid_unicode_ranges() {
    // Range 0x0021..=0xD7FF
    assert!(Symbol::new('\u{0021}', "Font".to_string()).is_some()); // '!'
    assert!(Symbol::new('\u{00A0}', "Font".to_string()).is_some()); // Non-breaking space
    assert!(Symbol::new('\u{D7FF}', "Font".to_string()).is_some()); // Upper limit of first range

    // Range 0xE000..=0xFFFD
    assert!(Symbol::new('\u{E000}', "Font".to_string()).is_some()); // Private use area start
    assert!(Symbol::new('\u{F000}', "Font".to_string()).is_some()); // Private use area
    assert!(Symbol::new('\u{FFFD}', "Font".to_string()).is_some()); // Replacement character
  }

  #[test]
  fn test_symbol_creation_invalid_chars() {
    assert!(Symbol::new('\u{0000}', "Font".to_string()).is_none()); // NULL
    assert!(Symbol::new('\u{0010}', "Font".to_string()).is_none()); // Control character
    assert!(Symbol::new('\u{0020}', "Font".to_string()).is_none()); // Space (below 0x0021)

    // Test surrogate pair range by creating from code points
    assert!(Symbol::new(char::from_u32(0xD800).unwrap_or('\0'), "Font".to_string()).is_none());
    assert!(Symbol::new(char::from_u32(0xDFFF).unwrap_or('\0'), "Font".to_string()).is_none());

    assert!(Symbol::new('\u{FFFE}', "Font".to_string()).is_none()); // Above 0xFFFD
    assert!(Symbol::new('\u{FFFF}', "Font".to_string()).is_none()); // Above 0xFFFD
  }
}
