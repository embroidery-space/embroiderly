/// <reference types="vite/client" />

declare module "virtual:*.ftl" {
  const content: string;
  export default content;
}
