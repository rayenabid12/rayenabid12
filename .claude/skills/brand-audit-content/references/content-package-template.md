# Content package template (Phase 4B)

**Audience:** business owners scrolling short-form video who may need branding help.
**Purpose:** teach one useful lesson, using this brand as a respectful worked example, and show what Catanacreative knows.
**Source:** only findings in `findings-verified.json` with `"public": true`, plus verified strengths.

## Tone rules

- **Credit first.** Before any analysis, name something the brand genuinely does well (from the verified strengths).
- **Lesson over critique.** The brand is the example; the viewer's own business is the subject. "Here's what this teaches us" beats "here's what they got wrong".
- **Conditional impact.** Say "can make it harder for…" or "first-time visitors may…". Never say a brand is losing sales or customers, killing conversions, costing itself money, making a mistake or failing, and never call its branding bad, ugly, terrible or cringe.
- **Keep taste out.** Every point names the observable thing and why it matters for *this brand's* stated positioning.
- **Show, don't assert.** Each point appears on screen: the hero, the quote, the measured value.
- **Plain language.** Explain any design term in five words or fewer.
- **Deliver on the hook.** No hook promises more than the video shows.

## Length

Spoken pace is about 2.5 words per second. 45 seconds is about 110 words and 90 seconds about 225. Aim for 60–75 seconds (150–190 words) covering one to three points.

## Template

Keep the numbered `##` headings, the numbered list of three hooks, and the `### Read-aloud version` subheading; the validator checks them. Put finding IDs and evidence IDs in tables so a reviewer can trace every claim.

```markdown
# Content package: {Brand}, {the lesson in 8 words or fewer}

> DRAFT for human review. Not published and not sent to the brand. Prepared {date} from {run folder}.

## 1. Selected findings
| # | Finding ID and title | What we show | Evidence IDs | Why selected |
|---|---|---|---|---|
One to three rows, drawn from each finding's `public_rationale`. Use no other finding IDs anywhere in the package.

## 2. The broader business lesson
2–4 sentences any business owner could apply to their own brand tomorrow, ending with a self-check question (for example, "Read your homepage headline out loud: does it say what you sell?").

## 3. Hooks
Three alternatives, each 12 words or fewer (about 3 seconds), each from a different angle:
1. **Lesson-first:** …
2. **Question:** …
3. **Observation:** …

## 4. Script
**Estimated length:** {N} words ≈ {N ÷ 2.5} seconds · **Hook used:** {1, 2 or 3}

### Read-aloud version
[HOOK 0:00–0:03] …
[CONTEXT 0:03–0:10] Who the brand is, and what it does well.
[POINT 1 0:10–0:25] Observation → why it may matter → what to try.
[POINT 2 …] (optional)
[POINT 3 …] (optional)
[LESSON …] Turn it towards the viewer's own business.
[CTA …]

Beat labels in square brackets are not spoken and don't count towards the word count.

## 5. Shot list
| Shot | Time | Visual (file, or URL + section) | On-screen text | Direction | Evidence |
|---|---|---|---|---|---|
| 1 | 0:00–0:03 | 01-research/screenshots/brand-com_home-desktop-01.png | Hook text | Talking head over the screenshot | E-site-001 |

Direction covers framing: talking head over a screenshot, zoom into an element, a highlight box, side by side with a competitor, a phone frame for mobile shots. Note any screenshot that needs cropping or blurring, such as faces or names in reviews.

## 6. Caption
No more than 125 words. Lead with the lesson, mention the brand neutrally, ask one question to invite comments, and add 3–5 relevant hashtags. Make no claims beyond the script.

## 7. CTA
One or two lines for business owners: low pressure, with a concrete next step from `studio-profile.md` (keep the placeholder if it isn't filled in). For example: "If your homepage headline could belong to anyone, that's fixable. [BOOKING_LINK]"

## 8. Fact-check table
| Claim in the video or caption | Type | Evidence | URL | Accessed |
|---|---|---|---|---|
Every factual statement, whether spoken, on screen or in the caption, gets a row. Type is observation, interpretation or hypothesis.

## 9. Pre-publication checklist
- [ ] Re-open every URL in the fact-check table, and re-capture anything that changed since {date}
- [ ] Blur or crop personal data in screenshots (customer names, faces, emails)
- [ ] Decide whether to name or tag the brand. Any outreach is your decision, made manually.
- [ ] Confirm you're comfortable showing their logo and screenshots as commentary on your platforms
- [ ] Check that nothing implies knowledge of their sales, traffic or conversion data
- [ ] Replace placeholders such as [BOOKING_LINK] and [HANDLE]
- [ ] Watch the cut once as the brand's founder would: is it fair and useful?
```

## When no finding was selected

Keep sections 1, 2 and 9. In section 1, explain why this brand isn't a good teaching example right now (for example, the evidence was too thin or the issues were only matters of taste). Under each of sections 3–8, write "Not produced: see section 1."
