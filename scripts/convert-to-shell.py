#!/usr/bin/env python3
"""Convert root HTML pages to use site-shell layout."""

import re
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent

HEADER_RE = re.compile(r"  <header class=\"header\".*?</header>\n", re.DOTALL)
FOOTER_RE = re.compile(r"  <footer class=\"footer\".*?</footer>\n", re.DOTALL)
MOBILE_RE = re.compile(r"  <div class=\"mobile-actions\".*?</div>\n", re.DOTALL)

HEADER_PLACEHOLDER = "  <div id=\"site-header\"></div>\n"
FOOTER_PLACEHOLDER = "  <div id=\"site-footer\"></div>\n  <div id=\"site-mobile-actions\"></div>\n\n  <script src=\"js/site-shell.js\"></script>\n"

SKIP = {"services"}

for path in sorted(ROOT.glob("*.html")):
    if path.stem in SKIP:
        continue
    text = path.read_text(encoding="utf-8")
    if "site-header" in text:
        print(f"skip {path.name} (already converted)")
        continue
    original = text
    text = HEADER_RE.sub(HEADER_PLACEHOLDER, text, count=1)
    text = FOOTER_RE.sub(FOOTER_PLACEHOLDER, text, count=1)
    text = MOBILE_RE.sub("", text, count=1)
    if text == original:
        print(f"warn: no changes for {path.name}")
        continue
    path.write_text(text, encoding="utf-8")
    print(f"converted {path.name}")
