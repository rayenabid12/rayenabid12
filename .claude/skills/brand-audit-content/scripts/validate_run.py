#!/usr/bin/env python3
"""Validate a brand-audit-content run folder at a given stage.

Usage:
    python3 validate_run.py RUN_DIR --stage evidence|research|analysis|verified|final [--lens LENS]

Stages build on each other:
  evidence  evidence logs that exist so far (safe while researchers run in parallel)
  research  + inputs.json, both research streams, brand-profile.md
  analysis  + all four findings files (or only --lens LENS while analysts run in parallel)
  verified  + verification log, findings-verified.json, scoring, public gate, accounting
  final     + internal-audit.md and content-package.md

Exit code 0 = no errors (warnings may remain), 1 = errors found.
"""

import argparse
import difflib
import json
import re
import sys
from pathlib import Path

STAGES = ["evidence", "research", "analysis", "verified", "final"]
LENSES = ["strategy", "digital", "visual", "market"]
EVIDENCE_TYPES = {"page", "screenshot", "style-data", "competitor", "external", "search-note"}
EVIDENCE_ID = re.compile(r"^E-[a-z]+-\d{3}$")
EVIDENCE_REF = re.compile(r"\bE-[a-z]+-\d{3}\b")
FINDING_REF = re.compile(r"\bF-(?:strategy|digital|visual|market)-\d{2}\b")
DATE = re.compile(r"^\d{4}-\d{2}-\d{2}$")
CONFIDENCE = {"high", "medium", "low"}
VERDICTS = {"keep", "revise"}
PRIORITIES = {"now", "next", "later"}
SCORE_KEYS = ["evidence_quality", "brand_relevance", "importance", "audience_usefulness"]
FINDING_TEXT_FIELDS = [
    "title", "observation", "interpretation", "why_it_may_matter",
    "improvement_direction", "confidence_rationale", "lesson",
]
ACCUSATORY = [
    r"\blos(?:e|es|ing|t) (?:sales|customers|revenue|money|business)\b",
    r"\bcost(?:s|ing)? (?:them|the brand|the business) (?:sales|customers|money|revenue)\b",
    r"\bkill(?:s|ing)? (?:conversions|sales)\b",
    r"\bmistakes?\b",
    r"\bfail(?:s|ing|ed|ure)?\b(?!\s+(?:wcag|aa\b|the wcag|contrast))",
    r"\bugly\b", r"\bterrible\b", r"\bcringe\w*\b", r"\bbad branding\b",
    r"\bdisaster\w*\b", r"\bworst\b", r"\bamateur\w*\b", r"\bembarrassing\b",
]
PLACEHOLDER = re.compile(r"\[[A-Z][A-Z_]{2,}\]")

AUDIT_HEADINGS = [
    "summary", "brand and business context", "what's working", "key findings",
    "recommendations", "removed in verification", "limitations", "sources",
]
PACKAGE_HEADINGS = [
    "selected findings", "broader business lesson", "hooks", "script", "shot list",
    "caption", "cta", "fact-check", "pre-publication checklist",
]


class Report:
    def __init__(self):
        self.errors, self.warnings, self.info = [], [], []

    def error(self, where, msg):
        self.errors.append(f"{where}: {msg}")

    def warn(self, where, msg):
        self.warnings.append(f"{where}: {msg}")


def load_json(path: Path, rep: Report, rel: str):
    if not path.exists():
        rep.error(rel, "file not found")
        return None
    try:
        return json.loads(path.read_text(encoding="utf-8"))
    except json.JSONDecodeError as exc:
        rep.error(rel, f"invalid JSON ({exc})")
        return None


def nonempty(value) -> bool:
    if value is None:
        return False
    if isinstance(value, str):
        return bool(value.strip())
    if isinstance(value, (list, dict)):
        return len(value) > 0
    return True


def scan_language(text: str, where: str, rep: Report):
    for pattern in ACCUSATORY:
        m = re.search(pattern, text, re.IGNORECASE)
        if m:
            rep.warn(where, f"accusatory or absolute wording '{m.group(0)}': rephrase conditionally if it's about the brand")


# ---------- evidence ----------

