# Analyst briefs (Phase 2)

## Contents
1. Rules for every analyst
2. Finding schema
3. Specific vs generic: a worked example
4. Lens briefs: strategy, digital, visual, market

## 1. Rules for every analyst

- **Read first.** Start with `01-research/brand-profile.md`, both notes files and the evidence logs. Open the screenshots that matter for your lens; they are PNG files you can view.
- **New evidence goes in your own log.** You may fetch more pages. Log anything new in `02-analysis/evidence-<lens>.json` (IDs `E-<lens>-001`, …) using the research evidence format.
- **Stay in your lane.** Ownership is in the SKILL.md lens table. If you notice something another lens owns, put it in `cross_lens_notes` rather than filing it. When an issue spans lenses, the lens that owns the root cause files it. For example:
  - a vague hero headline is **strategy** (the message), even though it also affects the journey;
  - a clear value proposition buried below three sections of imagery is **digital** (the hierarchy);
  - a headline that doesn't stand out typographically from body text is **visual**.
- **Quality bar: 2–6 findings.** Three sharp findings beat six soft ones. If your lens has nothing strong to say, return fewer. Don't pad.
- **Strengths: 1–3.** Things the brand does well, with evidence. They keep the audit fair and give the video an honest "credit first" moment.
- **Test every finding before filing it:**
  - *Substitution test.* Swap in a different brand's name. Still true? Then it's generic: make it specific or drop it.
  - *Positioning-link test* (essential for the visual lens). Which stated positioning, audience or promise does this undermine? Cite it. No link means it's a preference.
  - *Proof test.* Could a stranger open the evidence and see the observation within a minute?
  - *Alternative explanations.* Could this be deliberate (audience choice, regulation, budget, stage of business)? Say so in the rationale and lower confidence to match.
- **Conditional impact.** Write impact as a possibility ("may make it harder for first-time visitors to…"). Never assert lost sales, conversions or customers.

## 2. Finding schema

File: `02-analysis/findings-<lens>.json`

```json
{
  "lens": "strategy",
  "findings": [
    {
      "id": "F-strategy-01",
      "lens": "strategy",
      "title": "Neutral title, 12 words or fewer",
      "observation": "What is directly visible, stated neutrally and precisely. Quote verbatim where possible.",
      "evidence": [
        {"id": "E-site-001", "detail": "What in this evidence item shows it"}
      ],
      "interpretation": "Your strategic reading of the observation, in this brand's context.",
      "why_it_may_matter": "A hypothesis about the effect on customers or the business, in conditional language.",
      "improvement_direction": "A practical, proportionate direction specific to this brand. A direction, not a finished redesign.",
      "confidence": "high",
      "confidence_rationale": "Why this level, including alternative explanations you considered.",
      "to_verify_impact": [
        "What data or research would confirm the commercial impact, e.g. homepage-to-product-page click-through in analytics"
      ],
      "lesson": "One sentence any business owner could apply to their own brand. This feeds the public content.",
      "related_findings": []
    }
  ],
  "strengths": [
    {
      "id": "S-strategy-01",
      "title": "…",
      "observation": "…",
      "evidence": [{"id": "E-site-004", "detail": "…"}],
      "why_it_works": "…"
    }
  ],
  "unknowns": ["Questions this lens couldn't answer from public information"],
  "cross_lens_notes": ["Issues that belong to another lens, with evidence IDs"]
}
```

IDs: `F-<lens>-01`, `F-<lens>-02`, … for findings and `S-<lens>-01`, … for strengths. Every `evidence[].id` must exist in an evidence log.

