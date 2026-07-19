declare module "*.mdx" {
  const MDXComponent: (props: Record<string, unknown>) => unknown;
  export default MDXComponent;
}
