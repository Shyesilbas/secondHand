#!/usr/bin/env python3
"""Docs drift check.

Reports:
  MAP     docs/*.md files missing from the docs/README.md map
  LINK    relative markdown links whose target does not exist
  CLASS   backticked CamelCase type names that no Java type, import or source file declares
  REDIS   backticked v4:/v6: Redis key patterns whose prefix is not declared in code or CacheConfig
  TOPIC   backticked *.v1(*.DLT) Kafka topic names not declared in code or config
  TERM    forced Turkish words in docs/ where the English technical term is the convention
  STALE   references to removed tooling (./mvnw)
  SIZE    module hub README.md (backend or frontend), AGENTS.md or SKILL.md over its word budget
  CONST   backticked UPPER_SNAKE constant in a frontend README that no frontend or backend source declares
  ROUTE   backticked app route in a frontend README that common/constants/routes.js / AppRoutes.jsx does not define

Usage: python3 scripts/check_docs.py [--no-class]
Exit code 1 when anything is reported.
"""
import fnmatch
import os
import re
import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
SKIP_DIRS = {"node_modules", "target", "dist", "build", ".git", "graphify-out", "db-backups", ".idea", ".mvn", ".turbo", ".vite", ".gemini"}

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
# Redis keys of the unimplemented moderation proposal (docs/proposals/).
INTENTIONAL_REDIS = {
    "v4:complaints:delayed_queue",
    "v4:lock:complaint:worker",
    "v4:rate_limit:complaint:user",
    "v4:user:restriction",
}
TOPIC_TOKEN_RE = re.compile(r"^[a-z][a-z0-9._-]*\.v1(?:\.DLT)?$")
REDIS_TOKEN_RE = re.compile(r"^v[46]:[a-zA-Z0-9_:*{}<>-]+$")
FQCN_RE = re.compile(r"\b(?:org|com|java|jakarta)\.[\w.]+\.([A-Z]\w*)")
FENCE_RE = re.compile(r"^```.*?^```", re.S | re.M)
# Word budgets: module hubs say "where" (docs/ says "how"); SKILL.md keeps rules, references/ keeps detail.
MODULE_ROOT = ROOT / "src" / "main" / "java" / "com" / "serhat" / "secondhand"
HUB_WORD_BUDGET = 450
FRONTEND_ROOT = ROOT / "secondhand-frontend" / "src"
FE_HUB_WORD_BUDGET = 450
CONST_RE = re.compile(r"^[A-Z][A-Z0-9]+(?:_[A-Z0-9]+)+$")
ROUTE_TOKEN_RE = re.compile(r"^/[a-z][\w/:.-]*$")
NON_APP_ROUTE = ("/api", "/v1/", "/app/", "/topic/", "/user/", "/queue/")
SKILL_WORD_BUDGET = 700
AGENTS_WORD_BUDGET = 600  # loaded into every session: hard limit
DOC_WORD_WARN = 2000  # docs/ deep dives: warning only, split by section when exceeded


def walk(base: Path, pattern: str):
    if not base.exists():
        return
    for root, dirs, files in os.walk(base):
        dirs[:] = [d for d in dirs if d not in SKIP_DIRS]
        for f in files:
            if fnmatch.fnmatch(f, pattern):
                yield Path(root) / f


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
    code_exts = {".java", ".js", ".jsx", ".ts", ".tsx", ".lua", ".sql"}
    for root, dirs, files in os.walk(ROOT):
        dirs[:] = [d for d in dirs if d not in SKIP_DIRS]
        for f in files:
            p = Path(root) / f
            ext = p.suffix
            if ext in code_exts:
                names.add(p.stem)
                if ext == ".java":
                    text = p.read_text(encoding="utf-8", errors="ignore")
                    names.update(TYPE_DECL_RE.findall(text))
                    names.update(IMPORT_RE.findall(text))
                elif ext in (".js", ".jsx", ".ts", ".tsx"):
                    text = p.read_text(encoding="utf-8", errors="ignore")
                    names.update(re.findall(r"\b(?:function|const|class)\s+([A-Z]\w*)", text))
    for p in list(walk(ROOT / "src" / "main" / "resources", "*.yml")) + list(walk(ROOT / "src" / "main" / "resources", "*.properties")):
        names.update(FQCN_RE.findall(p.read_text(encoding="utf-8", errors="ignore")))
    return names | NON_TYPES | JDK_TYPES | INTENTIONAL


def known_infra():
    topics = set()
    redis_prefixes = {"v4", "v6"} | set(INTENTIONAL_REDIS)
    for ext in ("*.java", "*.yml", "*.properties", "*.lua"):
        for p in walk(ROOT / "src" / "main", ext):
            text = p.read_text(encoding="utf-8", errors="ignore")
            for t in re.findall(r"\b([a-z][a-z0-9._-]*\.v1)\b", text):
                topics.add(t)
                topics.add(f"{t}.DLT")
            for m in re.findall(r"(v[46]:[a-zA-Z0-9_:]+)", text):
                parts = m.rstrip(":").split(":")
                for i in range(1, len(parts) + 1):
                    redis_prefixes.add(":".join(parts[:i]))
            for m in re.findall(r'(?:put|@Cacheable\([^)]*value\s*=\s*|cacheNames\s*=\s*)\s*"([a-zA-Z0-9_:]+)"', text):
                parts = ("v4:" + m.rstrip(":")).split(":")
                for i in range(1, len(parts) + 1):
                    redis_prefixes.add(":".join(parts[:i]))
    return topics, redis_prefixes


def check_map(out):
    readme = (ROOT / "docs" / "README.md").read_text(encoding="utf-8")
    linked = {Path(t.split("#")[0]).name for t in LINK_RE.findall(readme)}
    for p in sorted((ROOT / "docs").glob("*.md")):
        if p.name != "README.md" and p.name not in linked:
            out.append(("MAP", p, 0, f"{p.name} is not linked from docs/README.md"))


