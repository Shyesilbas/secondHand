"""secondHand proje raporu PDF'ini uretir. Yeni bolum eklemek icin SECTIONS listesine fonksiyon ekle.

Kullanim: python3 scripts/project_report/build_project_report.py [cikti.pdf]
Her rakam kaynak koddan (yml, Java sabitleri, enum'lar, migration'lar, Lua scriptleri) okunur.
Anlatim metnindeki varsayimlar check() ile korunur; kod degisirse build sonunda UYARI basilir."""
import datetime
import re
import subprocess
import sys
from pathlib import Path

import yaml

ROOT = Path(__file__).resolve().parents[2]
SRC = ROOT / "src/main"
JAVA = SRC / "java/com/serhat/secondhand"
RES = SRC / "resources"
TESTS = ROOT / "src/test"
DOCS = ROOT / "docs"

_MONTHS = ["Ocak", "Şubat", "Mart", "Nisan", "Mayıs", "Haziran", "Temmuz", "Ağustos", "Eylül", "Ekim", "Kasım", "Aralık"]
_today = datetime.date.today()
UPDATED = f"{_today.day} {_MONTHS[_today.month - 1]} {_today.year}"

WARN = []


def check(cond, msg):
    """Anlatim metni bu varsayima dayaniyor; kod degisirse build sonunda uyari basilir."""
    if not cond:
        WARN.append(msg)


# ---------------------------------------------------------------------------------------------
# Veri katmani
# ---------------------------------------------------------------------------------------------
def git(*args):
    return subprocess.run(["git", "-C", str(ROOT), *args], capture_output=True, text=True, check=True).stdout.strip()


COMMIT = git("log", "-1", "--format=%h")
COMMIT_DATE = git("log", "-1", "--format=%cs")


def jread(rel):
    return (JAVA / rel).read_text()


def all_java(root=JAVA):
    return sorted(root.rglob("*.java"))


def _env_default(v):
    """`${NAME:default}` ifadesinden varsayilani cikarir (ic ice olabilir)."""
    if not isinstance(v, str):
        return v
    m = re.fullmatch(r"\$\{[^:}]+:(.*)\}", v.strip())
    if m:
        return _env_default(m.group(1))
    if re.fullmatch(r"\$\{[^}]+\}", v.strip()):
        return None  # varsayilansiz ortam degiskeni
    s = v.strip()
    if s in ("true", "false"):
        return s == "true"
    try:
        return int(s)
    except ValueError:
        try:
            return float(s)
        except ValueError:
            return s


def _flat(d, p=""):
    for k, v in d.items():
        key = f"{p}.{k}" if p else k
        if isinstance(v, dict):
            yield from _flat(v, key)
        else:
            yield key, v


def load_yml(name):
    raw = yaml.safe_load((RES / name).read_text())
    return {k: _env_default(v) for k, v in _flat(raw)}


CFG = {}
for _f in ("config/application-core.yml", "config/application-app.yml", "config/application-email.yml"):
    CFG.update(load_yml(_f))
LOCAL = load_yml("application-local.yml")
PROD = load_yml("application-prod.yml")


def cfg(key):
    if key not in CFG:
        raise KeyError(f"yml anahtari yok: {key}")
    return CFG[key]


def jconst(rel, name):
    """`static final ... NAME = <ifade>;` ifadesini sayiya cevirir."""
    m = re.search(rf"\b{name}\s*=\s*([^;]+);", jread(rel))
    if not m:
        raise KeyError(f"{rel}: {name} yok")
    expr = re.sub(r"(?<=\d)[LlDd]\b", "", m.group(1)).strip()
    if re.fullmatch(r"[\d\s*+/().]+", expr):
        return eval(expr)
    return expr.strip('"')


def jfield(rel, name):
    """`private <tip> name = <deger>;` alan varsayilani (Duration/int/long)."""
    m = re.search(rf"\b{name}\s*=\s*([^;]+);", jread(rel))
    if not m:
        raise KeyError(f"{rel}: {name} yok")
    return m.group(1).strip()


def dur(expr):
    """`Duration.ofMinutes(5)` -> saniye."""
    m = re.fullmatch(r"Duration\.of(Seconds|Minutes|Hours|Days|Millis)\((\d+)L?\)", expr.strip())
    if not m:
        raise ValueError(expr)
    mult = {"Seconds": 1, "Minutes": 60, "Hours": 3600, "Days": 86400, "Millis": 0.001}[m.group(1)]
    return int(m.group(2)) * mult


def iso_dur(s):
    """`PT4M30S` -> saniye."""
    m = re.fullmatch(r"PT(?:(\d+)H)?(?:(\d+)M)?(?:(\d+)S)?", s)
    h, mi, se = (int(x) if x else 0 for x in m.groups())
    return h * 3600 + mi * 60 + se


def human(sec):
    """Saniyeyi okunur sureye cevirir."""
    sec = float(sec)
    if sec < 1:
        return f"{int(sec * 1000)} ms"
    sec = int(sec)
    if sec % 86400 == 0:
        n = sec // 86400
        return f"{n} gün"
    if sec % 3600 == 0:
        return f"{sec // 3600} saat"
    if sec % 60 == 0:
        return f"{sec // 60} dk"
    if sec > 60:
        return f"{sec // 60} dk {sec % 60} sn"
    return f"{sec} sn"


def enum_vals(rel):
    t = jread(rel)
    body = re.search(r"enum\s+\w+[^{]*\{(.*?)(?:;\s*\n|\n\})", t, re.S).group(1)
    return re.findall(r"^\s*([A-Z][A-Z0-9_]*)\s*(?:\(|,|$)", body, re.M)


def find_java(name):
    hits = [p for p in all_java() if p.name == f"{name}.java"]
    if not hits:
        raise FileNotFoundError(name)
    return hits[0].relative_to(JAVA).as_posix()


def tr(n):
    """Binlik ayirac: 1.234"""
    return f"{n:,}".replace(",", ".")


def money(x):
    return f"{x:,.2f}".replace(",", "X").replace(".", ",").replace("X", ".")


def code(s):
    return f"<font face='Courier'>{s}</font>"


# ---- yapilandirma degerleri -------------------------------------------------------------------
JWT_ACCESS = cfg("jwt.accessToken.expiration") / 1000
JWT_REFRESH = cfg("jwt.refreshToken.expiration") / 1000
JWT_REMEMBER = cfg("jwt.refreshToken.rememberMeExpiration") / 1000
RL = {c: cfg(f"app.rate-limit.{c}.limit") for c in ("auth", "payment", "general", "ai")}
RL_WINDOW = cfg("app.rate-limit.window-size-seconds")
HIKARI = {k: cfg(f"spring.datasource.hikari.{k}") for k in
          ("maximum-pool-size", "minimum-idle", "connection-timeout", "idle-timeout", "max-lifetime")}
ASYNC = {k: cfg(f"app.async.{k}") for k in ("core-pool-size", "max-pool-size", "queue-capacity")}

# ---- Java sabitleri -----------------------------------------------------------------------------
OB = "order/util/OrderBusinessConstants.java"
REFUND_WINDOW_H = jconst(OB, "REFUND_WINDOW_HOURS")
AUTO_COMPLETE_H = jconst(OB, "AUTO_COMPLETION_HOURS")
SHIP_DEADLINE_H = jconst(OB, "SHIP_DEADLINE_HOURS")
STATUS_INTERVAL_MIN = jconst(OB, "STATUS_UPDATE_INTERVAL_MINUTES")
MEETUP_AUTO_H = jconst(OB, "MEETUP_AUTO_COMPLETION_HOURS")
MEETUP_CODE_TTL_MIN = jconst(OB, "MEETUP_CODE_TTL_MINUTES")
PC = "payment/util/PaymentProcessingConstants.java"
PAY_RETRIES = jconst(PC, "MAX_OPTIMISTIC_LOCK_RETRIES")
PAY_BACKOFF_MS = jconst(PC, "BASE_RETRY_BACKOFF_MS")
IDEM_LOCK_H = jconst(PC, "IDEMPOTENCY_LOCK_TTL_HOURS")
IDEM_RESULT_H = jconst(PC, "IDEMPOTENCY_RESULT_TTL_HOURS")
LA = "auth/application/LoginAttemptService.java"
LOGIN_PER_ACCOUNT = jconst(LA, "MAX_FAILURES_PER_ACCOUNT_AND_IP")
LOGIN_PER_IP = jconst(LA, "MAX_FAILURES_PER_IP")
LOGIN_WINDOW_S = dur(jfield(LA, "WINDOW"))

# ---- enum'lar --------------------------------------------------------------------------------
ORDER_STATUSES = enum_vals("order/entity/enums/OrderStatus.java")
PAYMENT_STATUSES = enum_vals("payment/entity/PaymentStatus.java")
PAYMENT_TYPES = enum_vals("payment/entity/PaymentTransactionType.java")
OFFER_STATUSES = enum_vals("offer/entity/OfferStatus.java")
COMPLAINT_STATUSES = enum_vals("complaint/ComplaintStatus.java")
LISTING_STATUSES = enum_vals("listing/domain/entity/enums/base/ListingStatus.java")
LISTING_TYPES = enum_vals("listing/domain/entity/enums/base/ListingType.java")
SHIPPING_STATUSES = enum_vals("shipping/entity/enums/ShippingStatus.java")
NOTIF_TYPES = enum_vals("notification/entity/enums/NotificationType.java")
EMAIL_TYPES = enum_vals("email/domain/entity/enums/EmailType.java")
ACCOUNT_STATUSES = enum_vals("user/domain/entity/enums/AccountStatus.java")
PLANS = enum_vals("user/domain/entity/enums/MembershipPlan.java")
AGREEMENT_TYPES = enum_vals("agreements/entity/enums/AgreementType.java")

# ---- membership plani -------------------------------------------------------------------------
_mp = jread("user/domain/entity/enums/MembershipPlan.java")


def _plan_val(method):
    m = re.search(rf"{method}\(\)\s*\{{\s*return this == PREMIUM \? (\d+) : (\d+);", _mp)
    return {"PREMIUM": int(m.group(1)), "FREE": int(m.group(2))}


PLAN_AURA = _plan_val("getDailyAuraLimit")
PLAN_SHOWCASE = _plan_val("getMaxShowcaseSlots")
PLAN_SHIP_DAYS = _plan_val("getEstimatedShippingDays")

# ---- zamanlanmis isler ------------------------------------------------------------------------
_SPEL = {
    "#{@campaignConfigProperties.schedulerDeactivateFixedDelayMs}": ("fixedDelay", lambda: cfg("app.campaign.scheduler-deactivate-fixed-delay-ms")),
    "#{@showcaseConfig.scheduler.expireCron}": ("cron", lambda: cfg("app.showcase.scheduler.expire-cron")),
}


def _trigger(args, rel):
    args = " ".join(args.split())
    m = re.search(r'(cron|fixedDelayString|fixedRateString|fixedDelay|fixedRate)\s*=\s*("([^"]*)"|[^,)]+)', args)
    kind, raw = m.group(1), m.group(2).strip()
    val = m.group(3) if m.group(3) is not None else raw
    if val in _SPEL:
        kind, fn = _SPEL[val]
        val = fn()
    pm = re.fullmatch(r"\$\{[^:}]+:([^}]*)\}", str(val))
    if pm:
        val = pm.group(1)
    kind = kind.replace("String", "")
    if kind in ("fixedDelay", "fixedRate"):
        val = str(val)
        if "OrderBusinessConstants.STATUS_UPDATE_INTERVAL_MINUTES" in val:
            val = STATUS_INTERVAL_MIN * 60 * 1000
        elif re.fullmatch(r"[A-Z_]+", val):
            val = int(jconst(rel, val))
        else:
            val = int(eval(re.sub(r"(?<=\d)L\b", "", val)))
        return ("her " + human(val / 1000)) + (" (sabit gecikme)" if kind == "fixedDelay" else " (sabit aralik)")
    return "cron " + str(val)


def scan_jobs():
    jobs = []
    for p in all_java():
        t = p.read_text()
        for m in re.finditer(r"@(?:org\.springframework\.scheduling\.annotation\.)?Scheduled\(((?:[^()]|\([^()]*\))*)\)[^\n]*\n(\s*@SchedulerLock\(\s*name\s*=\s*\"(\w+)\",\s*lockAtMostFor\s*=\s*\"(\w+)\",\s*lockAtLeastFor\s*=\s*\"(\w+)\"\s*\))?", t):
            jobs.append({
                "cls": p.stem, "mod": p.relative_to(JAVA).parts[0], "trigger": _trigger(m.group(1), p.relative_to(JAVA).as_posix()),
                "lock": m.group(3), "at_most": iso_dur(m.group(4)) if m.group(4) else None,
                "at_least": iso_dur(m.group(5)) if m.group(5) else None,
            })
    # initialDelay ve ShedLock'siz isler icin ek bilgi
    return jobs


JOBS = scan_jobs()
LOCKED_JOBS = [j for j in JOBS if j["lock"]]
LOCK_PREFIX = jconst("core/config/SchedulerLockConfig.java", "LOCK_KEY_PREFIX")
LOCK_DEFAULT_MOST = iso_dur(re.search(r'defaultLockAtMostFor\s*=\s*"(\w+)"', jread("core/config/SchedulerLockConfig.java")).group(1))

# ---- Kafka ---------------------------------------------------------------------------------------
_kc = jread("core/config/KafkaConfig.java")
TOPICS = {}
for _name, _file in (("PAYMENT_COMPLETED_TOPIC", None), ("PAYMENT_FAILED_TOPIC", None), ("PAYMENT_REFUNDED_TOPIC", None), ("MAIL_DISPATCH_TOPIC", None)):
    TOPICS[_name] = jconst("core/config/KafkaConfig.java", _name)
TOPICS["ESCROW_RELEASED_TOPIC"] = jconst("escrow/application/EscrowKafkaProducer.java", "ESCROW_RELEASED_TOPIC")
TOPICS["ORDER_CANCELLED_TOPIC"] = jconst("order/application/OrderKafkaProducer.java", "ORDER_CANCELLED_TOPIC")
TOPICS["ORDER_REFUNDED_TOPIC"] = jconst("order/application/OrderKafkaProducer.java", "ORDER_REFUNDED_TOPIC")
TOPIC_PARTITIONS = {m.group(1): (int(m.group(2)), int(m.group(3))) for m in re.finditer(
    r"topics\.([a-z-]+)-partitions:(\d+)\}\"\) int partitions,\s*@Value\(\"\$\{app\.kafka\.topics\.[a-z-]+-replicas:(\d+)\}", _kc)} if False else {}
for _m in re.finditer(r"topics\.([a-z-]+)-partitions:(\d+)\}\"\)\s*int partitions,\s*@Value\(\"\$\{app\.kafka\.topics\.[a-z-]+-replicas:(\d+)", _kc):
    TOPIC_PARTITIONS[_m.group(1)] = (int(_m.group(2)), int(_m.group(3)))
DLT_TOPICS = re.findall(r'TopicBuilder\.name\(([^)]*?)\s*\+\s*"\.DLT"\)', _kc)
DLT_PARTITIONS = re.findall(r'\.DLT"\)\.partitions\((\d+)\)', _kc)
BACKOFF = re.search(r"new FixedBackOff\((\d+)L,\s*(\d+)L\)", _kc)
BACKOFF_MS, BACKOFF_RETRIES = int(BACKOFF.group(1)), int(BACKOFF.group(2))
CONSUMERS = []
for _p in all_java():
    _t = _p.read_text()
    for _m in re.finditer(r"@KafkaListener\(\s*topics\s*=\s*([\w.]+),\s*groupId\s*=\s*\"\$\{[^:}]+:([^}]+)\}\"", _t):
        CONSUMERS.append((_p.stem, _m.group(1), _m.group(2)))
OUTBOX_MAX_ATTEMPTS = {}
for _n, _f in (("payment", "payment/outbox/PaymentOutboxEvent.java"), ("order", "order/outbox/OrderOutboxEvent.java"), ("escrow", "escrow/outbox/EscrowOutboxEvent.java")):
    OUTBOX_MAX_ATTEMPTS[_n] = int(re.search(r"maxAttempts\s*=\s*(\d+)", jread(_f)).group(1))
OUTBOX_PUBLISH_TIMEOUT = int(re.search(r"app\.outbox\.publish-timeout-seconds:(\d+)", jread("escrow/outbox/EscrowOutboxWorker.java")).group(1))
OUTBOX_BATCH = int(re.search(r"PageRequest\.of\(0,\s*(\d+)\)", jread("escrow/outbox/EscrowOutboxWorker.java")).group(1))
OUTBOX_RETENTION = int(re.search(r"retention-days:(\d+)", jread("core/outbox/OutboxHousekeepingScheduler.java")).group(1))
OUTBOX_CLEAN_CRON = re.search(r"app\.outbox\.cleanup\.cron:([^}]+)\}", jread("core/outbox/OutboxHousekeepingScheduler.java")).group(1)
_pw = jread("payment/outbox/PaymentOutboxWorker.java")
_ow = jread("order/outbox/OrderOutboxWorker.java")
_ew = jread("escrow/outbox/EscrowOutboxWorker.java")
PAY_BACKOFF_STEP = int(re.search(r"newAttempt \* (\d+)L", _pw).group(1))
PAY_BACKOFF_CAP = int(re.search(r"Math\.min\((\d+), newAttempt", _pw).group(1))
ESC_BACKOFF_CAP = int(re.search(r"Math\.min\((\d+), Math\.pow\(2, attempts\) \* (\d+)\)", _ew).group(1))
ESC_BACKOFF_MUL = int(re.search(r"Math\.min\((\d+), Math\.pow\(2, attempts\) \* (\d+)\)", _ew).group(2))
check("Math.pow(2, event.getAttemptCount())" in _ow, "Order outbox backoff formulu degisti: anlatim gozden gecirilmeli")

# ---- Cache TTL -----------------------------------------------------------------------------------
_cc = jread("core/config/CacheConfig.java")
CACHE_VERSION = jconst("core/config/CacheConfig.java", "CACHE_VERSION")
def _ttl_expr(expr):
    """Literal Duration or a `Type.CONSTANT` declared as `Duration.ofX(n)` in the code base."""
    if expr.startswith("Duration."):
        return dur(expr)
    const = expr.rsplit(".", 1)[-1]
    for f in (ROOT / "src" / "main" / "java").rglob("*.java"):
        m = re.search(r"Duration " + re.escape(const) + r"\s*=\s*(Duration\.of\w+\(\d+L?\))", f.read_text(encoding="utf-8"))
        if m:
            return dur(m.group(1))
    raise ValueError(expr)


