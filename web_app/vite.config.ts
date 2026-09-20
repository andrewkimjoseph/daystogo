// @lovable.dev/vite-tanstack-config already includes the following — do NOT add them manually
// or the app will break with duplicate plugins:
//   - TanStack devtools (dev-only, first), tanstackStart, viteReact, tailwindcss,
//     nitro (build-only; preset overridden below for Vercel), VITE_* env injection, @ path alias,
//     React/TanStack dedupe, error logger plugins, and sandbox detection (port/host/strictPort).
// You can pass additional config via defineConfig({ vite: { ... }, etc... }) if needed.
import type { ConfigEnv, PluginOption, UserConfig } from "vite";
import { defineConfig } from "@lovable.dev/vite-tanstack-config";

const lovable = defineConfig({
  nitro: { preset: "vercel" },
  tanstackStart: {
    // Redirect TanStack Start's bundled server entry to src/server.ts (our SSR error wrapper).
    // nitro/vite builds from this
    server: { entry: "server" },
  },
  vite: {
    resolve: { tsconfigPaths: true },
  },
});

function withoutTsconfigPathsPlugin(plugins: PluginOption): PluginOption[] {
  if (Array.isArray(plugins)) {
    return plugins.flatMap((plugin) => withoutTsconfigPathsPlugin(plugin));
  }
  if (plugins && typeof plugins === "object" && "name" in plugins && plugins.name === "vite-tsconfig-paths") {
    return [];
  }
  return plugins == null ? [] : [plugins];
}

/** Vite 8 resolves tsconfig paths natively — drop the plugin Lovable still injects. */
export default async (env: ConfigEnv): Promise<UserConfig> => {
  const config = await lovable(env);
  return {
    ...config,
    resolve: { ...config.resolve, tsconfigPaths: true },
    plugins: withoutTsconfigPathsPlugin(config.plugins ?? []),
  };
};
