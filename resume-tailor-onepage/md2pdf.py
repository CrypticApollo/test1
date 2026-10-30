#!/usr/bin/env python3
"""Convert Markdown resume(s) to PDF, and rebuild automatically on every save.

Each resume gets its own folder named after the .md file:
    Resume_Acme.md  ->  Resume_Acme/Resume_Acme.pdf

Usage:
    python3 md2pdf.py resume.md                 # build once
    python3 md2pdf.py resume.md --watch         # rebuild on every save
    python3 md2pdf.py *.md --watch              # watch several variants
    python3 md2pdf.py resume.md -o out/         # put the per-resume folders under out/
    python3 md2pdf.py resume.md --css my.css    # custom stylesheet
    python3 md2pdf.py resume.md --engine chrome # render with Chrome instead of Safari

Requires:  pip install markdown
PDF rendering uses Safari's WebKit engine by default (macOS, needs PyObjC:
pip install pyobjc-framework-WebKit), or headless Chrome/Chromium with --engine chrome.
"""
import argparse
import os
import shutil
import subprocess
import sys
import tempfile
import time
from pathlib import Path

try:
    import markdown
except ImportError:
    sys.exit("Missing dependency. Run:  pip3 install markdown")

CHROME_CANDIDATES = [
    "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome",
    "/Applications/Chromium.app/Contents/MacOS/Chromium",
    "/Applications/Microsoft Edge.app/Contents/MacOS/Microsoft Edge",
    "google-chrome", "google-chrome-stable", "chromium", "chromium-browser", "chrome",
]

DEFAULT_CSS = """
@page { size: A4; margin: 8mm 12mm; }
* { box-sizing: border-box; }
body { font-family: "STIX Two Text", "Latin Modern Roman", "Times New Roman", serif;
       font-size: 9pt; line-height: 1.25; color: #222; margin: 0; }
h1, h1 + p { text-align: center; }
h1 { font-size: 13pt; margin: 0; letter-spacing: 0; }
h1 + p { font-size: 9.5pt; margin: 0 0 6pt; line-height: 1.25; }
h2 { font-size: 11pt; text-transform: uppercase; letter-spacing: .8pt;
     border-bottom: 1px solid #444; padding-bottom: 2pt; margin: 8pt 0 4pt; }
h3 { font-size: 10.5pt; margin: 5pt 0 1pt; }
p  { margin: 2pt 0 4pt; }
ul { margin: 2pt 0 5pt; padding-left: 16pt; }
li { margin: 1pt 0; }
a  { color: #000080; text-decoration: underline; }
strong { font-weight: 600; }
em { color: #555; }
hr { border: 0; border-top: 1px solid #ccc; margin: 8pt 0; }
h2, h3 { break-after: avoid; }
li, p { break-inside: avoid; }
"""


def find_chrome() -> str:
    for c in CHROME_CANDIDATES:
        path = c if os.path.isabs(c) else shutil.which(c)
        if path and os.path.exists(path):
            return path
    sys.exit("Chrome/Chromium not found. Install Google Chrome or edit CHROME_CANDIDATES.")


A4_POINTS = (595.28, 841.89)
_webkit_state = {}
_webkit_delegate_class = None  # an Objective-C class can only be defined once per process


def _webkit_delegate():
    global _webkit_delegate_class
    if _webkit_delegate_class is None:
        import AppKit
        import objc

        class Md2PdfWebKitDelegate(AppKit.NSObject):
            def webView_didFinishNavigation_(self, web_view, navigation):
                _webkit_state["loaded"] = True

            @objc.typedSelector(b"v@:@Z^v")
            def printOperationDidRun_success_contextInfo_(self, operation, success, context):
                _webkit_state["printed"] = bool(success)

        _webkit_delegate_class = Md2PdfWebKitDelegate
    return _webkit_delegate_class.alloc().init()


def render_webkit(html: str, base_dir: Path, pdf_path: Path) -> None:
    """Print the HTML to PDF with Safari's WebKit engine (macOS only)."""
    try:
        import AppKit
        import Foundation
        import WebKit
    except ImportError:
        sys.exit("Safari rendering needs PyObjC. Run:  pip3 install pyobjc-framework-WebKit"
                 "  (or use --engine chrome)")

    def spin(until, seconds: float, what: str) -> None:
        deadline = time.time() + seconds
        while not until():
            if time.time() > deadline:
                raise TimeoutError(f"Safari/WebKit did not {what} within {seconds:.0f}s")
            Foundation.NSRunLoop.currentRunLoop().runUntilDate_(
                Foundation.NSDate.dateWithTimeIntervalSinceNow_(0.05))

    _webkit_state.update(loaded=False, printed=None)
    state = _webkit_state
    delegate = _webkit_delegate()

    app = AppKit.NSApplication.sharedApplication()
    app.setActivationPolicy_(AppKit.NSApplicationActivationPolicyProhibited)  # no Dock icon

    # WebKit only paginates correctly when the view sits in a window; keep it off screen.
    window = AppKit.NSWindow.alloc().initWithContentRect_styleMask_backing_defer_(
        ((-10000, -10000), A4_POINTS), AppKit.NSWindowStyleMaskBorderless,
        AppKit.NSBackingStoreBuffered, False)
    web_view = WebKit.WKWebView.alloc().initWithFrame_(((0, 0), A4_POINTS))
    window.setContentView_(web_view)
    web_view.setNavigationDelegate_(delegate)
    web_view.loadHTMLString_baseURL_(html, Foundation.NSURL.fileURLWithPath_isDirectory_(str(base_dir), True))
    spin(lambda: state["loaded"], 30, "load the page")

    with tempfile.TemporaryDirectory() as tmp:
        tmp_pdf = Path(tmp) / "out.pdf"
        info = AppKit.NSPrintInfo.sharedPrintInfo().copy()
        settings = info.dictionary()
        settings[AppKit.NSPrintJobDisposition] = AppKit.NSPrintSaveJob
        settings[AppKit.NSPrintJobSavingURL] = Foundation.NSURL.fileURLWithPath_(str(tmp_pdf))
        settings[AppKit.NSPrintHeaderAndFooter] = False
        info.setPaperSize_(A4_POINTS)
        # Zero printer margins so the stylesheet's @page margins are the only ones applied.
        for set_margin in (info.setTopMargin_, info.setBottomMargin_, info.setLeftMargin_, info.setRightMargin_):
            set_margin(0)
        info.setHorizontallyCentered_(False)
        info.setVerticallyCentered_(False)

        operation = web_view.printOperationWithPrintInfo_(info)
        operation.setShowsPrintPanel_(False)
        operation.setShowsProgressPanel_(False)
        operation.runOperationModalForWindow_delegate_didRunSelector_contextInfo_(
            window, delegate, b"printOperationDidRun:success:contextInfo:", None)
        spin(lambda: state["printed"] is not None, 60, "print the PDF")
        window.close()
        if not state["printed"] or not tmp_pdf.exists():
            raise RuntimeError("Safari/WebKit failed to write the PDF")
        shutil.move(str(tmp_pdf), pdf_path)