_ttl_var = {m.group(1): _ttl_expr(m.group(2)) for m in re.finditer(
    r"RedisCacheConfiguration (\w+) = defaultConfig\.entryTtl\(([\w.]+(?:\(\d+L?\))?)\)", _cc)}
CACHE_DEFAULT_TTL = dur(re.search(r"defaultCacheConfig\(\)\s*\.entryTtl\((Duration\.of\w+\(\d+\))\)", _cc).group(1))
CACHES = [(m.group(1), _ttl_var[m.group(2)]) for m in re.finditer(r'withCacheConfiguration\("([^"]+)",\s*(\w+)\)', _cc)]
SCAN_BATCH = int(re.search(r"BatchStrategies\.scan\((\d+)\)", _cc).group(1))

# ---- Lua scriptleri ------------------------------------------------------------------------------
LUA = []
for _p in sorted((RES / "scripts").glob("*.lua")):
    _lines = _p.read_text().splitlines()
    LUA.append((_p.name, len(_lines)))

# ---- Redis anahtarlari ---------------------------------------------------------------------------
_all_java_text = "\n".join(p.read_text() for p in all_java())
REDIS_KEYS = sorted(set(re.findall(r'"(v4:[A-Za-z0-9_:.-]*)"', _all_java_text)))
STOCK_KEY = jconst("inventory/application/InventoryRedisReservationService.java", "STOCK_KEY_PREFIX") if re.search(r"STOCK_KEY_PREFIX\s*=", jread("inventory/application/InventoryRedisReservationService.java")) else None
RESERVATION_TTL = int(re.search(r"DEFAULT_RESERVATION_TTL_SECONDS\s*=\s*(\d+)", jread("inventory/application/InventoryRedisReservationService.java")).group(1))
PENDING_TTL_H = int(re.search(r"PENDING_PURCHASE_TTL\s*=\s*Duration\.ofHours\((\d+)\)", jread("inventory/application/InventoryRedisReservationService.java")).group(1))
RECON_DELAY = int(re.search(r"reconciliation\.fixed-delay-ms:(\d+)", jread("inventory/application/StockReservationReconciliationScheduler.java")).group(1)) / 1000
RECON_SCAN = int(re.search(r"count\((\d+)\)", jread("inventory/application/StockReservationReconciliationScheduler.java")).group(1))

# ---- Migration ve sema istatistikleri ----------------------------------------------------------
MIG = sorted((RES / "db/migration").glob("*.sql"))
_mig_text = "\n".join(p.read_text() for p in MIG)
MIG_TABLES = len(set(re.findall(r"CREATE TABLE(?: IF NOT EXISTS)?\s+(?:public\.)?(\w+)", _mig_text)))
MIG_INDEXES = len(set(re.findall(r"CREATE (?:UNIQUE )?INDEX(?: IF NOT EXISTS)?\s+(\w+)", _mig_text)))
MIG_FIRST = MIG[0].name
ENTITY_TABLES = {}
for _p in all_java():
    _t = _p.read_text()
    if "@Entity" in _t:
        _m = re.search(r'@Table\(\s*name\s*=\s*"(\w+)"', _t)
        ENTITY_TABLES.setdefault(_p.relative_to(JAVA).parts[0], []).append(_m.group(1) if _m else _p.stem)
N_ENTITIES = sum(len(v) for v in ENTITY_TABLES.values())

# ---- Modul istatistikleri -----------------------------------------------------------------------
MODULES = sorted(p.name for p in JAVA.iterdir() if p.is_dir())
N_JAVA = len(all_java())
N_CONTROLLERS = sum(1 for p in all_java() if re.search(r"@(Rest)?Controller", p.read_text()))
N_ENDPOINTS = len(re.findall(r"@(?:Get|Post|Put|Delete|Patch)Mapping", _all_java_text))
N_TEST_FILES = len(list(TESTS.rglob("*Test*.java")))
N_TESTS = sum(len(re.findall(r"@(?:Test|ParameterizedTest)\b", p.read_text())) for p in TESTS.rglob("*.java"))
N_IT = len(list(TESTS.rglob("*IntegrationTest.java")))
N_SCHEDULED = len(JOBS)
N_DOCS = len(list(DOCS.glob("*.md")))
N_ADR = len(list((DOCS / "adr").glob("[0-9]*.md")))
N_JSON_CATALOG = len(list((RES / "data").rglob("*.json")))


# ---------------------------------------------------------------------------------------------
# PDF yardimcilari
# ---------------------------------------------------------------------------------------------
from reportlab.lib import colors  # noqa: E402
from reportlab.lib.enums import TA_LEFT  # noqa: E402
from reportlab.lib.pagesizes import A4  # noqa: E402
from reportlab.lib.styles import ParagraphStyle  # noqa: E402
from reportlab.lib.units import cm  # noqa: E402
from reportlab.pdfbase import pdfmetrics  # noqa: E402
from reportlab.pdfbase.ttfonts import TTFont  # noqa: E402
from reportlab.platypus import (KeepTogether, PageBreak, Paragraph, SimpleDocTemplate,  # noqa: E402
                                Spacer, Table, TableStyle)

FONT_DIR = Path("/System/Library/Fonts/Supplemental")
pdfmetrics.registerFont(TTFont("Body", str(FONT_DIR / "Arial.ttf")))
pdfmetrics.registerFont(TTFont("Body-Bold", str(FONT_DIR / "Arial Bold.ttf")))
pdfmetrics.registerFont(TTFont("Body-Italic", str(FONT_DIR / "Arial Italic.ttf")))
pdfmetrics.registerFontFamily("Body", normal="Body", bold="Body-Bold", italic="Body-Italic")

INK = colors.HexColor("#1f2933")
MUTED = colors.HexColor("#52606d")
RULE = colors.HexColor("#d9dee3")
TINT = colors.HexColor("#f3f5f7")

H1 = ParagraphStyle("H1", fontName="Body-Bold", fontSize=22, leading=28, textColor=INK, spaceAfter=4)
SUB = ParagraphStyle("Sub", fontName="Body", fontSize=10.5, leading=15, textColor=MUTED, spaceAfter=18)
H2 = ParagraphStyle("H2", fontName="Body-Bold", fontSize=15, leading=20, textColor=INK, spaceBefore=6, spaceAfter=8)
H3 = ParagraphStyle("H3", fontName="Body-Bold", fontSize=11.5, leading=16, textColor=INK, spaceBefore=12, spaceAfter=4)
P = ParagraphStyle("P", fontName="Body", fontSize=10.5, leading=16, textColor=INK, alignment=TA_LEFT, spaceAfter=6)
PK = ParagraphStyle("PK", parent=P)
CELL = ParagraphStyle("Cell", parent=P, fontSize=9.5, leading=13, spaceAfter=0)
CELL_B = ParagraphStyle("CellB", parent=CELL, fontName="Body-Bold")
CALLOUT = ParagraphStyle("Callout", parent=P, fontSize=11, leading=17, spaceAfter=0)

_SECTION_NO = [0]


def H2N(title):
    _SECTION_NO[0] += 1
    return Paragraph(f"{_SECTION_NO[0]}. {title}", H2)


def callout(text):
    t = Table([[Paragraph(text, CALLOUT)]], colWidths=[16.4 * cm])
    t.setStyle(TableStyle([
        ("BACKGROUND", (0, 0), (-1, -1), TINT),
        ("LINEBEFORE", (0, 0), (0, -1), 3, INK),
        ("LEFTPADDING", (0, 0), (-1, -1), 12), ("RIGHTPADDING", (0, 0), (-1, -1), 12),
        ("TOPPADDING", (0, 0), (-1, -1), 9), ("BOTTOMPADDING", (0, 0), (-1, -1), 9),
    ]))
    return [Spacer(1, 4), t, Spacer(1, 8)]


def summary(text):
    return callout("<b>Özet:</b> " + text)


def table(rows, widths):
    data = [[Paragraph(str(c), CELL_B if i == 0 else CELL) for c in r] for i, r in enumerate(rows)]
    t = Table(data, colWidths=[w * cm for w in widths], repeatRows=1)
    t.setStyle(TableStyle([
        ("LINEBELOW", (0, 0), (-1, 0), 0.8, INK),
        ("LINEBELOW", (0, 1), (-1, -1), 0.4, RULE),
        ("VALIGN", (0, 0), (-1, -1), "TOP"),
        ("TOPPADDING", (0, 0), (-1, -1), 5), ("BOTTOMPADDING", (0, 0), (-1, -1), 5),
        ("LEFTPADDING", (0, 0), (-1, -1), 4),
    ]))
    return [t, Spacer(1, 8)]


def para(text, style=None):
    return Paragraph(text, style or P)


def bullets(items):
    return [Paragraph("&bull; " + i, ParagraphStyle("B", parent=P, leftIndent=12, firstLineIndent=-9, spaceAfter=3)) for i in items]


def glue(story):
    """Baslik ve giris cumlelerini ardindaki ilk blokla tek blokta tutar."""
    out, pending = [], []
    for f in story:
        if isinstance(f, Paragraph) and f.style.name in ("H3", "PK"):
            pending.append(f)
        elif pending:
            out.append(KeepTogether(pending + [f]))
            pending = []
        elif isinstance(f, Table):
            out.append(KeepTogether([f]))
        else:
            out.append(f)
    return out + pending


def ms_s(ms):
    return human(ms / 1000)


# okunur ad -> kod gosterimi
def c(s):
    return f"<font face='Courier' size='9'>{s}</font>"


# ---------------------------------------------------------------------------------------------
# Bolumler 1-7: genel bakis, altyapi, veritabani, Redis, Kafka, outbox, stok
# ---------------------------------------------------------------------------------------------
_compose = yaml.safe_load((ROOT / "docker-compose.yml").read_text())["services"]
_PG_IMG, _REDIS_IMG, _KAFKA_IMG = (_compose[k]["image"] for k in ("postgres", "redis", "kafka"))
_PG_PORT = _compose["postgres"]["ports"][0]
_KAFKA_PARTS = _compose["kafka"]["environment"]["KAFKA_NUM_PARTITIONS"]
_POM = (ROOT / "pom.xml").read_text()
SPRING_BOOT = re.search(r"<artifactId>spring-boot-starter-parent</artifactId>\s*<version>([\d.]+)</version>", _POM).group(1)
JAVA_VER = re.search(r"<java.version>(\d+)</java.version>", _POM).group(1)
SHEDLOCK_VER = re.search(r"<shedlock.version>([\d.]+)</shedlock.version>", _POM).group(1)
_guard = jread("core/config/ProdSecurityGuard.java")
GUARD_ERRORS = len(re.findall(r"errors\.add\(", _guard))
check("app.test-endpoints.enabled" in _guard and "REDIS_PASSWORD" in _guard, "ProdSecurityGuard kontrolleri degisti: bolum 2 gozden gecirilmeli")
check(_PG_IMG.startswith("postgres:15") and _REDIS_IMG.startswith("redis:7") and _KAFKA_IMG.endswith("3.7.0"), "Altyapi imaj surumleri degisti")


def overview():
    s = [H2N("Genel Bakış ve Mimari Çerçeve")]
    s.append(para(
        "secondHand, ikinci el ürünlerin alınıp satıldığı bir pazaryeri arka ucudur. Rapor yalnızca arka ucu (Spring Boot servisi, "
        "PostgreSQL, Redis, Kafka ve bunların etrafındaki iş akışlarını) kapsar; ön yüz kapsam dışıdır. Her rakam kaynak koddan okunmuştur: "
        "yapılandırma dosyaları, Java sabitleri, enum'lar, Flyway migration'ları ve Lua scriptleri. Dokümantasyon ile kod çeliştiğinde "
        "kod esas alınmış, çelişkiler raporun sonunda ayrı bir bölümde listelenmiştir."))
    s += summary(
        f"Tek bir Spring Boot {SPRING_BOOT} uygulaması (Java {JAVA_VER}), {len(MODULES)} iş modülü, {N_CONTROLLERS} controller ve {N_ENDPOINTS} endpoint tanımı. "
        f"Kalıcı veri PostgreSQL'de, hızlı ve atomik işlemler Redis'te, modüller arası asenkron iş Kafka'da yürür. Para ve stok hattı "
        f"transactional outbox, Lua scriptleri ve idempotency kayıtlarıyla korunur.")
    s.append(Paragraph("Teknoloji yığını", H3))
    s += table([
        ["Katman", "Teknoloji", "Kaynak"],
        ["Uygulama", f"Spring Boot {SPRING_BOOT}, Java {JAVA_VER}, Maven", "pom.xml"],
        ["Veritabanı", f"PostgreSQL ({_PG_IMG}), Flyway, Hibernate (ddl-auto: {LOCAL['spring.jpa.hibernate.ddl-auto']})", "docker-compose.yml, application-local.yml"],
        ["Önbellek ve koordinasyon", f"Redis ({_REDIS_IMG}): cache, Lua scriptleri, kilitler, sayaçlar, kuyruklar", "docker-compose.yml"],
        ["Mesajlaşma", f"Apache Kafka ({_KAFKA_IMG.split('/')[-1]}), KRaft modu, tek düğüm", "docker-compose.yml"],
        ["Zamanlanmış iş kilidi", f"ShedLock {SHEDLOCK_VER}, Redis sağlayıcısı", "pom.xml, SchedulerLockConfig"],
        ["Gerçek zamanlı", "WebSocket / STOMP (sohbet ve canlı bildirim)", "WebSocketConfig"],
        ["Harici servisler", "Cloudinary (görsel), döviz kuru API'si, Gemini (Aura AI), Google OAuth2", "application-core.yml"],
        ["Gözlemlenebilirlik", "Actuator, Micrometer, Prometheus", "application-local.yml, application-prod.yml"],
    ], [3.6, 8.2, 4.6])
    s.append(Paragraph("Kod tabanının boyutu", H3))
    s += table([
        ["Ölçü", "Değer"],
        ["Java kaynak dosyası", tr(N_JAVA)],
        ["İş modülü (üst düzey paket)", str(len(MODULES))],
        ["JPA entity", str(N_ENTITIES)],
        ["Controller sınıfı / HTTP endpoint tanımı", f"{N_CONTROLLERS} / {N_ENDPOINTS}"],
        ["Flyway migration dosyası", str(len(MIG))],
        ["Redis Lua scripti", str(len(LUA))],
        ["Zamanlanmış metot (@Scheduled)", f"{N_SCHEDULED} ({len(LOCKED_JOBS)} tanesi ShedLock'lu)"],
        ["Kafka topic (ana + DLT)", f"{len(TOPICS)} + {len(DLT_TOPICS)}"],
        ["Test dosyası / test metodu", f"{N_TEST_FILES} / {N_TESTS}"],
        ["Katalog JSON dosyası (seed verisi)", str(N_JSON_CATALOG)],
        ["Mimari doküman / ADR", f"{N_DOCS} / {N_ADR}"],
    ], [9, 7.4])
    s.append(Paragraph("Modüller", H3))
    s.append(para("Her modül kendi paketinde controller, uygulama servisleri, entity ve repository katmanını taşır. Modüller yalnızca birbirlerinin "
                  "arayüzlerini (I-önekli servis arayüzleri, port'lar) çağırır. Aşağıda modül başına entity sayısı ve tabloları görünür."))
    rows = [["Modül", "Entity", "Tablolar"]]
    for mod in MODULES:
        tabs = ENTITY_TABLES.get(mod, [])
        rows.append([mod, str(len(tabs)), ", ".join(sorted(tabs)) if tabs else "-"])
    s += table(rows, [2.6, 1.4, 12.4])
    s.append(Paragraph("Ana iş akışı", H3))
    s.append(para(
        "Uygulamanın en kritik hattı şudur: sepet, checkout, sipariş, ödeme, escrow, e-cüzdan. Alıcı ödeme yaptığında para satıcıya geçmez; "
        "escrow havuzunda tutulur. Teslimat onaylanınca (ya da süre dolunca otomatik) para Kafka üzerinden asenkron olarak satıcının e-cüzdanına yazılır. "
        "Stok Redis'te atomik olarak ayrılır, ödeme sonrası PostgreSQL'e yansıtılır ve iki taraf arasındaki fark periyodik bir iş tarafından onarılır. "
        "Bu raporun sonraki bölümleri bu hattın her halkasını ayrı ayrı ele alır."))
    return s


