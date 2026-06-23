/**
 * Enforce the Conventional Commits spec (https://www.conventionalcommits.org).
 * Used both in CI (commit messages + PR title) and for local linting.
 */
export default {
  extends: ['@commitlint/config-conventional'],
};
