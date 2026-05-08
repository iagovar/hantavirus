#!/bin/bash

# ==============================================================================
# Production Update Script
#
# Updates the production deployment by pulling the latest code from the repo.
# Since dist/ is tracked in git, no rebuild is needed after pull.
# PocketBase is a standalone binary — it does not need restarting on code updates.
#
# Usage:
#   ./update_prod.sh            # Normal mode
#   ./update_prod.sh --dry-run  # Simulation mode (no changes)
# ==============================================================================
set -euo pipefail

readonly RED='\033[0;31m'
readonly GREEN='\033[0;32m'
readonly YELLOW='\033[1;33m'
readonly CYAN='\033[0;36m'
readonly BOLD='\033[1m'
readonly NC='\033[0m'

DRY_RUN=false
STASH_REF=""

log::step()  { printf "${CYAN}[%s]${NC} %s...\n" "$1" "$2" >&2; }
log::ok()    { printf "${GREEN}✔ %s${NC}\n" "$1" >&2; }
log::warn()  { printf "${YELLOW}⚠ %s${NC}\n" "$1" >&2; }
log::err()   { printf "${RED}✘ %s${NC}\n" "$1" >&2; exit 1; }
log::dry()   { printf "${YELLOW}[DRY-RUN] Would run: %s${NC}\n" "$1" >&2; }

io::confirm() {
    local prompt="$1"
    local def="${2:-N}"
    local suf="[y/N]"
    [[ "$def" == "Y" ]] && suf="[Y/n]"
    local ans
    read -rp "$(printf "${YELLOW}%s %s: ${NC}" "$prompt" "$suf")" ans
    ans="${ans:-$def}"
    [[ "${ans,,}" == "y" || "${ans,,}" == "yes" ]]
}

git::get_root() {
    local d; d="$(cd "$(dirname "${BASH_SOURCE[0]}")" &>/dev/null && pwd)"
    git -C "$d" rev-parse --show-toplevel
}

git::validate_branch() {
    local branch
    branch=$(git rev-parse --abbrev-ref HEAD)
    [[ "$branch" != "main" && "$branch" != "master" ]] && log::err "Must run on 'main' or 'master' branch (current: $branch)."
    printf "%s" "$branch"
}

git::has_changes() { [[ -n $(git status --porcelain 2>/dev/null) ]]; }

git::stash() {
    local msg="update_prod_$(date +%Y%m%d_%H%M%S)"
    if [[ "$DRY_RUN" == true ]]; then
        log::dry "git stash push -m \"$msg\""
        printf "%s" "stash@{0}_simulated"
        return
    fi
    git stash push -m "$msg" > /dev/null
    local ref; ref=$(git stash list | grep "$msg" | head -1 | cut -d: -f1)
    log::ok "Changes saved to $ref"
    printf "%s" "$ref"
}

git::pull() {
    local branch="$1"
    if [[ "$DRY_RUN" == true ]]; then
        log::dry "git pull origin $branch"
        printf "simulated"
        return
    fi
    git pull origin "$branch" 2>&1
}

git::unstash() {
    local ref="$1"
    if [[ "$DRY_RUN" == true ]]; then
        log::dry "git stash pop $ref"
        return
    fi
    git stash pop "$ref" || {
        log::warn "Conflict when restoring stash. Changes kept in $ref."
        io::confirm "Continue anyway?" "N" || log::err "Update aborted due to merge conflicts."
    }
}

main() {
    [[ "${1:-}" == "--dry-run" ]] && DRY_RUN=true && printf "${YELLOW}${BOLD}DRY-RUN MODE — No changes will be made${NC}\n\n"

    log::step "1/4" "Locating repository"
    REPO_ROOT=$(git::get_root)
    cd "$REPO_ROOT"
    log::ok "Root: $REPO_ROOT"

    log::step "2/4" "Validating branch"
    local branch; branch=$(git::validate_branch)
    log::ok "Branch: $branch"

    log::step "3/4" "Checking local changes"
    if git::has_changes; then
        git status --short
        io::confirm "Stash these changes and continue?" "N" || log::err "Update cancelled."
        STASH_REF=$(git::stash)
    else
        log::ok "No local changes"
    fi

    log::step "4/4" "Pulling latest code"
    local status; status=$(git::pull "$branch")
    [[ "$status" == "Already up to date." ]] && log::warn "Already up to date." || log::ok "Pulled successfully"

    if [[ -n "$STASH_REF" ]]; then
        io::confirm "Re-apply stashed changes?" "Y" && git::unstash "$STASH_REF"
    fi

    printf "\n${GREEN}${BOLD}Update complete${NC}\n"
}

main "$@"