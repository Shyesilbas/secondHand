#!/usr/bin/env bash
# ==============================================================================
# verify.sh — Unified Pre-Commit & CI Verification Script
#
# Runs all canonical repository consistency checks:
#   1. Zero-Emoji Standard (scripts/check_no_emoji.py)
#   2. Docs Drift, Broken Links & Type Parity (scripts/check_docs.py)
#   3. Frontend / Backend API Endpoint Parity (scripts/check_api_endpoints.py)
#   4. Frontend Code Quality & ESLint (npm run lint)
#
# Usage:
#   ./scripts/verify.sh             # Full suite
#   ./scripts/verify.sh --no-lint    # Skip frontend ESLint (faster)
#
# Exit code: 0 if all pass, 1 if any check fails.
# ==============================================================================
set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
REPO_ROOT="$(cd "${SCRIPT_DIR}/.." && pwd)"

# Color definitions
RED='\033[0;31m'
GREEN='\033[0;32m'
BLUE='\033[0;34m'
BOLD='\033[1m'
NC='\033[0m' # No Color

SKIP_LINT=0
for arg in "$@"; do
    case "$arg" in
        --no-lint)
            SKIP_LINT=1
            ;;
        --help|-h)
            echo "Usage: $0 [--no-lint]"
            exit 0
            ;;
    esac
done

echo -e "${BOLD}${BLUE}=== Running secondHand Unified Verification Suite ===${NC}\n"

FAILED=0

# Step 1: Zero Emoji Standard
echo -e "${BOLD}[1/4] Checking Zero-Emoji Standard...${NC}"
if python3 "${REPO_ROOT}/scripts/check_no_emoji.py"; then
    echo -e "${GREEN}PASS: Zero-Emoji Standard${NC}\n"
else
    echo -e "${RED}FAIL: Zero-Emoji violations detected${NC}\n"
    FAILED=1
fi

# Step 2: Docs Drift & Link Check
echo -e "${BOLD}[2/4] Checking Documentation Drift & Markdown Links...${NC}"
if python3 "${REPO_ROOT}/scripts/check_docs.py"; then
    echo -e "${GREEN}PASS: Docs & Links Drift${NC}\n"
else
    echo -e "${RED}FAIL: Docs drift or broken links detected${NC}\n"
    FAILED=1
fi

# Step 3: API Endpoint Parity
echo -e "${BOLD}[3/4] Checking Frontend/Backend API Endpoint Parity...${NC}"
if python3 "${REPO_ROOT}/scripts/check_api_endpoints.py"; then
    echo -e "${GREEN}PASS: API Endpoint Parity${NC}\n"
else
    echo -e "${RED}FAIL: API endpoint mismatch detected${NC}\n"
    FAILED=1
fi

# Step 4: Frontend ESLint
if [ "$SKIP_LINT" -eq 0 ]; then
    echo -e "${BOLD}[4/4] Checking Frontend ESLint...${NC}"
    if (cd "${REPO_ROOT}/secondhand-frontend" && npm run lint); then
        echo -e "${GREEN}PASS: Frontend ESLint${NC}\n"
    else
        echo -e "${RED}FAIL: Frontend ESLint errors detected${NC}\n"
        FAILED=1
    fi
else
    echo -e "${BOLD}[4/4] Skipping Frontend ESLint (--no-lint specified)${NC}\n"
fi

# Summary
if [ "$FAILED" -eq 0 ]; then
    echo -e "${BOLD}${GREEN}All verification checks PASSED successfully!${NC}"
    exit 0
else
    echo -e "${BOLD}${RED}Verification FAILED. Please resolve the errors above.${NC}"
    exit 1
fi

