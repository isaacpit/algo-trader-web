// Environment configuration for different deployment targets
const environments = {
  development: {
    GOOGLE_CLIENT_ID: import.meta.env.VITE_GOOGLE_CLIENT_ID,
    GOOGLE_REDIRECT_URI:
      import.meta.env.VITE_GOOGLE_REDIRECT_URI ||
      "http://localhost:5173/oauth/callback",
    CALLBACK_SERVER_URL:
      import.meta.env.VITE_CALLBACK_SERVER_URL ||
      "http://localhost:3000/api/auth/callback",
    // API Configuration
    API_BASE_URL: import.meta.env.VITE_API_BASE_URL || "http://localhost:3000",
    USE_MOCK_API: import.meta.env.VITE_USE_MOCK_API === "true" || false,
  },
  production: {
    GOOGLE_CLIENT_ID: import.meta.env.VITE_GOOGLE_CLIENT_ID,
    GOOGLE_REDIRECT_URI:
      import.meta.env.VITE_GOOGLE_REDIRECT_URI ||
      "https://algotraders.dev/oauth/callback",
    CALLBACK_SERVER_URL:
      import.meta.env.VITE_CALLBACK_SERVER_URL ||
      "https://api.algotraders.dev/api/auth/callback",
    // API Configuration
    API_BASE_URL:
      import.meta.env.VITE_API_BASE_URL || "https://api.algotraders.dev",
    USE_MOCK_API: import.meta.env.VITE_USE_MOCK_API === "true" || false,
  },
};

// Determine current environment
const isProduction = import.meta.env.PROD;
const currentEnv = isProduction ? "production" : "development";

// Log environment detection
console.log(`🔧 Environment Configuration:`);
console.log(`   Mode: ${isProduction ? "PRODUCTION" : "DEVELOPMENT"}`);
console.log(`   Environment: ${currentEnv}`);
console.log(`   Vite Mode: ${import.meta.env.MODE}`);

// Export the current environment config
export const config = environments[currentEnv];

// Log configuration values (with sensitive data masked)
console.log(`📋 Loaded Configuration:`);
console.log(
  `   GOOGLE_CLIENT_ID: ${config.GOOGLE_CLIENT_ID ? "✅ Set" : "❌ Missing"}`
);
console.log(`   GOOGLE_REDIRECT_URI: ${config.GOOGLE_REDIRECT_URI}`);
console.log(`   CALLBACK_SERVER_URL: ${config.CALLBACK_SERVER_URL}`);
console.log(`   API_BASE_URL: ${config.API_BASE_URL}`);
console.log(
  `   USE_MOCK_API: ${config.USE_MOCK_API ? "🎭 MOCK MODE" : "🔗 REAL API"}`
);

// Show mock API instructions if enabled
if (config.USE_MOCK_API) {
  console.log(`\n🎭 MOCK API MODE ENABLED:`);
  console.log(`   Using mock feed data from src/data/mockFeedData.js`);
  console.log(`   To switch to real API, set VITE_USE_MOCK_API=false in .env`);
} else {
  console.log(`\n🔗 REAL API MODE:`);
  console.log(`   Connecting to backend at: ${config.API_BASE_URL}`);
  console.log(`   To use mock data, set VITE_USE_MOCK_API=true in .env`);
}

// Log environment variables source
console.log(`🔍 Environment Variables Source:`);
console.log(
  `   VITE_GOOGLE_CLIENT_ID: ${
    import.meta.env.VITE_GOOGLE_CLIENT_ID ? "✅ Present" : "❌ Missing"
  }`
);
console.log(
  `   VITE_GOOGLE_REDIRECT_URI: ${
    import.meta.env.VITE_GOOGLE_REDIRECT_URI || "Using default"
  }`
);
console.log(
  `   CALLBACK_SERVER_URL: ${
    import.meta.env.VITE_CALLBACK_SERVER_URL || "Using default"
  }`
);

// Helper function to get config value
export const getConfig = (key) => {
  const value = config[key];
  console.log(
    `🔍 Config lookup: ${key} = ${value ? "✅ Found" : "❌ Missing"}`
  );
  return value;
};

// Validate required environment variables
export const validateConfig = () => {
  const required = ["GOOGLE_CLIENT_ID"];
  const missing = required.filter((key) => !config[key]);

  console.log(`🔍 Config Validation:`);
  console.log(`   Required variables: ${required.join(", ")}`);
  console.log(
    `   Missing variables: ${missing.length > 0 ? missing.join(", ") : "None"}`
  );

  if (missing.length > 0) {
    console.warn(
      `⚠️  Missing required environment variables: ${missing.join(", ")}`
    );
    console.warn(`   Current environment: ${currentEnv}`);
    console.warn(`   Please check your .env file or GitHub Secrets`);
    return false;
  }

  console.log(`✅ All required environment variables are present`);
  return true;
};

// Log configuration on module load
console.log(`🚀 Environment configuration loaded successfully`);
console.log(`   Timestamp: ${new Date().toISOString()}`);

export default config;
