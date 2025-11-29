#!/bin/bash

# Delete New Xcode Project
# Safely delete a project while preserving the main Spect-IT project

set -e

echo ""
echo "╔══════════════════════════════════════════════════════════════════════════╗"
echo "║     🗑️  DELETE NEW XCODE PROJECT                                        ║"
echo "╚══════════════════════════════════════════════════════════════════════════╝"
echo ""

echo "⚠️  IMPORTANT: This will help you delete a project safely."
echo ""

# List potential projects to delete
echo "🔍 POTENTIAL PROJECTS TO DELETE:"
echo ""
echo "   1. ~/Desktop/SpectIT/"
echo "   2. ~/Desktop/Spect/"
echo "   3. ~/EquiLedger-1/"
echo "   4. ~/EquiLedger-2/"
echo "   5. ~/Desktop/EquiLedger/"
echo ""

echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""
echo "🚫 DO NOT DELETE:"
echo "   • /Users/tanyastrauss/Spect-IT/SpectITMobile/"
echo "   • /Users/tanyastrauss/Documents/Spect-IT/SpectITMobile/"
echo "   These are your MAIN projects!"
echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""
read -p "Enter the FULL path of the project to delete (or 'cancel'): " PROJECT_PATH

if [ "$PROJECT_PATH" = "cancel" ] || [ -z "$PROJECT_PATH" ]; then
    echo "❌ Cancelled. No project deleted."
    exit 0
fi

# Safety check - don't delete main project
if [[ "$PROJECT_PATH" == *"Spect-IT/SpectITMobile"* ]]; then
    echo "❌ ERROR: Cannot delete main Spect-IT project!"
    echo "   This is your main project we've been working on."
    exit 1
fi

# Check if path exists
if [ ! -d "$PROJECT_PATH" ] && [ ! -f "$PROJECT_PATH" ]; then
    echo "❌ ERROR: Path not found: $PROJECT_PATH"
    exit 1
fi

# Confirm deletion
echo ""
echo "⚠️  WARNING: This will delete:"
echo "   $PROJECT_PATH"
echo ""
read -p "Are you sure? Type 'yes' to confirm: " CONFIRM

if [ "$CONFIRM" != "yes" ]; then
    echo "❌ Cancelled. No project deleted."
    exit 0
fi

# Delete the project
echo ""
echo "🗑️  Deleting project..."
rm -rf "$PROJECT_PATH"
echo "✅ Project deleted: $PROJECT_PATH"
echo ""
echo "💡 Tip: Empty Trash to permanently remove it."

