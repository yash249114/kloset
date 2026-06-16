# Kloset Contribution Guidelines

Welcome to the Kloset Marketplace repository. Since this is a private project, please adhere to the following development standards:

## Development Workflow

1. **Branching Model**:
   * Create feature branches off `main` using the syntax: `feature/your-feature-name` or `bugfix/issue-description`.
   * Never commit directly to `main`.

2. **Commit Message Guidelines**:
   * Follow conventional commits (e.g., `feat: Add Google login provider`, `fix: Adjust database connection retry timeout`).
   * Keep the subject line under 50 characters.

3. **Local Testing Requirements**:
   * Before opening a pull request, verify that all automated integration checks pass:
     ```bash
     node frontend/scripts/run-e2e-tests.js
     ```
   * Ensure both frontend and backend packages compile without typescript/Go errors:
     ```bash
     # Backend
     go build ./...
     
     # Frontend
     npx tsc --noEmit
     ```

4. **Pull Requests & Code Reviews**:
   * Pull requests must be reviewed by at least one core engineer.
   * All checks must pass on the CI pipeline before merging.