def build(md_path: Path, pdf_path: Path, css: str, chrome: str | None) -> None:
    """Render md_path to pdf_path; chrome=None uses Safari's WebKit engine."""
    body = markdown.markdown(
        md_path.read_text(encoding="utf-8"),
        extensions=["extra", "sane_lists", "smarty"],
    )
    html = (
        f'<!doctype html><html><head><meta charset="utf-8">'
        f"<title>{md_path.stem}</title><style>{css}</style></head>"
        f"<body>{body}</body></html>"
    )
    pdf_path.parent.mkdir(parents=True, exist_ok=True)
    if chrome is None:
        render_webkit(html, md_path.parent.resolve(), pdf_path)
        return
    with tempfile.TemporaryDirectory() as tmp:
        html_file = Path(tmp) / "resume.html"
        html_file.write_text(html, encoding="utf-8")
        tmp_pdf = Path(tmp) / "out.pdf"
        proc = subprocess.Popen(
            [
                chrome, "--headless=new", "--disable-gpu", "--no-pdf-header-footer",
                f"--user-data-dir={tmp}/profile",
                f"--print-to-pdf={tmp_pdf}",
                html_file.as_uri(),
            ],
            stdout=subprocess.DEVNULL, stderr=subprocess.DEVNULL,
        )
        # Headless Chrome often writes the PDF but never exits, so wait for the
        # file to appear and stop growing, then kill it.
        deadline, last = time.time() + 60, -1
        try:
            while time.time() < deadline:
                size = tmp_pdf.stat().st_size if tmp_pdf.exists() else -1
                if size > 0 and size == last:
                    break
                last = size
                if proc.poll() is not None and size > 0:
                    break
                time.sleep(0.3)
            else:
                raise TimeoutError("Chrome did not produce a PDF within 60s")
        finally:
            proc.kill()
            proc.wait()
        shutil.move(str(tmp_pdf), pdf_path)


def main() -> None:
    ap = argparse.ArgumentParser(description="Markdown -> PDF with auto-rebuild.")
    ap.add_argument("files", nargs="+", type=Path, help="Markdown file(s)")
    ap.add_argument("-w", "--watch", action="store_true", help="rebuild on every change")
    ap.add_argument("-o", "--outdir", type=Path, help="parent folder for the per-resume folders (default: next to the .md)")
    ap.add_argument("--css", type=Path, help="custom CSS file (replaces the default style)")
    ap.add_argument("--interval", type=float, default=0.5, help="watch poll seconds")
    ap.add_argument("--engine", choices=["safari", "chrome"], default="safari",
                    help="PDF renderer: Safari's WebKit engine (default) or headless Chrome")
    args = ap.parse_args()

    for f in args.files:
        if not f.is_file():
            sys.exit(f"Not found: {f}")

    chrome = find_chrome() if args.engine == "chrome" else None

    def out_for(md: Path) -> Path:
        return (args.outdir or md.parent) / md.stem / f"{md.stem}.pdf"

    def rebuild(md: Path) -> None:
        css = args.css.read_text(encoding="utf-8") if args.css else DEFAULT_CSS
        t = time.time()
        try:
            build(md, out_for(md), css, chrome)
            print(f"[{time.strftime('%H:%M:%S')}] {md.name} -> {out_for(md)} ({time.time() - t:.1f}s)")
        except Exception as e:  # keep the watcher alive on a bad save
            print(f"[{time.strftime('%H:%M:%S')}] FAILED {md.name}: {e}", file=sys.stderr)

    def stamp(p: Path):
        try:
            return p.stat().st_mtime_ns
        except FileNotFoundError:  # editors that save via rename
            return None

    for f in args.files:
        rebuild(f)
    if not args.watch:
        return

    watched = list(args.files) + ([args.css] if args.css else [])
    seen = {p: stamp(p) for p in watched}
    print("Watching for changes — Ctrl+C to stop.")
    try:
        while True:
            time.sleep(args.interval)
            for p in watched:
                s = stamp(p)
                if s is None or s == seen[p]:
                    continue
                seen[p] = s
                time.sleep(0.1)  # let the editor finish writing
                for f in (args.files if p == args.css else [p]):
                    rebuild(f)
    except KeyboardInterrupt:
        print("\nStopped.")


if __name__ == "__main__":
    main()
