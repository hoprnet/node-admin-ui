# GitHub Workflows

All tools (Node.js, yarn, actionlint, zizmor, gh) come from the flake's `ci*` dev shells; jobs run their steps through
`nix develop .#ci-node<version> --command …`, so CI uses exactly the toolchain you get locally with `nix develop`.

Docker images are published to the GitHub Container Registry: `ghcr.io/<owner>/node-admin-ui`.

## PR (`pr.yaml`)

- Validates the PR title (conventional commits) and applies labels
- Runs [Checks](#checks-checksyaml)
- Builds the Docker image and pushes it as `pr-<number>` and `sha-<short>` (build only for PRs coming from other forks)

## Main (`merge.yaml`)

Runs on every push to `main`:

- Runs [Checks](#checks-checksyaml)
- Pushes the Docker image as `latest`, `main` and `sha-<short>`

## Release (`release.yaml`)

Triggered manually from the Actions tab:

- Reads the version from `package.json` and fails if the tag `v<version>` already exists
- Runs [Checks](#checks-checksyaml)
- Pushes the Docker image as `<version>` (built without cache)
- Creates the `v<version>` tag and a GitHub release with generated notes (marked as pre-release when the version has a
  suffix such as `-rc.1`)

Bump the version in `package.json` through a regular PR before releasing.

## Reusable workflows

### Checks (`checks.yaml`)

- Build, lint, formatting and tests on Node.js 22 and 24
- `actionlint` and `zizmor` on the workflows

### Docker (`docker.yaml`)

- Builds the `Dockerfile` for `linux/amd64` and optionally pushes it to ghcr.io
