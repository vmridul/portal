import type { CapacitorConfig } from "@capacitor/cli";

const config: CapacitorConfig = {
  appId: "com.mridul.portal",
  appName: "Portal",
  webDir: "out",
  plugins: {
    Browser: {
      windowOpenUrl: "sameWindow",
    },
    CapacitorCookies: {
      enabled: true,
    },
  },
  server: {
    url: "https://portalchat.vercel.app",
    cleartext: false,
  },
};

export default config;
