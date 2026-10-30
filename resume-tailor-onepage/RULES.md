# Rules for AI Assistants: Job Applications

Give this file to any AI working in this folder. It defines two tasks:

1. Tailor the existing resume to a job.
2. Write a company-specific cover letter.

Follow these rules. If a rule here conflicts with an explicit user request, ask the user before proceeding.

---

## Files in This Workspace

| File or folder | Purpose |
|---|---|
| `Resume_Original.md` | The original resume and the **only source of candidate facts**. Read it in full before tailoring a resume or writing a cover letter. |
| `Human_Style_Cover_Letter_Strategy.md` | The cover-letter strategy. Read it in full before every cover letter. |
| `md2pdf.py` | The existing Markdown-to-PDF conversion script (Safari/WebKit on macOS by default, `--engine chrome` elsewhere). Reuse it; do not rewrite it or create another conversion script. |
| `coverletter.css` | Styling for cover-letter PDFs. Pass it to `md2pdf.py` with `--css coverletter.css`. |
| `Resume_<Company>/` | The **single canonical folder for that company**. All requested deliverables for that company belong here. |

Temporary Markdown files are build inputs only. Create them outside this workspace (for example, in `/tmp`) and do not leave them in the workspace.

---

## Ground Rules

1. **Candidate facts come only from `Resume_Original.md`.** Never add a skill, tool, employer, project, qualification, achievement, number, date, or personal story that is not supported by the original resume.
2. **Do not fill gaps.** If the job asks for something the resume does not show, do not add it. Report it separately using the exact label `Not in your resume: ...`.
3. You may reword, reorder, emphasize, or remove existing content to match the role. Do not change the meaning of the candidate's experience.
4. Keep every number exactly as it appears in the original resume. Do not round, recalculate, inflate, or invent metrics.
5. **Keep every hyperlink intact.** Wherever `Resume_Original.md` has a markdown link (email, LinkedIn, GitHub, project/repo URLs), the tailored resume must carry that same markdown link syntax, not plain text. Never strip a link down to bare text, and never invent a link that is not in the original.
6. Use the company's job description to decide what to emphasize, not as evidence that the candidate possesses a skill or experience.
7. Generate only the document types the user requests. A resume-only request must not produce a cover letter; a cover-letter-only request must not produce a resume. Create an interest answer only if explicitly requested.
8. Reuse the existing `md2pdf.py` script for PDF generation. Do not write a new conversion script or modify the existing one.
9. Do not modify the original resume, strategy file, conversion script, or unrelated files.
10. Report the output paths, meaningful changes, missing qualifications, and PDF verification status. Never claim a file was created or verified if it was not.
11. **No job-description words the resume doesn't contain.** A term that appears only in the job description must not appear in the tailored resume, not even as one word slipped into an existing bullet (e.g. turning "LangGraph path" into "LangGraph agent path" because the job mentions agents). Before building, check every new word or phrase against `Resume_Original.md`.
12. **End every deliverable reply with the folder name**, as the last line, e.g. `Folder: Resume_Acme/`.
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

## Company Folder Rule: One Folder Only

**There must be one folder per company, regardless of which document is requested first.**

1. Normalize the company name to CamelCase without spaces or symbols unless the user specifies a folder name. If the job post doesn't name the company, ask the user before creating the folder.
2. Use `Resume_<Company>/` as the canonical folder for all deliverables.
3. Before creating it, check whether `Resume_<Company>/` already exists. Reuse it if it does; create it only if it does not.
4. Never create a separate `CoverLetter_<Company>/` folder.
5. If the user requests a cover letter first, save it in `Resume_<Company>/`. If they later request a resume for the same company, add the resume PDF to that existing folder.
6. If the user requests a resume first, save a later cover letter in that same folder.
7. Never save duplicate copies of the same deliverable in another location.

Example folder contents when both are requested:

```text
Resume_Google/
├── Resume_Google.pdf
├── CoverLetter_Google.txt
├── CoverLetter_Google.pdf
└── Interest_Google.txt       # only if explicitly requested
```

The folder should contain only the deliverables the user requested.

---

## Task 1: Tailor a Resume

**Trigger:** The user provides company/job information and asks for a tailored resume.

### Steps

1. Read `Resume_Original.md` in full.
2. Read the job information and identify the role's priorities, required skills, responsibilities, and relevant keywords.
3. Choose the company folder name, then check whether `Resume_<Company>/` already exists. Reuse it if it does.
4. Create the tailored resume Markdown in a temporary directory outside the workspace, for example `/tmp/Resume_<Company>.md`. Never save the tailored `.md` file in the workspace.
5. Tailor only existing content:
   - **Summary:** Lead with the most relevant facts already in the original resume.
   - **Experience:** Reorder and reword existing bullets so the most relevant evidence appears first.
   - **Technical Skills:** Reorder only skills already listed in the original resume.
   - **Education and Additional:** Preserve the original facts; do not invent or infer details.
6. Preserve the original resume's header and formatting unless the user asks for a change. Keep names, places and contact details spelled exactly as the original has them, even if they look like typos, and keep every hyperlink as a markdown link.
7. Convert the temporary Markdown file using the existing script:

   ```bash
   python3 md2pdf.py /tmp/Resume_<Company>.md -o .
   ```

   Run the existing `md2pdf.py` script from this workspace. Do not rewrite it or create another conversion script.

8. Ensure the PDF is saved at `Resume_<Company>/Resume_<Company>.pdf`.
9. Verify that the PDF exists, is readable, and is exactly one A4 page. If it is too long, trim the least relevant existing wording and rebuild; do not remove or alter facts in a misleading way.
   - Gotcha: a 2-page PDF whose second page is blank means page 1 is over-full by a line or so. Trim a short trailing line (a bullet or Summary line ending in one or two words) and rebuild.
