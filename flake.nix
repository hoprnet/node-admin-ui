{
  description = "node-admin-ui";

  inputs = {
    flake-utils.url = "github:numtide/flake-utils";
    nixpkgs.url = "github:NixOS/nixpkgs/nixos-26.05";
  };

  outputs =
    {
      self,
      nixpkgs,
      flake-utils,
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

        # CI shells: the Node toolchain plus the workflow linters.
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
