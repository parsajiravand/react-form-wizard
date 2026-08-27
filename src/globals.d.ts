/// <reference types="vite/client" />

// Style imports are side-effect only; the bundler extracts them to a
// stylesheet. Declared so `tsc` can emit declarations under `strict`.
declare module "*.css" {
  const content: string;
  export default content;
}
