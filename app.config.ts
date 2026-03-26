// ─── Expo App Configuration ────────────────────────────────────────────────

import 'dotenv/config';

export default {
  expo: {
    name: 'Sovereign',
    slug: 'sovereign',
    version: '1.0.0',
    scheme: 'sovereign',
    orientation: 'portrait',
    userInterfaceStyle: 'dark',
    icon: './assets/icon.png',
    splash: {
      image: './assets/splash.png',
      resizeMode: 'contain',
      backgroundColor: '#0a0a1a',
    },
    assetBundlePatterns: ['**/*'],
    ios: {
      supportsTablet: true,
      bundleIdentifier: 'com.sovereign.game',
    },
    android: {
      adaptiveIcon: {
        foregroundImage: './assets/adaptive-icon.png',
        backgroundColor: '#0a0a1a',
      },
      package: 'com.sovereign.game',
    },
    web: {
      favicon: './assets/favicon.png',
      bundler: 'metro',
    },
    plugins: ['expo-router'],
    experiments: {
      typedRoutes: true,
    },
    extra: {
      OPENAI_API_KEY: process.env.OPENAI_API_KEY ?? '',
      ANTHROPIC_API_KEY: process.env.ANTHROPIC_API_KEY ?? '',
      RUNPOD_API_KEY: process.env.RUNPOD_API_KEY ?? '',
      RUNPOD_ENDPOINT_ID: process.env.RUNPOD_ENDPOINT_ID ?? '',
    },
  },
};
