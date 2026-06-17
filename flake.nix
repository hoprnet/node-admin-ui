{
  description = "node-admin-ui";

  inputs = {
    flake-utils.url = "github:numtide/flake-utils";
    nixpkgs.url = "github:NixOS/nixpkgs/nixos-25.11";
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
            pkgs.docker
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
          };
          tools = pkgs;
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
        devShells.ci = pkgs.mkShell {
          nativeBuildInputs = [
            pkgs.zizmor
          ];
        };

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
