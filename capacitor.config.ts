
import { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'app.lovable.ed6925bc7c0946058c828e776dab2316',
  appName: 'stellar-client-vault',
  webDir: 'dist',
  server: {
    url: 'https://ed6925bc-7c09-4605-8c82-8e776dab2316.lovableproject.com?forceHideBadge=true',
    cleartext: true
  },
  bundledWebRuntime: false
};

export default config;