def check_evidence(run: Path, rep: Report, require_streams: bool) -> dict:
    evidence = {}
    files = sorted((run / "01-research").glob("evidence-*.json")) + sorted((run / "02-analysis").glob("evidence-*.json"))
    if not files:
        rep.error("01-research", "no evidence-*.json files yet")
    if require_streams:
        for name in ("evidence-site.json", "evidence-ext.json"):
            if not (run / "01-research" / name).exists():
                rep.error(f"01-research/{name}", "file not found")
    has_screenshot = False
    for path in files:
        rel = str(path.relative_to(run))
        data = load_json(path, rep, rel)
        if data is None:
            continue
        if not isinstance(data, list):
            rep.error(rel, "must be a JSON array of evidence items")
            continue
        if not data:
            rep.warn(rel, "no evidence items")
        for i, item in enumerate(data):
            where = f"{rel}[{i}]"
            if not isinstance(item, dict):
                rep.error(where, "item must be an object")
                continue
            eid = item.get("id", "")
            where = f"{rel} {eid or f'[{i}]'}"
            if not EVIDENCE_ID.match(str(eid)):
                rep.error(where, "id must look like E-site-001")
            elif eid in evidence:
                rep.error(where, f"duplicate evidence id (also in {evidence[eid]['_file']})")
            etype = item.get("type")
            if etype not in EVIDENCE_TYPES:
                rep.error(where, f"type must be one of {sorted(EVIDENCE_TYPES)}")
            if etype == "search-note":
                if not nonempty(item.get("query")):
                    rep.error(where, "search-note needs a 'query'")
            elif not str(item.get("url", "")).startswith(("http://", "https://")):
                rep.error(where, "needs an http(s) 'url'")
            if not DATE.match(str(item.get("accessed", ""))):
                rep.error(where, "'accessed' must be YYYY-MM-DD")
            if not nonempty(item.get("excerpt")):
                rep.error(where, "'excerpt' is empty: quote or describe exactly what the evidence shows")
            shot = item.get("screenshot")
            if shot:
                has_screenshot = True
                if not (run / shot).exists():
                    rep.error(where, f"screenshot not found: {shot}")
            if etype == "screenshot" and not shot:
                rep.error(where, "screenshot evidence needs a 'screenshot' path")
            if "published" in item and item["published"] and not DATE.match(str(item["published"])):
                rep.warn(where, "'published' should be YYYY-MM-DD")
            if isinstance(eid, str) and eid not in evidence:
                evidence[eid] = dict(item, _file=rel)
    if files and not has_screenshot:
        rep.warn("evidence", "no screenshots referenced: fine if no screenshot tool was available, but say so in site-notes.md")
    return evidence


def check_evidence_refs(refs, evidence: dict, where: str, rep: Report):
    if not isinstance(refs, list) or not refs:
        rep.error(where, "'evidence' must be a non-empty list of {id, detail}")
        return
    for ref in refs:
        rid = ref.get("id") if isinstance(ref, dict) else ref
        if rid not in evidence:
            rep.error(where, f"evidence {rid} not found in any evidence log")
        if isinstance(ref, dict) and not nonempty(ref.get("detail")):
            rep.warn(where, f"evidence {rid} has no 'detail' saying what it shows")


# ---------- research ----------

def check_research(run: Path, rep: Report):
    inputs = load_json(run / "inputs.json", rep, "inputs.json")
    if inputs is not None and not nonempty(inputs.get("url")):
        rep.error("inputs.json", "missing 'url'")
    for name in ("recon.md", "site-notes.md", "market-notes.md"):
        if not (run / "01-research" / name).exists():
            rep.warn(f"01-research/{name}", "file not found")
    profile = run / "01-research" / "brand-profile.md"
    if not profile.exists():
        rep.error("01-research/brand-profile.md", "file not found (main thread writes it after both researchers finish)")
    else:
        text = profile.read_text(encoding="utf-8").lower()
        if "unknown" not in text and "inferred" not in text and "verified" not in text:
            rep.warn("01-research/brand-profile.md", "no Status values (verified / stated by brand / inferred / unknown) found")


# ---------- findings ----------