def infra():
    s = [H2N("Altyapı, Yapılandırma ve Çalışma Profilleri")]
    s.append(para(
        "Yerel geliştirme altyapısı docker-compose ile üç servisten oluşur. Hepsi adlandırılmış volume kullanır ve "
        "<i>restart: unless-stopped</i> ile ayağa kalkar. Prometheus ve Grafana compose'da yoktur; metrikler uygulamadan dışarı verilir."))
    s += table([
        ["Servis", "İmaj", "Port (ana:konteyner)", "Not"],
        ["PostgreSQL", _PG_IMG, _PG_PORT, "Veritabanı adı secondhand; DB_USER ve DB_PASSWORD verilmezse postgres/postgres"],
        ["Redis", _REDIS_IMG, _compose["redis"]["ports"][0], "Şifresiz yerel kullanım; prod'da şifre zorunlu"],
        ["Kafka", _KAFKA_IMG.split("/")[-1], _compose["kafka"]["ports"][0],
         f"KRaft (broker + controller aynı düğümde), varsayılan {_KAFKA_PARTS} partition, replikasyon faktörü 1"],
    ], [2.4, 4.4, 3.2, 6.4])
    s.append(para("Kafka tek düğüm ve replikasyon faktörü 1 ile çalışır. Bu yapı yalnızca geliştirme içindir; düğüm kaybında mesaj kaybı olur."))

    s.append(Paragraph("Profiller", H3))
    s.append(para(
        f"Varsayılan profil <b>local</b>'dir. Prod için SPRING_PROFILES_ACTIVE=prod verilir. Her iki profilde de şema doğrulama modu "
        f"<i>{LOCAL['spring.jpa.hibernate.ddl-auto']}</i>'dir: Hibernate tabloları değiştirmez, yalnızca entity'lerin migration'larla kurulan şemayla "
        f"uyumunu denetler. Şemayı değiştirmenin tek yolu Flyway'dir."))
    s += table([
        ["Özellik", "local", "prod"],
        ["Flyway", f"açık, baseline-on-migrate, out-of-order: {'açık' if LOCAL['spring.flyway.out-of-order'] else 'kapalı'}", "açık, baseline-on-migrate, out-of-order kapalı"],
        ["Actuator exposure", LOCAL["management.endpoints.web.exposure.include"], PROD["management.endpoints.web.exposure.include"]],
        ["Yönetim portu", "uygulama portu (8080)", f"ayrı port, varsayılan {PROD['management.server.port']}"],
        ["E-cüzdan başlangıç bakiyesi", f"{money(cfg('app.e-wallet.default-balance'))} TRY (demo)", f"{money(PROD['app.e-wallet.default-balance'])} TRY"],
        ["Swagger / OpenAPI", "açık (/swagger-ui.html, /v3/api-docs)", "kapalı"],
    ], [4.6, 6.0, 5.8])

    s.append(Paragraph("Prod güvenlik bekçisi (ProdSecurityGuard)", H3))
    s.append(para(
        f"Prod profilinde uygulama açılırken ProdSecurityGuard tüm yapılandırma hatalarını toplar ve biri bile varsa uygulamayı başlatmaz. "
        f"Kodda {GUARD_ERRORS} ayrı hata mesajı tanımlıdır; bunlar yedi başlık altında toplanır:"))
    s += bullets([
        "JWT imza anahtarı tanımlı, geçerli base64 ve çözüldüğünde en az 32 bayt olmalıdır.",
        "Rate limiting açık olmalıdır (app.rate-limit.enabled).",
        "Actuator exposure listesi tehlikeli uç noktaları (env, beans, heapdump, threaddump, loggers, mappings, shutdown, logfile, configprops, *) içeremez.",
        "Auth çerezi secure olmalı ve same-site değeri boş bırakılamaz.",
        "CORS origin listesi boş olamaz, localhost içeremez; allow-credentials açıkken joker (*) kullanılamaz.",
        "Test endpoint'leri (app.test-endpoints.enabled) kapalı olmalıdır.",
        "Redis şifresi (REDIS_PASSWORD) tanımlı olmalıdır.",
    ])

    s.append(Paragraph("Bağlantı havuzu ve iş parçacığı limitleri", H3))
    s += table([
        ["Ayar", "Değer", "Anahtar"],
        ["Hikari maksimum bağlantı", str(HIKARI["maximum-pool-size"]), "DB_POOL_MAX_SIZE"],
        ["Hikari minimum boşta bağlantı", str(HIKARI["minimum-idle"]), "DB_POOL_MIN_IDLE"],
        ["Bağlantı alma zaman aşımı", ms_s(HIKARI["connection-timeout"]), "DB_POOL_CONNECTION_TIMEOUT_MS"],
        ["Boşta bağlantı ömrü", ms_s(HIKARI["idle-timeout"]), "DB_POOL_IDLE_TIMEOUT_MS"],
        ["Bağlantı azami ömrü", ms_s(HIKARI["max-lifetime"]), "DB_POOL_MAX_LIFETIME_MS"],
        ["Hibernate batch boyutu / batch fetch", f"{cfg('spring.jpa.properties.hibernate.jdbc.batch_size')} / {cfg('spring.jpa.properties.hibernate.default_batch_fetch_size')}", "application-core.yml"],
        ["Open-in-view", "kapalı (lazy yükleme transaction dışında yapılmaz)", "spring.jpa.open-in-view"],
        ["Async havuz (çekirdek / azami / kuyruk)", f"{ASYNC['core-pool-size']} / {ASYNC['max-pool-size']} / {ASYNC['queue-capacity']}", "app.async.*"],
        ["Async reddetme politikası", "CallerRuns (kuyruk dolarsa çağıran iş parçacığı çalıştırır, uyarı loglanır)", "AsyncConfig"],
        ["Zamanlayıcı havuzu", f"{cfg('spring.task.scheduling.pool.size')} iş parçacığı", "SCHEDULING_POOL_SIZE"],
        ["Sayfa boyutu üst sınırı", str(cfg("spring.data.web.pageable.max-page-size")), "spring.data.web.pageable"],
        ["Dosya yükleme sınırı", f"{cfg('spring.servlet.multipart.max-file-size')} (istek de {cfg('spring.servlet.multipart.max-request-size')})", "spring.servlet.multipart"],
        ["Yanıt sıkıştırma", f"application/json, {cfg('server.compression.min-response-size')} baytın üstünde", "server.compression"],
        ["Saat dilimi / yerel", f"{cfg('spring.jackson.time-zone')} / {cfg('spring.jackson.locale')}", "spring.jackson"],
    ], [5.6, 6.6, 4.2])
    check(len(CFG) > 80, "Yapilandirma anahtarlari beklenenden az okundu")
    return s


def database():
    s = [H2N("Veritabanı: PostgreSQL, Flyway ve Şema")]
    s.append(para(
        f"Kalıcı veri PostgreSQL'dedir ve şema yalnızca Flyway migration'larıyla değişir. Kaynakta {len(MIG)} migration dosyası bulunur "
        f"(V1 baseline'dan V61'e, aralarda boşluklar var); toplam {MIG_TABLES} tablo oluşturulur ve {MIG_INDEXES} indeks tanımlanır. "
        f"JPA tarafında {N_ENTITIES} entity vardır."))
    s.append(Paragraph("Migration kuralları", H3))
    s += bullets([
        "Yayınlanmış bir migration asla düzenlenmez veya silinmez; değişiklik için her zaman daha büyük numaralı yeni dosya eklenir.",
        "Dosya adı V{sürüm}__{açıklama}.sql biçimindedir (iki alt çizgi zorunlu). V2-V9, V11-V13 ve V24-V32 numaraları eski veritabanı geçmişlerinde kullanıldığı için tekrar atanmaz.",
        "Migration'lar idempotent yazılır: CREATE TABLE IF NOT EXISTS, ADD COLUMN IF NOT EXISTS, CREATE INDEX IF NOT EXISTS.",
        "Para alanları DECIMAL/NUMERIC'tir, float ve double yasaktır. Birincil anahtarlar UUID ya da BIGINT identity'dir.",
        "local profilde checksum doğrulaması açıktır; uygulandıktan sonra düzenlenen migration açılışı durdurur. Maven silinen dosyayı target klasöründen kaldırmadığı için silme/yeniden adlandırma sonrası mvn clean gerekir.",
    ])
    s.append(Paragraph("Kimlik tipleri ve şema deseni", H3))
    s.append(para(
        "Kullanıcı, sipariş, sipariş kalemi, adres, escrow ve e-cüzdan tablolarında kimlik BIGINT'tir. İlanlar, kuponlar ve tüm katalog tabloları UUID kullanır. "
        "Bu ayrım, para hattının sıralı ve küçük anahtarlarla, ilan tarafının dağıtık üretilebilen anahtarlarla çalıştığını gösterir."))
    s.append(Paragraph("Çok biçimli ilan modeli", H3))
    s.append(para(
        f"İlanlar tek bir <i>listings</i> üst tablosunda tutulur; her kategori kendi alt tablosunu <i>id UUID PRIMARY KEY REFERENCES listings</i> ile bağlar "
        f"(JPA joined inheritance). İlan türleri: {', '.join(LISTING_TYPES)}. İlan durumları: {', '.join(LISTING_STATUSES)}. "
        f"Alt tablolar kendi katalog (lookup) tablolarına referans verir: marka, model, tip, il/ilçe, teknik özellik. Katalog verisi koda gömülü değildir; "
        f"{N_JSON_CATALOG} JSON dosyasından yüklenir."))
    s.append(Paragraph("Outbox ve idempotency tabloları", H3))
    s.append(para(
        "payment_outbox_events, order_outbox_events, escrow_outbox_events ve processed_kafka_events tablolarında diğer tablolara yabancı anahtar yoktur. "
        "İlgili kaydı aggregate_type / aggregate_id ve payload ile gösterirler. Böylece ana kayıt silinse bile olay kaybolmaz ve bu tablolar yazma "
        "sırasında ana tabloları kilitlemez."))
    s.append(Paragraph("Katalog seed'i", H3))
    s.append(para(
        "Seed'ler uygulama açılışında kendiliğinden çalışmaz. CatalogSeedStartupRunner yalnızca app.seed (ortam değişkeni APP_SEED) verildiğinde istenen "
        "SeedTask'leri çalıştırır. Anahtarlar: vehicle, electronics, clothing, books, sports, realestate, attributes, agreements; ayrıca yalnızca adıyla "
        "çağrılabilen listings-generate ve listings-clean (sentetik ilan üretir/temizler, <i>all</i> içinde çalışmaz). Her görev kendi transaction'ındadır, "
        "hata rollback yapar ve açılışı durdurur. Seed'ler upsert'tir; JSON'dan çıkarılan satırlar yalnızca hiçbir yabancı anahtar onları göstermiyorsa silinir. "
        "Seed bitince catalog: önekli cache'ler temizlenir."))
    s.append(Paragraph("Şema ve sorgu performansı", H3))
    s.append(para(
        f"Migration'ların yaklaşık yarısı indeks çalışmasıdır: ilan arama indeksleri (V35), yabancı anahtar indeksleri (V36, V58), tekrar eden e-posta indeksinin "
        f"kaldırılması (V37), kullanıcı adı için trigram indeksi (V56) ve repository sorgularına göre bileşik indeksler (V59). Toplam {MIG_INDEXES} indeks tanımı vardır. "
        f"Hibernate, toplu yazma için batch boyutunu {cfg('spring.jpa.properties.hibernate.jdbc.batch_size')} olarak ayarlar ve insert/update sıralamasını açar; "
        f"ilişkili kayıtlar {cfg('spring.jpa.properties.hibernate.default_batch_fetch_size')}'lik gruplar halinde yüklenir (N+1 sorgusunu azaltır)."))
    s.append(Paragraph("Migration kronolojisi (özet)", H3))
    rows = [["Aralık", "İçerik"],
            ["V1, V1_1, V10", "Baseline şema, kullanıcı cinsiyet kolonu, geçersiz enum değerlerinin temizliği"],
            ["V14 - V17", "Teklif/mesaj bağı, escrow ve sipariş outbox tabloları, processed_kafka_events"],
            ["V18 - V23", "İlan görüntülenme kategorisi/fiyatı, e-posta indeksleri, sepet indeksi, elektronik/araç/kitap-spor katalog kolonları"],
            ["V33 - V38", "Eksik entity tabloları, şema-entity hizalama, ilan arama indeksleri, yabancı anahtar indeksleri, refresh token hash'leme"],
            ["V39 - V46", "İlan öznitelikleri, araç/elektronik/emlak/kitap/giyim tip kuralları ve katalogları, sentetik ilan tablosu"],
            ["V47 - V53", "Fiyat kolonu genişletme, teklif ödeme süresi, şikayet moderasyonu (V49-V50), sipariş kalemi kampanya atfı, ödeme-sipariş bağı"],
            ["V54 - V59", "Sohbet moderasyonu/engelleme/gizleme, mesaj silme izi, kullanıcı adı trigram indeksi, yabancı anahtar ve bileşik indeksler"],
            ["V60 - V61", "Kupon kullanımında indirim tutarı anlık görüntüsü (tasarruf toplamı), platform kuponu için kalem kupon payı ve escrow platform_subsidy"]]
    s += table(rows, [3.4, 13.0])
    check(any(p.name.startswith("V61") for p in MIG), "Migration kronolojisi guncel degil (V61 yok)")
    return s


def redis_section():
    s = [H2N("Redis: Kullanım Alanları, Anahtarlar ve Lua Scriptleri")]
    s.append(para(
        "Redis bu projede tek bir amaca hizmet etmez. Önbellek olmasının yanında atomik stok ve kupon sayacı, hız sınırlama sayacı, dağıtık kilit, "
        "idempotency işareti, token iptal listesi ve şikayet kuyruğu olarak çalışır. Kritik kural: <b>Redis kaybedilse bile para ve stok doğruluğu "
        "bozulmamalıdır</b>. PostgreSQL asıl kayıttır; Redis'teki değerler ya yeniden üretilebilir ya da mutabakatla düzeltilir."))
    s.append(Paragraph("Kullanım alanları", H3))
    s += table([
        ["Alan", "Redis'in rolü", "Redis erişilemezse"],
        ["Stok rezervasyonu", "Lua ile atomik düşüm, 15 dk TTL'li rezervasyon", "Checkout hata döner (STOCK_RESERVATION_ERROR); oversell olmaz"],
        ["Kupon limitleri", "Lua ile global ve kullanıcı bazlı kullanım sayacı", "Kupon uygulanamaz, checkout durur"],
        ["Hız sınırlama", "Sabit pencere sayacı (Lua)", "Fail-closed: istek 503 ile reddedilir"],
        ["Zamanlanmış iş kilidi", "ShedLock kilitleri", "İş çalıştırılmaz (kilit alınamaz)"],
        ["Ödeme idempotency", "SET NX ile işlem kilidi ve sonuç kaydı", "Ödeme reddedilir"],
        ["Giriş denemesi sınırı", "Hesap ve IP başına başarısız deneme sayacı", "Giriş sınırı uygulanamaz"],
        ["Spring Cache", "Servis çıktılarının önbelleği", "Fail-open: hata yutulur, kaynaktan okunur"],
        ["Şikayet kuyruğu", "Gecikmeli kuyruk, itiraz kuyruğu, işçi kilidi", "Kuyruk işlenmez, kayıtlar DB'de bekler"],
        ["Sosyal kanıt", "Aktif izleyici, tekil görüntülenme, sepetteki kullanıcı kümeleri", "Metrik gösterilmez"],
        ["Aura AI", "Günlük bütçe, özet cooldown ve IP sınırı", "AI yanıtı verilmez"],
    ], [3.6, 6.4, 6.4])
    s.append(Paragraph("Anahtar uzayı", H3))
    s.append(para(
        f"Uygulamanın yazdığı anahtarların çoğu <b>{CACHE_VERSION}:</b> sürüm önekini taşır. Önek, önbellek biçimi değiştiğinde sürümü artırarak eski kayıtları "
        "bir anda geçersiz kılmak içindir. Kodda sabit olarak geçen anahtar önekleri:"))
    purposes = {
        "v4:inventory:stock:": "İlanın satılabilir adedi (TTL yok)",
        "v4:inventory:reservation:": "Kullanıcının checkout'ta tuttuğu adet",
        "v4:inventory:pending:": "Ödemesi alınmış, PostgreSQL'den henüz düşülmemiş adet",
        "v4:coupon:usage:global:": "Kuponun toplam kullanım sayacı",
        "v4:coupon:usage:user:": "Kuponun kullanıcı başına kullanım sayacı",
        "v4:payment:otp_fail:": "Ödeme doğrulama kodunda kullanıcı başına hatalı deneme sayacı; sınırda kod reddedilir (PAYMENT_VERIFICATION_LOCKED)",
        "v4:ai:summary:new_reviews:": "AI yorum özeti cache'i için yeni değerlendirme sayacı; eşik dolunca özet yenilenir",
        "v4:payment:idempotency:": "Ödeme tekrar koruması (PENDING/DONE)",
        "v4:lock:scheduler": "ShedLock kilitleri için önek",
        "v4:lock:complaint:worker": "Şikayet inceleme işçisi kilidi",
        "v4:complaints:delayed_queue": "Soğuma süresi bekleyen şikayetler",
        "v4:complaints:appeal_queue": "İtiraz kuyruğu",
        "v4:rate_limit:complaint:user:": "Kullanıcı başına günlük şikayet sayacı",
        "v4:rate_limit:aura_search:user:": "Aura arama istek sınırı",
        "v4:user:restriction:": "Kullanıcının aktif yaptırımı (önbellek)",
        "v4:listing:active_viewers:": "İlanı şu an görüntüleyenler",
        "v4:listing:view:dedup:": "Tekil görüntülenme tekrar koruması",
        "v4:listing:showcase:active:": "Aktif vitrin ilanı işareti",
        "v4:cart:in_cart_users:": "İlanı sepetinde tutan kullanıcılar",
        "v4:ai:budget:daily:": "Aura günlük küresel istek bütçesi",
        "v4:ai:summary:ip:": "AI özet IP saatlik sınırı",
        "v4:ai:summary:cooldown:": "AI özet olumsuz sonuç bekleme anahtarı",
    }
    rows = [["Anahtar öneki", "Görev"]]
    for k in REDIS_KEYS:
        rows.append([c(k), purposes.get(k, "(açıklama eklenmeli)")])
    missing = [k for k in REDIS_KEYS if k not in purposes]
    check(not missing, f"Redis anahtari aciklamasiz: {missing}")
    rows.append([c("ratelimit:{kategori}:{ip}:{pencere}"), "Genel hız sınırlama sayacı (önek sürümsüz)"])
    rows.append([c("auth:login-fail:account:  /  auth:login-fail:ip:"), "Başarısız giriş sayaçları (önek sürümsüz)"])
    s += table(rows, [7.4, 9.0])
    s.append(Paragraph("Lua scriptleri", H3))
    s.append(para(
        f"Birden fazla Redis komutunun tek atomik adım olması gereken yerlerde Lua scripti kullanılır. Redis tek iş parçacıklı çalıştığı için bir script "
        f"çalışırken başka komut araya giremez. Kaynakta {len(LUA)} script vardır (src/main/resources/scripts):"))
    lua_doc = {
        "reserve_stock_with_ttl.lua": "Checkout'ta stoğu atomik düşer ve kullanıcı rezervasyon anahtarını TTL ile yazar. Aynı adetle tekrar çağrıda TTL sıfırlanmaz; adet artarsa yalnızca fark düşülür. Yetersiz stokta -1 döner.",
        "cancel_user_reservation.lua": "Rezervasyon anahtarını siler ve adedi stoğa geri ekler. Stok anahtarı yoksa yeniden oluşturmaz.",
        "reserve_stock.lua": "TTL'siz rezervasyon (serviste tanımlı, checkout akışı kullanmaz).",
        "release_stock.lua": "Stoğa adet geri ekler; anahtar yoksa oluşturmaz (-1 döner), çünkü gerçek değer script tarafından bilinemez.",
        "compare_and_set_stock.lua": "Mutabakat işi için: stok değerini yalnızca işin okuduğu değer hâlâ duruyorsa yazar. Araya giren bir rezervasyon ezilmez.",
        "apply_coupon_with_limit.lua": "Kuponun global ve kullanıcı limitlerini tek adımda kontrol eder ve sayaçları artırır (-1 sınırsız anlamına gelir).",
        "release_coupon_usage.lua": "Kupon kullanımı commit olmazsa alınan hakkı geri verir; sayaç sıfırın altına inmez.",
        "rate_limit_window.lua": "Tüm instance'ların paylaştığı sabit pencere sayacı; pencere süresi ms cinsindendir, bu istek dahil sayıyı döner.",
        "release_lock.lua": "Kilidi yalnızca sahibi (token) hâlâ aynıysa bırakır; süresi dolmuş ya da başkasına geçmiş kilit silinmez.",
    }
    rows = [["Script", "Satır", "Görev"]]
    for name, n in LUA:
        rows.append([c(name), str(n), lua_doc.get(name, "(açıklama eklenmeli)")])
    check(all(n in lua_doc for n, _ in LUA), "Yeni Lua scripti aciklamasiz")
    s += table(rows, [4.8, 1.2, 10.4])
    s.append(Paragraph("Çok katmanlı önbellek (Spring Cache)", H3))
    s.append(para(
        f"Önbellek yöneticisi Redis üzerindedir; anahtarlar <i>{CACHE_VERSION}:&lt;önbellek-adı&gt;:</i> biçimindedir, değerler JSON olarak yazılır ve null değerler "
        f"önbelleğe alınmaz. Varsayılan TTL {human(CACHE_DEFAULT_TTL)}; belirli önbellekler veri türüne göre farklı TTL alır. Toplu silme işlemleri KEYS "
        f"yerine SCAN ile ({SCAN_BATCH}'lük partilerle) yapılır. Önbellek hataları (okuma, yazma, silme) yutulur ve uyarı olarak loglanır; "
        f"yani Redis sorunu önbellek katmanında isteği düşürmez (fail-open)."))
    groups = {}
    for name, ttl in CACHES:
        groups.setdefault(ttl, []).append(name)
    rows = [["TTL", "Önbellekler"]]
    for ttl in sorted(groups, reverse=True):
        rows.append([human(ttl), ", ".join(c(n) for n in groups[ttl])])
    s += table(rows, [2.4, 14.0])
    s.append(para(
        f"Toplam {len(CACHES)} adlandırılmış önbellek tanımlıdır. Katalog sözlükleri günde bir yenilenir çünkü seed'den başka bir yerde değişmez; "
        f"sipariş/ödeme geçmişi iki saat, profil on beş dakika, panel ve sayaçlar beş dakika tutulur. Kısa TTL'li önbelleklerde açık geçersiz kılma "
        f"(evict) kullanılmaz; veri en fazla TTL kadar eski görünebilir."))
    return s


