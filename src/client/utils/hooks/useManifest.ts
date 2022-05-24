import axios from "axios";
import { useState } from "react";
import type {
  Manifest,
  ManifestModel,
  ManifestModule,
} from "../../../shared/manifest";
import { useAsyncEffect } from "./useAsyncEffect";

declare global {
  interface Window {
    __WHEEL__: {
      manifest: Manifest;
    };
  }
}

const useManifest = () => {
  const [manifest, setManifest] = useState<Manifest>();

  useAsyncEffect(async () => {
    if (window.__WHEEL__?.manifest) {
      setManifest(window.__WHEEL__.manifest);
      return;
    }
    const { data: manifest } = await axios("/_/api/manifest");
    setManifest(manifest);
    window.__WHEEL__ ??= { manifest };
    window.__WHEEL__.manifest ??= manifest;
  }, []);

  const endpoint = ({
    modelName,
    moduleName,
    by,
    value,
    children,
  }: {
    moduleName: string;
    modelName: string;
    by?: string;
    value?: string;
    children?: string;
  }) => {
    const base = `/_/api/module/${moduleName}/model/${modelName}`;
    if (by) {
      return `${base}/${by}/${value}`;
    }
    if (children) {
      return `${base}/children/${children}`;
    }
    return base;
  };

  function get(p: { modelName: string; moduleName: string }): ManifestModel;
  function get(p: { moduleName: string }): ManifestModule;
  function get(p: {}): Manifest;
  function get({
    moduleName,
    modelName,
  }: {
    moduleName?: string;
    modelName?: string;
  }) {
    if (!moduleName) return manifest;
    if (!modelName) return manifest?.modules[moduleName];
    return manifest?.modules[moduleName]?.models[modelName];
  }

  return { manifest, endpoint, get };
};

export default useManifest;