def check_finding(f, lens, evidence, where, rep: Report):
    fid = f.get("id", "")
    if not re.match(rf"^F-{lens}-\d{{2}}$", str(fid)):
        rep.error(where, f"id must look like F-{lens}-01")
    if f.get("lens") != lens:
        rep.error(where, f"'lens' must be '{lens}'")
    for field in FINDING_TEXT_FIELDS:
        if not nonempty(f.get(field)):
            rep.error(where, f"'{field}' is empty")
    if f.get("confidence") not in CONFIDENCE:
        rep.error(where, "'confidence' must be high, medium or low")
    if not nonempty(f.get("to_verify_impact")):
        rep.error(where, "'to_verify_impact' is empty: say what information would verify commercial impact")
    check_evidence_refs(f.get("evidence"), evidence, where, rep)
    title = f.get("title", "")
    if isinstance(title, str) and len(title.split()) > 14:
        rep.warn(where, "title is long; aim for 12 words or fewer")
    for field in ("observation", "interpretation", "why_it_may_matter", "improvement_direction", "lesson"):
        if isinstance(f.get(field), str):
            scan_language(f[field], f"{where} {field}", rep)


def check_strengths(strengths, lens, evidence, rel, rep: Report):
    if not isinstance(strengths, list):
        rep.error(rel, "'strengths' must be a list")
        return
    for i, s in enumerate(strengths):
        sid = s.get("id", f"[{i}]") if isinstance(s, dict) else f"[{i}]"
        where = f"{rel} {sid}"
        if not isinstance(s, dict):
            rep.error(where, "strength must be an object")
            continue
        pattern = rf"^S-{lens}-\d{{2}}$" if lens else r"^S-(?:strategy|digital|visual|market)-\d{2}$"
        if not re.match(pattern, str(s.get("id", ""))):
            rep.error(where, "id must look like S-<lens>-01")
        for field in ("title", "observation", "why_it_works"):
            if not nonempty(s.get(field)):
                rep.error(where, f"'{field}' is empty")
        check_evidence_refs(s.get("evidence"), evidence, where, rep)


def check_analysis(run: Path, evidence: dict, rep: Report, only_lens=None) -> dict:
    findings = {}
    lenses = [only_lens] if only_lens else LENSES
    for lens in lenses:
        rel = f"02-analysis/findings-{lens}.json"
        data = load_json(run / rel, rep, rel)
        if data is None:
            continue
        if not isinstance(data, dict) or not isinstance(data.get("findings"), list):
            rep.error(rel, "must be an object with a 'findings' list")
            continue
        items = data["findings"]
        if not items:
            rep.warn(rel, "no findings: fine only if this lens genuinely found nothing well-evidenced")
        if len(items) > 6:
            rep.warn(rel, f"{len(items)} findings: the brief asks for 2-6; keep the sharpest")
        for i, f in enumerate(items):
            if not isinstance(f, dict):
                rep.error(f"{rel}[{i}]", "finding must be an object")
                continue
            fid = f.get("id", f"[{i}]")
            where = f"{rel} {fid}"
            if fid in findings:
                rep.error(where, "duplicate finding id")
            check_finding(f, lens, evidence, where, rep)
            findings[fid] = f
        strengths = data.get("strengths", [])
        if not strengths:
            rep.warn(rel, "no strengths recorded: add 1-3 evidenced things the brand does well")
        check_strengths(strengths, lens, evidence, rel, rep)
    # Possible duplicates across lenses
    items = list(findings.values())
    for i in range(len(items)):
        for j in range(i + 1, len(items)):
            a, b = items[i], items[j]
            if a.get("lens") == b.get("lens"):
                continue
            ta = f"{a.get('title', '')} {a.get('observation', '')}".lower()
            tb = f"{b.get('title', '')} {b.get('observation', '')}".lower()
            if difflib.SequenceMatcher(None, ta, tb).ratio() > 0.6:
                rep.warn("02-analysis", f"{a.get('id')} and {b.get('id')} look like duplicates: keep one (root-cause lens)")
    return findings


# ---------- verified ----------