`confidence` is one of `high`, `medium` or `low`. It describes how sure you are that the issue is real and relevant for *this* brand, not how large its commercial impact is (that's what `to_verify_impact` is for):
- **high:** directly observable, consistent across pages or screens, few plausible alternative explanations
- **medium:** observable, but how much it matters depends on context we can only partly see
- **low:** a plausible reading on thin evidence, or with strong alternative explanations; usually stays internal

## 3. Specific vs generic: a worked example

The brand is fictional: "Harbor & Pine", handmade ceramics.

**Generic: reject it.**
> "The brand messaging could be clearer and more customer-focused. Consider strengthening the value proposition to improve conversions."

It fails the substitution test, cites nothing, and asserts an effect on conversions.

**Specific: file it.**
- **observation:** The homepage H1 reads "Made for moments that matter" (E-site-001). Neither the H1, the subheadline nor the first mobile screen mentions ceramics or handmade production (E-site-002). "Handmade in small batches in Maine" first appears in the second paragraph of the About page (E-site-007).
- **interpretation:** The brand's most distinctive and checkable claim (handmade, small-batch, local) sits two clicks deep, while the hero uses a line that could front any lifestyle brand.
- **why_it_may_matter:** First-time visitors arriving from search or social may not see what makes these pieces different from mass-produced ceramics before deciding whether to scroll.
- **improvement_direction:** Test a hero line that names the product and the handmade claim (for example, "Handmade stoneware, thrown in small batches in Maine") and keep the emotional line as the subheadline.
- **confidence:** high. The wording is verbatim on two pages and the same on mobile. The alternative explanation (a deliberate mood-first lead) is noted.
- **to_verify_impact:** hero scroll depth and homepage-to-collection click-through; five customer interviews about why they bought.
- **lesson:** Lead with what makes you different, in words a stranger understands, and save the mood line for second.

## 4. Lens briefs

### Strategy: what the brand says

Investigate:
- **Five-second clarity.** From the hero alone, could a stranger say what is sold, to whom, and why this brand? Quote the hero.
- **Audience.** Named, implied or absent? Consistent across the homepage, About, product pages and meta description?
- **Value proposition and promise.** What is promised, and is it ownable or category table stakes ("quality", "sustainable", "innovative")? Deep competitor comparison belongs to the market lens; reference it lightly.
- **Claim-proof gaps.** Claims made with no substantiation anywhere on the site.
- **Messaging hierarchy.** Does the most distinctive point lead, or is it buried? Do pages contradict each other on names, numbers or promises?
- **Tone of voice.** Consistent? Suited to the stated audience? Quote examples.

Typical traps: "messaging is unclear" without the quote; demanding a tagline; judging tone by personal taste.

### Digital experience: how a visitor moves and understands

Investigate:
- **Primary journey.** From the homepage, how many clicks to the main action (buy, book, enquire)? Is there one consistent primary CTA, or several competing ones? Use the CTA candidates in `*.styles.json` and the screenshots.
- **Content hierarchy.** Does each key page answer visitors' questions in a sensible order: what is it, is it for me, why trust it, how do I start, what does it cost?
- **Navigation.** Labels a newcomer understands, or internal jargon? Are important pages reachable?
- **Trust signals.** Look at placement relative to decision points (reviews near CTAs, guarantees near pricing), not just presence. Absence claims need the list of pages checked.
- **Mobile.** Are the offer and a CTA in the first screen? Does anything break or disappear on mobile?
- **Friction you actually observed.** Hidden pricing, long forms (describe the fields; never submit), dead ends, broken links, intrusive pop-ups.
- **Structural accessibility in the data.** Missing alt text counts, several H1s or none (from `*.styles.json`). Mention these only when they're material.

Typical traps: generic "improve the UX"; invented analytics ("high bounce rate"); recommending features the business may not need.

### Visual identity: how the brand looks

Use the screenshots and `*.styles.json` (font families, loaded web fonts, type sizes, colors, contrast ratios).

Investigate:
- **Typography.** Families in use and their roles; the type scale and hierarchy (are H1, H2 and body clearly differentiated?); consistency across pages.
- **Color.** The core palette; consistency; whether the CTA color is distinctive; contrast of key text. Cite measured ratios, and report WCAG AA failures as observations.
- **Imagery.** Original or stock-looking? A consistent style? Does it show the product, customer or outcome that the strategy claims?
- **Logo and brand marks.** Consistent use across header, favicon, footer and social preview images.
- **Visual hierarchy.** In each hero screenshot, what draws the eye first, and is that the most important thing?
- **Fit with positioning.** Does the look support the brand's stated tier and personality? Quote the claim. This is where taste traps live, so every such finding must pass the positioning-link test by citing both the claim and the visual.

Typical traps: "outdated", "boring", "not modern" or "too busy" with no measurement or positioning link; recommending a rebrand; personal font or color preferences.

### Market context: how the brand compares

Use `market-notes.md` and the competitor evidence.

Investigate:
- **Side-by-side heroes.** The brand's headline and core claim against each competitor's. Where does it blend in, and where does it stand apart?
- **Category conventions.** The claims, words, colors and imagery most competitors share. Is the brand following convention where it should stand out, or breaking it where customers expect it?
- **White space.** Positions no competitor clearly owns that the brand has evidence to claim. Cite the brand's own assets: awards, process, origin, guarantees.
- **Business developments.** Recent dated events (launches, new markets, funding, rebrands) that the website does or doesn't reflect. For example, a new service announced in the press with no page on the site.

Typical traps: "competitor X is better"; market size or share claims without a source; recommending that the brand copy a competitor.
