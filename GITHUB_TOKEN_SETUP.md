# 🔐 GitHub Personal Access Token Setup

## 📋 Your GitHub Account

- **Username:** TanyaStrauss1
- **Repository:** https://github.com/TanyaStrauss1/Spect-IT

---

## 🔑 Create Personal Access Token

### Step 1: Go to Token Settings

**Direct Link:**
https://github.com/settings/tokens/new

**Or navigate:**
1. Go to: https://github.com
2. Click your profile picture (top right)
3. **Settings** → **Developer settings** → **Personal access tokens** → **Tokens (classic)**
4. Click **"Generate new token"** → **"Generate new token (classic)"**

---

### Step 2: Configure Token

**Name:**
```
Spect-IT Development
```
(Or any descriptive name)

**Expiration:**
- 90 days (recommended)
- Or custom date
- Or "No expiration" (less secure)

**Scopes (Permissions):**
Select these:
- ✅ **repo** (Full control of private repositories)
  - This includes:
    - repo:status
    - repo_deployment
    - public_repo
    - repo:invite
    - security_events

---

### Step 3: Generate and Copy

1. **Click "Generate token"**
2. **COPY THE TOKEN IMMEDIATELY**
   - Format: `ghp_xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx`
   - You can't see it again after leaving the page!
3. **Save it securely** (password manager, notes, etc.)

---

## 💾 Use the Token

### Option 1: Store in macOS Keychain (Recommended)

```bash
# Configure git to use keychain
git config --global credential.helper osxkeychain

# On next push, when prompted:
# Username: TanyaStrauss1
# Password: [paste your token here]
# macOS will save it in Keychain
```

---

### Option 2: Use in Remote URL

```bash
cd /Users/tanyastrauss/Spect-IT
git remote set-url origin https://TanyaStrauss1:YOUR_TOKEN@github.com/TanyaStrauss1/Spect-IT.git
```

**Replace `YOUR_TOKEN` with your actual token.**

---

### Option 3: Environment Variable

```bash
# Add to ~/.zshrc or ~/.bash_profile
export GITHUB_TOKEN=your_token_here

# Then use in git operations
git push https://TanyaStrauss1:$GITHUB_TOKEN@github.com/TanyaStrauss1/Spect-IT.git
```

---

### Option 4: Use SSH Instead (Alternative)

**If you prefer SSH keys:**

1. **Generate SSH key:**
   ```bash
   ssh-keygen -t ed25519 -C "tanstrauss@gmail.com"
   ```

2. **Add to GitHub:**
   - Copy public key: `cat ~/.ssh/id_ed25519.pub`
   - Go to: https://github.com/settings/keys
   - Add new SSH key

3. **Change remote to SSH:**
   ```bash
   git remote set-url origin git@github.com:TanyaStrauss1/Spect-IT.git
   ```

---

## ✅ Verify Token Works

```bash
cd /Users/tanyastrauss/Spect-IT
git push
```

If it works without asking for password, token is configured correctly!

---

## 🔒 Security Tips

1. **Don't commit tokens to git** - They'll be in history
2. **Use environment variables** or keychain
3. **Set expiration dates** - Rotate tokens regularly
4. **Use minimum required scopes** - Only give necessary permissions
5. **Revoke old tokens** - Delete unused tokens

---

## 🔗 Quick Links

- **Create Token:** https://github.com/settings/tokens/new
- **Manage Tokens:** https://github.com/settings/tokens
- **SSH Keys:** https://github.com/settings/keys

---

## 📋 Token Format

Your token will look like:
```
ghp_xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
```

**Keep it secret!** Treat it like a password.

---

**Create your token at: https://github.com/settings/tokens/new**

