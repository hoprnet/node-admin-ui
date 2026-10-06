{
  description = "node-admin-ui";

  inputs = {
    flake-utils.url = "github:numtide/flake-utils";
    nixpkgs.url = "github:NixOS/nixpkgs/nixos-26.05";
    pre-commit.url = "github:cachix/git-hooks.nix";
    pre-commit.inputs.nixpkgs.follows = "nixpkgs";
  };

  outputs =
    {
      self,
      nixpkgs,
      flake-utils,
      pre-commit,
    }:
    flake-utils.lib.eachDefaultSystem (
      system:
      let
        pkgs = nixpkgs.legacyPackages.${system};
        pkgsLinux = nixpkgs.legacyPackages."x86_64-linux";

        dockerBuild = pkgs.writeShellApplication {
          name = "dockerBuild";
          runtimeInputs = [
            pkgs.docker_29
            pkgs.coreutils
          ];
          text = ''
            #!/usr/bin/env bash
            set -euo pipefail

            echo "[+] Building: hopr-admin:latest"
            docker build --platform linux/amd64 -t hopr-admin:latest -f ./Dockerfile .
            echo "[✓] Done: hopr-admin:latest"
          '';
        };

        pre-commit-check = pre-commit.lib.${system}.run {
          src = ./.;
          hooks = {
            check-executables-have-shebangs.enable = true;
            check-shebang-scripts-are-executable.enable = true;
            check-case-conflicts.enable = true;
            check-symlinks.enable = true;
            check-merge-conflicts.enable = true;
            check-added-large-files.enable = true;
            commitizen.enable = true;
            actionlint.enable = true;
            pinact = {
              enable = true;
              name = "pinact";
              description = "Check GitHub Action refs are SHA-pinned and resolvable";
              entry = "${pkgs.writeShellScript "pinact-check" ''
                token="''${GITHUB_TOKEN:-$(${pkgs.gh}/bin/gh auth token 2>/dev/null || true)}"
                if [ -z "$token" ]; then
                  echo "pinact: skipping — no GITHUB_TOKEN and gh not authenticated" >&2
                  exit 0
                fi
                export GITHUB_TOKEN="$token"
                exec ${pkgs.pinact}/bin/pinact run --check
              ''}";
              files = "^\\.github/workflows/.*\\.ya?ml$";
              language = "system";
              pass_filenames = false;
            };
            dependabot-validator = {
              enable = true;
              name = "Dependabot config validator";
              entry = "${pkgs.check-jsonschema}/bin/check-jsonschema --builtin-schema vendor.dependabot";
              files = "\\.github/dependabot\\.yml$";
              language = "system";
              pass_filenames = true;
            };
          };
          tools = pkgs;
        };

        # CI shells: the Node toolchain plus the workflow linters, without the
        # interactive pre-commit hook installation.
        ciShell =
          nodejs:
          pkgs.mkShell {
            inputsFrom = [ (import ./shell.nix { inherit pkgs nodejs; }) ];
            nativeBuildInputs = [
              pkgs.zizmor
              pkgs.actionlint
              pkgs.gh
            ];
          };
      in
      {
        devShells.default = pkgs.mkShell {
          inputsFrom = [ (import ./shell.nix { inherit pkgs; }) ];
          buildInputs = [ pkgs.gh ];
          shellHook = ''
            export GITHUB_TOKEN="''${GITHUB_TOKEN:-$(gh auth token 2>/dev/null || true)}"
            ${pre-commit-check.shellHook}
          '';
        };
        # UI shell: the default toolchain plus a headless Chromium (Playwright)
        # for screenshots and visual checks of the dashboard.
        devShells.ui = pkgs.mkShell {
          inputsFrom = [ (import ./shell.nix { inherit pkgs; }) ];
          nativeBuildInputs = [
            (pkgs.python3.withPackages (ps: [ ps.playwright ]))
          ];
          PLAYWRIGHT_BROWSERS_PATH = pkgs.playwright-driver.browsers;
          PLAYWRIGHT_SKIP_VALIDATE_HOST_REQUIREMENTS = "true";
          # The nix Chromium sees no system fonts otherwise and renders no text.
          FONTCONFIG_FILE = pkgs.makeFontsConf {
            fontDirectories = [
              pkgs.dejavu_fonts
              pkgs.liberation_ttf
              pkgs.noto-fonts-color-emoji
            ];
          };
        };
        devShells.ci = ciShell pkgs.nodejs_22;
        devShells.ci-node22 = ciShell pkgs.nodejs_22;
        devShells.ci-node24 = ciShell pkgs.nodejs_24;

        # Expose as flake as app
        apps = {
          docker-x86_64-linux = {
            type = "app";
            program = "${dockerBuild}/bin/dockerBuild";
          };
          default = {
            type = "app";
            program = "${dockerBuild}/bin/dockerBuild";
          };
        };
      }
    );
}
