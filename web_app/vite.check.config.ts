import type { ConfigEnv, UserConfig } from "vite";
import base from "./vite.config";

/** Throwaway config used only to check the UI with sign-in stubbed out. */
export default async (env: ConfigEnv): Promise<UserConfig> => {
  const config = await base(env);
  return {
    ...config,
    resolve: {
      ...config.resolve,
      alias: [
        {
          find: /^@clerk\/tanstack-react-start$/,
          replacement: new URL("./src/lib/__clerkstub.tsx", import.meta.url).pathname,
        },
        {
          find: /^@clerk\/tanstack-react-start\/server$/,
          replacement: new URL("./src/lib/__clerkserverstub.ts", import.meta.url).pathname,
        },
      ],
    },
  };
};
