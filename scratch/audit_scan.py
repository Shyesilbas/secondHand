import os
import re
import json

ROOT_DIR = "/Users/serhat/IdeaProjects/secondHand/src/main/java/com/serhat/secondhand"
EXCLUDE_DIR = "payment"

# Regex patterns
PATTERNS = {
    # 1. Hardcoded values
    "magic_numbers": [
        (re.compile(r'\bquota\s*==\s*2\b'), "Magic number: quota == 2"),
        (re.compile(r'\*\s*0\.18\b'), "Magic number: multiplier * 0.18"),
        (re.compile(r'\+\s*50\b'), "Magic number: addition + 50"),
        (re.compile(r'<=\s*0\b'), "Comparison <= 0 (check if magic number context)"),
        (re.compile(r'\b(==|!=|>|<|>=|<=)\s*(?!0\b)(?!1\b)\d+\b'), "Comparison with magic number (not 0 or 1)")
    ],
    "hardcoded_strings": [
        (re.compile(r'"admin"'), 'Hardcoded string: "admin"'),
        (re.compile(r'"ROLE_USER"'), 'Hardcoded string: "ROLE_USER"'),
        (re.compile(r'"tr"'), 'Hardcoded string: "tr"'),
        (re.compile(r'"https?://[^"]+"'), 'Hardcoded URL'),
        (re.compile(r'"[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}"'), 'Hardcoded email')
    ],
    "hardcoded_money": [
        (re.compile(r'\b\d+\.\d+\b'), "Hardcoded decimal number (money or rate indicator)")
    ],
    "hardcoded_durations": [
        (re.compile(r'\b60\s*\*\s*60\b'), "Hardcoded duration calculation (60 * 60)"),
        (re.compile(r'\b24\s*\*\s*60\b'), "Hardcoded duration calculation (24 * 60)")
    ],
    # 2. Legacy patterns
    "autowired_field": re.compile(r'@Autowired\b'),
    "new_date": re.compile(r'\bnew\s+(java\.util\.)?Date\s*\('),
    "sysout_or_stacktrace": re.compile(r'\bSystem\.out\.print|\.printStackTrace\s*\('),
    "raw_types": re.compile(r'\b(List|Map|Set|HashMap|ArrayList)\s+[a-zA-Z0-9_]+\s*=\s*new\s+\1\s*\('),
    "sql_concat": re.compile(r'"\s*(SELECT|INSERT|UPDATE|DELETE)\b.*"\s*\+'),
    # 3. Security
    "sensitive_logging": re.compile(r'log\.(info|debug|warn|error|trace)\(.*(password|token|secret|cvv|credential).*', re.IGNORECASE),
    "todo_fixme": re.compile(r'\b(TODO|FIXME)\b'),
    # 4. Code quality
    "empty_catch": re.compile(r'catch\s*\(\s*[a-zA-Z0-9_.]+\s+[a-zA-Z0-9_]+\s*\)\s*\{\s*\}'),
    "throws_exception": re.compile(r'\bthrows\s+Exception\b')
}

def check_commented_code(lines):
    commented_blocks = []
    consecutive_comments = []
    for idx, line in enumerate(lines):
        clean = line.strip()
        if clean.startswith("//"):
            # Check if it looks like code
            code_indicator = clean.endswith(";") or "{" in clean or "}" in clean or "if(" in clean or "for(" in clean or "return" in clean
            if code_indicator:
                consecutive_comments.append((idx + 1, line))
            else:
                if len(consecutive_comments) >= 3:
                    commented_blocks.append(consecutive_comments)
                consecutive_comments = []
        else:
            if len(consecutive_comments) >= 3:
                commented_blocks.append(consecutive_comments)
            consecutive_comments = []
    if len(consecutive_comments) >= 3:
        commented_blocks.append(consecutive_comments)
    return commented_blocks

def check_nested_if(lines):
    nested_ifs = []
    brace_depth = 0
    if_stack = [] # stores (line_num, brace_depth)
    for idx, line in enumerate(lines):
        clean = line.strip()
        open_braces = clean.count("{")
        close_braces = clean.count("}")
        
        if re.search(r'\bif\s*\(', clean):
            # Check depth relative to existing if statements in stack
            if_stack = [item for item in if_stack if item[1] < brace_depth]
            if_stack.append((idx + 1, brace_depth))
            if len(if_stack) >= 3:
                nested_ifs.append((idx + 1, f"Nested if statements at depth {len(if_stack)}"))
        
        brace_depth += open_braces - close_braces
        if brace_depth < 0:
            brace_depth = 0
    return nested_ifs

results = {
    "magic_numbers": [],
    "hardcoded_strings": [],
    "hardcoded_money": [],
    "hardcoded_durations": [],
    "autowired_field": [],
    "new_date": [],
    "sysout_or_stacktrace": [],
    "raw_types": [],
    "sql_concat": [],
    "sensitive_logging": [],
    "preauthorize_missing": [],
    "todo_fixme": [],
    "commented_code": [],
    "god_objects": [],
    "nested_ifs": [],
    "empty_catch": [],
    "throws_exception": []
}

