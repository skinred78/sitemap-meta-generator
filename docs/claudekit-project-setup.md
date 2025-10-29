# ClaudeKit Project Setup Guide

This guide explains how to properly set up git remotes when bootstrapping projects from ClaudeKit.

## The Problem

When you bootstrap a project from ClaudeKit, the git remote is initially set to:
```
origin  git@github.com:claudekit/claudekit-engineer.git
```

This means any commits/pushes will go to the ClaudeKit repo instead of your own project repository.

## The Solution

Follow this workflow **immediately** after bootstrapping any new project from ClaudeKit.

---

## Quick Start (3 Steps)

### 1. Bootstrap your project
```bash
# Use whatever ClaudeKit bootstrap method you normally use
# Then navigate to your project:
cd my-new-project
```

### 2. Run the fix-remote command
```bash
# Option A: Use the slash command (recommended)
/fix-remote

# Option B: Manual one-liner
git remote remove origin && gh repo create $(basename "$PWD") --public --source=. --remote=origin && git remote -v
```

### 3. Commit and push
```bash
git add -A
git commit -m "feat: initial project setup from ClaudeKit"
git push -u origin main
```

Done! ✅

---

## Detailed Workflow

### Step 1: Check current remote (diagnosis)
```bash
# Verify the problem exists
git remote -v

# Output will show:
# origin  git@github.com:claudekit/claudekit-engineer.git (fetch)
# origin  git@github.com:claudekit/claudekit-engineer.git (push)
```

### Step 2: Remove ClaudeKit remote
```bash
git remote remove origin
```

### Step 3: Create new GitHub repository
```bash
# Authenticate gh CLI first (one-time setup)
gh auth login

# Create new repo with current directory name
gh repo create $(basename "$PWD") --public --source=. --remote=origin

# Or specify a different name:
gh repo create my-custom-name --public --source=. --remote=origin
```

### Step 4: Verify the fix
```bash
git remote -v

# Should now show:
# origin  git@github.com:YOUR_USERNAME/my-new-project.git (fetch)
# origin  git@github.com:YOUR_USERNAME/my-new-project.git (push)
```

### Step 5: Initial commit and push
```bash
# Stage all files
git add -A

# Commit
git commit -m "feat: initial project setup from ClaudeKit"

# Push and set upstream
git push -u origin main
```

---

## Troubleshooting

### "Repository already exists" error
```bash
# If gh repo create fails because the repo exists:
git remote add origin git@github.com:YOUR_USERNAME/my-project.git
git push -u origin main
```

### "gh: command not found"
```bash
# Install GitHub CLI
brew install gh

# Or on Linux:
# See: https://github.com/cli/cli#installation
```

### "Not authenticated with gh"
```bash
gh auth login
# Follow the prompts to authenticate
```

### Wrong repository was pushed to
```bash
# Check what was pushed:
git log --oneline -5

# If you accidentally pushed to claudekit-engineer:
# Don't worry! Just create a new repo and push there
# The claudekit repo won't be affected if you only pushed feature commits
```

---

## Best Practices

### 1. **Always verify immediately**
Make `git remote -v` your first command after bootstrap:
```bash
cd new-project
git remote -v  # <- Run this FIRST
```

### 2. **Use the slash command**
Instead of remembering the manual steps, just use:
```bash
/fix-remote
```

### 3. **Add to your checklist**
Create a mental checklist:
- [ ] Bootstrap from ClaudeKit
- [ ] Run `/fix-remote`
- [ ] Verify with `git remote -v`
- [ ] Initial commit and push
- [ ] Continue building

### 4. **Verify before first commit**
Never commit until you've verified the remote is correct:
```bash
git remote -v | grep "YOUR_USERNAME"
# If this returns nothing, stop and fix the remote!
```

---

## Why This Happens

ClaudeKit projects include git configuration that points to the ClaudeKit repository. This is normal for template/bootstrap systems. The solution is simple: just update the remote after bootstrapping.

This is not a bug - it's expected behavior when using templates. The fix takes 30 seconds.

---

## Automation Script

Save this as `~/bin/fix-claudekit-remote.sh`:

```bash
#!/bin/bash
set -e

PROJECT_NAME=$(basename "$PWD")

echo "🔧 Fixing git remote for: $PROJECT_NAME"
echo ""

# Remove old remote
echo "1. Removing ClaudeKit remote..."
git remote remove origin

# Create new repo
echo "2. Creating GitHub repository..."
gh repo create "$PROJECT_NAME" --public --source=. --remote=origin

# Verify
echo "3. Verifying remote..."
git remote -v

echo ""
echo "✅ Done! Your remote is now set to:"
gh repo view --json url -q .url

echo ""
echo "Next steps:"
echo "  git add -A"
echo "  git commit -m 'feat: initial project setup from ClaudeKit'"
echo "  git push -u origin main"
```

Make it executable:
```bash
chmod +x ~/bin/fix-claudekit-remote.sh
```

Use it:
```bash
cd my-new-project
~/bin/fix-claudekit-remote.sh
```

---

## Summary

**The Golden Rule**: After every ClaudeKit bootstrap, run:
```bash
/fix-remote && git remote -v
```

This ensures your commits go to YOUR repository, not the ClaudeKit template repo.

---

## Related Documentation

- [GitHub CLI Documentation](https://cli.github.com/manual/)
- [Git Remote Documentation](https://git-scm.com/docs/git-remote)
- [ClaudeKit Official Docs](https://claudekit.cc/)
