# Verification rubric (Phase 3)

You are the independent reviewer. You didn't write these findings and you owe them nothing. Your job is to make the set smaller and truer: whatever survives will be read by a client, or broadcast under a designer's name.

Inputs: all four `02-analysis/findings-*.json` files, the evidence logs in `01-research/` and `02-analysis/`, the screenshots, and `01-research/brand-profile.md`.

## 1. Challenge every finding

Work through every finding and strength, and record each check in the verification log.

1. **Re-open the evidence.** Fetch the cited URL or open the screenshot. Does it show exactly what the observation says? Are the quotes verbatim? If the live page has changed since capture, note it: the screenshot is still valid evidence of the captured state, but set `page_changed_since_capture`.
2. **Fact-check.** Every name, number, date, price, claim about the business and claim about a competitor must trace to an evidence item. Remove anything that doesn't, or turn it into an unknown.
3. **Claim level.** The observation must be checkable by anyone; the interpretation must follow from the observation; impact must read as a hypothesis. Move statements into the right field, and rewrite any speculation presented as fact.
4. **Absence claims.** For "no testimonials", "no pricing" and the like, check the claimed scope (nav, footer, obvious URLs such as `/reviews` or `/pricing`). Rephrase as "not found on the N pages reviewed: …", or cut.
5. **Generic advice.** Apply the substitution test. Make generic findings specific from the evidence, or cut them.
6. **Taste versus strategy.** Apply the positioning-link test. Cut any visual finding that doesn't cite a stated positioning, audience or promise.
7. **Fairness.** Is there a plausible deliberate reason (audience choice, regulation, budget, stage of business)? Mention it, and lower confidence when it's strong.
8. **Duplicates.** Merge findings that share a root cause. Keep the strongest evidence and the owning lens, and list the absorbed IDs in `merged_from`.
9. **Improvement direction.** It should be practical, proportionate and specific to this brand. Cut "rebrand", "hire an agency", "improve the UX" or "be more consistent" unless made concrete.
10. **Language.** Remove accusations and certainty about outcomes: "losing sales", "costing them customers", "mistake", "failing", "bad", "ugly", or "confusing customers" stated as fact. Use "may", "could", "first-time visitors might…".

Verdicts:
- **keep:** stands as written
- **revise:** store the revised text in the verified file and say what changed
- **cut:** give a one-line reason

Check strengths the same way. A strength that can't be seen in its evidence is cut too.

## 2. Score and rank what survives

Score each surviving finding from 1 to 5 on four criteria:

| Score | evidence_quality | brand_relevance | importance | audience_usefulness |
|---|---|---|---|---|
| 5 | Directly visible in a cited screenshot or quote, repeated across pages, or measured | Tied to this brand's stated positioning, audience or a dated business development | Touches the core promise or the main path to purchase or enquiry | A lesson most business owners can apply, showable on screen in seconds |
| 3 | Visible, but its meaning depends on reasonable interpretation | Relevant, partly generic | Noticeable, but on secondary pages or moments | Useful to one segment; needs some explanation |
| 1 | Indirect or anecdotal | Could apply to any brand | Cosmetic | Niche, or hard to show |

`rank_score = 2 × evidence_quality + brand_relevance + importance + audience_usefulness` (maximum 25). Evidence counts double because a wrong claim costs more than a weak one does. Rank from 1 to n by `rank_score`, breaking ties by the higher `evidence_quality`.

Set an internal `priority` independently of public appeal:
- **now:** importance 4 or more, with a low-effort improvement direction
- **next:** importance 3 or more
- **later:** everything else

## 3. Select for public content (at most three)

A finding is eligible only if all of these hold:
- the verdict is keep or revise, and confidence is high or medium
- `evidence_quality` is 4 or more, and the observation can be shown on screen (a screenshot or verbatim on-page text)
- `audience_usefulness` is 3 or more, and the `lesson` stands on its own
- the impact claim is conditional and doesn't imply knowledge of the brand's sales or analytics

From the eligible findings, pick the set of one to three that adds up to one coherent lesson. Prefer different lenses. If together they would make the brand look ridiculed rather than instructive, pick fewer. Write a `public_rationale` for each selected finding. Zero eligible findings is a valid result; say so in `reviewer_summary`.

## 4. Outputs

### `03-verification/verification-log.md`

```markdown
# Verification log

| ID | Verdict | Checks (✓ passed, ✗ failed → action) | Notes |
|---|---|---|---|

## Overall
A short paragraph on evidence quality across the audit, what couldn't be verified, and pages that changed since capture.
```

### `03-verification/findings-verified.json`

```json
{
  "verified_at": "YYYY-MM-DD",
  "reviewer_summary": "Counts kept / revised / cut / merged, and the reasoning behind the public selection.",
  "findings": [
    {
      "id": "F-strategy-01",
      "lens": "strategy",
      "title": "…",
      "observation": "…",
      "evidence": [{"id": "E-site-001", "detail": "…"}],
      "interpretation": "…",
      "why_it_may_matter": "…",
      "improvement_direction": "…",
      "confidence": "high",
      "confidence_rationale": "…",
      "to_verify_impact": ["…"],
      "lesson": "…",
      "related_findings": [],
      "verification": {
        "verdict": "revise",
        "changes": "What was revised and why (empty for keep)",
        "evidence_rechecked": true,
        "page_changed_since_capture": false,
        "merged_from": ["F-digital-02"]
      },
      "scores": {"evidence_quality": 5, "brand_relevance": 4, "importance": 4, "audience_usefulness": 4},
      "rank_score": 22,
      "rank": 1,
      "priority": "now",
      "public": true,
      "public_rationale": "Why this finding teaches well and is safe to show."
    }
  ],
  "cut": [
    {"id": "F-visual-03", "title": "…", "reason": "Preference: no link to stated positioning"}
  ],
  "strengths": [
    {"id": "S-strategy-01", "title": "…", "observation": "…", "evidence": [{"id": "E-site-004", "detail": "…"}], "why_it_works": "…"}
  ],
  "unknowns": ["Consolidated open questions across all lenses"]
}
```

Every analyst finding ID must appear exactly once: as a kept or revised finding, in another finding's `merged_from`, or in `cut`. Nothing disappears silently.