def check_verified(run: Path, evidence: dict, analysis_findings: dict, rep: Report) -> dict:
    rel = "03-verification/findings-verified.json"
    if not (run / "03-verification" / "verification-log.md").exists():
        rep.error("03-verification/verification-log.md", "file not found")
    data = load_json(run / rel, rep, rel)
    if data is None:
        return {}
    if not isinstance(data, dict) or not isinstance(data.get("findings"), list):
        rep.error(rel, "must be an object with a 'findings' list")
        return {}
    if not DATE.match(str(data.get("verified_at", ""))):
        rep.warn(rel, "'verified_at' should be YYYY-MM-DD")
    if not nonempty(data.get("reviewer_summary")):
        rep.warn(rel, "'reviewer_summary' is empty")

    verified = {}
    ranks = []
    accounted = {}
    public = []
    for i, f in enumerate(data["findings"]):
        if not isinstance(f, dict):
            rep.error(f"{rel}[{i}]", "finding must be an object")
            continue
        fid = f.get("id", f"[{i}]")
        where = f"{rel} {fid}"
        lens = f.get("lens") if f.get("lens") in LENSES else (str(fid).split("-")[1] if str(fid).count("-") >= 2 else "?")
        check_finding(f, lens, evidence, where, rep)
        if fid in verified:
            rep.error(where, "duplicate id in verified findings")
        verified[fid] = f
        accounted.setdefault(fid, []).append("kept")

        v = f.get("verification")
        if not isinstance(v, dict):
            rep.error(where, "missing 'verification' object")
            v = {}
        if v.get("verdict") not in VERDICTS:
            rep.error(where, "verification.verdict must be keep or revise (cut findings go in 'cut')")
        if v.get("verdict") == "revise" and not nonempty(v.get("changes")):
            rep.error(where, "revised finding needs verification.changes")
        if v.get("evidence_rechecked") is not True:
            rep.warn(where, "verification.evidence_rechecked is not true: re-open the evidence")
        for mid in v.get("merged_from", []) or []:
            accounted.setdefault(mid, []).append(f"merged into {fid}")

        scores = f.get("scores")
        valid_scores = isinstance(scores, dict) and all(
            isinstance(scores.get(k), int) and 1 <= scores[k] <= 5 for k in SCORE_KEYS)
        if not valid_scores:
            rep.error(where, f"'scores' needs integers 1-5 for {', '.join(SCORE_KEYS)}")
        else:
            expected = 2 * scores["evidence_quality"] + scores["brand_relevance"] + scores["importance"] + scores["audience_usefulness"]
            if f.get("rank_score") != expected:
                rep.error(where, f"rank_score should be {expected} (2 x evidence_quality + the other three)")
        rank = f.get("rank")
        if not isinstance(rank, int):
            rep.error(where, "'rank' must be an integer")
        else:
            ranks.append((rank, f.get("rank_score") or 0, scores.get("evidence_quality", 0) if valid_scores else 0, fid))
        if f.get("priority") not in PRIORITIES:
            rep.error(where, "'priority' must be now, next or later")
        if not isinstance(f.get("public"), bool):
            rep.error(where, "'public' must be true or false")
        if f.get("public") is True:
            public.append(fid)
            if f.get("confidence") not in ("high", "medium"):
                rep.error(where, "public finding must have high or medium confidence")
            if valid_scores and scores["evidence_quality"] < 4:
                rep.error(where, "public finding needs evidence_quality of 4 or more")
            if valid_scores and scores["audience_usefulness"] < 3:
                rep.error(where, "public finding needs audience_usefulness of 3 or more")
            if not nonempty(f.get("public_rationale")):
                rep.error(where, "public finding needs a 'public_rationale'")

    if len(public) > 3:
        rep.error(rel, f"{len(public)} findings marked public: select at most three")
    if not public:
        rep.warn(rel, "no public findings: the content package must explain why no video was produced")

    if ranks:
        ordered = sorted(ranks)
        if [r[0] for r in ordered] != list(range(1, len(ordered) + 1)):
            rep.error(rel, "ranks must run 1..n with no gaps or repeats")
        for a, b in zip(ordered, ordered[1:]):
            if (a[1], a[2]) < (b[1], b[2]):
                rep.warn(rel, f"rank {a[0]} ({a[3]}) has a lower rank_score than rank {b[0]} ({b[3]})")

    cut = data.get("cut", [])
    if not isinstance(cut, list):
        rep.error(rel, "'cut' must be a list")
        cut = []
    for c in cut:
        if not isinstance(c, dict) or not nonempty(c.get("id")) or not nonempty(c.get("reason")):
            rep.error(rel, f"cut entry needs 'id' and 'reason': {c}")
            continue
        accounted.setdefault(c["id"], []).append("cut")

    for fid in analysis_findings:
        if fid not in accounted:
            rep.error(rel, f"{fid} from 02-analysis is not kept, merged or cut: nothing may disappear silently")
        elif len(accounted[fid]) > 1:
            rep.warn(rel, f"{fid} is accounted for more than once: {', '.join(accounted[fid])}")
    for fid in accounted:
        if analysis_findings and fid not in analysis_findings:
            rep.warn(rel, f"{fid} does not exist in 02-analysis")

    if "strengths" in data:
        check_strengths(data["strengths"], None, evidence, rel, rep)
    rep.info.append(f"{len(verified)} verified findings, {len(cut)} cut, {len(public)} public")
    return verified


