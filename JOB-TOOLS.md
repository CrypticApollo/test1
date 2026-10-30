# Job-hunting tools

All installed in this repo. Open Claude Code in this folder and they load automatically
(plugins ask you to trust them the first time).

## Skills (type `/name` or just ask)

From [ResumeSkills](https://github.com/Paramchoudhary/ResumeSkills), in `.claude/skills/`:

| Skill | Use it for |
|---|---|
| `/resume-tailor` | Tailor your resume to a job ad |
| `/resume-ats-optimizer` | Check your resume against applicant-tracking software |
| `/resume-bullet-writer` | Turn weak bullets into achievements with numbers |
| `/job-description-analyzer` | Score a job ad against you, list gaps |
| `/cover-letter-generator` | Cover letter from resume + job ad |
| `/interview-prep-generator` | STAR stories and practice questions |
| `/linkedin-profile-optimizer` | Rewrite your LinkedIn profile |
| `/salary-negotiation-prep` | Market rates and counter-offer scripts |
| `/offer-comparison-analyzer` | Compare offers side by side |
| `/cold-email-writer` | Outreach emails to hiring managers |
| `/application-form-filler` | Draft answers for application form questions |

Plus: `academic-cv-builder`, `career-changer-translator`, `creative-portfolio-resume`,
`executive-resume-writer`, `portfolio-case-study-writer`, `reference-list-builder`,
`resume-formatter`, `resume-quantifier`, `resume-section-builder`,
`resume-version-manager`, `tech-resume-optimizer`.

Also `/grill-me` (stress-test a plan), `find-skills` (ask "find a skill for X" to search and install more) and `skill-inspector` (NVIDIA SkillSpector safety check; ask "is this skill safe?").

## Plugins (enabled in `.claude/settings.json`)

| Plugin | Start with | Notes |
|---|---|---|
| [job-hunt-skills](https://github.com/Remotivated/job-hunt-skills) | `/job-hunt-skills:get-started` | Resume builder, opportunity evaluator, company research, interview coach, `claim-check` |
| [proficiently](https://github.com/proficientlyjobs/proficiently-claude-skills) | `/proficiently:setup` | Needs Chrome + Claude in Chrome. `apply` fills real application forms; watch it |
| [resume-tailor](https://github.com/olegvg/resume-tailor-plugin) | `/resume-tailor:onboarding` | Builds a master profile once, then tailors per job |
| [linkedin-mcp-server](https://github.com/stickerdaniel/linkedin-mcp-server) | ask "search LinkedIn jobs for…" | Logs in as you. LinkedIn bans automation; use sparingly. Needs `uv` |

## Frameworks (run Claude Code from inside the folder)

- **`ai-job-search/`**: [ai-job-search](https://github.com/MadsLorentzen/ai-job-search).
  `cd ai-job-search && claude`, then `/setup`, `/scrape`, `/apply`, `/interview`.
  First install its job-board tools: `python3 tools/install_portal_clis.py`
  (needs Python 3.10+, Bun, LaTeX). Built-in boards are mostly Danish, plus LinkedIn.
- **`resume-tailor-onepage/`**: [resume-tailor](https://github.com/rakeshnitb23/resume-tailor).
  Copy `Resume_Original.example.md` to `Resume_Original.md`, fill it in,
  `pip install -r requirements.txt`, then `cd resume-tailor-onepage && claude`.

Their `.gitignore` files keep your resume, cover letters and PDFs out of git.

## LinkedIn job search without logging in (one-time setup)

Source is in `mcp/mcp-linkedin/` ([mcp-linkedin](https://github.com/ynsz-66/mcp-linkedin)).
On your own machine, from this folder:

```bash
(cd mcp/mcp-linkedin && uv sync)
claude mcp add linkedin-jobs --scope project -e MCP_TRANSPORT=stdio -- \
  uv run --directory mcp/mcp-linkedin python server.py
```

## Already connected (no install)

Indeed, ZipRecruiter and Gmail connectors: ask Claude to search jobs directly.

## Safety audit (2026-10-30, manual review, no SkillSpector scan)

All tools passed except these restrictions, enforced in `.claude/settings.json` `permissions.deny`:

- `proficiently:jobsearch-telegram` is **blocked**: it acts on any Telegram message the bot
  receives without checking the sender, so a stranger could steer Claude or confirm a submission.
- `crontab` is **blocked**: proficiently asks for `Bash(crontab *)`, which would let Claude
  schedule any command. Don't add the permissions its skills suggest.
- linkedin-mcp-server always runs `mcp-server-linkedin@latest` (not pinned) and logs in as you.
  Use it sparingly.
