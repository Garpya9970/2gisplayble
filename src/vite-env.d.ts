/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_AD_NETWORK: string;
  readonly VITE_ORIENTATION: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}



