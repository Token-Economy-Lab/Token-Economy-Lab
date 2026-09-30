#!/usr/bin/env bash
set -euo pipefail
repo="${PAGES_REPOSITORY:-Token-Economy-Lab/Token-Economy-Lab.github.io}"
if [[ ! "$repo" =~ ^[A-Za-z0-9_.-]+/[A-Za-z0-9_.-]+$ ]]; then echo 'Invalid PAGES_REPOSITORY'; exit 1; fi
test -f dist/index.html
test -f dist/.nojekyll
node scripts/verify.mjs
node scripts/verify-release.mjs
deploy_root="$(mktemp -d)"
trap 'rm -rf "$deploy_root"' EXIT
cp -R dist/. "$deploy_root/"
cd "$deploy_root"
git init --initial-branch=gh-pages --quiet
git config user.name 'Token Economy Deploy'
git config user.email '88832314+luoyu100@users.noreply.github.com'
git add .
git commit --quiet -m "Publish encrypted website code ${CODE_SHA:-local} content ${GITHUB_SHA:-local}"
git remote add origin "git@github.com:${repo}.git"
# The deployment repository is a generated artifact; it contains no editable source.
git push --force origin gh-pages
