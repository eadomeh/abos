# OpenCode Integration

OpenCode is the primary ABOS implementation worker.

The repository-wide contract lives in `AGENTS.md`; the portable builder prompt lives in `.abos/prompts/builder.md`.

Tool-specific OpenCode configuration should be added only after verifying the currently installed OpenCode configuration format. The control plane intentionally avoids pinning a vendor-specific config syntax before that verification.
