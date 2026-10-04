# Install ABOS-OPS-001 in ABOS_RICH

This bundle is designed for the existing ABOS checkout on Android/Termux.

## 1. Enter the repository

```bash
cd ~/ABOS_RICH
```

## 2. Confirm you are on the canonical repository

```bash
git remote -v
git status
```

## 3. Create the isolated branch

```bash
git checkout main
git pull --ff-only origin main
git checkout -b ops/001-control-plane
```

## 4. Copy the bundle contents into the repository

Copy/extract the contents of this bundle **into the repository root**, preserving hidden directories such as `.abos`, `.opencode`, and `.github`.

## 5. Validate

```bash
bash scripts/abos-ops-001-check.sh
npm run typecheck
npm run lint
npm run build
```

## 6. Inspect the diff

```bash
git status --short
git diff --check
git diff --stat
git diff
```

## 7. Commit

```bash
git add AGENTS.md .abos .opencode .github/pull_request_template.md scripts/abos-ops-001-check.sh INSTALL-IN-ABOS-RICH.md
git commit -m "chore: bootstrap abos engineering control plane"
```

## 8. Push the branch

```bash
git push -u origin ops/001-control-plane
```

Then open the pull request from `ops/001-control-plane` into `main`.
