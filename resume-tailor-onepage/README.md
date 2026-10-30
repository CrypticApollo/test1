# Resume Tailor

Tailor your resume and write cover letters for each job you apply to, using [Claude Code](https://claude.com/claude-code). Paste a job description in and get back a one-page PDF resume built **only from facts already in your resume**. It is reordered and reworded to fit that job, and it lists what the job asks for that you don't have.

## What you do

1. Put your resume in this folder as `Resume_Original.md`.
2. Open Claude Code in this folder and paste a job description.

That's it. Claude follows `CLAUDE.md` and `RULES.md` and saves everything for that job in one folder:

```text
Resume_Acme/
├── Resume_Acme.pdf          # tailored, one A4 page
├── CoverLetter_Acme.txt     # only if you ask for a cover letter
├── CoverLetter_Acme.pdf
└── Interest_Acme.txt        # only if you ask for an "interest in the company" answer
```

## Setup

```bash
git clone https://github.com/rakeshnitb23/resume-tailor.git
cd resume-tailor
pip3 install -r requirements.txt
cp Resume_Original.example.md Resume_Original.md   # then replace it with your real resume
```

If you only have a PDF resume, open Claude Code here and say: *"Convert my resume PDF at <path> into Resume_Original.md in the format of Resume_Original.example.md."*

**PDF rendering:**
- **macOS:** uses Safari's WebKit engine, so nothing extra to install beyond `requirements.txt`.
- **Linux / Windows:** install Google Chrome or Chromium and tell Claude to build with `--engine chrome`.

## Example prompts

- `<paste job description>` + "Generate the resume for this company."
- "Also write the cover letter for that company."
- "Write the interest-in-the-company answer and save it as txt."
- "What did you rearrange and change in this resume?"

## The rules Claude follows

- **Nothing beyond your resume.** It can add a Summary, reorder bullets and skills, and reword using your resume's own terms. It never adds a skill, tool, number or job-description word that your resume doesn't contain.
- **Gaps are listed, not filled.** Every reply ends with a `Not in your resume: ...` list.
- **Numbers stay exact.** No rounding or inflating.
- **One page, one folder per company.** Only the documents you ask for get generated.
- **Opened for you.** Every file it creates opens in your current VS Code window, ready to copy.
- **Your data stays local.** `.gitignore` keeps `Resume_Original.md` and every `Resume_*/` output out of git.

Full details are in [`RULES.md`](RULES.md). The cover letter style is in [`Human_Style_Cover_Letter_Strategy.md`](Human_Style_Cover_Letter_Strategy.md).

## Building a PDF by hand

```bash
python3 md2pdf.py path/to/Resume_Acme.md -o .                           # -> Resume_Acme/Resume_Acme.pdf
python3 md2pdf.py path/to/CoverLetter_Acme.md --css coverletter.css -o /tmp
python3 md2pdf.py resume.md --watch                                     # rebuild on every save
python3 md2pdf.py resume.md --engine chrome                             # use Chrome instead of Safari
```
