#!/usr/bin/env python3
"""Create the run folder for one brand-audit-content run.

Usage:
    python3 init_run.py URL [--industry TEXT] [--competitors URL,URL] [--region TEXT]
                            [--platform TEXT] [--focus TEXT] [--root DIR]

Creates <root>/<domain-slug>-<YYYY-MM-DD>/ (adding -2, -3, ... if that exists) with
the phase subfolders and an inputs.json, then prints the absolute path of the run folder.
"""

import argparse
import datetime as dt
import json
import re
import sys
from pathlib import Path
from urllib.parse import urlparse

SUBDIRS = [
    "01-research/screenshots",
    "02-analysis",
    "03-verification",
    "04-deliverables",
]


def normalize_url(raw: str) -> str:
    raw = raw.strip()
    if not re.match(r"^[a-zA-Z][a-zA-Z0-9+.-]*://", raw):
        raw = "https://" + raw
    parsed = urlparse(raw)
    if parsed.scheme not in ("http", "https") or not parsed.netloc or "." not in parsed.netloc:
        raise ValueError(f"not a public website URL: {raw!r}")
    return raw


def domain_slug(url: str) -> str:
    host = urlparse(url).hostname or "site"
    if host.startswith("www."):
        host = host[4:]
    return re.sub(r"[^a-z0-9]+", "-", host.lower()).strip("-")


def split_list(value):
    if not value:
        return []
    return [item.strip() for item in value.split(",") if item.strip()]


def main() -> int:
    parser = argparse.ArgumentParser(description=__doc__, formatter_class=argparse.RawDescriptionHelpFormatter)
    parser.add_argument("url", help="public brand website, e.g. https://brand.com")
    parser.add_argument("--industry", help="industry or category, if the user gave one")
    parser.add_argument("--competitors", help="comma-separated competitor URLs or names")
    parser.add_argument("--region", help="market or region, e.g. 'UK' or 'US West Coast'")
    parser.add_argument("--platform", help="target video platform(s); default is vertical short-form")
    parser.add_argument("--focus", help="optional emphasis for the audit")
    parser.add_argument("--root", default="brand-audits", help="parent folder for runs (default: ./brand-audits)")
    args = parser.parse_args()

    try:
        url = normalize_url(args.url)
    except ValueError as exc:
        print(f"error: {exc}", file=sys.stderr)
        return 1

    today = dt.date.today().isoformat()
    root = Path(args.root).resolve()
    base = f"{domain_slug(url)}-{today}"
    run_dir = root / base
    n = 2
    while run_dir.exists():
        run_dir = root / f"{base}-{n}"
        n += 1

    for sub in SUBDIRS:
        (run_dir / sub).mkdir(parents=True, exist_ok=True)

    inputs = {
        "url": url,
        "domain": urlparse(url).hostname,
        "industry": {"value": args.industry, "source": "user"} if args.industry else {"value": None, "source": "to be inferred"},
        "competitors": split_list(args.competitors),
        "region": args.region,
        "platform": args.platform or "vertical short-form video (Reels / TikTok / Shorts)",
        "focus": args.focus,
        "started": today,
        "run_dir": str(run_dir),
    }
    (run_dir / "inputs.json").write_text(json.dumps(inputs, indent=2) + "\n", encoding="utf-8")

    print(run_dir)
    return 0


if __name__ == "__main__":
    sys.exit(main())
