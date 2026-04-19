#!/usr/bin/env bash
set -euo pipefail

# generate-variant-placeholders.sh
# Phase 1 Star Shop — Placeholder PNG generation (D-05)
# Copies existing character source PNGs to all 20 variant filenames under
# src/assets/variants/. Run once from the repo root before `npm run dev`.
# This is a placeholder step; real variant art replaces these files later.

mkdir -p src/assets/variants

# peach → src/assets/mascot.png
cp src/assets/mascot.png src/assets/variants/peach-default.png
cp src/assets/mascot.png src/assets/variants/peach-blue.png
cp src/assets/mascot.png src/assets/variants/peach-green.png
cp src/assets/mascot.png src/assets/variants/peach-purple.png
cp src/assets/mascot.png src/assets/variants/peach-yellow.png

# daisy → src/assets/daisy.png
cp src/assets/daisy.png src/assets/variants/daisy-default.png
cp src/assets/daisy.png src/assets/variants/daisy-blue.png
cp src/assets/daisy.png src/assets/variants/daisy-green.png
cp src/assets/daisy.png src/assets/variants/daisy-purple.png
cp src/assets/daisy.png src/assets/variants/daisy-yellow.png

# rosalina → src/assets/rosalina.png
cp src/assets/rosalina.png src/assets/variants/rosalina-default.png
cp src/assets/rosalina.png src/assets/variants/rosalina-blue.png
cp src/assets/rosalina.png src/assets/variants/rosalina-green.png
cp src/assets/rosalina.png src/assets/variants/rosalina-purple.png
cp src/assets/rosalina.png src/assets/variants/rosalina-yellow.png

# toad → src/assets/toad.png
cp src/assets/toad.png src/assets/variants/toad-default.png
cp src/assets/toad.png src/assets/variants/toad-blue.png
cp src/assets/toad.png src/assets/variants/toad-green.png
cp src/assets/toad.png src/assets/variants/toad-purple.png
cp src/assets/toad.png src/assets/variants/toad-yellow.png

echo "Generated 20 placeholder variant PNGs in src/assets/variants/"
