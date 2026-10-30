# Job Application Workflow

This file is the workflow for three tasks: tailor the resume to a job, write a cover letter, and write an interest-in-the-company answer. If a rule here conflicts with an explicit user request, ask the user before proceeding.

Cover letters and interest answers are not written from the summary in this file. Before either one, read `Human_Style_Cover_Letter_Strategy.md` in full and follow it. When `wellFound_session.md` is present, its session rules sit on top of this file (default interest answer, `WellFound/` folders).

## Files

| File or folder | Purpose |
|---|---|
| `Resume_Original.md` | The original resume and the **only source of candidate facts**. Read it in full before every resume, cover letter, or interest answer. If it is missing, stop and help the user create it from their real resume (convert their PDF into Markdown with the same header / Experience / Technical Skills / Education / Additional structure). |
| `Human_Style_Cover_Letter_Strategy.md` | The **only writing strategy** for cover letters and interest answers. Read it in full before every cover letter and every interest answer. Do not replace it with a shortened copy. |
| `wellFound_session.md` | Wellfound session overlay, when present: interest answer by default, company folders under `WellFound/`. |
| `md2pdf.py` | The Markdown-to-PDF script (Safari/WebKit on macOS, needs `markdown` + `pyobjc-framework-WebKit`; `--engine chrome` elsewhere). Reuse it; never rewrite it or create another conversion script. |
| `coverletter.css` | Styling for cover-letter PDFs, passed with `--css coverletter.css`. |
| `Resume_<Company>/` | The **single folder for that company**. All requested deliverables go here. Under the Wellfound overlay, that folder is `WellFound/Resume_<Company>/`. |

**Do not leave generated Markdown in this workspace.** Tailored-resume and cover-letter build files go in a temp folder (e.g. `/tmp`) and are not left behind. Do not delete project Markdown: this file, `RULES.md`, `README.md`, `Human_Style_Cover_Letter_Strategy.md`, `Resume_Original.md`, `Resume_Original.example.md`, or `wellFound_session.md`.

---

## Ground Rules

1. **Candidate facts come only from `Resume_Original.md`.** Never add a skill, tool, employer, project, qualification, achievement, number, date, or personal story it doesn't support.
2. **Do not fill gaps.** If the job asks for something the resume doesn't show, don't add it. Report it with the exact label `Not in your resume: ...`.
3. You may reword, reorder, emphasize, or remove existing content to match the role. Do not change the meaning of the experience.
4. Keep every number exactly as in the original. No rounding, recalculating, inflating, or invented metrics.
5. **Keep every hyperlink intact.** Every markdown link in the original (email, LinkedIn, GitHub, project/repo URLs) stays a markdown link in the tailored resume, never plain text. Never invent a link.
6. Use the job description to decide what to emphasize, not as evidence the candidate has a skill.
7. **Generate only what the user asks for, always with a PDF.** A resume-only request must not produce a cover letter, and vice versa. Create an interest answer only if explicitly asked.
8. Do not modify `Resume_Original.md`, `Human_Style_Cover_Letter_Strategy.md`, `md2pdf.py`, or unrelated files.
9. Report output paths, meaningful changes, missing qualifications, and PDF verification status. Never claim a file was created or verified if it wasn't.
10. **No job-description words the resume doesn't contain.** A term that appears only in the job description must not appear in the tailored resume, not even one word slipped into an existing bullet (e.g. turning "LangGraph path" into "LangGraph agent path" because the job mentions agents). Before building, check every new word or phrase against `Resume_Original.md`.
11. **End every deliverable reply with the folder name** as the last line, e.g. `Folder: Resume_Acme/`.
12. **Non-English job posts:** if the pasted job description is in another language, first translate it to English (show the user a short English version), work from the English version, then generate the deliverables. **Resumes, cover letters and interest answers are always written in English**, unless the user explicitly asks for another language. Missing language requirements (e.g. German fluency) are reported as `Not in your resume: ...` gaps.
13. **Open every created file in VS Code.** After creating and verifying a deliverable, open it in the user's current VS Code window with `code -r <path>` (macOS, if `code` is not on PATH: `"/Applications/Visual Studio Code.app/Contents/Resources/app/bin/code" -r <path>`), so it is ready to copy. For a cover letter, open the `.txt`.

### What tailoring may and may not change

| Allowed | Not allowed |
|---|---|
| Add a Summary built only from resume facts | Any skill, tool, title, employer, number or claim not in the original |
| Reorder bullets, skills and skill groups to match the job | Job-description terms inserted into bullets or the Summary |
| Say the same fact in different words, using the resume's own terms | Rewording that changes or inflates the meaning |
| Merge duplicate bullets, shorten or drop the least relevant ones to fit one page | Changing, rounding or recalculating numbers |
| Keep every existing hyperlink as a markdown link | Flattening a hyperlink to plain text, or inventing a new one |

---

## One Folder per Company

1. Normalize the company name to CamelCase without spaces or symbols unless the user specifies a folder name. If the job post doesn't name the company, ask before creating the folder.
2. Always use `Resume_<Company>/`, for the resume and the cover letter alike, whichever is created first. Check whether it exists and reuse it.
3. Never create a `CoverLetter_<Company>/` folder, and never save duplicate copies elsewhere.
4. The folder contains only requested deliverables:

```text
Resume_Google/
├── Resume_Google.pdf
├── CoverLetter_Google.txt
├── CoverLetter_Google.pdf
└── Interest_Google.txt       # only if explicitly requested
```

---

