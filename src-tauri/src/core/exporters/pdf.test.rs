// #[test]
// fn converts_hex_to_pdf_rgb() {
//   let test_cases = [
//     ("#FF0000", (1.0, 0.0, 0.0)),                   // Red
//     ("#00FF00", (0.0, 1.0, 0.0)),                   // Green
//     ("#0000FF", (0.0, 0.0, 1.0)),                   // Blue
//     ("#FFFF00", (1.0, 1.0, 0.0)),                   // Yellow
//     ("#00FFFF", (0.0, 1.0, 1.0)),                   // Cyan
//     ("#FF00FF", (1.0, 0.0, 1.0)),                   // Magenta
//     ("#800080", (0.5019608, 0.0, 0.5019608)),       // Purple
//     ("#FFA500", (1.0, 0.64705884, 0.0)),            // Orange
//     ("#40E0D0", (0.2509804, 0.8784314, 0.8156863)), // Turquoise
//     ("#C0C0C0", (0.7529412, 0.7529412, 0.7529412)), // Silver
//   ];

//   for (hex, expected) in test_cases {
//     let rgb = super::hex_to_pdf_rgb(hex);
//     assert_eq!(rgb.r, expected.0);
//     assert_eq!(rgb.g, expected.1);
//     assert_eq!(rgb.b, expected.2);
//   }
// }
