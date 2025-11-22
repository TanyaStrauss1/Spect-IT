# Setting Up GitHub Repository for Spect-IT

## Step 1: Create Private Repository on GitHub

1. Go to: https://github.com/new
2. Repository name: `Spect-IT`
3. Description: `Premium eye testing app with advanced AI-powered vision analysis`
4. Visibility: **Private** ✅
5. Click "Create repository"

## Step 2: Connect Local Repository to GitHub

After creating the repository, GitHub will show you commands. Run these in your terminal:

```bash
cd /Users/tanyastrauss/Spect-IT

# Add the remote (replace YOUR_USERNAME with your GitHub username)
git remote add origin https://github.com/YOUR_USERNAME/Spect-IT.git

# Push to GitHub
git branch -M main
git push -u origin main
```

## Step 3: Verify

Visit: `https://github.com/YOUR_USERNAME/Spect-IT`

Your code should now be in a private GitHub repository!

---

## Alternative: Using GitHub CLI (if installed)

```bash
cd /Users/tanyastrauss/Spect-IT
gh repo create Spect-IT --private --source=. --remote=origin --push
```

