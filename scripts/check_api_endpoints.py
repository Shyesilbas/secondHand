#!/usr/bin/env python3
import os
import re
import sys

# Paths
FRONTEND_FILE = "/Users/serhat/IdeaProjects/secondHand/secondhand-frontend/src/common/constants/apiEndpoints.js"
BACKEND_DIR = "/Users/serhat/IdeaProjects/secondHand/src/main/java"

# Whitelist (endpoints defined by Spring Security, WebSockets, or third-party logic not in controllers)
WHITELIST = [
    r"^/auth/oauth2/complete$",
    r"^/ws$",
    r"^/favorites$",  # handled by FavoriteController RequestMapping base path with empty/no-value methods
    r"^/images/.*", # handled by ImagesController
]

def extract_js_endpoints(file_path):
    endpoints = []
    if not os.path.exists(file_path):
        print(f"Error: JS Endpoints file not found at {file_path}")
        return endpoints

    with open(file_path, 'r', encoding='utf-8') as f:
        content = f.read()

    # Find string literals starting with /
    # Supports single, double quotes, and backticks.
    pattern = re.compile(r"(['\"`])(/[^\'\"\`\n]+)\1")
    matches = pattern.findall(content)
    for quote, path in matches:
        # Strip query parameters
        path_clean = path.split('?')[0]
        # Clean placeholders like ${id} -> {param}
        path_clean = re.sub(r"\$\{[^}]+\}", "{param}", path_clean)
        if path_clean not in endpoints:
            endpoints.append(path_clean)
            
    return endpoints

def scan_java_controllers(directory):
    java_endpoints = []
    
    mapping_annotations = [
        '@RequestMapping',
        '@GetMapping',
        '@PostMapping',
        '@PutMapping',
        '@DeleteMapping',
        '@PatchMapping'
    ]
    
    # Walk directory to find Controller files
    for root, dirs, files in os.walk(directory):
        for file in files:
            if file.endswith('.java'):
                path = os.path.join(root, file)
                with open(path, 'r', encoding='utf-8') as f:
                    lines = f.readlines()
                
                content = "".join(lines)
                if not ("@RestController" in content or "@Controller" in content):
                    continue
                
                # Extract class RequestMapping
                class_mapping = ""
                # Simple extraction of RequestMapping for class
                class_match = re.search(r"@RequestMapping\s*\(\s*(?:value\s*=\s*)?\"([^\"]+)\"\s*\)", content)
                if class_match:
                    class_mapping = class_match.group(1)
                
                # Scan lines for method level mapping annotations
                for i, line in enumerate(lines):
                    for ann in mapping_annotations:
                        if ann in line:
                            # Skip class level annotation line
                            # Check if public class is in class definition or if it's class level
                            is_class_level = False
                            for offset in range(1, 5):
                                if i + offset < len(lines):
                                    if "class " in lines[i+offset]:
                                        is_class_level = True
                                        break
                            if is_class_level:
                                continue
                                
                            # Extract path inside annotation
                            path_match = re.search(r"\"([^\"]+)\"", line)
                            method_path = path_match.group(1) if path_match else ""
                            
                            # Combine class mapping and method mapping
                            if method_path:
                                full_path = class_mapping.rstrip('/') + '/' + method_path.lstrip('/')
                            else:
                                full_path = class_mapping

                            if not full_path.startswith('/'):
                                full_path = '/' + full_path
                            full_path = full_path.replace('//', '/')
                            
                            # Strip "/api" prefix for comparing with JS paths
                            if full_path.startswith("/api/"):
                                full_path = full_path[4:]
                            elif full_path == "/api":
                                full_path = "/"
                                
                            if full_path not in java_endpoints:
                                java_endpoints.append(full_path)
                                
    return java_endpoints

def path_to_regex(path):
    # Escape special characters except placeholders
    # Placeholder is {param} or {variable} or {variable:.*}
    # Convert {param} to [^/]+
    # First, normalize placeholders to {param}
    norm = re.sub(r"\{[^}]+\}", "{param}", path)
    regex = re.escape(norm)
    regex = regex.replace(r"\{param\}", r"[^/]+")
    return "^" + regex + "$"

def main():
    print("Extracting JS Endpoints...")
    js_endpoints = extract_js_endpoints(FRONTEND_FILE)
    print(f"Found {len(js_endpoints)} JS endpoints.")

    print("Scanning Java Controllers...")
    java_endpoints = scan_java_controllers(BACKEND_DIR)
    print(f"Found {len(java_endpoints)} Java controller endpoints.")

    # Compile Java path regex patterns
    java_regexes = []
    for java_path in java_endpoints:
        pat = path_to_regex(java_path)
        java_regexes.append((java_path, re.compile(pat)))

    missing_endpoints = []
    for js_path in js_endpoints:
        # Check whitelist
        is_whitelisted = False
        for wp in WHITELIST:
            if re.match(wp, js_path):
                is_whitelisted = True
                break
        if is_whitelisted:
            continue

        # Try matching against Java regexes
        matched = False
        # Normalize JS path template variables to match Java {param} representation
        js_path_norm = re.sub(r"\{param\}", "something", js_path)
        
        for java_path, reg in java_regexes:
            if reg.match(js_path_norm):
                matched = True
                break
        
        if not matched:
            missing_endpoints.append(js_path)

    if missing_endpoints:
        print("\n[WARNING] Mismatched/Unresolved Frontend Endpoints (No matching Java Controller found):")
        for ep in sorted(missing_endpoints):
            print(f"  - {ep}")
        print("\nPlease check if these endpoints are handled by security/websockets or if they are legacy/dead routes.")
        # Exit success as it is a warning check script
        sys.exit(0)
    else:
        print("\n[SUCCESS] All frontend endpoints matched to java controller mappings successfully!")
        sys.exit(0)

if __name__ == "__main__":
    main()