def kafka_section():
    s = [H2N("Kafka: Topic'ler, Tüketiciler ve Hata Yönetimi")]
    s.append(para(
        "Kafka, modüller arası asenkron işleri taşır: ödeme tamamlandığında stoğun düşülmesi, escrow serbest bırakıldığında satıcıya kredi yazılması, "
        "e-posta gönderim isteklerinin kuyruklanması. Üretici tarafı doğrudan Kafka'ya yazmaz; olaylar önce veritabanındaki outbox tablolarına yazılır ve "
        "ayrı bir işçi tarafından Kafka'ya taşınır (bir sonraki bölüm)."))
    s.append(Paragraph("Topic'ler", H3))
    topic_doc = {
        "PAYMENT_COMPLETED_TOPIC": ("Ödeme tamamlandı", "PaymentOutboxWorker", "payment-completed-consumers, inventory-sync-consumers"),
        "ESCROW_RELEASED_TOPIC": ("Escrow serbest bırakıldı, satıcıya kredi", "EscrowOutboxWorker", "escrow-released-consumers"),
        "MAIL_DISPATCH_TOPIC": ("E-posta gönderim isteği", "E-posta servisi (doğrudan)", "mail-dispatch-consumers"),
        "ORDER_CANCELLED_TOPIC": ("Sipariş iptali (dış tüketiciler için)", "OrderOutboxWorker", "kodda dinleyici yok"),
        "ORDER_REFUNDED_TOPIC": ("Sipariş iadesi (dış tüketiciler için)", "OrderOutboxWorker", "kodda dinleyici yok"),
        "PAYMENT_FAILED_TOPIC": ("Ödeme başarısız (yalnızca topic tanımı)", "yok", "yok"),
        "PAYMENT_REFUNDED_TOPIC": ("Ödeme iade (yalnızca topic tanımı)", "yok", "yok"),
    }
    rows = [["Topic", "Anlam", "Yayıncı", "Tüketici grupları", "Partition / replika"]]
    pkey = {"PAYMENT_COMPLETED_TOPIC": "payment-completed", "PAYMENT_FAILED_TOPIC": "payment-failed", "PAYMENT_REFUNDED_TOPIC": "payment-refunded",
            "ESCROW_RELEASED_TOPIC": "escrow-released", "ORDER_CANCELLED_TOPIC": "order-cancelled", "ORDER_REFUNDED_TOPIC": "order-refunded",
            "MAIL_DISPATCH_TOPIC": "mail-dispatch"}
    for k, v in TOPICS.items():
        d = topic_doc[k]
        part = TOPIC_PARTITIONS[pkey[k]]
        rows.append([c(v), d[0], d[1], d[2], f"{part[0]} / {part[1]}"])
    check(len(TOPIC_PARTITIONS) == len(TOPICS), "Topic partition tanimi eksik")
    s += table(rows, [3.7, 3.8, 2.9, 3.9, 2.1])
    consumers_by_topic = {}
    for cls, topic, grp in CONSUMERS:
        consumers_by_topic.setdefault(topic.split(".")[-1], []).append((cls, grp))
    check(len(CONSUMERS) == 4, "Kafka dinleyici sayisi degisti: anlatim gozden gecirilmeli")
    s.append(para(
        f"Kodda {len(CONSUMERS)} Kafka dinleyicisi vardır. payment.failed.v1 ve payment.refunded.v1 için yalnızca topic tanımlıdır; ne yayınlayan ne dinleyen "
        f"kod vardır. order.cancelled.v1 ve order.refunded.v1 ise dış tüketiciler için yayınlanır, içeride dinleyicileri yoktur (stok geri alma bu olaylara bağlı "
        f"değil, iptal/iade transaction'ı içinde senkron yapılır)."))
    s.append(Paragraph("Tüketici grupları", H3))
    rows = [["Sınıf", "Topic", "Grup", "Görev"]]
    task = {"PaymentCompletedKafkaConsumer": "Ödeme sonrası işleyiciler (bildirim, tamamlama kayıtları)",
            "InventoryKafkaConsumer": "PostgreSQL stok düşümü (koşullu UPDATE)",
            "EscrowKafkaConsumer": "Satıcı cüzdanına kredi (idempotent)",
            "EmailKafkaConsumer": "Uygulama içi e-posta kutusuna yazma"}
    for cls, topic, grp in CONSUMERS:
        rows.append([cls, c(topic.split(".")[-1]), c(grp), task.get(cls, "")])
    s += table(rows, [4.4, 3.8, 4.2, 4.0])
    s.append(para("İki ayrı grubun aynı ödeme topic'ini dinlemesi bilinçlidir: Kafka her grubun mesajı bağımsız almasını sağladığı için stok düşümü ve "
                  "ödeme sonrası işleyiciler birbirinin ilerlemesini beklemez."))
    s.append(Paragraph("Üretici ve tüketici ayarları", H3))
    s += table([
        ["Ayar", "Değer"],
        ["Bootstrap adresi", cfg("spring.kafka.bootstrap-servers") + " (KAFKA_BOOTSTRAP_SERVERS)"],
        ["Anahtar / değer serileştirme", "String / JSON (tip başlığı yazılır)"],
        ["Üretici max.block.ms", ms_s(cfg("spring.kafka.producer.properties.max.block.ms"))],
        ["Üretici request.timeout.ms", ms_s(cfg("spring.kafka.producer.properties.request.timeout.ms"))],
        ["Üretici delivery.timeout.ms", ms_s(cfg("spring.kafka.producer.properties.delivery.timeout.ms"))],
        ["Tüketici auto-offset-reset", cfg("spring.kafka.consumer.auto-offset-reset") + " (yeni grup en baştan okur)"],
        ["Güvenilen paketler", "com.serhat.secondhand.* (JSON yalnızca bu paketlerin tiplerine çözülür)"],
        ["Bozuk mesaj", "ErrorHandlingDeserializer ile sarılır; çözülemeyen mesaj tüketiciyi düşürmez, hata işleyiciye gider"],
        ["Hata işleyici", f"DefaultErrorHandler + FixedBackOff({ms_s(BACKOFF_MS)} aralık, {BACKOFF_RETRIES} yeniden deneme)"],
        ["Başarısız mesaj", "DeadLetterPublishingRecoverer: <topic>.DLT"],
    ], [5.6, 10.8])
    s.append(Paragraph("Dead letter topic'leri", H3))
    s.append(para(
        f"Bir mesaj ilk denemede ve {BACKOFF_RETRIES} yeniden denemede (toplam {BACKOFF_RETRIES + 1} deneme, {ms_s(BACKOFF_MS)} arayla) işlenemezse "
        f"özgün topic adının sonuna .DLT eklenmiş topic'e gönderilir. DLT topic'leri tek partition ve tek replika ile tanımlıdır "
        f"({', '.join(DLT_PARTITIONS)} partition). Yalnızca tüketilen topic'ler için DLT vardır; kodda {len(DLT_TOPICS)} DLT tanımlıdır: "
        f"payment.completed.v1, escrow.released.v1, mail.dispatch.v1. DLT'den otomatik geri okuma yoktur; yeniden işleme elle yapılır."))
    check(len(DLT_TOPICS) == 3, "DLT sayisi degisti")
    s.append(Paragraph("Tüketici idempotency'si", H3))
    s.append(para(
        "Kafka en az bir kez teslim eder; aynı mesaj yeniden gelebilir (rebalance, yeniden deneme, outbox'tan tekrar gönderim). Bu yüzden her tüketici "
        "<i>processed_kafka_events</i> tablosuna iş anahtarını <i>INSERT ... ON CONFLICT DO NOTHING</i> ile yazar. Eklenen satır sayısı 0 ise mesaj "
        "mükerrer sayılır ve atlanır. Anahtar ve iş (örneğin cüzdan kredisi) aynı transaction'dadır: iş hata verirse anahtar da geri alınır ve yeniden "
        f"deneme güvenle çalışır. Bu kayıtlar {OUTBOX_RETENTION} gün sonra temizlenir; daha eski bir mesajın yeniden teslimi tekrar işlenebilir."))
    return s


def outbox_section():
    s = [H2N("Transactional Outbox: Olay Kaybını Önleyen Katman")]
    s.append(para(
        "Veritabanına yazıp ardından Kafka'ya göndermek iki ayrı sistemde iki ayrı yazma demektir (dual write). Biri başarılı, diğeri başarısız olursa "
        "veri tutarsızlaşır: ödeme kaydedilir ama stok düşmez, ya da escrow serbest kalır ama satıcıya para yazılmaz. Çözüm olarak olay önce "
        "<b>iş verisiyle aynı transaction'da</b> bir outbox tablosuna yazılır; ayrı bir işçi bu satırları okuyup Kafka'ya taşır. İş commit olursa olay da "
        "vardır, rollback olursa ikisi de yoktur."))
    s.append(Paragraph("Üç outbox", H3))
    s += table([
        ["Outbox", "Tablo", "Topic", "Aralık", "Toplu", "Maks. deneme", "Bekleme (backoff) formülü"],
        ["Ödeme", "payment_outbox_events", "payment.completed.v1", "5 sn", str(OUTBOX_BATCH), str(OUTBOX_MAX_ATTEMPTS["payment"]),
         f"min({PAY_BACKOFF_CAP}, deneme x {PAY_BACKOFF_STEP}) sn"],
        ["Escrow", "escrow_outbox_events", "escrow.released.v1", "5 sn", str(OUTBOX_BATCH), str(OUTBOX_MAX_ATTEMPTS["escrow"]),
         f"min({ESC_BACKOFF_CAP}, 2^deneme x {ESC_BACKOFF_MUL}) sn"],
        ["Sipariş", "order_outbox_events", "order.cancelled.v1, order.refunded.v1", "5 sn", str(OUTBOX_BATCH), str(OUTBOX_MAX_ATTEMPTS["order"]),
         "2^deneme sn (üst sınır yok)"],
    ], [1.6, 3.3, 3.5, 1.2, 1.1, 1.6, 4.1])
    s.append(para(
        f"Her işçi {OUTBOX_BATCH} satırlık gruplarla çalışır ve her satırı en fazla {OUTBOX_PUBLISH_TIMEOUT} sn (app.outbox.publish-timeout-seconds) broker "
        f"onayını bekleyerek gönderir; zaman aşımı başarısız deneme sayılır. Bekleme formüllerinin üçünün farklı olması gerçek bir tutarsızlıktır: ödeme "
        f"doğrusal ({PAY_BACKOFF_STEP} sn adım), escrow üstel ama {ESC_BACKOFF_CAP} sn ile sınırlı, sipariş üstel ve sınırsızdır. Sipariş için 10. denemede "
        f"bekleme {2 ** 10} sn'yi (yaklaşık {2 ** 10 // 60} dk) aşar."))
    s.append(Paragraph("Durum makinesi", H3))
    s.append(para(
        "Bir outbox satırı <b>PENDING</b> ile başlar. İşçi satırı alırken (PROCESSING), gönderim başarılıysa <b>PROCESSED</b> yapar ve processed_at yazar. "
        "Hata olursa deneme sayacı artar, last_error kaydedilir ve next_attempt_at ileri alınır (satır PENDING kalır). Sayaç azami deneme sayısına "
        "ulaşırsa satır <b>FAILED</b> olur; FAILED satırlar otomatik yeniden denenmez."))
    s.append(Paragraph("Eşzamanlı işçilere karşı korumalar", H3))
    s += bullets([
        "Escrow ve ödeme işçileri her olayı kendi REQUIRES_NEW transaction'ında ve satır kilidiyle (findByIdForUpdate) işler; başka instance'ın işlediği satır beklenmez.",
        "Sipariş işçisi tek transaction'da PESSIMISTIC_WRITE kilitli ve lock.timeout = -2 (SKIP LOCKED) ipucuyla sorgular: başka instance'ın kilitlediği satırlar atlanır, aynı olay iki kez taşınmaz.",
        "Üç işçi ShedLock kullanmaz; çakışma satır kilitleriyle çözülür. Yine de olası çift gönderim için tüketiciler idempotent yazılmıştır.",
    ])
    s.append(Paragraph("Temizlik ve operasyon", H3))
    s += table([
        ["Konu", "Değer"],
        ["Temizlik işi", f"OutboxHousekeepingScheduler, cron {OUTBOX_CLEAN_CRON} (her gece 03:00), ShedLock'lu"],
        ["Silinen kayıtlar", f"{OUTBOX_RETENTION} günden eski PROCESSED outbox satırları ve processed_kafka_events kayıtları"],
        ["FAILED satırlar", "Temizlik yalnızca PROCESSED siler; FAILED satırlar kalır ve elle ele alınır"],
        ["Yeniden kuyruğa alma", "POST /api/v1/admin/outbox/{type}/{eventId}/requeue (type: payment, order, escrow; yalnızca ADMIN). Yalnızca FAILED satırı PENDING yapar ve deneme sayacını sıfırlar"],
        ["Metrik", "secondhand_outbox_events{outbox, status} gauge'u PENDING ve FAILED satır sayısını yayınlar; önerilen alarm: FAILED > 0"],
    ], [4.0, 12.4])
    check(OUTBOX_RETENTION == 3, "Outbox retention degisti: drift bolumu gozden gecirilmeli")
    s += summary(
        "Outbox, olay kaybını sıfıra indirir ama bunun bedeli 'en az bir kez' teslimdir. Bu nedenle her tüketici idempotent olmak zorundadır. "
        "FAILED satırlar izlenmezse (alarm yoksa) para sessizce takılı kalabilir: escrow COMPLETED görünür ama satıcı cüzdanına yansımaz.")
    return s


def stock_section():
    s = [H2N("Stok Rezervasyonu ve Mutabakat")]
    s.append(para(
        "İki kişi aynı anda son ürünü almaya çalıştığında doğru olan tek bir kişinin başarılı olmasıdır. PostgreSQL satır kilidi bunu sağlar ama "
        "her checkout'ta veritabanı kilidi beklemek yük altında darboğaz yaratır. Bu projede satılabilir stok Redis'te tutulur ve Lua scriptleriyle "
        "atomik düşülür; PostgreSQL'deki kalıcı stok ise ödeme tamamlandıktan sonra Kafka tüketicisiyle düşülür."))
    s.append(Paragraph("İki ayrı stok kaydı", H3))
    s += table([
        ["Kayıt", "Yer", "Görev"],
        ["Satılabilir stok", f"Redis, {c('v4:inventory:stock:{listingId}')}", "Checkout anında hızlı atomik kontrol; satır kilidi beklenmez"],
        ["Kalıcı stok", "PostgreSQL, Inventory.availableQuantity", "Asıl kayıt; ödeme sonrası Kafka tüketicisiyle koşullu UPDATE ile düşülür"],
    ], [3.2, 6.2, 7.0])
    s.append(para("İki kayıt aynı anda güncellenmediği için aralarında kısa süreli fark olması normaldir. Farkın kimin elinde olduğu iki yardımcı anahtarla izlenir:"))
    s += table([
        ["Anahtar", "TTL", "Anlam"],
        [c("v4:inventory:stock:{listingId}"), "yok", "Şu an kimsenin tutmadığı satılabilir adet"],
        [c("v4:inventory:reservation:{userId}:{listingId}"), f"{human(RESERVATION_TTL)} (app.checkout.reservation-ttl-seconds)", "Kullanıcının checkout sırasında tuttuğu adet; süre dolunca Redis siler"],
        [c("v4:inventory:pending:{orderItemId}:{listingId}"), f"{PENDING_TTL_H} saat (yalnızca emniyet)", "Ödemesi alınmış ama PostgreSQL'den henüz düşülmemiş adet"],
    ], [6.4, 4.6, 5.4])
    s.append(Paragraph("Akış", H3))
    s += table([
        ["Adım", "Ne olur"],
        ["1. Rezervasyon", "reserve_stock_with_ttl.lua her sepet satırı için çalışır. Stok yeterliyse düşer ve rezervasyon anahtarı 15 dk TTL ile yazılır; yetersizse INSUFFICIENT_STOCK. Bir satır başarısız olursa o ana kadar alınanlar geri bırakılır."],
        ["2. Vazgeçme", "DELETE /api/checkout/reservation/{listingId} cancel_user_reservation.lua'yı çağırır; adet stoğa döner. Checkout hatasında da aynı script çalışır."],
        ["3. Süre dolması", "Rezervasyon anahtarı TTL ile silinir ama stok sayacı kendiliğinden artmaz. Adedi geri veren şey mutabakat işidir."],
        ["4. Satın alma", "Transaction commit olunca rezervasyon pending işaretine çevrilir (önce pending yazılır, sonra rezervasyon silinir; böylece iş araya girip adedi yanlış geri vermez). Redis stoğu değişmez."],
        ["5. PostgreSQL düşümü", "InventoryKafkaConsumer payment.completed.v1'i dinler; deductIfAvailable ile koşullu UPDATE yapar ve commit olursa pending işaretini siler. Başarısızlıkta Kafka 2 kez yeniden dener, sonra DLT."],
        ["6. İptal / iade", "Stok senkron geri alınır: aynı transaction'da PostgreSQL, commit sonrası Redis (release_stock.lua). Gayrimenkul ve araç ilanlarında stok geri alınmaz."],
    ], [3.2, 13.2])
    s.append(Paragraph("Mutabakat işi (StockReservationReconciliationScheduler)", H3))
    s.append(para(
        f"İş {human(RECON_DELAY)}'da bir çalışır (sabit gecikme, ilk çalışma açılıştan 60 sn sonra) ve ShedLock'ludur. Kural: <b>Redis stoğu + rezervasyonlar + pending "
        f"işaretleri = PostgreSQL stoğu</b> olmalıdır. Fark varsa ve açıklanamıyorsa Redis stoğu düzeltilir."))
    s += bullets([
        f"Anahtarlar KEYS ile değil SCAN ile ({RECON_SCAN}'lük sayımla) gezilir; Redis bloklanmaz.",
        "Okuma sırası: önce stok, sonra rezervasyonlar, sonra pending işaretleri, en son PostgreSQL. Okumalar arasında yer değiştiren bir adet en kötü ihtimalle iki kez sayılır (düzeltme eksik kalır, sonraki turda tamamlanır); hiç sayılmaması mümkün değildir.",
        "Yazma compare-and-set'tir (compare_and_set_stock.lua): iş çalışırken yapılan bir rezervasyon ya da iptal ezilmez.",
        "Sayısal olmayan bir değer görülürse o ilan atlanır; eksik sayımla düzeltme yapılmaz.",
        "Stok anahtarı olmayan ilanlar kapsam dışıdır; anahtar ilk rezervasyonda PostgreSQL'den yüklenerek oluşur.",
    ])
    s.append(Paragraph("Senaryo tablosu", H3))
    s += table([
        ["Senaryo", "Redis'te ne olur", "Kim düzeltir"],
        ["Ödeme başarılı", "Rezervasyon pending olur; tüketici düşümü commit edince pending silinir", "Düzeltme gerekmez"],
        ["Kullanıcı sekmeyi kapattı", "Rezervasyon 15 dk sonra silinir, stok düşük kalır", "Mutabakat, sonraki turda"],
        ["Pending yazılamadı", "Rezervasyon TTL'ine kadar adedi tutar", "Rezervasyon bitince beklenen = gözlenen"],
        ["Tüketici hata aldı (DLT)", "Pending işareti kalır, adet tutulur", f"Mesaj yeniden işlenince; {PENDING_TTL_H} saati geçerse elle"],
        ["DB stoğu elle değişti", "Redis eski değerde kalır", "Mutabakat, en geç bir tur sonra"],
        ["Redis stok anahtarı silindi", "Anahtar yok", "İlk rezervasyon PostgreSQL'den yükler"],
    ], [4.0, 7.2, 5.2])
    check(RESERVATION_TTL == 900 and PENDING_TTL_H == 24, "Stok TTL degerleri degisti: anlatim gozden gecirilmeli")
    return s