def check_file(path, text, names, topics, redis_prefixes, out):
    rel_is_docs = path.is_relative_to(ROOT / "docs")
    prose = FENCE_RE.sub(lambda m: "\n" * m.group(0).count("\n"), text)
    for lineno, line in enumerate(prose.splitlines(), 1):
        for target in LINK_RE.findall(line):
            if re.match(r"^(https?:|mailto:|#)", target):
                continue
            file_part = target.split("#")[0]
            base = ROOT / file_part.lstrip("/") if file_part.startswith("/") else path.parent / file_part
            if file_part and not base.exists():
                out.append(("LINK", path, lineno, f"broken link -> {target}"))
        for code in CODE_RE.findall(line):
            stripped = code.strip()
            if names is not None:
                token = re.split(r"[.(<#:\s\[]", stripped, maxsplit=1)[0]
                if CAMEL_RE.match(token) and token not in names:
                    out.append(("CLASS", path, lineno, f"`{token}` not found in code"))
            if TOPIC_TOKEN_RE.match(stripped) and stripped not in topics:
                out.append(("TOPIC", path, lineno, f"Kafka topic `{stripped}` not found in code"))
            if REDIS_TOKEN_RE.match(stripped):
                prefix = re.split(r"[{*<]", stripped, maxsplit=1)[0].rstrip(":")
                norm_prefix = re.sub(r":\d+$", "", prefix)
                if prefix not in redis_prefixes and norm_prefix not in redis_prefixes:
                    out.append(("REDIS", path, lineno, f"Redis key prefix `{prefix}` not found in code"))
        if rel_is_docs:
            lower = CODE_RE.sub("", line).lower()
            for term, english in FORCED_TERMS.items():
                if re.search(r"(?<![\wçğıöşü])" + re.escape(term), lower):
                    out.append(("TERM", path, lineno, f"'{term}' -> use '{english}'"))
        if "./mvnw" in line or "mvnw " in line:
            out.append(("STALE", path, lineno, "Maven wrapper was removed; use `mvn`"))


def check_sizes(out):
    budgets = [(p, HUB_WORD_BUDGET) for p in sorted(MODULE_ROOT.glob("*/README.md"))]
    budgets += [(p, FE_HUB_WORD_BUDGET) for p in sorted(FRONTEND_ROOT.glob("*/README.md"))]
    budgets.append((ROOT / "AGENTS.md", AGENTS_WORD_BUDGET))
    budgets += [(p, SKILL_WORD_BUDGET) for p in sorted((ROOT / ".agents" / "skills").glob("*/SKILL.md"))]
    for path, budget in budgets:
        words = len(path.read_text(encoding="utf-8").split())
        if words > budget:
            out.append(("SIZE", path, 0, f"{words} words > budget {budget}; move detail to docs/ or references/"))


def check_frontend_facts(out):
    """Frontend READMEs drifted into invented error codes and routes; verify both against source."""
    words = set()
    for base, exts in ((FRONTEND_ROOT, (".js", ".jsx")), (ROOT / "src" / "main", (".java", ".json", ".sql", ".yml", ".lua"))):
        for p in walk(base, "*"):
            if p.suffix in exts:
                words.update(re.findall(r"[A-Z][A-Z0-9_]+", p.read_text(encoding="utf-8", errors="ignore")))
    route_src = (FRONTEND_ROOT / "common" / "constants" / "routes.js").read_text(encoding="utf-8")
    route_src += (FRONTEND_ROOT / "common" / "routes" / "AppRoutes.jsx").read_text(encoding="utf-8")
    routes = set(re.findall(r"['\"`](/[^'\"`?$]*)", route_src))
    prefixes = {r.split("/:")[0].rstrip("/") for r in routes}
    for path in sorted(FRONTEND_ROOT.glob("*/README.md")):
        for lineno, line in enumerate(path.read_text(encoding="utf-8").splitlines(), 1):
            for tok in CODE_RE.findall(line):
                if CONST_RE.match(tok) and tok not in words:
                    out.append(("CONST", path, lineno, f"`{tok}` not found in frontend or backend source"))
                elif ROUTE_TOKEN_RE.match(tok) and not tok.startswith(NON_APP_ROUTE):
                    base = tok.split("?")[0].split("/:")[0].rstrip("/") or "/"
                    if tok.split("?")[0] not in routes and base not in prefixes:
                        out.append(("ROUTE", path, lineno, f"`{tok}` is not a route in routes.js / AppRoutes.jsx"))


def warn_large_docs():
    warns = []
    for p in sorted((ROOT / "docs").glob("*.md")):
        words = len(p.read_text(encoding="utf-8").split())
        if words > DOC_WORD_WARN:
            warns.append(f"WARN  {p.relative_to(ROOT)}  {words} words > {DOC_WORD_WARN}; consider splitting")
    return warns


def main():
    names = None if "--no-class" in sys.argv else known_names()
    topics, redis_prefixes = known_infra()
    out = []
    check_map(out)
    check_sizes(out)
    check_frontend_facts(out)
    for path in doc_files():
        check_file(path, path.read_text(encoding="utf-8"), names, topics, redis_prefixes, out)
    for kind, path, lineno, msg in out:
        loc = f"{path.relative_to(ROOT)}:{lineno}" if lineno else str(path.relative_to(ROOT))
        print(f"{kind:5} {loc}  {msg}")
    for w in warn_large_docs():
        print(w)
    print(f"\n{len(out)} issue(s) in {len(doc_files())} files")
    return 1 if out else 0


if __name__ == "__main__":
    sys.exit(main())
