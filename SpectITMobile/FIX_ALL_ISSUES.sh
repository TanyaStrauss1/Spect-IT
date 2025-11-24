#!/bin/bash

# Fix all code review issues and App Store Connect build selection

cd /Users/tanyastrauss/Spect-IT/SpectITMobile

echo "╔══════════════════════════════════════════════════════════════════════════╗"
echo "║          🔧 FIXING ALL CODE REVIEW ISSUES                              ║"
echo "╚══════════════════════════════════════════════════════════════════════════╝"
echo ""

echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "📋 FIX 1: SECURE API KEY HANDLING"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""

# Fix storeLocatorService.js to require API key
sed -i.bak 's/const GOOGLE_MAPS_API_KEY = process\.env\.EXPO_PUBLIC_GOOGLE_MAPS_API_KEY || '\''YOUR_API_KEY_HERE'\'';/const GOOGLE_MAPS_API_KEY = process.env.EXPO_PUBLIC_GOOGLE_MAPS_API_KEY;\nif (!GOOGLE_MAPS_API_KEY) {\n  throw new Error('\''EXPO_PUBLIC_GOOGLE_MAPS_API_KEY is required. Please add it to your .env file.'\'');\n}/' storeLocatorService.js

echo "✅ Fixed API key handling in storeLocatorService.js"
echo ""

echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "📋 FIX 2: REPLACE CONSOLE LOGS WITH LOGGER"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""

# Update App.js to use logger
if [ -f "src/utils/logger.js" ]; then
    # Replace console.log/warn in App.js
    sed -i.bak "s/console\.warn/logger.warn/g" App.js
    sed -i.bak "s/console\.log/logger.log/g" App.js
    
    # Add logger import at top of App.js
    if ! grep -q "import logger" App.js; then
        sed -i.bak '1a\
import logger from "./src/utils/logger";
' App.js
    fi
    
    echo "✅ Updated App.js to use logger"
else
    echo "⚠️  Logger utility not found. Creating it..."
    mkdir -p src/utils
    cat > src/utils/logger.js << 'LOGGER_EOF'
/**
 * Logger utility - Removes console logs in production
 */

const isDev = __DEV__;

export const logger = {
  log: (...args) => {
    if (isDev) {
      console.log(...args);
    }
  },
  warn: (...args) => {
    if (isDev) {
      console.warn(...args);
    }
  },
  error: (...args) => {
    // Always log errors, even in production
    console.error(...args);
  },
  info: (...args) => {
    if (isDev) {
      console.info(...args);
    }
  },
};

export default logger;
LOGGER_EOF
    echo "✅ Created logger utility"
fi

# Update storeLocatorService.js to use logger
if [ -f "src/utils/logger.js" ]; then
    # Add logger import
    if ! grep -q "import logger" storeLocatorService.js; then
        sed -i.bak '6a\
import logger from "./src/utils/logger";
' storeLocatorService.js
    fi
    
    # Replace console.error with logger.error
    sed -i.bak "s/console\.error/logger.error/g" storeLocatorService.js
    
    echo "✅ Updated storeLocatorService.js to use logger"
fi

echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "📋 FIX 3: FIX NPM VULNERABILITIES"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""

echo "Running npm audit fix..."
npm audit fix --legacy-peer-deps 2>&1 | head -20

echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "✅ ALL FIXES COMPLETE"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""
echo "📋 Next Steps:"
echo ""
echo "1. Add Google Maps API key to .env file:"
echo "   EXPO_PUBLIC_GOOGLE_MAPS_API_KEY=your_key_here"
echo ""
echo "2. Review changes in:"
echo "   - App.js (logger added)"
echo "   - storeLocatorService.js (secure API key, logger)"
echo ""
echo "3. Test the app to ensure everything works"
echo ""