def scan_file(filepath):
    rel_path = os.path.relpath(filepath, "/Users/serhat/IdeaProjects/secondHand")
    with open(filepath, 'r', encoding='utf-8', errors='ignore') as f:
        content = f.read()
        lines = content.splitlines()

    # God object check (> 300 lines and is a service)
    if len(lines) > 300 and ("@Service" in content or filepath.endswith("Service.java")):
        results["god_objects"].append((rel_path, len(lines), f"Service class has {len(lines)} lines"))

    # Controller PreAuthorize check
    is_controller = "@RestController" in content or "@Controller" in content or filepath.endswith("Controller.java")
    if is_controller:
        # Check if the class has class-level PreAuthorize or similar
        has_class_security = "@PreAuthorize" in content or "@Secured" in content or "@RolesAllowed" in content
        # Find methods with Mapping annotations
        in_class_body = False
        brace_count = 0
        method_annotations = []
        
        for idx, line in enumerate(lines):
            clean = line.strip()
            if not in_class_body:
                if "class " in clean and "{" in clean:
                    in_class_body = True
                    brace_count = 1
                continue
            
            # Count braces inside class
            brace_count += clean.count("{") - clean.count("}")
            if brace_count <= 0:
                in_class_body = False
                continue
            
            # Accumulate annotations
            if clean.startswith("@"):
                method_annotations.append(clean)
            elif clean and not clean.startswith("//") and not clean.startswith("/*"):
                is_mapping = any(re.search(r'@(GetMapping|PostMapping|PutMapping|DeleteMapping|PatchMapping|RequestMapping)\b', ann) for ann in method_annotations)
                if is_mapping:
                    has_security = any(re.search(r'@(PreAuthorize|Secured|RolesAllowed|PermitAll)\b', ann) for ann in method_annotations)
                    if not has_security and not has_class_security:
                        results["preauthorize_missing"].append((rel_path, idx + 1, clean, "Endpoint missing @PreAuthorize / security annotation"))
                if not clean.startswith("@"):
                    method_annotations = []

    # Line-by-line checks
    for idx, line in enumerate(lines):
        line_num = idx + 1
        clean = line.strip()
        
        is_comment = clean.startswith("//") or clean.startswith("*") or clean.startswith("/*")
        
        if PATTERNS["todo_fixme"].search(line):
            results["todo_fixme"].append((rel_path, line_num, clean))
            
        if is_comment:
            continue

        # 1. Hardcoded values
        for regex, desc in PATTERNS["magic_numbers"]:
            if regex.search(clean):
                if not re.search(r'\b(int|double|float|long)\s+[a-zA-Z0-9_]+\s*=\s*[01];', clean):
                    results["magic_numbers"].append((rel_path, line_num, clean, desc))

        for regex, desc in PATTERNS["hardcoded_strings"]:
            if regex.search(clean):
                results["hardcoded_strings"].append((rel_path, line_num, clean, desc))

        if PATTERNS["hardcoded_money"][0][0].search(clean):
            if not re.search(r'\b(version|id|page|size|status|code)\b', clean, re.I):
                results["hardcoded_money"].append((rel_path, line_num, clean))

        for regex, desc in PATTERNS["hardcoded_durations"]:
            if regex.search(clean):
                results["hardcoded_durations"].append((rel_path, line_num, clean, desc))

        # 2. Legacy patterns
        if PATTERNS["autowired_field"].search(clean):
            results["autowired_field"].append((rel_path, line_num, clean))

        if PATTERNS["new_date"].search(clean):
            results["new_date"].append((rel_path, line_num, clean))

        if PATTERNS["sysout_or_stacktrace"].search(clean):
            results["sysout_or_stacktrace"].append((rel_path, line_num, clean))

        if PATTERNS["raw_types"].search(clean):
            results["raw_types"].append((rel_path, line_num, clean))

        if PATTERNS["sql_concat"].search(clean):
            results["sql_concat"].append((rel_path, line_num, clean))

        # 3. Security
        if PATTERNS["sensitive_logging"].search(clean):
            results["sensitive_logging"].append((rel_path, line_num, clean))

        # 4. Code quality
        if PATTERNS["empty_catch"].search(clean):
            results["empty_catch"].append((rel_path, line_num, clean))

        if PATTERNS["throws_exception"].search(clean):
            results["throws_exception"].append((rel_path, line_num, clean))

    # Commented-out code blocks (3+ lines)
    commented_blocks = check_commented_code(lines)
    for block in commented_blocks:
        start_line = block[0][0]
        snippet = " | ".join([item[1].strip() for item in block[:3]])
        results["commented_code"].append((rel_path, start_line, f"Commented code block (length {len(block)}): {snippet}..."))

    # Nested ifs
    nested_ifs = check_nested_if(lines)
    for line_num, desc in nested_ifs:
        results["nested_ifs"].append((rel_path, line_num, lines[line_num - 1].strip(), desc))


def main():
    for root, dirs, files in os.walk(ROOT_DIR):
        # Exclude payment package
        if EXCLUDE_DIR in root.split(os.sep):
            continue
        for file in files:
            if file.endswith(".java"):
                scan_file(os.path.join(root, file))

    # Print summary and details
    print("=== SCAN COMPLETED ===")
    for key, items in results.items():
        print(f"{key}: {len(items)}")

    # Write output to JSON file
    output_path = "/Users/serhat/IdeaProjects/secondHand/scratch/audit_results.json"
    with open(output_path, "w", encoding="utf-8") as f:
        json.dump(results, f, indent=2)
    print(f"Results written to {output_path}")

if __name__ == "__main__":
    main()
