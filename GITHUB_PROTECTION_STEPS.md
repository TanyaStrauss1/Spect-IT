# 🔒 GitHub Repository Protection Guide

## IMMEDIATE ACTIONS REQUIRED

### 1. Make Repository PRIVATE

**Steps:**
1. Go to: https://github.com/TanyaStrauss1/Spect-IT
2. Click **Settings** (top right)
3. Scroll down to **Danger Zone**
4. Click **Change visibility**
5. Select **Make private**
6. Type repository name to confirm
7. Click **I understand, change repository visibility**

### 2. Enable Branch Protection

**Steps:**
1. Go to: https://github.com/TanyaStrauss1/Spect-IT/settings/branches
2. Click **Add rule** (or edit existing rule for `main`)
3. Branch name pattern: `main`
4. Enable these settings:
   - ✅ **Require a pull request before merging**
     - Require approvals: 1
   - ✅ **Require status checks to pass before merging**
   - ✅ **Require conversation resolution before merging**
   - ✅ **Require signed commits**
   - ✅ **Restrict who can push to matching branches**
     - Only allow specific people (yourself)
   - ✅ **Do not allow bypassing the above settings**
5. Click **Create** (or **Save changes**)

### 3. Remove Collaborators (if any)

**Steps:**
1. Go to: https://github.com/TanyaStrauss1/Spect-IT/settings/access
2. Review all collaborators
3. Remove any unauthorized users
4. Keep only yourself (or trusted team members)

### 4. Enable Security Features

**Steps:**
1. Go to: https://github.com/TanyaStrauss1/Spect-IT/settings/security
2. Enable:
   - ✅ **Dependency graph**
   - ✅ **Dependabot alerts**
   - ✅ **Dependabot security updates**
   - ✅ **Secret scanning**
   - ✅ **Push protection** (prevents committing secrets)

### 5. Enable 2FA on Your Account

**Steps:**
1. Go to: https://github.com/settings/security
2. Click **Enable two-factor authentication**
3. Follow the setup wizard
4. Save backup codes securely

### 6. Review and Remove Sensitive Data

**If API keys were committed:**

1. **Rotate all API keys immediately:**
   - Supabase: https://supabase.com/dashboard/project/_/settings/api
   - Google Cloud: https://console.cloud.google.com/apis/credentials

2. **Remove from git history:**
   ```bash
   # Install git-filter-repo
   pip install git-filter-repo
   
   # Remove sensitive file from entire history
   git filter-repo --path website/supabase-config.js --invert-paths
   git filter-repo --path website/spectit-location.js --invert-paths
   
   # Force push (WARNING: This rewrites history)
   git push origin --force --all
   ```

3. **Or use BFG Repo-Cleaner:**
   ```bash
   # Download BFG: https://rtyley.github.io/bfg-repo-cleaner/
   java -jar bfg.jar --delete-files supabase-config.js
   java -jar bfg.jar --delete-files spectit-location.js
   git reflog expire --expire=now --all
   git gc --prune=now --aggressive
   ```

### 7. Set Up Environment Variables

**For Local Development:**
```bash
# Create .env.local (NOT committed)
cp .env.example .env.local

# Add your actual keys to .env.local
# This file is in .gitignore
```

**For Vercel Deployment:**
1. Go to: https://vercel.com/dashboard
2. Select your project
3. Go to **Settings** → **Environment Variables**
4. Add:
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - `GOOGLE_PLACES_API_KEY`
   - `GOOGLE_MAPS_API_KEY`

### 8. Monitor Repository Access

**Regular Checks:**
1. Go to: https://github.com/TanyaStrauss1/Spect-IT/settings/access
2. Review **Access logs** regularly
3. Check for unauthorized access
4. Review commit history for suspicious activity

## ✅ Protection Checklist

- [ ] Repository set to **PRIVATE**
- [ ] Branch protection enabled on `main`
- [ ] Collaborators reviewed and limited
- [ ] Security features enabled (secret scanning, etc.)
- [ ] 2FA enabled on GitHub account
- [ ] API keys rotated (if they were exposed)
- [ ] Sensitive files removed from git history
- [ ] Environment variables set up (not in code)
- [ ] .gitignore configured properly
- [ ] Access logs reviewed

## 🚨 Emergency Actions

**If repository was cloned or accessed:**
1. **IMMEDIATELY** rotate all API keys
2. Make repository private
3. Remove unauthorized collaborators
4. Review all commits for malicious code
5. Contact GitHub support if needed
6. Consider creating a new private repository

## 📞 Need Help?

- GitHub Support: https://support.github.com
- Security Best Practices: https://docs.github.com/en/code-security