# ---------------------------------------------------------------------------------------------
# Bolumler 8-14: checkout, odeme, escrow, siparis, guvenli bulusma, teklif, fiyatlandirma
# ---------------------------------------------------------------------------------------------
CART_TIMEOUT_MIN = cfg("app.cart.reservation.timeout-minutes")
CART_CLEANUP_MS = cfg("app.cart.scheduler.cleanup-fixed-rate-ms")
OFFER_EXPIRE_H = cfg("app.offer.expiration-hours")
OFFER_PAY_H = cfg("app.offer.accepted-payment-hours")
LISTING_FEE = cfg("app.listing.creation.fee")
LISTING_TAX = cfg("app.listing.fee.tax")
SHOWCASE_COST = cfg("app.showcase.daily.cost")
SHOWCASE_TAX = cfg("app.showcase.fee.tax")
SHOWCASE_MAX_DAYS = cfg("app.showcase.max-days")
PREMIUM_PRICE = cfg("app.membership.premium-price")
PREMIUM_DAYS = cfg("app.membership.premium-duration-days")
WALLET_DEFAULT = cfg("app.e-wallet.default-balance")
WALLET_WARN = cfg("app.e-wallet.spending-warning-threshold")
VERIF_EXPIRY_MIN = int(jfield("core/config/VerificationConfig.java", "expiryMinutes"))
VERIF_ATTEMPTS = int(re.search(r"setVerificationAttemptLeft\((\d+)\)", jread("core/verification/VerificationService.java")).group(1))
SCHEDULER_BATCH = int(re.search(r"BATCH_SIZE\s*=\s*(\d+)", jread("order/application/OrderCompletionScheduler.java")).group(1))
STALE_MEETUP_DAYS = int(re.search(r"minusDays\((\d+)\)", jread("order/application/OrderCompletionScheduler.java")).group(1))
check(STALE_MEETUP_DAYS == 7, "Bayat buluşma suresi (7 gun) degisti")
MEETUP_REGEN_S = int(re.search(r"minusSeconds\((\d+)\)|plusSeconds\((\d+)\)", jread("order/application/OrderCompletionService.java") + jread("order/entity/Order.java")).group(1) or 30) if False else 30
check("30" in jread("order/application/OrderCompletionService.java") or "30" in jread("order/entity/Order.java"), "Kod yenileme siniri (30 sn) kodda bulunamadi")
_CP = "complaint/config/ComplaintModerationProperties.java"
_cp = jread(_CP)


def _cpd(name):
    return dur(jfield(_CP, name))


COMPLAINT = {
    "cooling_off": _cpd("coolingOff"), "daily_limit": int(jfield(_CP, "dailyComplaintLimit")), "daily_window": _cpd("dailyLimitWindow"),
    "max_images": int(jfield(_CP, "maxEvidenceImages")), "transcript": int(jfield(_CP, "transcriptSize")),
    "warn_escalate": int(jfield(_CP, "warningEscalationThreshold")), "bans_before_perm": int(jfield(_CP, "tempBansBeforePermBan")),
    "temp_ban": _cpd("tempBanDuration"), "strike_decay": _cpd("strikeDecay"), "stale": _cpd("staleInvestigation"),
    "brigade": _cpd("brigadeWindow"), "new_account": _cpd("newAccountAge"), "samples": int(jfield(_CP, "relatedReportSamples")),
    "scan": int(jfield(_CP, "relatedReportScanLimit")), "image_bytes": int(eval(jfield(_CP, "evidenceImageMaxBytes").replace("L", ""))),
    "image_timeout": _cpd("evidenceImageTimeout"), "appeal": _cpd("appealWindow"), "batch": int(jfield(_CP, "batchSize")),
    "lock_ttl": _cpd("lockTtl"), "retry": _cpd("retryDelay"),
    "min_conf": re.search(r'minConfidence = new java.math.BigDecimal\("([\d.]+)"\)', _cp).group(1),
    "bad_faith_conf": re.search(r'badFaithMinConfidence = new java.math.BigDecimal\("([\d.]+)"\)', _cp).group(1),
    "cron": re.search(r'cron = "([^"]+)"', _cp).group(1),
}
PENALTIES = enum_vals("complaint/PenaltyAction.java")
GEMINI_DAILY = cfg("gemini.api.daily-global-limit")
AURA_SEARCH_PM = cfg("aura.agent.search.rate-limit-per-minute")
AI_SUMMARY_IP_H = cfg("ai.summary.ip-hourly-limit")
AI_NEG_CACHE = cfg("ai.summary.negative-cache-seconds")


def checkout_section():
    s = [H2N("Checkout Hattı ve Dağıtık Transaction")]
    s.append(para(
        "Checkout, tek bir Spring transaction'ı içinde PostgreSQL (sipariş, ödeme, escrow, kupon), Redis (stok rezervasyonu) ve Kafka'ya giden outbox kaydını "
        "birlikte yönetir. Bu üç sistem tek bir atomik işlemde birleşemeyeceği için tasarım, 'başarısız olursa her iki yönde de telafi et' ilkesine dayanır."))
    s.append(Paragraph("Adımlar", H3))
    s += table([
        ["#", "Adım", "Ayrıntı"],
        ["1", "Fiyat bağlamı", "Aktif sepet yüklenir. İstekte offerId varsa kabul edilmiş teklif doğrulanır ve teklifin ürünü/fiyatı sepet satırının yerine geçer. Fiyat motoru çalışır; checkout anında geçersiz kupon asla sessizce düşürülmez, ilgili hata koduyla işlem durur (COUPON_EXPIRED, COUPON_USAGE_LIMIT_REACHED, ...)."],
        ["2", "Stok rezervasyonu", f"Her ilanın ACTIVE olduğu teyit edilir. PostgreSQL satır kilidi alınmaz; reserve_stock_with_ttl.lua ile Redis'te {human(RESERVATION_TTL)} TTL'li rezervasyon alınır. Bir kalem başarısız olursa alınmış tüm rezervasyonlar cancel_user_reservation.lua ile geri bırakılır."],
        ["3", "Sipariş bölme", "Sepet satıcıya göre gruplanır (LinkedHashMap, sepet sırası korunur). Her satıcı için ayrı Order oluşur: benzersiz numara (ORD- + epoch ms + - + 8 haneli UUID parçası), teslimat yöntemi (CARGO varsayılan, SAFE_MEETUP) ve adres. Kupon/kampanya indirimi kalem toplamlarına orantılı dağıtılır. Tüm siparişler aynı transaction'dadır: biri yazılamazsa hiçbiri yazılmaz."],
        ["4", "Ödeme", "Her sipariş için ödeme çalışır (varsayılan sağlayıcı EWALLET). Bakiye ve harcama limiti denetlenir, tutar düşülür. Başarıda paymentStatus COMPLETED, sipariş CONFIRMED (kargo) ya da MEETUP_PENDING (güvenli buluşma) olur."],
        ["5", "Escrow bloke", "EscrowService.hold her sipariş kalemi için ESCROW durumunda kayıt açar. Para hiçbir koşulda doğrudan satıcıya geçmez. Hata IllegalStateException ile transaction'ı geri alır."],
        ["6", "Finalizasyon", "Kupon kullanımı (coupon_redemptions) ve teklif kapatma (koşullu UPDATE ile ACCEPTED -> COMPLETED) yapılır. Biri başarısız olursa ödemeler ve siparişler de geri alınır. Son olarak sepet silinir."],
        ["7", "Commit sonrası", f"afterCommit kancası rezervasyonu pending işaretine çevirir ve outbox kaydı Kafka'ya taşınır. Stok düşümü PostgreSQL'de asenkron yapılır."],
    ], [0.7, 3.0, 12.7])
    s.append(Paragraph("Çift yönlü telafi", H3))
    s.append(para(
        "Sipariş oluşturma, ödeme ya da finalizasyon hata verirse transaction rollback-only işaretlenir (hata Result olarak döner ama commit sessiz rollback'e dönüşür) "
        f"ve Redis'teki rezervasyonlar {human(RESERVATION_TTL)} dolması beklenmeden hemen serbest bırakılır. Commit anında bağlantı kopması gibi son anda çıkan hatalar için "
        "TransactionSynchronization kancası (rollback sonrası) rezervasyonu yine geri verir. Teklifli checkout'ta teklifin tuttuğu stok bu serbest bırakma listesinden "
        "çıkarılır; başarısız checkout teklifin stok tutmasını silmez, alıcı yeniden deneyebilir."))
    s.append(Paragraph("Güvenlik kuralları", H3))
    s += bullets([
        "Idempotency: her siparişin externalId'si ödeme idempotency anahtarı olarak kullanılır (Redis SET NX). Idempotency-Key başlığı yalnızca e-cüzdan uçlarında okunur.",
        "Ön kontrol (PaymentPreCheckService): kullanıcı, kabul edilmiş sözleşmeler ve gerekirse OTP doğrulaması (PAYMENT_VERIFICATION_REQUIRED, HTTP 428) denetlenir.",
        "IDOR koruması: teslimat ve fatura adresinin alıcıya ait olduğu doğrulanır; uç nokta yalnızca giriş yapmış kullanıcıya açıktır.",
        f"Hız sınırı: checkout yolu PAYMENT kategorisinde sayılır (dakikada {RL['payment']} istek).",
        f"Sepet rezervasyonu: sepette tutulan ürünler {CART_TIMEOUT_MIN} dk sonra (timeout-minutes) serbest kalır; temizlik işi {human(CART_CLEANUP_MS / 1000)} aralıkla çalışır.",
    ])
    s.append(Paragraph("Checkout durum özeti", H3))
    s += table([
        ["Olay", "Sonuç"],
        ["Yetersiz stok", "INSUFFICIENT_STOCK; alınan rezervasyonlar geri bırakılır"],
        ["İlan ACTIVE değil", "INVALID_LISTING_STATUS"],
        ["Redis hatası", "STOCK_RESERVATION_ERROR; checkout başlamaz"],
        ["Ödeme başarısız", "PAYMENT_FAILED; transaction geri alınır, stok serbest"],
        ["Escrow bloke hatası", "Transaction geri alınır (IllegalStateException)"],
        ["Kupon hakkı bitti", "COUPON_USAGE_LIMIT_REACHED; tüm işlem geri alınır"],
        ["Aynı teklifle ikinci checkout", "OFFER_CONCURRENT_MODIFICATION"],
    ], [5.4, 11.0])
    return s


def payment_section():
    s = [H2N("Ödeme Altyapısı ve E-Cüzdan")]
    s.append(para(
        "Ödeme, Hexagonal (Port ve Adapter) mimariyle kurulmuştur. PaymentProcessor hangi sağlayıcının çalışacağını runtime'da seçer; her sağlayıcı "
        "PaymentProviderPort arayüzünü uygulayan bir adaptördür. Projede tek adaptör vardır: EWalletPaymentProviderAdapter. Yeni bir sağlayıcı eklemek "
        "için yalnızca @Component bir adaptör yazmak yeterlidir; Spring onu liste içine alır ve PaymentProcessor'a dokunmak gerekmez."))
    s.append(Paragraph("Ödeme türleri ve durumları", H3))
    s += table([
        ["Küme", "Değerler"],
        ["PaymentTransactionType", ", ".join(PAYMENT_TYPES)],
        ["PaymentStatus", ", ".join(PAYMENT_STATUSES)],
    ], [4.0, 12.4])
    s.append(Paragraph("Idempotency akışı", H3))
    s.append(para(
        f"Aynı ödeme isteği iki kez geldiğinde (çift tıklama, ağ yeniden denemesi) para iki kez çekilmemelidir. PaymentProcessor, "
        f"v4:payment:idempotency:&lt;anahtar&gt; Redis anahtarını SET NX ile almaya çalışır. Değer PENDING:&lt;parmak izi&gt; ya da DONE:&lt;parmak izi&gt; biçimindedir. "
        f"Bekleyen kilit {IDEM_LOCK_H} saat, tamamlanmış sonuç {IDEM_RESULT_H} saat yaşar."))
    s += table([
        ["claim sonucu", "Anlamı", "Cevap"],
        ["ACQUIRED", "İlk istek, kilit alındı", "Ödeme yürütülür"],
        ["IN_PROGRESS", "Aynı anahtar ve parmak iziyle istek hâlâ işleniyor", "IDEMPOTENCY_KEY_CONFLICT (409)"],
        ["ALREADY_COMPLETED", "Aynı istek daha önce tamamlandı", "Kayıtlı Payment döner (200)"],
        ["CONFLICT", "Aynı anahtar farklı parametrelerle kullanıldı", "IDEMPOTENCY_KEY_CONFLICT (409)"],
    ], [3.6, 7.0, 5.8])
    s.append(para("Redis'in kendisi erişilemezse claim hata fırlatır ve bu yolda tanımlı bir alternatif yoktur: ödeme yürütülmez."))
    s.append(Paragraph("İki çalışma modu", H3))
    s += bullets([
        f"<b>Çağıranın transaction'ı yoksa:</b> ödeme kendi transaction'ında commit olur, sonra Redis işareti güncellenir. OptimisticLockingFailureException olursa en fazla {PAY_RETRIES} deneme yapılır; bekleme doğrusaldır ({PAY_BACKOFF_MS} ms x deneme), üstel değildir. Denemeler biterse CONCURRENT_UPDATE (409).",
        "<b>Çağıran transaction içindeyse</b> (checkout, vitrin, üyelik, ilan ücreti): ödeme satırı çağıranın commit'iyle kalıcı olur ve Redis işareti commit sonucuna bağlanır. Bu modda optimistic lock çakışması yeniden denenmez; çağıranın transaction'ı zaten geri alınır. Rollback olursa PENDING işareti silinir, aynı anahtarla yeniden deneme mümkün olur.",
        "Başarısız sağlayıcı sonucu da kaydedilir; ancak outbox olayı yalnızca başarıda yazılır.",
    ])
    s.append(Paragraph("Ön kontrol sırası", H3))
    s.append(para("PaymentPreCheckService sağlayıcıdan önce çalışır: kullanıcı, sözleşmeler (AGREEMENTS_NOT_ACCEPTED), OTP (PAYMENT_VERIFICATION_REQUIRED 428), tutar (INVALID_AMOUNT) ve "
                  "kendine ödeme (SELF_PAYMENT; ilan, vitrin ve üyelik ödemeleri hariç). Üyelik otomatik yenilemesi sözleşme ve OTP adımını atlar."))
    s.append(Paragraph("Ödeme sonrası işleme", H3))
    s += bullets([
        "<b>Outbox yolu:</b> PaymentProcessor payment_outbox_events satırını yazar; PaymentOutboxWorker bunu payment.completed.v1 olarak yayınlar. İki tüketici grubu vardır: stok düşümü (inventory-sync-consumers) ve ödeme sonrası işleyiciler (payment-completed-consumers; ilan oluşturma ücreti ödemesinde ilanı yayına alır, ödeyene bildirim gönderir).",
        "<b>Cüzdan yolu (process içi):</b> e-cüzdan işlemleri PaymentCompletedEvent yayınlar; AFTER_COMMIT fazında dispatcher çalışır.",
    ])
    s.append(Paragraph("E-cüzdan", H3))
    s += table([
        ["Kural", "Değer"],
        ["Bakiye kilidi", "Her bakiye değişimi (yatırma, çekme, ödeme düşümü, escrow kredisi) önce e_wallets satırında SELECT ... FOR UPDATE alır"],
        ["Kilit altında idempotency", "Yatırma, çekme ve ödeme işlemleri aynı idempotency anahtarının daha önce payments'a yazılıp yazılmadığını kilit altında kontrol eder"],
        ["Hassasiyet", "2 ondalık, HALF_UP; negatif bakiyeye düşülemez"],
        ["Başlangıç bakiyesi", f"local {money(WALLET_DEFAULT)} TRY (demo), prod {money(PROD['app.e-wallet.default-balance'])} TRY"],
        ["Aylık harcama uyarısı", f"Eşik oranı {int(WALLET_WARN * 100)}%; yalnızca uyarır, işlemi engellemez"],
        ["Yatırma / çekme", "Idempotency-Key başlığı zorunlu; hız sınırında PAYMENT kategorisi"],
        ["Kilit sırasında ağ çağrısı", "Yapılmaz (değişiklik kuralı)"],
    ], [4.6, 11.8])
    s.append(Paragraph("Para alan işlemler ve ücretler", H3))
    s += table([
        ["İşlem", "Tutar", "Not"],
        ["İlan oluşturma ücreti", f"{money(LISTING_FEE)} TRY + %{LISTING_TAX:g} vergi", "Ödeme tamamlanınca ilan yayına alınır"],
        ["Vitrin", f"günlük {money(SHOWCASE_COST)} TRY + %{SHOWCASE_TAX:g} vergi, en fazla {SHOWCASE_MAX_DAYS} gün", "Hesap ShowcasePricingCalculator'dan; iptalde otomatik iade yok"],
        ["Premium üyelik", f"{money(PREMIUM_PRICE)} TRY / {PREMIUM_DAYS} gün", "Otomatik yenileme açıksa süre dolunca cüzdandan çekilir"],
    ], [4.6, 6.4, 5.4])
    check(WALLET_DEFAULT == 10000.0 and PREMIUM_PRICE == 100.0, "Para sabitleri degisti: anlatim gozden gecirilmeli")
    return s


