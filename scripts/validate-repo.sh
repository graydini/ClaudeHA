#!/usr/bin/env bash
set -euo pipefail

echo "Running repository validation checks..."

# 1) Check for .gitmodules
if [ -f .gitmodules ]; then
  echo "ERROR: .gitmodules file found - remove submodules or vendor the code instead" >&2
  exit 1
fi

# 2) Check for gitlink entries (mode 160000)
if git ls-files -s | awk '$1=="160000" {print $0}' | grep -q .; then
  echo "ERROR: gitlink (submodule) entries found in index - remove submodules" >&2
  git ls-files -s | awk '$1=="160000" {print $0}'
  exit 1
fi

# 3) Check for nested .git directories or .git files
nested_git=$(find . -type d -name .git -not -path './.git' -print || true)
if [ -n "${nested_git}" ]; then
  echo "ERROR: nested .git directories found:" >&2
  echo "$nested_git" >&2
  exit 1
fi

nested_gitfiles=$(find . -type f -name .git -print || true)
# remove any top-level .git file (there shouldn't be files named .git normally)
if [ -n "${nested_gitfiles}" ]; then
  echo "ERROR: .git files found in repository (possible submodule pointers):" >&2
  echo "$nested_gitfiles" >&2
  exit 1
fi

# 4) Flag large files > 5MiB (helpful for detecting accidental large binary commits)
large_files=$(find . -type f -not -path './.git/*' -size +5M -print || true)
if [ -n "${large_files}" ]; then
  echo "WARNING: Large files (>5MiB) found in repository:" >&2
  echo "$large_files" >&2
  # Do not fail on large files automatically, just warn
fi

echo "Repository validation checks passed."