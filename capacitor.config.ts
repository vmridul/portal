import type { CapacitorConfig } from "@capacitor/cli";

const config: CapacitorConfig = {
  appId: "com.mridul.portal",
  appName: "Portal",
  webDir: "out", //
  server: {
    url: "https://portalchat.vercel.app",
    cleartext: false
  }
};

export default config;