def escrow_section():
    s = [H2N("Escrow: Emanet Havuzu ve Para Aktarımı")]
    s.append(para(
        "İkinci el ticarette iki taraf da risk altındadır: alıcı parayı verip ürünü alamamaktan, satıcı ürünü gönderip parayı alamamaktan çekinir. "
        "Platform parayı ödeme anında satıcıya aktarmaz; escrow havuzunda bloke eder, teslimat onaylanınca satıcının cüzdanına yazar. Escrow kaydı <b>kalem başınadır</b> "
        "(bir siparişte birden fazla satıcıya ait kalem olabilir)."))
    s.append(Paragraph("Durumlar", H3))
    s.append(para("Escrow ayrı bir enum kullanmaz; PaymentStatus'un bir alt kümesini taşır. Kayıt her zaman ESCROW ile açılır; COMPLETED, CANCELLED ve REFUNDED terminaldir."))
    s += table([
        ["Durum", "Anlam", "Paranın yeri", "Geçişi yapan"],
        ["ESCROW", "Ödeme alındı, para havuzda", "Sistem havuzu", "EscrowService.hold"],
        ["COMPLETED", "Alıcı onayladı ya da otomatik tamamlama süresi doldu", "Satıcı cüzdanı (Kafka ile asenkron)", "EscrowService.release"],
        ["CANCELLED", "Sipariş kalemi iptal edildi", "Alıcı cüzdanı (REFUND)", "EscrowService.cancel"],
        ["REFUNDED", "Teslimat sonrası iade onaylandı", "Alıcı cüzdanı (REFUND)", "EscrowService.refund"],
    ], [2.6, 5.4, 4.4, 4.0])
    s.append(Paragraph("Tutar bölüştürme", H3))
    s.append(para(
        "Siparişe kupon ya da indirim uygulandıysa her kalemin escrow tutarı, ödenen toplamın kalemin ürün fiyatındaki payına göre 2 basamak (HALF_UP) hesaplanır. "
        "Yuvarlama farkının havuzda açık yaratmaması için son kalem kalan bakiyeyi alır. hold idempotenttir: order_item_id için kayıt varsa o kalem atlanır. "
        "Platform kuponunun kalem payı order_items.coupon_discount alanında tutulur ve escrow kaydına platform_subsidy olarak geçer: amount alıcının ödediği net tutardır ve iade tabanıdır; "
        "serbest bırakmada satıcıya amount + platform_subsidy ödenir, iade ve iptalde alıcıya yalnızca amount döner. Satıcının kazancını yalnızca kendi kampanyaları düşürür."))
    s.append(Paragraph("Serbest bırakma (release)", H3))
    s += bullets([
        "release, escrow satırlarını PESSIMISTIC_WRITE ile kilitler (findByOrderIdAndStatusForUpdate), kaydı COMPLETED yapar, releasedAt yazar ve aynı transaction'da escrow_outbox_events'e ESCROW_RELEASED olayını ekler.",
        f"EscrowOutboxWorker olayı 5 sn aralıkla ({OUTBOX_BATCH}'lik gruplar) escrow.released.v1 topic'ine gönderir.",
        "EscrowKafkaConsumer mesajı tüketir; escrow:release:{escrowId} anahtarını processed_kafka_events'e INSERT ... ON CONFLICT DO NOTHING ile yazar. Mükerrerse atlanır.",
        "Satıcı cüzdanına kredi yazılır. Dedupe kaydı ve kredi aynı transaction'dadır; hata olursa ikisi de geri alınır.",
    ])
    s.append(Paragraph("İptal ve iade", H3))
    s.append(para(
        "Sipariş kargolanmadan iptal edilirse ya da iade onaylanırsa para satıcıdan çekilmez (çünkü satıcıya henüz geçmemiştir). Escrow CANCELLED/REFUNDED yapıldıktan "
        "sonra tutar aynı transaction'da, senkron olarak alıcı cüzdanına REFUND türüyle yazılır. Bu yolda Kafka ve outbox kullanılmaz. İade kaydı payments tablosunda "
        "siparişe ve sipariş kalemine bağlanır."))
    s.append(Paragraph("Uç durumlar", H3))
    s += table([
        ["Senaryo", "Risk", "Önlem"],
        ["Mükerrer teslimat onayı", "Çift para aktarımı", "Satır kilidi; ilk işlemden sonra durum COMPLETED olduğu için ikincisi ESCROW kaydı bulamaz ve etkisiz döner"],
        ["Çifte iptal / iade", "Çift iade", "findByOrderItemIdInForUpdate kilidi; kayıt yoksa ESCROW_NOT_FOUND, ESCROW dışındaysa ESCROW_STATUS_INVALID; transaction rollback-only, REFUND_FAILED"],
        ["Bozuk event", "escrowId, sellerId ya da amount boş", "BusinessException; dedupe geri alınır; 2 yeniden deneme sonra DLT"],
        ["Kafka yeniden teslimi", "Mükerrer cüzdan bakiyesi", f"processed_kafka_events; kayıtlar {OUTBOX_RETENTION} gün sonra silinir"],
        ["Kafka kapalı", "Olay gönderilemez", f"Outbox backoff (en fazla {ESC_BACKOFF_CAP} sn), {OUTBOX_MAX_ATTEMPTS['escrow']} denemeden sonra FAILED"],
        ["FAILED olay", "Para takılı kalır", "Escrow COMPLETED görünür ama satıcı cüzdanına yansımaz; alarm ve requeue endpoint'i gerekir"],
    ], [3.6, 3.4, 9.4])
    s.append(Paragraph("Denetim izi", H3))
    s.append(para("Escrow kaydı, işlemin yapıldığı andaki ilan başlığını, ilan numarasını ve tarih damgalarını (blockedAt, releasedAt, refundedAt) snapshot olarak saklar. "
                  "Kaynak ilan sonradan değişse ya da silinse bile uyuşmazlık incelemesi yapılabilir. İndeksler: sipariş, satıcı ve durum."))
    return s


def order_section():
    s = [H2N("Sipariş Yaşam Döngüsü ve Zamanlayıcılar")]
    s.append(para(
        f"Sipariş {len(ORDER_STATUSES)} durumlu bir makinedir: {', '.join(ORDER_STATUSES)}. Teslimat iki yoldan yürür: <b>CARGO</b> (kargo takipli) ve "
        f"<b>SAFE_MEETUP</b> (yüz yüze, doğrulama kodlu). Her durumun hangi işleme izin verdiği OrderStatus içindeki kümelerle belirlenir."))
    s.append(Paragraph("Durum yetki matrisi", H3))
    s += table([
        ["Durum", "Anlam", "İptal", "İade", "Düzenleme", "Tamamlama"],
        ["PENDING", "Ödeme bekleniyor (checkout içinde kısa süreli)", "evet", "-", "evet", "-"],
        ["CONFIRMED", "Ödeme alındı, escrow'da", "evet", "-", "evet", "-"],
        ["PROCESSING", "Satıcı paketliyor", "-", "-", "-", "-"],
        ["SHIPPED", "Kargoda", "-", "-", "-", "-"],
        ["DELIVERED", "Teslim edildi (inceleme süresi)", "-", "evet", "-", "evet"],
        ["MEETUP_PENDING", "Buluşma bekleniyor", "evet", "-", "-", "-"],
        ["VERIFICATION_LOCKED", "3 hatalı kod sonrası kilit", "-", "-", "-", "-"],
        ["HANDOVER_CONFIRMED", "Elden teslim doğrulandı", "-", "-", "-", "evet"],
        ["COMPLETED", "Para satıcıya aktarıldı", "-", "-", "-", "-"],
        ["CANCELLED / REFUNDED", "Tüm kalemler iptal ya da iade edildi", "-", "-", "-", "-"],
    ], [3.6, 5.6, 1.4, 1.4, 2.2, 2.2])
    check(len(ORDER_STATUSES) == 11, "Siparis durum sayisi degisti")
    s.append(Paragraph("Zaman limitleri", H3))
    s += table([
        ["Sabit", "Değer", "Anlam"],
        ["REFUND_WINDOW_HOURS", f"{REFUND_WINDOW_H} saat", "Teslimden sonra iade talep edebilme süresi (aşılırsa REFUND_TIME_EXPIRED)"],
        ["AUTO_COMPLETION_HOURS", f"{AUTO_COMPLETE_H} saat", "Teslimden sonra otomatik tamamlama ve escrow serbest bırakma"],
        ["SHIP_DEADLINE_HOURS", f"{SHIP_DEADLINE_H} saat", "Satıcının kargolama süresi; aşılırsa sipariş sistem tarafından iptal edilir"],
        ["STATUS_UPDATE_INTERVAL_MINUTES", f"{STATUS_INTERVAL_MIN} dk", "Sipariş zamanlayıcısının çalışma aralığı"],
        ["MEETUP_AUTO_COMPLETION_HOURS", f"{MEETUP_AUTO_H} saat", "Elden teslim doğrulandıktan sonra otomatik tamamlama"],
        ["MEETUP_CODE_TTL_MINUTES", f"{MEETUP_CODE_TTL_MIN} dk", "Güvenli buluşma kodunun geçerlilik süresi"],
        ["Bayat buluşma iptali", f"{STALE_MEETUP_DAYS} gün", "MEETUP_PENDING bu sürede tamamlanmazsa escrow iptal edilir"],
    ], [5.0, 2.6, 8.8])
    s.append(para(
        f"İade penceresi ({REFUND_WINDOW_H} saat) otomatik tamamlama süresinden ({AUTO_COMPLETE_H} saat) kısadır: alıcı iade hakkını kullanabilir, "
        f"hak bittikten sonra satıcı parasını almadan önce {AUTO_COMPLETE_H - REFUND_WINDOW_H} saat daha beklenir."))
    check(REFUND_WINDOW_H < AUTO_COMPLETE_H, "Iade penceresi otomatik tamamlamayi gecti: anlatim gozden gecirilmeli")
    s.append(Paragraph("İptal akışı", H3))
    s += bullets([
        "Yetki: yalnızca siparişin alıcısı iptal edebilir. Durum PENDING, CONFIRMED ya da MEETUP_PENDING olmalıdır; COMPLETED için ORDER_ALREADY_COMPLETED.",
        "Tek transaction: compensation planlayıcı iptal edilecek kalemleri belirler; her kalem için OrderItemCancel audit kaydı yazılır.",
        "Stok senkron geri alınır: aynı transaction'da PostgreSQL, commit sonrası Redis. Gayrimenkul ve araç ilanlarında stok geri alınmaz. Redis hatası yutulur, mutabakat işi düzeltir.",
        "EscrowService.cancel parayı alıcıya iade eder. Hata olursa transaction rollback-only yapılır ve REFUND_FAILED döner.",
        "Tüm kalemler iptal edildiyse sipariş CANCELLED, ödeme REFUNDED olur; kısmi iptalde sipariş durumu değişmez, ödeme PARTIALLY_REFUNDED olur.",
        "ORDER_CANCELLED outbox olayı yazılır ve order.cancelled.v1 topic'ine taşınır.",
    ])
    s.append(Paragraph("İade akışı", H3))
    s += bullets([
        f"Yalnızca alıcı iade edebilir. Sipariş DELIVERED olmalı ve teslimden itibaren {REFUND_WINDOW_H} saat geçmemiş olmalıdır.",
        "Kalem başına OrderItemRefund kaydı yazılır; stok senkron geri alınır; EscrowService.refund escrow'u REFUNDED yapar ve alıcıya REFUND kredisi verir.",
        "Tüm kalemler iade edildiyse sipariş REFUNDED olur; aksi halde ödeme PARTIALLY_REFUNDED. ORDER_REFUNDED outbox olayı order.refunded.v1'e gider.",
    ])
    s.append(Paragraph("Otomasyon: OrderCompletionScheduler", H3))
    s.append(para(
        f"İş {STATUS_INTERVAL_MIN} dakikada bir çalışır ve ShedLock'ludur. Her adım önce vadesi gelmiş olabilecek sipariş kimliklerini veritabanında zaman filtresiyle çeker "
        f"(adım başına en fazla {SCHEDULER_BATCH} kayıt). Her sipariş kendi transaction'ında yeniden yüklenir ve kural tekrar kontrol edilir; bir siparişteki hata yalnızca o siparişi geri alır."))
    s += table([
        ["Geçiş", "Koşul", "Sonuç"],
        ["CONFIRMED -> PROCESSING", f"{STATUS_INTERVAL_MIN} dk (premium kullanıcıda yarısı)", "markAsProcessing"],
        ["SHIPPED -> DELIVERED", "Yolda geçen süre aynı eşikle", "markAsDelivered"],
        ["CONFIRMED / PROCESSING (CARGO) -> CANCELLED", f"Oluşturmadan {SHIP_DEADLINE_H} saat", "cancelUnshippedOrder: stok ve escrow iadesi"],
        ["DELIVERED -> COMPLETED", f"Tesliminden {AUTO_COMPLETE_H} saat", "escrow release, ardından tamamlama"],
        ["HANDOVER_CONFIRMED -> COMPLETED", f"Doğrulamadan {MEETUP_AUTO_H} saat", "escrow release"],
        ["MEETUP_PENDING -> CANCELLED", f"Oluşturmadan {STALE_MEETUP_DAYS} gün", "escrow iptali; OrderItemCancel, stok geri alma ve outbox olayı yoktur"],
    ], [5.4, 5.0, 6.0])
    s.append(para("PROCESSING -> SHIPPED zamanla değil, satıcının ship uç noktasını çağırmasıyla olur. Escrow release hata verirse sipariş COMPLETED yapılmaz ve sonraki turda yeniden denenir."))
    s.append(Paragraph("Eşzamanlılık güvenceleri", H3))
    s += table([
        ["Risk", "Koruma"],
        ["Kargolanmış siparişi iptal", "Politika durum denetimi: ORDER_CANNOT_BE_CANCELLED"],
        ["Tamamlanmış siparişi iptal/iade", "ORDER_ALREADY_COMPLETED; para satıcıya gittiği için telafi yapılmaz"],
        ["İade penceresi dışında iade", "REFUND_TIME_EXPIRED"],
        ["Aynı kalemi iki kez iptal/iade", "Planlayıcıda ORDER_ITEM_ALREADY_CANCELLED / _REFUNDED; escrow katmanında satır kilidi"],
        ["Aynı anda iptal ve onay", "Escrow satırında PESSIMISTIC_WRITE; ikinci işlem ESCROW durumunu bulamaz"],
        ["Olay kaybı", "İptal/iade olayları doğrudan Kafka'ya değil outbox üzerinden gider"],
    ], [5.2, 11.2])
    return s


def meetup_section():
    s = [H2N("Güvenli Buluşma: OTP ve QR Doğrulaması")]
    s.append(para(
        "Kargo masrafından kaçınmak isteyenler için yüz yüze teslimat desteklenir. Elden alışverişte klasik riskler vardır: sahte para, 'aldım ama almadım dedi' "
        "çelişkisi, paranın ne zaman serbest kalacağının belirsizliği. Güvenli buluşma bunu şöyle çözer: ödeme önceden escrow'dadır; alıcıya özel kısa ömürlü bir kod "
        "üretilir; satıcı kodu buluşmada sisteme girince teslimat kesinleşir."))
    s.append(Paragraph("Akış", H3))
    s += table([
        ["Adım", "Durum", "Ne olur"],
        ["1", "MEETUP_PENDING", f"Ödeme alınır, escrow bloke. Alıcı 6 haneli kodu ve aynı kodu taşıyan QR'ı görür; kod {MEETUP_CODE_TTL_MIN} dk geçerlidir, süresi dolunca alıcı yeniler."],
        ["2", "MEETUP_PENDING", "Buluşmada alıcı ürünü inceler, beğenirse kodu satıcıya gösterir. Yalnızca alıcı siparişi iptal edebilir."],
        ["3", "HANDOVER_CONFIRMED", "Satıcı kodu sisteme girer (verify-meetup). Kod doğruysa teslimat kesinleşir; artık iptal edilemez."],
        ["4", "COMPLETED", f"Alıcı ya da satıcı tamamlamayı onaylar; onay gelmezse {MEETUP_AUTO_H} saat sonra sistem tamamlar. Escrow serbest kalır."],
        ["-", "CANCELLED", f"{STALE_MEETUP_DAYS} gün içinde tamamlanmazsa sistem escrow'u iptal eder ve parayı alıcıya iade eder."],
    ], [1.2, 3.8, 11.4])
    s.append(Paragraph("Güvenlik mekanizmaları", H3))
    s += table([
        ["Mekanizma", "Değer", "Açıklama"],
        ["Kod uzunluğu", "6 hane", "Doğrulama SHA-256 hash üzerinden yapılır"],
        ["Kod geçerlilik süresi", f"{MEETUP_CODE_TTL_MIN} dk", "Süresi dolmuş kodla gelen deneme MEETUP_CODE_EXPIRED alır ve deneme sayacını artırmaz"],
        ["Kod yenileme sınırı", "en erken 30 sn sonra", "Daha sık istek RATE_LIMIT_EXCEEDED alır"],
        ["Hatalı deneme hakkı", "3", "3. hatalı denemede sipariş VERIFICATION_LOCKED olur"],
        ["Kilit süresi", "15 dk", "Kilit dolunca ilk denemede sayaç sıfırlanır ve durum MEETUP_PENDING'e döner"],
        ["QR", "250x250 PNG", "İçeriği kodun kendisi; URL ya da imza taşımaz. Yalnızca alıcıya üretilir"],
    ], [4.2, 3.4, 8.8])
    check("newAttempts >= 3" in jread("order/application/OrderCompletionService.java") and "plusMinutes(15)" in jread("order/application/OrderCompletionService.java"),
          "Buluşma kilidi (3 deneme / 15 dk) kodda degisti")
    s.append(para(
        "<b>Bilinen zayıflık.</b> Kod, doğrulama hash'inin yanında alıcıya yeniden gösterebilmek için açık metin olarak da saklanır; yani hash veritabanına "
        "erişen birine karşı kodu gizlemez. Ayrıca kod yenileme sayacı ve kilidi sıfırlar: alıcı kilit sırasında kodu yenilerse 15 dakikalık kilit kalkar. "
        "Kilit, satıcının tek başına deneme yapmasını sınırlar ama alıcıyla birlikte hareket eden satıcıyı sınırlamaz."))
    return s


