{
  description = "node-admin-ui";

  inputs = {
    flake-utils.url = "github:numtide/flake-utils";
  };

  outputs = { self, nixpkgs, flake-utils}:
    flake-utils.lib.eachDefaultSystem
      (system:
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

        in
        {
          devShells.default = import ./shell.nix { inherit pkgs; };
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