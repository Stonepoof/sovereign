import { ExpoConfig, ConfigContext } from 'expo/config';

export default ({ config }: ConfigContext): ExpoConfig => ({
  ...config,
  name: 'Sovereign',
  slug: 'sovereign',
  scheme: 'sovereign',
  version: '1.0.0',
  orientation: 'portrait',
  icon: './assets/icon.png',
  userInterfaceStyle: 'dark',
  splash: {
    image: './assets/splash.png',
    resizeMode: 'contain',
    backgroundColor: '#0a0a1a'
  },
  assetBundlePatterns: [
    '**/*'
  ],
  ios: {
    supportsTablet: true,
    bundleIdentifier: 'com.novaworkos.sovereign'
  },
  android: {
    adaptiveIcon: {
      foregroundImage: './assets/adaptive-icon.png',
      backgroundColor: '#0a0a1a'
    },
    package: 'com.novaworkos.sovereign'
  },
  web: {
    favicon: './assets/favicon.png'
  },
  extra: {
    // AI Service Configuration
    OPENAI_API_KEY: process.env.OPENAI_API_KEY || '',
    ANTHROPIC_API_KEY: process.env.ANTHROPIC_API_KEY || '',

    // RunPod Image Generation
    RUNPOD_API_KEY: process.env.RUNPOD_API_KEY || '',
    RUNPOD_ENDPOINT_ID: process.env.RUNPOD_ENDPOINT_ID || '',

    // Supabase (if using for backend)
    SUPABASE_URL: process.env.SUPABASE_URL || '',
    SUPABASE_ANON_KEY: process.env.SUPABASE_ANON_KEY || '',

    eas: {
      projectId: "your-eas-project-id-here"
    }
  },
  plugins: [
    'expo-router',
    [
      'expo-screen-orientation',
      {
        initialOrientation: 'PORTRAIT_UP'
      }
    ]
  ],
  experiments: {
    typedRoutes: true
  }
});
