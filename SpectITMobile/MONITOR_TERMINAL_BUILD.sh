#!/bin/bash

# Monitor Terminal Build Progress

cd /Users/tanyastrauss/Spect-IT/SpectITMobile

echo "╔══════════════════════════════════════════════════════════════════════════╗"
echo "║          📊 TERMINAL BUILD STATUS                                       ║"
echo "╚══════════════════════════════════════════════════════════════════════════╝"
echo ""

# Check if build is running
if pgrep -f "xcodebuild.*archive" > /dev/null; then
    echo "🔄 Build Status: RUNNING"
    echo ""
elif [ -f "build/archive.log" ]; then
    echo "✅ Build Status: COMPLETED"
    echo ""
else
    echo "⏳ Build Status: NOT STARTED"
    echo ""
fi

# Check archive log
if [ -f "build/archive.log" ]; then
    echo "📋 Archive Log (last 10 lines):"
    echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
    tail -10 build/archive.log | grep -E "(error|warning|succeeded|Archive|Building)" || tail -10 build/archive.log
    echo ""
fi

# Check export log
if [ -f "build/export.log" ]; then
    echo "📋 Export Log (last 10 lines):"
    echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
    tail -10 build/export.log | grep -E "(error|warning|succeeded|Export)" || tail -10 build/export.log
    echo ""
fi

# Check upload log
if [ -f "build/upload.log" ]; then
    echo "📋 Upload Log (last 10 lines):"
    echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
    tail -10 build/upload.log | grep -E "(error|warning|successfully|Upload)" || tail -10 build/upload.log
    echo ""
fi

# Check for archive
if [ -d "build/SpectIT.xcarchive" ]; then
    echo "✅ Archive created: build/SpectIT.xcarchive"
    echo ""
fi

# Check for IPA
IPA_FILE=$(find build/export -name "*.ipa" 2>/dev/null | head -1)
if [ -n "$IPA_FILE" ]; then
    echo "✅ IPA file created: $IPA_FILE"
    echo ""
fi

echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""
echo "📊 Full logs:"
echo "   - build/archive.log"
echo "   - build/export.log"
echo "   - build/upload.log"
echo ""
echo "🔗 App Store Connect:"
echo "   https://appstoreconnect.apple.com/apps/6755681856/distribution/ios/version/inflight"
echo ""

