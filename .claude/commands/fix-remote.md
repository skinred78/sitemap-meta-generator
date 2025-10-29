Fix the git remote after bootstrapping from ClaudeKit.

**IMPORTANT**: This command should be run immediately after creating a new project from ClaudeKit.

## What this does:

1. Removes the ClaudeKit git remote (origin)
2. Creates a new GitHub repository for this project
3. Sets the new repo as the origin remote
4. Verifies the configuration

## Steps:

1. Check current remote and verify the issue
2. Remove the ClaudeKit remote
3. Create new GitHub repository with project name
4. Verify the new remote is correct
5. Provide next steps for initial commit and push

## After running this:

You should commit and push your initial code:

```bash
git add -A
git commit -m "feat: initial project setup from ClaudeKit"
git push -u origin main
```

## See also:

- Documentation: `docs/claudekit-project-setup.md`
- For detailed troubleshooting and best practices
