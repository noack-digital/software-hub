#!/bin/bash
# Push to GitHub using token from .env
set -e
cd "$(dirname "$0")"

if [ ! -f .env ]; then
    echo "Error: .env file not found"
    exit 1
fi

# Load .env
export $(grep -v '^#' .env | xargs)

if [ -z "$GITHUB_TOKEN" ] || [ "$GITHUB_TOKEN" = "ghp_DEIN_TOKEN_HIER_EINFUEGEN" ]; then
    echo "Error: GITHUB_TOKEN not set in .env"
    exit 1
fi

git push "https://${GITHUB_USER}:${GITHUB_TOKEN}@github.com/noack-digital/software-hub.git" main "$@"
