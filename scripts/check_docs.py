#!/usr/bin/env python3
"""Docs drift check.

Reports:
  MAP     docs/*.md files missing from the docs/README.md map
  LINK    relative markdown links whose target does not exist
  CLASS   backticked CamelCase type names that no Java type, import or source file declares
  TERM    forced Turkish words in docs/ where the English technical term is the convention
  STALE   references to removed tooling (./mvnw)

Usage: python3 scripts/check_docs.py [--no-class]
Exit code 1 when anything is reported.
"""
import re
import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
SKIP_DIRS = {"node_modules", "target", "dist", "build", ".git", "graphify-out", "db-backups"}

# Forced Turkish -> English convention (see AGENTS.md "Docs language").
FORCED_TERMS = {
    "önbellek": "cache", "serileştir": "serialize", "tohumla": "seed", "migrasyon": "migration",
    "polimorf": "polymorphism", "tahliye": "eviction", "telafi": "compensation",
    "el sıkış": "handshake", "güvence havuz": "escrow", "güvenli havuz": "escrow",
    "rozet": "badge", "iş parçacı": "thread", "olay güdümlü": "event-driven", "dikey": "vertical",
    "deseni": "pattern", "yığın": "blob/stack", "dinleyici": "listener", "istemci": "client",
    "boru hatt": "pipeline", "sağlayıcı": "provider", "üretici": "producer",
}

LINK_RE = re.compile(r"\[[^\]]*\]\(([^)\s]+)(?:\s+\"[^\"]*\")?\)")
CODE_RE = re.compile(r"`([^`\n]+)`")
CAMEL_RE = re.compile(r"^[A-Z][a-z0-9]+(?:[A-Z][a-z0-9]*)+$")
TYPE_DECL_RE = re.compile(r"\b(?:class|interface|enum|record|@interface)\s+([A-Z]\w*)")
IMPORT_RE = re.compile(r"^import\s+(?:static\s+)?[\w.]*?\.([A-Z]\w*)", re.M)
# Words that look like type names but are protocol or product terms.
NON_TYPES = {"HttpOnly", "SameSite", "WebSocket", "JavaScript", "PostgreSQL", "OpenAPI"}
# java.lang types (never imported) and nested framework types.
JDK_TYPES = {"IllegalStateException", "IllegalArgumentException", "SecurityException", "StringBuilder",
             "RuntimeException", "NullPointerException", "UnsupportedOperationException", "DefaultTyping"}
# Names used on purpose that are not types: anti-pattern examples and provider name strings.
INTENTIONAL = {"PaymentService", "JetKargo"}
FQCN_RE = re.compile(r"\b(?:org|com|java|jakarta)\.[\w.]+\.([A-Z]\w*)")
FENCE_RE = re.compile(r"^```.*?^```", re.S | re.M)


def walk(base: Path, pattern: str):
    for p in base.rglob(pattern):
        if not any(part in SKIP_DIRS for part in p.relative_to(ROOT).parts):
            yield p


def doc_files():
    files = set(walk(ROOT / "docs", "*.md"))
    files |= {ROOT / "README.md", ROOT / "AGENTS.md"}
    files |= set(walk(ROOT / "src", "*.md"))
    files |= set(walk(ROOT / "secondhand-frontend", "README.md"))
    files |= set(walk(ROOT / "secondhand-frontend", "AGENTS.md"))
    files |= set(walk(ROOT / ".agents", "*.md")) if (ROOT / ".agents").exists() else set()
    return sorted(f for f in files if f.exists())


def known_names():
    names = set()
    for ext in ("*.java", "*.js", "*.jsx", "*.ts", "*.tsx", "*.lua", "*.sql"):
        for p in walk(ROOT, ext):
            names.add(p.stem)
            if p.suffix == ".java":
                text = p.read_text(encoding="utf-8", errors="ignore")
                names.update(TYPE_DECL_RE.findall(text))
                names.update(IMPORT_RE.findall(text))
            elif p.suffix in (".js", ".jsx", ".ts", ".tsx"):
                text = p.read_text(encoding="utf-8", errors="ignore")
                names.update(re.findall(r"\b(?:function|const|class)\s+([A-Z]\w*)", text))
    for p in list(walk(ROOT / "src" / "main" / "resources", "*.yml")) + list(walk(ROOT / "src" / "main" / "resources", "*.properties")):
        names.update(FQCN_RE.findall(p.read_text(encoding="utf-8", errors="ignore")))
    return names | NON_TYPES | JDK_TYPES | INTENTIONAL


def check_map(out):
    readme = (ROOT / "docs" / "README.md").read_text(encoding="utf-8")
    linked = {Path(t.split("#")[0]).name for t in LINK_RE.findall(readme)}
    for p in sorted((ROOT / "docs").glob("*.md")):
        if p.name != "README.md" and p.name not in linked:
            out.append(("MAP", p, 0, f"{p.name} is not linked from docs/README.md"))


def check_file(path, text, names, out):
    rel_is_docs = path.is_relative_to(ROOT / "docs")
    prose = FENCE_RE.sub(lambda m: "\n" * m.group(0).count("\n"), text)
    for lineno, line in enumerate(prose.splitlines(), 1):
        for target in LINK_RE.findall(line):
            if re.match(r"^(https?:|mailto:|#)", target):
                continue
            file_part = target.split("#")[0]
            if file_part and not (path.parent / file_part).exists():
                out.append(("LINK", path, lineno, f"broken link -> {target}"))
        if names is not None:
            for code in CODE_RE.findall(line):
                token = re.split(r"[.(<#:\s\[]", code.strip(), maxsplit=1)[0]
                if CAMEL_RE.match(token) and token not in names:
                    out.append(("CLASS", path, lineno, f"`{token}` not found in code"))
        if rel_is_docs:
            lower = CODE_RE.sub("", line).lower()
            for term, english in FORCED_TERMS.items():
                if re.search(r"(?<![\wçğıöşü])" + re.escape(term), lower):
                    out.append(("TERM", path, lineno, f"'{term}' -> use '{english}'"))
        if "./mvnw" in line or "mvnw " in line:
            out.append(("STALE", path, lineno, "Maven wrapper was removed; use `mvn`"))


def main():
    names = None if "--no-class" in sys.argv else known_names()
    out = []
    check_map(out)
    for path in doc_files():
        check_file(path, path.read_text(encoding="utf-8"), names, out)
    for kind, path, lineno, msg in out:
        loc = f"{path.relative_to(ROOT)}:{lineno}" if lineno else str(path.relative_to(ROOT))
        print(f"{kind:5} {loc}  {msg}")
    print(f"\n{len(out)} issue(s) in {len(doc_files())} files")
    return 1 if out else 0


if __name__ == "__main__":
    sys.exit(main())
