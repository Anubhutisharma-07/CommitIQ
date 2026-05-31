# Security Policy

CommitIQ clones and analyzes public GitHub repositories. Treat repository URLs, local clone storage, API keys, and generated analysis output as security-sensitive surfaces.

## Supported Versions

The `main` branch is the active development line. Security fixes should target `main`.

## Reporting a Vulnerability

Please do not open a public issue for a suspected vulnerability. Instead, use GitHub private vulnerability reporting if it is enabled for the repository, or contact the maintainer directly through the repository owner profile.

Include:

- A clear description of the issue
- Steps to reproduce
- Impact and affected paths
- Whether credentials, arbitrary command execution, data exposure, or denial of service are involved

## Security Notes for Operators

- Set `ENVIRONMENT=production` in deployed environments.
- Set explicit `CORS_ORIGINS` in production.
- Use least-privilege API keys and rotate them if exposed.
- Keep `ENABLE_GRAPHCODEBERT=false` unless ML dependencies and model cache storage are intentionally provisioned.
- Run the backend with storage quotas and cleanup policies for cloned repositories.
- Do not expose local SQLite databases or repo clone directories.
