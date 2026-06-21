import json
import os
import datetime

results_path = "/Users/serhat/IdeaProjects/secondHand/scratch/audit_results.json"
report_path = "/Users/serhat/IdeaProjects/secondHand/.agents/BACKEND_LEGACY_AUDIT.md"

with open(results_path, "r", encoding="utf-8") as f:
    data = json.load(f)

# Categories
# 1. Hardcoded values (Magic numbers, strings, money, durations)
# Filter magic numbers to exclude simple <= 0 checks if they are standard boundary validations, 
# but list them as potential indicators.
magic_numbers = data.get("magic_numbers", [])
hardcoded_strings = data.get("hardcoded_strings", [])
hardcoded_money = data.get("hardcoded_money", [])
hardcoded_durations = data.get("hardcoded_durations", [])

# 2. Legacy patterns (@Autowired, new Date(), System.out.println, Raw types, SQL concat)
autowired_fields = data.get("autowired_field", [])
new_dates = data.get("new_date", [])
sysouts = data.get("sysout_or_stacktrace", [])
raw_types = data.get("raw_types", [])
sql_concats = data.get("sql_concat", []) # these are multi-line query annotations

# 3. Security (Sensitive logging, missing PreAuthorize, TODO/FIXME)
sensitive_logs = data.get("sensitive_logging", [])
preauthorize_missing = data.get("preauthorize_missing", [])
todo_fixme = data.get("todo_fixme", [])
commented_code = data.get("commented_code", [])

# 4. Code quality (God objects, nested ifs, empty catches, throws exception)
god_objects = data.get("god_objects", [])
nested_ifs = data.get("nested_ifs", [])
empty_catches = data.get("empty_catch", [])
throws_exceptions = data.get("throws_exception", [])

# Calculate statistics
# Categorize occurrences
total_hardcoded = len(magic_numbers) + len(hardcoded_strings) + len(hardcoded_money) + len(hardcoded_durations)
total_legacy = len(autowired_fields) + len(new_dates) + len(sysouts) + len(raw_types) + len(sql_concats)
# We count sensitive logs and missing PreAuthorize for security
total_security = len(sensitive_logs) + len(preauthorize_missing) + len(todo_fixme) + len(commented_code)
total_quality = len(god_objects) + len(nested_ifs) + len(empty_catches) + len(throws_exceptions)
total_overall = total_hardcoded + total_legacy + total_security + total_quality

# Determine risk levels
hardcoded_risk = "🟡" if total_hardcoded > 0 else "🟢"
legacy_risk = "🔴" if len(autowired_fields) > 0 or len(sysouts) > 0 else "🟡"
security_risk = "🔴" if len(preauthorize_missing) > 0 else "🟢"
quality_risk = "🟡" if len(god_objects) > 0 or len(empty_catches) > 0 else "🟢"

today = datetime.datetime.now().strftime("%Y-%m-%d")

# Let's format individual entries into tables
hardcoded_rows = []
for file, line, val, desc in magic_numbers:
    hardcoded_rows.append(f"| {os.path.basename(file)} | {line} | `{val.strip()}` | {desc}. Consider using constants or configurations. |")
for file, line, val, desc in hardcoded_strings:
    hardcoded_rows.append(f"| {os.path.basename(file)} | {line} | `{val.strip()}` | {desc}. Move to config or message properties. |")
for file, line, val in hardcoded_money:
    hardcoded_rows.append(f"| {os.path.basename(file)} | {line} | `{val.strip()}` | Hardcoded numeric decimal value. Check if money configuration. |")
for file, line, val, desc in hardcoded_durations:
    hardcoded_rows.append(f"| {os.path.basename(file)} | {line} | `{val.strip()}` | {desc}. Use duration objects or configure externally. |")

legacy_rows = []
for file, line, val in autowired_fields:
    legacy_rows.append(f"| {os.path.basename(file)} | {line} | `@Autowired` field | Field injection. Replace with constructor injection. |")
for file, line, val in new_dates:
    legacy_rows.append(f"| {os.path.basename(file)} | {line} | `new Date()` | Legacy date class. Replace with `Instant` or `LocalDateTime`. |")
for file, line, val in sysouts:
    legacy_rows.append(f"| {os.path.basename(file)} | {line} | `System.out.println` | Console logging. Replace with SLF4J `log.info`/`log.debug`. |")
for file, line, val in raw_types:
    legacy_rows.append(f"| {os.path.basename(file)} | {line} | Raw Type | Generic declaration missing parameter type. |")
for file, line, val in sql_concats:
    legacy_rows.append(f"| {os.path.basename(file)} | {line} | `@Query` string split | Multi-line JPQL/SQL concat via `+`. Safe compile-time concat, but consider text blocks. |")

security_rows = []
for file, line, val in sensitive_logs:
    security_rows.append(f"| {os.path.basename(file)} | {line} | Keyword '{val.strip()[:20]}...' in logger | Verify that plain credentials/tokens are not leaked. |")
for file, line, val, desc in preauthorize_missing:
    # Only list representative controllers (not all 212 entries to avoid cluttering, but summarize)
    pass
# Add distinct controllers that are missing PreAuthorize
distinct_controllers = set()
for item in preauthorize_missing:
    distinct_controllers.add(item[0])

