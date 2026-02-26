/// <reference types="vite/client" />
/// <reference types="unplugin-icons/types/vue" />

declare module "virtual:*.ftl" {
  const content: string;
  export default content;
}
