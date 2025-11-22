# Security Policy

## 🔒 Repository Protection

This repository contains proprietary code and should be kept **PRIVATE**.

### Protection Measures

1. **Repository Visibility**: PRIVATE
2. **Branch Protection**: Enabled on `main` branch
3. **API Keys**: Never commit API keys or secrets
4. **Access Control**: Limited to authorized personnel only

## 🚫 Preventing Unauthorized Access

### GitHub Settings

1. Go to: https://github.com/TanyaStrauss1/Spect-IT/settings
2. Scroll to "Danger Zone"
3. Ensure repository is set to **PRIVATE**
4. Enable "Require pull request reviews before merging"
5. Enable "Require status checks to pass before merging"
6. Enable "Require conversation resolution before merging"
7. Enable "Restrict who can push to matching branches"

### API Key Protection

**NEVER commit these files:**
- `supabase-config.js` (contains Supabase keys)
- `spectit-location.js` (contains Google API keys)
- Any file with `API_KEY`, `SECRET`, `TOKEN`, `PASSWORD`

**Use environment variables instead:**
```bash
# Create .env.local (not committed)
NEXT_PUBLIC_SUPABASE_URL=your_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_key
GOOGLE_PLACES_API_KEY=your_key
```

## 🔐 Access Control

### Who Can Access

- Repository owner only
- Authorized team members (if any)

### How to Add Collaborators

1. Go to: https://github.com/TanyaStrauss1/Spect-IT/settings/access
2. Click "Invite a collaborator"
3. Add only trusted individuals
4. Set permission level: **Read** (minimum)

## 🛡️ Additional Security

### Remove Sensitive Data from History

If API keys were previously committed:

```bash
# Use git-filter-repo or BFG Repo-Cleaner
# This removes sensitive data from entire git history
```

### Enable 2FA

- Enable Two-Factor Authentication on GitHub account
- Use SSH keys instead of HTTPS passwords

### Monitor Access

- Regularly check repository access logs
- Review commit history for unauthorized changes
- Enable GitHub security alerts

## 📋 Security Checklist

- [x] Repository set to PRIVATE
- [x] .gitignore configured for sensitive files
- [x] API keys moved to environment variables
- [ ] Branch protection enabled
- [ ] 2FA enabled on GitHub account
- [ ] Access logs reviewed regularly
- [ ] Sensitive data removed from git history (if needed)

## 🚨 If Repository is Compromised

1. **Immediately** rotate all API keys
2. Revoke access for unauthorized users
3. Review commit history for malicious changes
4. Contact GitHub support if needed
5. Update all secrets and credentials

## 📞 Security Contact

For security concerns, contact the repository owner directly.

