
import { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'app.lovable.442a4da346da4457965a04d220ed42d4',
  appName: 'PubCash',
  webDir: 'dist',
  server: {
    url: "https://442a4da3-46da-4457-965a-04d220ed42d4.lovableproject.com?forceHideBadge=true",
    cleartext: true
  },
  android: {
    buildOptions: {
      keystorePath: null,
      keystoreAlias: null,
      keystorePassword: null,
      keystoreAliasPassword: null,
    }
  }
};

export default config;
