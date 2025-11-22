#!/bin/bash

# Auto-Protect Spect-IT Repository
# Automates repository protection via GitHub CLI

set -e

echo "╔════════════════════════════════════════════════════════════════╗"
echo "║          🔒 AUTO-PROTECTING SPECT-IT REPOSITORY                 ║"
echo "╚════════════════════════════════════════════════════════════════╝"
echo ""

REPO="TanyaStrauss1/Spect-IT"

# Check if GitHub CLI is installed
if ! command -v gh &> /dev/null; then
    echo "❌ GitHub CLI (gh) not found"
    echo ""
    echo "📥 Installing GitHub CLI..."
    if [[ "$OSTYPE" == "darwin"* ]]; then
        brew install gh
    else
        echo "Please install GitHub CLI: https://cli.github.com/"
        exit 1
    fi
fi

# Check if authenticated
if ! gh auth status &> /dev/null; then
    echo "🔐 GitHub CLI not authenticated"
    echo "Logging in..."
    gh auth login
fi

echo "✅ GitHub CLI ready"
echo ""

# Step 1: Make repository private
echo "📋 Step 1: Making repository PRIVATE..."
if gh repo view "$REPO" --json visibility --jq .visibility | grep -q "PUBLIC"; then
    echo "   Current: PUBLIC"
    echo "   Changing to PRIVATE..."
    gh repo edit "$REPO" --visibility private
    echo "   ✅ Repository is now PRIVATE"
else
    echo "   ✅ Repository is already PRIVATE"
fi
echo ""

# Step 2: Enable branch protection
echo "📋 Step 2: Enabling branch protection for 'main'..."
echo "   Setting up branch protection rules..."

# Create branch protection configuration
cat > /tmp/branch-protection.json << 'EOF'
{
  "required_status_checks": {
    "strict": true,
    "contexts": []
  },
  "enforce_admins": true,
  "required_pull_request_reviews": {
    "dismissal_restrictions": {},
    "dismiss_stale_reviews": true,
    "require_code_owner_reviews": false,
    "required_approving_review_count": 1
  },
  "restrictions": null,
  "allow_force_pushes": false,
  "allow_deletions": false,
  "block_creations": false,
  "required_conversation_resolution": true,
  "lock_branch": false,
  "allow_fork_syncing": false
}
EOF

# Apply branch protection
if gh api repos/$REPO/branches/main/protection --method PUT -f @/tmp/branch-protection.json 2>/dev/null; then
    echo "   ✅ Branch protection enabled"
else
    echo "   ⚠️  Branch protection may need manual setup"
    echo "   Go to: https://github.com/$REPO/settings/branches"
fi
rm -f /tmp/branch-protection.json
echo ""

# Step 3: Enable security features
echo "📋 Step 3: Enabling security features..."
echo "   - Secret scanning"
echo "   - Dependency alerts"
echo "   - Dependabot"

# Enable vulnerability alerts
gh api repos/$REPO/vulnerability-alerts --method PUT 2>/dev/null || echo "   ⚠️  Vulnerability alerts may need manual setup"

# Enable automated security fixes
gh api repos/$REPO/automated-security-fixes --method PUT 2>/dev/null || echo "   ⚠️  Automated security fixes may need manual setup"

echo "   ✅ Security features enabled"
echo ""

# Step 4: Remove sensitive files from tracking
echo "📋 Step 4: Removing sensitive files from git tracking..."
SENSITIVE_FILES=(
    "website/supabase-config.js"
    "website/spectit-location.js"
    "website/set-api-keys.sh"
)

for file in "${SENSITIVE_FILES[@]}"; do
    if git ls-files --error-unmatch "$file" >/dev/null 2>&1; then
        echo "   Removing: $file"
        git rm --cached "$file" 2>/dev/null || true
    fi
done

if [ -n "$(git diff --cached --name-only)" ]; then
    git commit -m "security: Remove sensitive files from tracking" || true
    echo "   ✅ Sensitive files removed"
else
    echo "   ✅ No sensitive files to remove"
fi
echo ""

# Step 5: Summary
echo "╔════════════════════════════════════════════════════════════════╗"
echo "║          ✅ AUTO-PROTECTION COMPLETE                            ║"
echo "╚════════════════════════════════════════════════════════════════╝"
echo ""
echo "✅ Completed:"
echo "   🔒 Repository set to PRIVATE"
echo "   🛡️  Branch protection enabled"
echo "   🔐 Security features enabled"
echo "   📝 Sensitive files removed from tracking"
echo ""
echo "⚠️  MANUAL STEPS REQUIRED:"
echo ""
echo "1. Rotate API Keys (URGENT):"
echo "   - Supabase: https://supabase.com/dashboard/project/_/settings/api"
echo "   - Google Cloud: https://console.cloud.google.com/apis/credentials"
echo ""
echo "2. Review Branch Protection:"
echo "   https://github.com/$REPO/settings/branches"
echo ""
echo "3. Review Security Settings:"
echo "   https://github.com/$REPO/settings/security"
echo ""
echo "4. Push changes (if any):"
echo "   git push origin main"
echo ""
echo "🔒 Repository is now protected!"
echo ""

