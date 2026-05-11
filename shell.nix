{ pkgs ? import <nixpkgs> { } }:
let
  linuxPkgs = with pkgs; lib.optional stdenv.isLinux (
    inotify-tools
  );
in
with pkgs;
mkShell {
  nativeBuildInputs = [
    nodejs_22
    (yarn.override { nodejs = nodejs_22; })

    # custom pkg groups
    linuxPkgs
  ];
}