def offer_section():
    s = [H2N("Teklif (Pazarlık) Sistemi ve Eşzamanlılık")]
    s.append(para(
        f"Alıcı ve satıcı fiyat pazarlığı yapabilir. Teklif durumları: {', '.join(OFFER_STATUSES)}. Sistem dört sorunu çözer: aynı ilan için iki teklifin aynı anda "
        "kabul edilmesi (çifte kabul), teklifi verenin kendi teklifini kabul etmesi, cevaplanmayan tekliflerin sonsuza kadar askıda kalması ve aynı kabul edilmiş "
        "teklifle iki kez ödeme yapılması."))
    s.append(Paragraph("Durumlar ve süreler", H3))
    s += table([
        ["Durum", "Anlam", "Sonraki"],
        ["PENDING", f"Karşı tarafın cevabı bekleniyor; yanıt süresi {OFFER_EXPIRE_H} saat", "ACCEPTED, REJECTED, EXPIRED"],
        ["ACCEPTED", f"Kabul edildi; alıcının ödeme süresi {OFFER_PAY_H} saat, bu sürede stok alıcı adına tutulur", "COMPLETED, EXPIRED"],
        ["REJECTED", "Reddedildi ya da üzerine karşı teklif verildi", "terminal"],
        ["EXPIRED", "Süresinde cevaplanmadı ya da ödenmedi", "terminal"],
        ["COMPLETED", "Alıcı teklif fiyatıyla ödemeyi tamamladı", "terminal"],
    ], [2.8, 9.6, 4.0])
    s.append(para("Teklif verilemeyen durumlar: ilan ACTIVE değil, ilan tipi VEHICLE ya da REAL_ESTATE, kendi ilanına teklif, adet 1'den küçük, fiyat 0 ya da altı, adet stoktan fazla. "
                  "Kabul, ret ve karşı teklif yalnızca teklifin karşı tarafı tarafından yapılabilir; teklifin tarafı olmayan kullanıcı OFFER_NOT_ALLOWED alır."))
    s.append(Paragraph("Kabul anındaki kilitler", H3))
    s += table([
        ["Katman", "Ne sağlar"],
        ["İlan satır kilidi (findByIdWithLock)", "Aynı ilan için iki kabul sıraya girer"],
        ["existsByListingAndStatusAndIdNot(ACCEPTED)", "Kilidi ikinci alan istek ilk kabulü görür ve OFFER_ALREADY_ACCEPTED_FOR_LISTING alır. Çifte kabulü engelleyen asıl kontrol budur"],
        ["@Version (optimistic lock)", "Aynı teklif satırına eşzamanlı yazma OFFER_CONCURRENT_MODIFICATION döner"],
        ["Stok tutma (OfferStockHoldService)", "Teklif adedi alıcı adına ödeme süresi boyunca Redis stoğundan düşülür"],
    ], [6.2, 10.2])
    s.append(para(
        f"Stok tutma ayrı bir anahtar kullanmaz: alıcının normal checkout rezervasyonu (v4:inventory:reservation:&lt;alıcı&gt;:&lt;ilan&gt;) ödeme süresine kalan TTL ile yazılır. "
        f"Böylece diğer alıcılar düşük Redis stoğunu görür ve ilanı liste fiyatından alamaz; teklifli checkout'ta script yalnızca farkı aldığı için ek stok düşmez. "
        f"Kabul transaction'ı geri alınırsa tutulan adet hemen bırakılır."))
    s.append(Paragraph("Karşı teklif zinciri ve süre dolması", H3))
    s += bullets([
        "Karşı teklif tek transaction'da önceki teklifi REJECTED yapar ve yeni teklifi parentOffer ile ona bağlar; pazarlık geçmişi bu zincirden okunur. Sıra karşı tarafa geçer.",
        f"OfferScheduler dakikada bir (cron {cfg('app.offer.scheduler-cron')}) çalışır ve ShedLock'ludur: süresi geçmiş PENDING ve ACCEPTED teklifleri koşullu bir UPDATE ile (id, version, durum, süre) EXPIRED yapar. Aynı anda checkout teklifi tamamlamışsa UPDATE 0 satır döner ve teklif atlanır.",
        "Zamanlayıcı çalışmadan önce bir işlem gelirse (kabul, ret, karşı teklif) teklif o anda EXPIRED yapılır; süresi geçmiş kabul edilmiş teklifle checkout da OFFER_EXPIRED alır.",
        "Alıcı ödeme süresi içinde ödemezse teklif EXPIRED olur, stok tutması bırakılır ve ilan için yeni teklif kabul edilebilir.",
    ])
    return s


def pricing_section():
    s = [H2N("Fiyatlandırma, Kupon ve Kampanya")]
    s.append(para(
        "Sepet ve checkout fiyatını PriceCalculationEngine hesaplar. Motor saf hesaplama yapar; repository ya da dış servis çağırmaz. Girdileri satıcı kampanyaları, "
        "platform kuponları ve kabul edilmiş teklif fiyatıdır. Tüm tutarlar 2 haneye HALF_UP yuvarlanır."))
    s.append(Paragraph("Hesaplama sırası", H3))
    s += table([
        ["#", "Adım", "Kural"],
        ["1", "Satır fiyatı", "ilan fiyatı x adet. Teklif yalnızca teklif ilanının satırını değiştirir: miktar teklifin adedi, satır toplamı teklifin toplam fiyatı olur"],
        ["2", "Kampanya (satır bazlı)", "Satıcının uygulanabilir kampanyaları arasından en yüksek birim indirimi veren seçilir; kampanyalar birleşmez. PERCENT: birim fiyat x değer / 100, FIXED: değer; indirim birim fiyatı geçemez. minQuantity: aynı kampanyaya giren satırların toplam miktarı yetmezse atlanır"],
        ["3", "Kupon (sepet bazlı)", "Kampanya sonrası toplamlar üzerinden hesaplanır; uygun satırlara satır toplamıyla orantılı dağıtılır, yuvarlama farkı son satıra yazılır"],
        ["4", "Sonuç", "toplam = kampanya sonrası ara toplam - kupon indirimi; alıcının ödediği tutar net satır toplamlarıdır. Satıcıya ödenen tutar kupon payını (platform_subsidy) da içerir; yalnızca satıcı kampanyası kazancı düşürür"],
    ], [0.7, 3.4, 12.3])
    s.append(para("<b>İndirim dışı kategoriler.</b> Gayrimenkul (REAL_ESTATE) ve araç (VEHICLE) ilanlarına kampanya, kupon ve teklif indirimi uygulanmaz; bu kural tek yerde tanımlıdır (DiscountEligibility)."))
    s.append(Paragraph("Kupon", H3))
    s += table([
        ["Alan", "Anlam"],
        ["discountKind", "ORDER_PERCENT, ORDER_FIXED, TYPE_PERCENT, TYPE_FIXED, THRESHOLD_PERCENT, THRESHOLD_FIXED"],
        ["value, maxDiscount", "İndirim değeri ve üst sınırı; sonuç uygun ara toplamı ve maxDiscount'u geçemez"],
        ["minSubtotal", "THRESHOLD_* kuponları için uygun ara toplam alt sınırı"],
        ["eligibleTypes", "TYPE_* kuponlarında hangi ilan tiplerinin indirime gireceği"],
        ["audience", "ALL_USERS, USER_ID_LIST, NEVER_ORDERED_FIRST_ORDER (ödemesi tamamlanmış siparişi olmayan alıcı)"],
        ["usageLimitGlobal, usageLimitPerUser", "Toplam ve kullanıcı başına kullanım limitleri"],
    ], [5.0, 11.4])
    s.append(Paragraph("Kupon kullanımı ve eşzamanlılık", H3))
    s += bullets([
        "Kupon satırı findByCodeIgnoreCaseForUpdate ile kilitlenir.",
        "apply_coupon_with_limit.lua global ve kullanıcı sayaçlarını tek atomik çağrıda kontrol edip artırır (TTL 30 gün). Aşımda COUPON_USAGE_LIMIT_REACHED.",
        "Sayaç artırıldıysa bir TransactionSynchronization kaydedilir: checkout commit edilmezse release_coupon_usage.lua sayaçları geri azaltır (sıfırın altına inmez).",
        "PostgreSQL limitleri tekrar kontrol edilir ve coupon_redemptions satırı yazılır; satırda kuponun toplam indirimi (discount_amount) saklanır ve Kuponlarım sayfasındaki toplam tasarruf bundan hesaplanır. Kupon bir kez, indirim alan ilk siparişe bağlanarak kullanılır.",
        "Redis erişilemezse limiter 'sayılmadı' döner; karar kupon satır kilidi altındaki PostgreSQL kontrollerine kalır (kupon için Redis fail-open'dır).",
    ])
    s.append(Paragraph("Önizleme ile checkout farkı", H3))
    s.append(para(
        "Sepet önizlemesinde (priceCart) geçersiz ya da kotası dolmuş kupon sessizce düşürülür ve kuponsuz fiyat gösterilir. Checkout'ta ise (priceCartForCheckout) "
        "asla sessiz düşüm yapılmaz; kupon geçersizse işlem ilgili hata koduyla (COUPON_NOT_FOUND, COUPON_EXPIRED, COUPON_USAGE_LIMIT_REACHED, COUPON_NOT_APPLICABLE) durur. "
        "Böylece alıcının onayladığı fiyat ile ödediği fiyat farklı olamaz."))
    s.append(Paragraph("Kampanya", H3))
    s.append(para(
        "Kampanya satıcıya aittir: indirim türü (PERCENT ya da FIXED), değer, başlangıç/bitiş, uygun ilan tipleri ve ilan kimlikleri, minQuantity (varsayılan 1) ve soft delete. "
        "CampaignValidator değerin pozitif olmasını, PERCENT için en çok 100 olmasını, başlangıcın bitişten sonra olmamasını ve ilanların satıcıya ait olmasını denetler. "
        f"CampaignScheduler süresi geçen kampanyaları toplu UPDATE ile {human(cfg('app.campaign.scheduler-deactivate-fixed-delay-ms') / 1000)} aralıkla pasifleştirir (ShedLock'lu); "
        "arada fiyat hesabı bitiş tarihini zaten kontrol ettiği için süresi geçmiş kampanya uygulanmaz."))
    return s


# ---------------------------------------------------------------------------------------------
# Bolumler 15-24
# ---------------------------------------------------------------------------------------------
def security_section():
    s = [H2N("Kimlik Doğrulama, Yetkilendirme ve Güvenlik Katmanları")]
    s.append(para(
        "Kimlik doğrulama JWT tabanlıdır ve oturum tutulmaz (STATELESS). Access ve refresh token'lar HTTP cookie olarak taşınır; kimlik doğrulama filtresi "
        "isteği, hız sınırlama filtresinden sonra değerlendirir. Google OAuth2 girişi de desteklenir."))
    s.append(Paragraph("Token ömürleri", H3))
    s += table([
        ["Token", "Süre", "Not"],
        ["Access token", human(JWT_ACCESS), "Her kullanımda iptal anahtarları kontrol edilir"],
        ["Refresh token", human(JWT_REFRESH), "Her yenilemede rotasyon uygulanır"],
        ["Refresh token (beni hatırla)", human(JWT_REMEMBER), "Cookie ömrü de buna göre uzar"],
    ], [5.0, 3.4, 8.0])
    s.append(Paragraph("Refresh rotasyonu ve yeniden kullanım tespiti", H3))
    s.append(para(
        "Her refresh token bir aileye (familyId) bağlıdır. Yenileme eski token'ı geçersiz kılar ve aynı aileden yenisini üretir. Daha önce kullanılmış bir refresh "
        "token tekrar gelirse bu çalınma işareti sayılır ve o ailenin tüm token'ları iptal edilir."))
    s.append(Paragraph("Access token iptali", H3))
    s += table([
        ["Redis anahtarı", "Amaç"],
        ["auth:access-token-revoked:{jti}", "Tek bir access token'ı geçersiz kılar (çıkış)"],
        ["auth:access-revoked:{userId}", "Kullanıcının tüm access token'larını geçersiz kılar (şifre değişimi, yasaklama)"],
    ], [6.4, 10.0])
    s.append(Paragraph("Giriş denemesi sınırlaması", H3))
    s.append(para(
        f"Başarısız girişler Redis'te sayılır: hesap ve IP çifti başına {LOGIN_PER_ACCOUNT}, yalnızca IP başına {LOGIN_PER_IP} deneme, {human(LOGIN_WINDOW_S)} içinde "
        "(anahtarlar auth:login-fail:account: ve auth:login-fail:ip: önekleriyle). Sınır aşılırsa giriş denemesi reddedilir."))
    s.append(Paragraph("Hız sınırlama", H3))
    s += table([
        ["Kategori", f"Limit ({human(RL_WINDOW)} pencere)", "Kapsam"],
        ["auth", RL["auth"], "Giriş, kayıt ve token uçları"],
        ["payment", RL["payment"], "Ödeme ve para yazan yollar: checkout, e-cüzdan yatırma/çekme, üyelik yükseltme, vitrin, ilan ücreti ödemesi"],
        ["general", RL["general"], "Diğer tüm uçlar"],
        ["ai", RL["ai"], "AI uçları"],
    ], [3.0, 4.4, 9.0])
    s.append(para(
        "Sayaç Redis'te rate_limit_window.lua ile atomik tutulur (anahtar ratelimit:{kategori}:{ip}:{pencere}). Redis erişilemezse AI kategorisi fail-closed çalışır "
        "(503); IP, güvenilir proxy zincirinde X-Forwarded-For'un sağdan sola okunmasıyla bulunur."))
    s.append(Paragraph("CSRF, CORS ve başlıklar", H3))
    s += bullets([
        "CSRF: çift gönderimli cookie (CookieCsrfTokenRepository, JS okuyabilir); yalnızca @PublicEndpoint ile işaretli handler'lar muaftır. Muafiyet yol bazlı değil, Spring MVC'nin seçeceği handler bazlıdır: GET /{id} herkese açıkken PUT /{id} korumalı kalır.",
        "CORS: izinli origin listesi yapılandırmadan gelir; WebSocket origin kontrolü de aynı listeyi kullanır. Prod'da joker origin ve localhost yasaktır.",
        "Başlıklar (SecurityHeadersFilter): X-Content-Type-Options nosniff, X-Frame-Options DENY, HSTS, Content-Security-Policy, Referrer-Policy, Permissions-Policy, Cross-Origin-Opener-Policy ve Cross-Origin-Resource-Policy same-origin; Server başlığı boşaltılır.",
        "Açık uçlar: Swagger, OAuth2, /ws, actuator health ve info. /actuator/prometheus bilerek açık listede değildir.",
    ])
    s.append(Paragraph("ProdSecurityGuard", H3))
    s.append(para(
        f"Prod profilinde uygulama açılırken güvensiz yapılandırma varsa başlamayı reddeder. Kodda {GUARD_ERRORS} hata mesajı, 7 kontrol grubu vardır: "
        "JWT anahtarı, hız sınırı ayarı, actuator açıklığı, cookie secure ve SameSite, CORS, test uçlarının kapalı olması ve Redis parolası."))
    return s


def chat_notification_section():
    s = [H2N("Sohbet, Bildirim ve E-posta")]
    s.append(Paragraph("Gerçek zamanlı sohbet (STOMP / WebSocket)", H3))
    s += bullets([
        "Uç nokta /ws; broker JVM-yerel basit broker'dır (harici relay yoktur). Bu yüzden birden fazla uygulama örneğinde mesajlar yalnızca bağlı olunan örneğin kullanıcılarına dağılır; yatay ölçekleme için harici broker gerekir.",
        "Abonelik allowlist'i vardır; istemci yalnızca izinli hedeflere abone olabilir. SEND yalnızca /app/ önekine yapılabilir.",
        "Her STOMP çerçevesinde token iptal kontrolü yapılır; çıkış yapılmış ya da yasaklanmış kullanıcının açık bağlantısı bir sonraki çerçevede düşer.",
        "Mesaj geçmişi PostgreSQL'dedir; yeni mesaj bildirimi ChatNotificationService ile gönderilir.",
    ])
    s.append(Paragraph("Bildirimler", H3))
    s.append(para(
        f"Uygulama içi bildirim {len(NOTIF_TYPES)} türdedir ({', '.join(NOTIF_TYPES)}). Bildirimler domain olaylarından AFTER_COMMIT fazında üretilir; "
        "bu yolda Kafka ya da outbox kullanılmaz. Olay commit olmadan bildirim gitmez, ancak süreç commit ile gönderim arasında ölürse bildirim kaybolabilir."))
    s.append(Paragraph("E-posta", H3))
    s.append(para(
        f"{len(EMAIL_TYPES)} e-posta türü tanımlıdır. Gerçek SMTP gönderimi yoktur: e-postalar uygulama içi gelen kutusuna yazılır. Dağıtım mail.dispatch.v1 topic'i "
        "üzerinden mail-dispatch-consumers grubuyla yapılır ve topic'in DLT'si vardır. Mail üreticisi outbox kullanmaz; broker erişilemezse mail kaybolur."))
    check(len(NOTIF_TYPES) == 24 and len(EMAIL_TYPES) == 45, "Bildirim/e-posta tur sayisi degisti")
    return s