10. Report the saved path, the main tailoring changes, any `Not in your resume: ...` gaps, and whether PDF verification succeeded.

### Resume Format

Match the structure and visual conventions of `Resume_Original.md`:

- Keep the original header and contact details unchanged, including their markdown hyperlinks (email, LinkedIn, GitHub, project/repo links).
- Keep sections in this order when those sections exist in the original: `Summary`, `Experience`, `Technical Skills`, `Education`, `Additional`.
- Each job should use the original role/company heading style, italic dates line, and bullets.
- Skills should use the original grouped-line style.
- Target one A4 page.

Do not create a resume if the user requested only a cover letter.

---

## Task 2: Write a Cover Letter

**Trigger:** The user provides company information and asks for a cover letter.

### Steps

1. Read `Human_Style_Cover_Letter_Strategy.md` in full every time before writing.
2. Read `Resume_Original.md` in full to verify candidate facts. A tailored resume PDF may be consulted for context, but the original Markdown resume remains the only source of candidate facts.
3. Extract from the job/company context:
   - Exact company name and job title.
   - What the company does for its users or customers.
   - One specific, checkable company signal, such as mission wording, a product feature, or a stated culture detail.
   - The top job requirements.
   - Remote or time-zone requirements, if relevant.
4. Write a cover letter of **250–350 words** in 3–4 short paragraphs, following the strategy file:
   - **Opening:** Begin with a fresh, human, non-technical observation tied directly to a real company-specific signal. Do not begin with "I am writing to apply" or lead with skills/tools.
   - **Evidence:** Use 1–2 of the strongest relevant resume-backed examples. Preserve their real numbers exactly.
   - **Why this company:** Explain the connection to the company's actual work. Mention remote readiness, time-zone overlap, written communication, or independent delivery only if supported by the resume or explicitly stated by the user.
   - **Close:** Thank the reader and state a clear next step.
5. Do not invent personal stories, feelings, statistics, hardships, experience, or skills. If a required skill is missing, state honestly that the candidate would approach it as a learner only when appropriate; do not present it as an existing skill.
6. Create a plain-text version at `Resume_<Company>/CoverLetter_<Company>.txt`.
7. Create a temporary Markdown build file outside the workspace, such as `/tmp/CoverLetter_<Company>.md`. Its text must match the `.txt` version, including the role, greeting, body, and signature.
8. Convert it with the existing script and stylesheet:

   ```bash
   python3 md2pdf.py /tmp/CoverLetter_<Company>.md --css coverletter.css -o /tmp
   ```

   Move the generated PDF into `Resume_<Company>/CoverLetter_<Company>.pdf`.

9. Verify that the PDF exists, is readable, and is one page. Check that the text matches the TXT version.
10. Report both file paths and the cover letter's word count.

Do not create a tailored resume if the user requested only a cover letter.

### Cover Letter Text Layout

`CoverLetter_<Company>.txt`:

```text
COVER LETTER
Role: <Exact Job Title> - <Company>

Dear <Company> Hiring Team,

<paragraph 1: human hook>

<paragraph 2: resume evidence>

<paragraph 3: why this company and remote readiness, if applicable>

<closing line and thanks>

Sincerely,
<Use the candidate's exact name and contact details from Resume_Original.md>
```

Use the candidate's real name and contact details from the original resume. Do not copy example contact details from this rules file.

---

## Task 3: Interest-in-the-Company Answer

Only create this answer when the user explicitly asks for it.

- Read `Human_Style_Cover_Letter_Strategy.md` in full before writing, same as for a cover letter. The interest answer is governed by that file's "Short Interest in the Company Answer" section, not written ad hoc.
- Save it as `Resume_<Company>/Interest_<Company>.txt`.
- Write exactly **4 sentences**, in this order:
  1. A specific, human, non-technical observation or company signal — the same kind of quiet, observational hook used to open a cover letter. Do not start with a restated job-description line or a credentials/technical lead-in.
  2. Why it resonates with the candidate — genuine, not a skills statement.
  3. What the candidate can contribute, based only on `Resume_Original.md`.
  4. A brief close.
- The opening sentence must read like the cover letter's human hook (sentence 1 of Paragraph 1 in Task 2), not like the body/evidence paragraph. Technical contribution belongs in sentence 3, not sentence 1 or 2.
- Use the same truthful, human tone as the cover letter.
- Do not create a PDF for the interest answer unless the user explicitly asks for one.

---

## Final Checklist

Before reporting completion, confirm:

- [ ] `Resume_Original.md` was read in full and used as the only source of candidate facts.
- [ ] The cover-letter strategy was read in full if a cover letter was requested.
- [ ] No unsupported skills, tools, employers, projects, qualifications, achievements, numbers, dates, or stories were added.
- [ ] Every hyperlink present in `Resume_Original.md` is still a markdown link in the tailored resume, not plain text.
- [ ] Missing requirements are listed as `Not in your resume: ...`.
- [ ] Only the requested document types were generated.
- [ ] All deliverables for the company are saved in the one canonical `Resume_<Company>/` folder.
- [ ] No separate `CoverLetter_<Company>/` folder or duplicate deliverable was created.
- [ ] The existing `md2pdf.py` script was reused.
- [ ] Temporary Markdown files were kept outside the workspace and were not left in it.
- [ ] The resume PDF is exactly one A4 page if a resume was requested.
- [ ] The cover letter is 250–350 words and its PDF is one page if a cover letter was requested.
- [ ] The cover-letter TXT and PDF contain matching text.
- [ ] Every created file was opened in the current VS Code window.
- [ ] The final report includes file paths, changes made, missing qualifications, and honest PDF verification results.