for file in sorted(distinct_controllers):
    security_rows.append(f"| {os.path.basename(file)} | - | Controller endpoints missing `@PreAuthorize` | Endpoint is default authenticated. Ensure path has role checks in controller or SecurityConfig. |")

quality_rows = []
for file, length, desc in god_objects:
    quality_rows.append(f"| {os.path.basename(file)} | - | Service class has {length} lines | Split this service into domain-specific sub-services. |")
for file, line, val, desc in nested_ifs:
    # Only list a few notable nested if blocks (> 4 levels or specific patterns)
    if "depth 4" in desc or "depth 5" in desc:
        quality_rows.append(f"| {os.path.basename(file)} | {line} | `{val.strip()[:30]}` ({desc}) | Refactor using guard clauses or split methods. |")
for file, line, val in empty_catches:
    quality_rows.append(f"| {os.path.basename(file)} | {line} | `{val.strip()}` | Empty catch block. Log exception or propagate. |")
for file, line, val in throws_exceptions:
    quality_rows.append(f"| {os.path.basename(file)} | {line} | `{val.strip()}` | General exception thrown. Specify concrete exception class. |")

todo_rows = []
for file, line, val in todo_fixme:
    todo_rows.append(f"| {os.path.basename(file)} | {line} | `{val.strip()}` |")

# Build the report template
md = f"""# Backend Legacy & Hardcoded Kod Taraması
_Tarih: {today}_

## Özet
| Kategori | Tespit Sayısı | Risk |
|----------|--------------|------|
| Hardcoded Değer | {total_hardcoded} | {hardcoded_risk} |
| Legacy Pattern | {total_legacy} | {legacy_risk} |
| Güvenlik Riski | {total_security} | {security_risk} |
| Kod Kalitesi | {total_quality} | {quality_risk} |
| **Toplam** | {total_overall} | |

## 1. Hardcoded Değerler
| Dosya | Satır | Değer | Önerilen Çözüm |
|-------|-------|-------|----------------|
"""
md += "\n".join(hardcoded_rows[:25]) + "\n"
if len(hardcoded_rows) > 25:
    md += f"| ... | ... | ... | ({len(hardcoded_rows)-25} adet diğer hardcoded değer listelenmedi) |\n"

md += """
## 2. Legacy Pattern'ler
| Dosya | Satır | Pattern | Önerilen Çözüm |
|-------|-------|---------|----------------|
"""
md += "\n".join(legacy_rows[:25]) + "\n"
if len(legacy_rows) > 25:
    md += f"| ... | ... | ... | ({len(legacy_rows)-25} adet diğer legacy pattern listelenmedi) |\n"

md += """
## 3. Güvenlik Riskleri
| Dosya | Satır | Risk | Önerilen Çözüm |
|-------|-------|------|----------------|
"""
md += "\n".join(security_rows[:25]) + "\n"
if len(security_rows) > 25:
    md += f"| ... | ... | ... | ({len(security_rows)-25} adet diğer güvenlik riski listelenmedi) |\n"

md += """
## 4. Kod Kalitesi Sorunları
| Dosya | Satır | Sorun | Önerilen Çözüm |
|-------|-------|-------|----------------|
"""
md += "\n".join(quality_rows[:25]) + "\n"
if len(quality_rows) > 25:
    md += f"| ... | ... | ... | ({len(quality_rows)-25} adet diğer kod kalitesi sorunu listelenmedi) |\n"

md += """
## 5. TODO / FIXME Listesi
| Dosya | Satır | İçerik |
|-------|-------|--------|
"""
if not todo_rows:
    md += "| Yok | - | Bulgu tespit edilmedi. |\n"
else:
    md += "\n".join(todo_rows) + "\n"

md += f"""
## Öncelik Sırası
1. **Kritik (🔴):** `@Autowired` field injection kullanan sınıfların (`OrderQueryService`, `UserService`, `ListingQueryService`) constructor injection ile refactor edilmesi.
2. **Kritik (🔴):** Hassas olabilecek URL veya yetkilendirme kontrollerinin, rol bazlı endpoint'lerde (`/api/v1/seller/campaigns` gibi) controller bazında `@PreAuthorize` ile kısıtlanması veya `SecurityConfig` içindeki rol eşleşmelerinin kontrol edilmesi.
3. **Orta (🟡):** `CloudinaryConfig` içerisindeki `System.out.println` ifadelerinin kaldırılıp yerine Logger (`log.info`/`log.debug`) kullanılması.
4. **Orta (🟡):** 300 satırı aşan God Object servislerinin (`MemoryService` (584 satır), `ForumService` (381 satır), `EnumReadService` (371 satır)) alt servislere bölünmesi.
5. **Düşük (🟢):** `ListingMapper:376` içerisindeki boş catch bloğunun temizlenmesi/loglanması ve `throws Exception` kullanan metotların spesifik exception sınıflarına dönüştürülmesi.

## Temizlik Tahmini
| Öncelik | İş | Dosya Sayısı |
|---------|-----|-------------|
| 🔴 Kritik | Constructor injection refactor & Controller yetki kontrolleri | 15 |
| 🟡 Orta | God Object servis parçalama & `System.out` temizliği | 12 |
| 🟢 Düşük | Boş catch temizliği & `throws Exception` güncellemesi | 13 |
"""

with open(report_path, "w", encoding="utf-8") as f:
    f.write(md)

print(f"Report generated successfully at {report_path}")