## Task 1: Tailor a Resume

**Trigger:** the user provides job information and asks for a tailored resume.

1. Read `Resume_Original.md` in full.
2. Identify the role's priorities, required skills, responsibilities, and keywords.
3. Choose the folder name; reuse `Resume_<Company>/` if it exists.
4. Write the tailored Markdown at `/tmp/Resume_<Company>.md` (never in the workspace).
5. Tailor only existing content:
   - **Summary:** lead with the most relevant facts already in the resume.
   - **Experience:** reorder and reword existing bullets so the most relevant evidence comes first.
   - **Technical Skills:** reorder only skills already listed.
   - **Education and Additional:** preserve the original facts.
6. Keep the header exactly like the original: names, places and contact details spelled as written (even if they look like typos), with every hyperlink as a markdown link.
7. Build: `python3 md2pdf.py /tmp/Resume_<Company>.md -o .` → `Resume_<Company>/Resume_<Company>.pdf`
8. Verify the PDF exists, is readable, and is exactly **one A4 page**. If too long, trim the least relevant wording and rebuild without removing or distorting facts.
   - Gotcha: a 2-page PDF with a blank second page means page 1 is over-full by a line. Trim a short trailing line (a bullet or Summary line ending in one or two words) and rebuild.
9. Report the path, main changes, `Not in your resume: ...` gaps, and verification result.

**Format:** match `Resume_Original.md`. Section order (where present): `Summary`, `Experience`, `Technical Skills`, `Education`, `Additional`. Same role/company heading style, italic dates line, bullets, and grouped skill lines.

---

## Task 2: Write a Cover Letter

**Trigger:** the user pastes a job's about/qualifications and asks for a cover letter.

1. Read `Human_Style_Cover_Letter_Strategy.md` in full, then read `Resume_Original.md` in full. A tailored resume PDF may give context, but the original Markdown is the only source of facts. Follow that strategy file for the hook, the research, the paragraph order, and the tone. Do not copy its example opening.
2. Extract from the job/company context: exact company name and job title; what the company does for its users; one specific, checkable company signal (mission wording, product feature, culture detail); the top requirements; remote / time-zone notes.
3. Write **250–350 words** in 3–4 short paragraphs, as the strategy file specifies:
   - **Opening:** a fresh, human, non-technical observation tied directly to a real company signal. Never "I am writing to apply", never lead with skills/tools.
   - **Evidence:** 1–2 of the strongest relevant resume-backed examples, numbers exact.
   - **Why this company:** the connection to their actual work. Mention remote readiness, time-zone overlap, written communication, or independent delivery only if the resume or the user supports it.
   - **Close:** thanks and a clear next step.
4. No invented stories, feelings, statistics, hardships, experience, or skills. If a required skill is missing, at most say honestly the candidate would approach it as a learner.
5. Save `Resume_<Company>/CoverLetter_<Company>.txt`.
6. Write `/tmp/CoverLetter_<Company>.md` with text identical to the `.txt`, then build: `python3 md2pdf.py /tmp/CoverLetter_<Company>.md --css coverletter.css -o /tmp` and move the PDF to `Resume_<Company>/CoverLetter_<Company>.pdf`.
7. Verify the PDF exists, is one page, and matches the TXT. Report both paths and the word count.

**TXT layout.** No "COVER LETTER" title or "Role: ..." line; start directly with the greeting:

```text
Dear <Company> Hiring Team,

<paragraph 1: human hook>

<paragraph 2: resume evidence>

<paragraph 3: why this company and remote readiness, if applicable>

<closing line and thanks>

Sincerely,
<candidate's exact name and contact details from Resume_Original.md>
```

The writing strategy is `Human_Style_Cover_Letter_Strategy.md`, read in full before this task. Use its first principles, research questions, hook structure, and reminders. Do not copy the example opening in that file.

---

## Task 3: Interest-in-the-Company Answer

When this task is requested, or when `wellFound_session.md` makes it the default, read `Human_Style_Cover_Letter_Strategy.md` in full first. Follow its **Short "Interest in the Company" Answer** section. Do not write the answer from memory of this file.

- Save as `Resume_<Company>/Interest_<Company>.txt`. No PDF unless asked.
- **4–5 sentences**, in the order that section gives:
  1. A specific, human, non-technical observation or company signal, like a cover letter hook. Not a restated job-description line or a credentials lead-in.
  2. Why it resonates with the candidate (genuine, not a skills statement).
  3. What the candidate can contribute, only from `Resume_Original.md`.
  4. A brief close.
- Technical contribution belongs in sentence 3 only.

---

## Final Checklist

- [ ] `Resume_Original.md` read in full and used as the only fact source.
- [ ] `Human_Style_Cover_Letter_Strategy.md` read in full before any cover letter or interest answer.
- [ ] No unsupported skills, tools, employers, projects, numbers, dates, stories, or job-description-only words.
- [ ] Every original hyperlink is still a markdown link.
- [ ] Gaps listed as `Not in your resume: ...`.
- [ ] Only requested documents generated, all in the one `Resume_<Company>/` folder.
- [ ] `md2pdf.py` reused; no generated resume or cover-letter Markdown left in the workspace. Project Markdown was not deleted.
- [ ] Resume PDF is exactly one A4 page; cover letter is 250–350 words, one-page PDF, TXT and PDF match.
- [ ] Every created file was opened in the current VS Code window.
- [ ] Report includes paths, changes, gaps, honest verification, and ends with `Folder: Resume_<Company>/`.
