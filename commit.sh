#!/bin/bash

# Exit on errors
set -e

# Add all untracked and modified files
git add .

# Get a list of staged files
files=$(git diff --cached --name-only)

if [ -z "$files" ]; then
  echo "No changes to commit."
  exit 0
fi

# Loop through each file
for file in $files; do
  # Skip unwanted files/folders
  case "$file" in
    .env|.env.*|node_modules/*|.vs/*|*.lock)
      echo "⏩ Skipping $file"
      continue
      ;;
  esac

  echo ""
  echo "File: $file"

  # Ask for commit message
  read -p "Enter commit message for this file: " msg

  # Use default if blank
  if [ -z "$msg" ]; then
    msg="Update $file"
    echo "ℹ️ No message entered. Using default: '$msg'"
  fi

  git reset
  git add "$file"
  git commit -m "$msg"

  echo "✅ Committed $file with message: '$msg'"
done

# Push to the current branch
echo ""
read -p "Do you want to push the commits to GitHub now? (y/n): " push_confirm
if [ "$push_confirm" == "y" ]; then
  git push
  echo "🚀 All commits pushed!"
else
  echo "✅ All commits done. Push later with 'git push'"
fi