# ---------- final ----------

def sections(text: str) -> dict:
    """Map normalized '## ' heading text to the body under it."""
    out, current, buf = {}, None, []
    for line in text.splitlines():
        m = re.match(r"^##\s+(?:\d+[.)]\s*)?(.+?)\s*$", line)
        if m and not line.startswith("###"):
            if current is not None:
                out[current] = "\n".join(buf)
            current, buf = m.group(1).strip().lower(), []
        elif current is not None:
            buf.append(line)
    if current is not None:
        out[current] = "\n".join(buf)
    return out


def find_section(secs: dict, key: str):
    for name, body in secs.items():
        if key in name:
            return body
    return None


def check_headings(secs: dict, required, rel, rep: Report):
    for key in required:
        if find_section(secs, key) is None:
            rep.error(rel, f"missing section heading containing '{key}'")


def script_words(script_body: str):
    m = re.search(r"^###\s+read-aloud version\s*$(.*?)(?=^#{1,3}\s|\Z)", script_body, re.IGNORECASE | re.MULTILINE | re.DOTALL)
    if not m:
        return None
    text = re.sub(r"\[[^\]]*\]", " ", m.group(1))
    return len(re.findall(r"[A-Za-z0-9][A-Za-z0-9'’-]*", text))


def check_final(run: Path, evidence: dict, verified: dict, rep: Report):
    audit_rel = "04-deliverables/internal-audit.md"
    pkg_rel = "04-deliverables/content-package.md"
    public_ids = {fid for fid, f in verified.items() if f.get("public") is True}

    audit_path = run / audit_rel
    if not audit_path.exists():
        rep.error(audit_rel, "file not found")
    else:
        text = audit_path.read_text(encoding="utf-8")
        check_headings(sections(text), AUDIT_HEADINGS, audit_rel, rep)
        for eid in sorted(set(EVIDENCE_REF.findall(text)) - set(evidence)):
            rep.error(audit_rel, f"cites {eid}, which is not in any evidence log")
        for fid in sorted(set(verified) - set(FINDING_REF.findall(text))):
            rep.warn(audit_rel, f"verified finding {fid} is not mentioned")
        merged = {m for f in verified.values() for m in ((f.get("verification") or {}).get("merged_from") or [])}
        cut_heading = re.search(r"^##\s+(?:\d+[.)]\s*)?removed in verification", text, re.IGNORECASE | re.MULTILINE)
        before_cut = text[:cut_heading.start()] if cut_heading else text
        for fid in sorted(set(FINDING_REF.findall(before_cut)) - set(verified) - merged):
            rep.warn(audit_rel, f"mentions {fid} outside 'Removed in verification', but it is not a verified finding")

    pkg_path = run / pkg_rel
    if not pkg_path.exists():
        rep.error(pkg_rel, "file not found")
        return
    text = pkg_path.read_text(encoding="utf-8")
    secs = sections(text)
    check_headings(secs, PACKAGE_HEADINGS, pkg_rel, rep)

    for eid in sorted(set(EVIDENCE_REF.findall(text)) - set(evidence)):
        rep.error(pkg_rel, f"cites {eid}, which is not in any evidence log")
    mentioned = set(FINDING_REF.findall(text))
    # With no public findings, section 1 may cite IDs to explain why nothing was selected.
    for fid in sorted(mentioned - public_ids) if public_ids else []:
        rep.error(pkg_rel, f"uses {fid}, which is not marked public in findings-verified.json")
    for fid in sorted(public_ids - mentioned):
        rep.error(pkg_rel, f"public finding {fid} is not listed in the content package")

    if public_ids:
        hooks = find_section(secs, "hooks") or ""
        n_hooks = len(re.findall(r"^\d+[.)]\s+\S", hooks, re.MULTILINE))
        if n_hooks != 3:
            rep.error(pkg_rel, f"Hooks section should have exactly three numbered hooks (found {n_hooks})")
        script = find_section(secs, "script")
        words = script_words(script or "")
        if words is None:
            rep.error(pkg_rel, "Script section needs a '### Read-aloud version' subsection")
        else:
            secs_est = round(words / 2.5)
            rep.info.append(f"script: {words} spoken words ≈ {secs_est} s")
            if words < 100 or words > 240:
                rep.error(pkg_rel, f"script has {words} spoken words (≈{secs_est} s); 45-90 s is about 110-225 words")
            elif words < 110 or words > 225:
                rep.warn(pkg_rel, f"script has {words} spoken words (≈{secs_est} s); aim for 110-225")
        fact = find_section(secs, "fact-check") or ""
        if not EVIDENCE_REF.search(fact):
            rep.error(pkg_rel, "Fact-check table cites no evidence IDs")
        shots = find_section(secs, "shot list") or ""
        if not EVIDENCE_REF.search(shots):
            rep.warn(pkg_rel, "Shot list cites no evidence IDs")
        caption = find_section(secs, "caption") or ""
        if len(caption.split()) > 160:
            rep.warn(pkg_rel, f"caption section is {len(caption.split())} words; keep the caption to about 125")
    else:
        if "not produced" not in text.lower():
            rep.error(pkg_rel, "no public findings, so sections 3-8 should say 'Not produced: see section 1'")

    checklist = re.search(r"^##\s+(?:\d+[.)]\s*)?pre-publication checklist", text, re.IGNORECASE | re.MULTILINE)
    scan_language(text[:checklist.start()] if checklist else text, pkg_rel, rep)
    placeholders = sorted(set(PLACEHOLDER.findall(text)))
    if placeholders:
        rep.info.append(f"placeholders to fill before publishing: {', '.join(placeholders)}")


