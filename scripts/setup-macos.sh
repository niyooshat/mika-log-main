#!/usr/bin/env bash
set -euo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"

print_step() {
  echo ""
  echo "==> $1"
}

require_brew() {
  if command -v brew >/dev/null 2>&1; then
    return
  fi

  echo "Homebrew is required but not installed."
  echo "Install it first:"
  echo '/bin/bash -c "$(curl -fsSL https://raw.githubusercontent.com/Homebrew/install/HEAD/install.sh)"'
  exit 1
}

ensure_formula() {
  local formula="$1"
  if brew list "$formula" >/dev/null 2>&1; then
    echo "- $formula already installed"
  else
    echo "- installing $formula"
    brew install "$formula"
  fi
}

print_step "Checking Homebrew"
require_brew

print_step "Updating Homebrew"
brew update

print_step "Installing required packages (node, watchman, cocoapods)"
ensure_formula node
ensure_formula watchman
ensure_formula cocoapods

print_step "Checking Xcode Command Line Tools"
if xcode-select -p >/dev/null 2>&1; then
  echo "- Xcode Command Line Tools already installed"
else
  echo "- installing Xcode Command Line Tools"
  xcode-select --install || true
  echo "Complete the Command Line Tools installation, then re-run this script if needed."
fi

print_step "Checking Xcode app"
if [ -d "/Applications/Xcode.app" ]; then
  echo "- Xcode.app found"
else
  echo "- Xcode.app not found in /Applications"
  echo "  Install Xcode from the App Store for iOS simulator support."
fi

print_step "Installing JavaScript dependencies"
cd "$ROOT_DIR"
if [ -f package-lock.json ]; then
  npm ci
else
  npm install
fi

print_step "Setup complete"
echo "Next steps:"
echo "1) Add EXPO_PUBLIC_TMDB_API_KEY to .env.local"
echo "2) Run web: npm run web"
echo "3) Run iOS: npm run ios"
