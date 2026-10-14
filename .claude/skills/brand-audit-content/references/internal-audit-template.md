# Internal audit template (Phase 4A)

**Reader:** the designer at Catanacreative, and possibly the brand later if the designer decides to share it. Write plainly, lead with evidence, and skip the hype. A typical audit runs 1,200–2,500 words.

**Source:** `03-verification/findings-verified.json` only. Cite evidence IDs inline, for example (E-site-003), and list every source at the end.

Keep the numbered `##` headings below; the validator checks for them.

```markdown
# Brand audit: {Brand} ({domain})

> Draft for internal review. Catanacreative, {date}. Based on public information accessed {date range}. Not shared with the brand.

## 1. Summary
3–5 bullets: who the brand is, the single biggest opportunity, and how strong the evidence is overall.

## 2. Brand and business context
A condensed version of the brand-profile fact sheet. Keep the Status column (verified / stated by brand / inferred / unknown). Say whether the industry was given or inferred. List business developments with dates and sources.

## 3. What's working
The verified strengths, each with evidence.

## 4. Key findings
In rank order, one block per finding:

### {rank}. {title} ({finding ID})
*{lens} · confidence {level} · priority {now / next / later}*
- **Observation:** …
- **Evidence:** E-…, E-… (what each shows; screenshot path where there is one)
- **Interpretation:** …
- **Why it may matter (hypothesis):** …
- **Improvement direction:** …
- **To verify impact:** …

## 5. Recommendations and priorities
| Priority | Recommendation | Findings | Effort (S/M/L, rough) | How to measure |
|---|---|---|---|---|
Group the rows Now, Next, Later. Effort is a rough design-and-build estimate; label it as such.

## 6. Removed in verification
One line per cut finding: ID, title, reason. This shows the audit's discipline and stops cut ideas from creeping back in.

## 7. Limitations and open questions
- What wasn't reviewed: pages, logged-in areas, checkout, other regions or languages
- What only the brand can answer: analytics, sales data, customer research, constraints
- Capture caveats, such as screenshot dates and pages that changed since capture

## 8. Sources
Every cited evidence ID with its URL, access date and, for articles, publication date.
```