# ---------- main ----------

def main() -> int:
    parser = argparse.ArgumentParser(description=__doc__, formatter_class=argparse.RawDescriptionHelpFormatter)
    parser.add_argument("run_dir")
    parser.add_argument("--stage", choices=STAGES, required=True)
    parser.add_argument("--lens", choices=LENSES, help="with --stage analysis: check only this lens's file")
    args = parser.parse_args()

    run = Path(args.run_dir).resolve()
    if not run.is_dir():
        print(f"error: run folder not found: {run}", file=sys.stderr)
        return 1
    level = STAGES.index(args.stage)
    rep = Report()

    evidence = check_evidence(run, rep, require_streams=level >= 1)
    rep.info.append(f"{len(evidence)} evidence items")
    if level >= 1:
        check_research(run, rep)
    findings, verified = {}, {}
    if level >= 2:
        findings = check_analysis(run, evidence, rep, only_lens=args.lens if level == 2 else None)
        rep.info.append(f"{len(findings)} analyst findings")
    if level >= 3:
        verified = check_verified(run, evidence, findings, rep)
    if level >= 4:
        check_final(run, evidence, verified, rep)

    print(f"brand-audit-content validation: stage '{args.stage}'{f' (lens {args.lens})' if args.lens and level == 2 else ''}")
    print(f"run: {run}")
    if rep.errors:
        print(f"\nERRORS ({len(rep.errors)})")
        for e in rep.errors:
            print(f"  - {e}")
    if rep.warnings:
        print(f"\nWARNINGS ({len(rep.warnings)})")
        for w in rep.warnings:
            print(f"  - {w}")
    if rep.info:
        print("\nINFO")
        for i in rep.info:
            print(f"  - {i}")
    print("\nRESULT:", "FAIL" if rep.errors else "PASS")
    return 1 if rep.errors else 0


if __name__ == "__main__":
    sys.exit(main())
