{
  pkgs ? import <nixpkgs> { },
  nodejs ? pkgs.nodejs_22,
}:
let
  linuxPkgs = with pkgs; lib.optional stdenv.isLinux (
    inotify-tools
  );
in
with pkgs;
mkShell {
  nativeBuildInputs = [
    nodejs
    (yarn.override { inherit nodejs; })
  ]
  # custom pkg groups
  ++ linuxPkgs;
}
