/**
 * @filename: lint-staged.config.js
 * @type {import('lint-staged').Configuration}
 */
export default {
  "*.md": ["markdownlint-cli2 --fix", "oxfmt"],
  "*.rs": () => {
    // Clippy and Rustfmt don't support multiple files formatting via CLI.
    // Therefore, run them on the entire codebase.
    return ["cargo clippy --locked --fix --allow-dirty -- -D warnings", "cargo +nightly fmt"];
  },
  "!(*.md|*.rs)": ["oxlint --fix --format stylish", "eslint --fix", "oxfmt"],
};