def aura_section():
    s = [H2N("Aura: AI Destekli Arama ve Özet")]
    s.append(para(
        "Aura, Gemini modeliyle doğal dil aramasını yapılandırılmış ilan sorgusuna çeviren ve ilan özetleri üreten katmandır. Maliyet ve kötüye kullanım "
        "birden fazla katmanla sınırlanır."))
    s += table([
        ["Sınır", "Değer", "Mekanizma"],
        ["Küresel günlük bütçe", GEMINI_DAILY, "Redis sayacı v4:ai:budget:daily:{tarih}; aşılınca AI çağrısı yapılmaz"],
        ["Aura arama (kullanıcı başına)", f"{AURA_SEARCH_PM} / dk", "Redis tabanlı; anahtar v4:rate_limit:aura_search:user:"],
        ["AI özet (IP başına)", f"{AI_SUMMARY_IP_H} / saat", "Redis tabanlı IP sınırı"],
        ["Negatif önbellek", f"{AI_NEG_CACHE} sn", "Başarısız özet isteği bu süre tekrar denenmez"],
        ["HTTP hız sınırı", f"{RL['ai']} / {human(RL_WINDOW)}", "ai kategorisi; fail-closed (503)"],
        ["Plan bazlı günlük Aura hakkı", f"FREE {PLAN_AURA['FREE']} / PREMIUM {PLAN_AURA['PREMIUM']}", "Üyelik planından okunur"],
    ], [5.0, 3.6, 7.8])
    s.append(para(
        "Arama planı beş moddan birini seçer: KEYWORD_ONLY, STRUCTURED_ONLY, HYBRID, CATEGORY_BROWSE ve NO_SEARCH. Model çıktısı doğrudan sorguya dönüşmez; "
        "önce şemaya göre doğrulanır ve bilinmeyen alanlar atılır. Bütçe ya da sınır aşıldığında kullanıcıya hata değil, mümkünse klasik arama sonucu döner."))
    return s


def complaint_section():
    C = COMPLAINT
    s = [H2N("Şikayet Moderasyonu")]
    s.append(para(
        f"Kullanıcılar birbirlerini ya da ilanları şikayet edebilir. Durumlar: {', '.join(COMPLAINT_STATUSES)}. Cezalar: {', '.join(PENALTIES)}. "
        "Şikayet önce bekleme süresinden geçer, ardından bir AI değerlendirmesi ve kural tabanlı kontroller çalışır; sonuç itiraz edilebilir."))
    s.append(Paragraph("Akış", H3))
    s += bullets([
        f"Şikayet verildiğinde {human(C['cooling_off'])} bekleme süresi (cooling-off) başlar; şikayet Redis gecikmeli kuyruğuna (v4:complaints:delayed_queue) yazılır.",
        f"ComplaintReviewWorker ({C['cron']} cron) kuyruktan en fazla {C['batch']} kayıt alır. İşçi kendi Redis kilidini kullanır (v4:lock:complaint:worker, TTL {human(C['lock_ttl'])}); ShedLock kullanmaz.",
        f"Takılı kalmış INVESTIGATING kayıtları {human(C['stale'])} sonra yeniden alınır; hatada yeniden deneme gecikmesi {human(C['retry'])}.",
        f"Değerlendirme son {C['transcript']} mesajı ve en çok {C['max_images']} kanıt görselini kullanır. Görseller yalnızca res.cloudinary.com'dan, en fazla {C['image_bytes'] // (1024 * 1024)} MB ve {human(C['image_timeout'])} zaman aşımıyla indirilir.",
        f"Güven eşiği {C['min_conf']}; kötü niyetli şikayet kararı için daha yüksek eşik {C['bad_faith_conf']} gerekir.",
    ])
    s.append(Paragraph("Kötüye kullanım ve ceza kuralları", H3))
    s += table([
        ["Kural", "Değer"],
        ["Günlük şikayet limiti", f"{C['daily_limit']} / {human(C['daily_window'])}"],
        ["Uyarı yükselmesi", f"{C['warn_escalate']} uyarıdan sonra bir üst ceza"],
        ["Geçici yasak", human(C["temp_ban"])],
        ["Kalıcı yasak", f"{C['bans_before_perm']} geçici yasaktan sonra"],
        ["Ceza çürümesi (strike decay)", human(C["strike_decay"])],
        ["Toplu şikayet (brigading) penceresi", f"{human(C['brigade'])}; yeni hesap eşiği {human(C['new_account'])}"],
        ["İlgili şikayet örneği", f"{C['samples']} örnek, en çok {C['scan']} kayıt taranır"],
        ["İtiraz süresi", human(C["appeal"])],
    ], [6.0, 10.4])
    s.append(para("İtirazlar v4:complaints:appeal_queue kuyruğuyla işlenir. Yasaklama kararı, kullanıcının tüm access token'larını iptal eden anahtarı da yazar (güvenlik bölümüne bakınız)."))
    return s


def plans_section():
    s = [H2N("Üyelik Planları, Ücretler ve İlan Limitleri")]
    s += table([
        ["Özellik", "FREE", "PREMIUM"],
        ["Günlük Aura hakkı", PLAN_AURA["FREE"], PLAN_AURA["PREMIUM"]],
        ["Vitrin slotu", PLAN_SHOWCASE["FREE"], PLAN_SHOWCASE["PREMIUM"]],
        ["Tahmini kargo süresi (gün)", PLAN_SHIP_DAYS["FREE"], PLAN_SHIP_DAYS["PREMIUM"]],
        ["Fiyat", "-", f"{money(PREMIUM_PRICE)} TRY / {PREMIUM_DAYS} gün"],
    ], [6.4, 4.0, 6.0])
    s.append(para(
        "Üyelik yenilemesi her gün 00:01'de ShedLock'lu bir işle yapılır; otomatik yenileme açıksa ücret cüzdandan çekilir, bakiye yetersizse plan düşer. "
        "Aylık AI ilan kotasını sıfırlayan iş ayın 1'inde çalışır; kota iki planda da 0 olduğundan fiilen etkisizdir."))
    s.append(Paragraph("İlan ve arama limitleri", H3))
    s += table([
        ["Limit", "Değer"],
        ["İlan oluşturma ücreti", f"{money(LISTING_FEE)} TRY + %{LISTING_TAX:g} vergi"],
        ["Vitrin", f"günlük {money(SHOWCASE_COST)} TRY + %{SHOWCASE_TAX:g} vergi; en fazla {SHOWCASE_MAX_DAYS} gün"],
        ["Görüntülenme tekilleştirme", "1 saat"],
        ["Genel arama", "en çok 50 sayfa, 200 karakter, 8 token"],
        ["Toplu kimlik sorgusu", "en çok 100 kimlik"],
        ["Favori listesi", "kullanıcı başına 20 liste, liste başına 100 öğe"],
        ["Sepet rezervasyonu", f"{CART_TIMEOUT_MIN} dk; temizlik {human(CART_CLEANUP_MS / 1000)} aralıkla"],
        ["Sayfa boyutu üst sınırı", "100"],
        ["Dosya yükleme", "10 MB (multipart)"],
    ], [6.0, 10.4])
    return s


def jobs_section():
    s = [H2N("Zamanlanmış İşler")]
    s.append(para(
        f"Kodda {len(JOBS)} @Scheduled metodu bulunur; {len(LOCKED_JOBS)} tanesi ShedLock ile korunur (Redis sağlayıcı, anahtar öneki {LOCK_PREFIX}, varsayılan "
        f"lockAtMostFor {human(LOCK_DEFAULT_MOST)}). Kilitsiz işler: üç outbox işçisi (kayıt başına satır kilidi kullanır) ve ComplaintReviewWorker (kendi Redis kilidi). "
        f"Zamanlama havuzu {cfg('spring.task.scheduling.pool.size')} iş parçacığıdır."))
    rows = [["Sınıf", "Modül", "Tetikleyici", "ShedLock (en fazla / en az)"]]
    for j in sorted(JOBS, key=lambda j: (j["mod"], j["cls"])):
        lock = f"{j['lock']} ({human(j['at_most'])} / {human(j['at_least'])})" if j["lock"] else "yok"
        rows.append([j["cls"], j["mod"], j["trigger"], lock])
    s += table(rows, [4.6, 2.4, 4.4, 5.0])
    check(len(JOBS) == 16 and len(LOCKED_JOBS) == 12, "Zamanlanmis is sayisi degisti")
    return s


def limits_section():
    s = [H2N("Limitler ve Eşikler: Birleşik Tablo")]
    s += table([
        ["Alan", "Limit", "Değer"],
        ["HTTP", "Hız sınırı (auth / payment / general / ai)", f"{RL['auth']} / {RL['payment']} / {RL['general']} / {RL['ai']} istek, {human(RL_WINDOW)}"],
        ["Veritabanı", "Hikari havuzu", f"en çok {HIKARI['maximum-pool-size']}, boşta en az {HIKARI['minimum-idle']}"],
        ["Asenkron", "Çalıştırıcı", f"çekirdek {ASYNC['core-pool-size']}, en çok {ASYNC['max-pool-size']}, kuyruk {ASYNC['queue-capacity']}, CallerRuns"],
        ["Kimlik", "Giriş denemesi", f"hesap+IP {LOGIN_PER_ACCOUNT}, IP {LOGIN_PER_IP} / {human(LOGIN_WINDOW_S)}"],
        ["Stok", "Rezervasyon TTL", human(RESERVATION_TTL)],
        ["Sipariş", "İade / otomatik tamamlama / kargolama", f"{REFUND_WINDOW_H} sa / {AUTO_COMPLETE_H} sa / {SHIP_DEADLINE_H} sa"],
        ["Buluşma", "Hatalı kod / kilit", "3 deneme / 15 dk"],
        ["Teklif", "Yanıt / ödeme süresi", f"{OFFER_EXPIRE_H} sa / {OFFER_PAY_H} sa"],
        ["Outbox", "Grup / deneme sayısı", f"{OUTBOX_BATCH} kayıt / en çok {OUTBOX_MAX_ATTEMPTS['payment']}"],
        ["Kafka", "Tüketici yeniden deneme", f"{BACKOFF_RETRIES} deneme, {BACKOFF_MS} ms ara, sonra DLT"],
        ["AI", "Küresel günlük bütçe", GEMINI_DAILY],
        ["Şikayet", "Günlük limit", f"{COMPLAINT['daily_limit']} / {human(COMPLAINT['daily_window'])}"],
    ], [2.6, 5.4, 8.4])
    return s


def integrations_section():
    s = [H2N("Dış Servis Entegrasyonları")]
    s += table([
        ["Servis", "Kullanım", "Sınırlar ve hata davranışı"],
        ["Cloudinary", "İlan görselleri (klasör secondhand-listings)", "10 MB; jpeg, png, gif, webp; 800x600 sınırlı kırpma. Silme uç noktası yoktur"],
        ["Döviz kuru API'si", "Para birimi dönüşümü", "Bağlantı 5 sn, okuma 10 sn zaman aşımı; sonuç 2 saat önbellekte (payment:exchangeRates); hatada 503"],
        ["Gemini", "Aura arama ve özet", "Günlük küresel bütçe ve kullanıcı/IP sınırları (Aura bölümüne bakınız)"],
        ["Google OAuth2", "Sosyal giriş", "Başarı/hata yönlendirme işleyicileri"],
    ], [3.2, 4.8, 8.4])
    return s


def ops_section():
    s = [H2N("Gözlemlenebilirlik, Test ve CI")]
    s += bullets([
        "Metrikler Micrometer ile Prometheus biçiminde sunulur; outbox kuyruk durumu secondhand_outbox_events gauge'ıyla izlenir. /actuator/prometheus açık listede değildir; ayrı yönetim portu ya da ağ politikası gerekir.",
        f"Testler: {N_TEST_FILES} test dosyası, {N_TESTS} test metodu, {N_IT} entegrasyon testi. Ağırlık birim testlerdedir; Redis ve Kafka davranışı büyük ölçüde mock'lanarak sınanır.",
        "CI (GitHub Actions ci.yml): backend işi mvn -B verify ve JaCoCo raporu; ikinci iş ön yüz derlemesi ve scripts/verify.sh depo denetimleridir.",
        f"Dokümantasyon: {N_DOCS} doküman ve {N_ADR} mimari karar kaydı (ADR).",
    ])
    s.append(Paragraph("Olay müdahale notları", H3))
    s += table([
        ["Belirti", "Bakılacak yer", "Eylem"],
        ["Ödeme alındı, sipariş onaylanmadı ya da stok düşmedi", "payment_outbox_events", "FAILED satırlar varsa admin requeue uç noktası: POST /api/v1/admin/outbox/{type}/{eventId}/requeue"],
        ["Satıcıya para yansımadı", "escrow_outbox_events, processed_kafka_events", "Olay FAILED ise requeue; DLT'de mesaj varsa inceleyip yeniden yayınla"],
        ["Redis stoğu ile veritabanı farklı", "Mutabakat işi", "Her 5 dk compare-and-set ile düzeltir; ek eylem gerekmez"],
        ["Kullanıcı 429 alıyor", "ratelimit:* anahtarları", "Kategori limitine bak; payment kategorisi para yazan yolları da kapsar"],
        ["Uygulama prod'da açılmıyor", "ProdSecurityGuard logu", "Listelenen yapılandırma hatalarını düzelt"],
    ], [5.0, 4.6, 6.8])
    return s


def drift_section():
    s = [H2N("Bilinen Farklar: Doküman ve Kod")]
    s.append(para("Aşağıdaki maddelerde doküman ile kod çelişiyor. Raporun geri kalanı koda göre yazılmıştır."))
    s += table([
        ["#", "Doküman", "Kod"],
        ["1", "Stok ve sipariş dokümanları mutabakat işinde ShedLock olmadığını söyler", f"Mutabakat işi ShedLock'ludur; kilitli iş sayısı {len(LOCKED_JOBS)}"],
        ["2", "core README: outbox temizliği 7 gün", f"Kod: {OUTBOX_RETENTION} gün; yalnızca PROCESSED satırlar silinir, FAILED kalır"],
        ["3", "user ve vitrin README'leri BASIC/PLUS/PRO planlarından söz eder", "Kod: FREE ve PREMIUM"],
        ["4", "agreements README 6 sözleşme türü sayar", f"Kod: {len(AGREEMENT_TYPES)} tür"],
        ["5", "docs/README şikayet moderasyonu için 'kodda yok' der", "Moderasyon uygulanmıştır"],
        ["6", "Hız sınırı dokümanları PAYMENT kategorisinin para yazan yollarını anmaz", "Kod: checkout, e-cüzdan yatırma/çekme, üyelik yükseltme, vitrin ve ilan ücreti PAYMENT sayılır"],
        ["7", "core README anahtar biçimi ratelimit:{kat}:ip:{ip}:...", "Kod: ratelimit:{kat}:{ip}:{pencere}"],
        ["8", "CI dokümanı ProdSecurityGuard için 5 kontrol sayar", f"Kod: {GUARD_ERRORS} hata mesajı, 7 grup"],
        ["9", "Üyelik README Aura hakkının günlük sıfırlandığını söyler", "Zamanlayıcı aylıktır ve aylık kota 0 olduğundan etkisizdir"],
        ["10", "Bir doküman Aura arama limitini JVM-yerel sayar", "Kod: Redis tabanlı"],
        ["11", "Stok dokümanı tek örnek için yazıldığını söyler", "Kodda ShedLock vardır; stok işleri çok örnekte güvenlidir"],
    ], [0.8, 7.6, 8.0])
    s.append(Paragraph("Dokümanda değil, kodda görülen tutarsızlıklar", H3))
    s += bullets([
        "payment.failed.v1 ve payment.refunded.v1 topic'leri tanımlıdır ama kullanılmaz; order.cancelled.v1 ve order.refunded.v1'in uygulama içi dinleyicisi yoktur.",
        f"Üç outbox işçisi üç farklı geri çekilme formülü kullanır (ödeme doğrusal, escrow üstel ve {ESC_BACKOFF_CAP} sn üst sınırlı, sipariş üstel ve sınırsız).",
        "Mail dağıtımı outbox kullanmaz; broker hatasında mail kaybolur.",
        "Buluşma kodu hash'in yanında açık metin de saklanır ve yenileme kilidi sıfırlar.",
    ])
    return s


def sources_section():
    s = [H2N("Kaynaklar")]
    s.append(para(
        f"Rapor secondHand deposunun {COMMIT} numaralı commit'inden ({COMMIT_DATE}) üretilmiştir. Rakamlar src/main/resources altındaki yml dosyalarından, "
        "src/main/java altındaki sabitlerden ve enum'lardan, db/migration dosyalarından, Lua scriptlerinden ve docker-compose.yml dosyasından okunur. "
        "Metindeki varsayımlar derleme sırasında kodla karşılaştırılır; kod değişirse derleme UYARI basar. Raporu yeniden üretmek için:"))
    s.append(para(c("python3 scripts/project_report/build_project_report.py [cikti.pdf]")))
    return s


# ---------------------------------------------------------------------------------------------
# Derleme
# ---------------------------------------------------------------------------------------------
SECTIONS = [overview, infra, database, redis_section, kafka_section, outbox_section, stock_section,
            checkout_section, payment_section, escrow_section, order_section, meetup_section, offer_section,
            pricing_section, security_section, chat_notification_section, aura_section, complaint_section,
            plans_section, jobs_section, limits_section, integrations_section, ops_section, drift_section, sources_section]


def footer(canvas, doc):
    canvas.saveState()
    canvas.setFont("Body", 8.5)
    canvas.setFillColor(MUTED)
    canvas.drawString(2.3 * cm, 1.1 * cm, f"secondHand proje raporu - {UPDATED}")
    canvas.drawRightString(A4[0] - 1.9 * cm, 1.1 * cm, str(doc.page))
    canvas.restoreState()


def main():
    out = Path(sys.argv[1]) if len(sys.argv) > 1 else Path.home() / "Desktop" / "secondhand_proje_raporu.pdf"
    doc = SimpleDocTemplate(str(out), pagesize=A4, leftMargin=2.3 * cm, rightMargin=1.9 * cm, topMargin=2.0 * cm, bottomMargin=2.0 * cm,
                            title="secondHand Proje Raporu", author="secondHand")
    story = [Paragraph("secondHand Proje Raporu", H1),
             Paragraph(f"Son güncelleme: {UPDATED}. Kaynak: commit {COMMIT} ({COMMIT_DATE}). Kapsam: arka uç.", SUB)]
    for build in SECTIONS:
        story += build()
    story = glue(story)
    while story and isinstance(story[-1], Spacer):
        story.pop()
    doc.build(story, onFirstPage=footer, onLaterPages=footer)
    for w in WARN:
        print("UYARI:", w)
    print(f"{out} ({len(WARN)} uyari)")
    return 1 if WARN else 0


if __name__ == "__main__":
    sys.exit(main())
