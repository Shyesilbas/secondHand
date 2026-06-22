import os
import re

def parse_controller(file_path):
    with open(file_path, 'r', encoding='utf-8') as f:
        content = f.read()

    # Get class name
    class_name_match = re.search(r'public class (\w+)', content)
    if not class_name_match:
        return []
    controller_name = class_name_match.group(1)

    # Get base path
    base_path_match = re.search(r'@RequestMapping\("?([^"]*)"?\)', content)
    base_path = base_path_match.group(1) if base_path_match else ""

    # Split methods (approximate by annotations)
    # We look for @GetMapping, @PostMapping, etc.
    methods = []
    
    # Regular expression to find methods with their annotations
    # This is a simplified regex and might need adjustment for complex cases
    method_regex = r'(@(?:GetMapping|PostMapping|PutMapping|DeleteMapping|PatchMapping|RequestMapping)\s*\((?:[^)]*)\))?\s*((?:@[^@\n]+\n\s*)*)\s*public\s+([\w<>?.,\s]+)\s+(\w+)\s*\(([^)]*)\)'
    
    # Actually, a better way might be to iterate through lines and track context
    lines = content.split('\n')
    current_method_annotations = []
    
    for i, line in enumerate(lines):
        stripped = line.strip()
        if stripped.startswith('@') and any(m in stripped for m in ['GetMapping', 'PostMapping', 'PutMapping', 'DeleteMapping', 'PatchMapping', 'RequestMapping']):
            # Found a mapping annotation
            mapping_match = re.search(r'@(\w+)Mapping(?:\("?([^"]*)"?\))?', stripped)
            if mapping_match:
                m_type = mapping_match.group(1).upper()
                if m_type == 'REQUEST':
                    # Try to find method attribute in RequestMapping
                    method_attr = re.search(r'method\s*=\s*RequestMethod\.(\w+)', stripped)
                    m_type = method_attr.group(1) if method_attr else 'GET' # Default GET
                
                m_path = mapping_match.group(2) if mapping_match.group(2) else ""
                
                # Check for auth in preceding lines or this line
                auth = "Hayır"
                is_public = "Evet"
                # Look back a few lines for @PreAuthorize or @PublicEndpoint
                context = "\n".join(lines[max(0, i-5):i+1])
                if "@PreAuthorize" in context:
                    auth = "Evet (@PreAuthorize)"
                    is_public = "Hayır"
                elif "@PublicEndpoint" in context:
                    auth = "Hayır (@PublicEndpoint)"
                    is_public = "Evet"
                elif "Authentication" in line or "@AuthenticationPrincipal" in line:
                    auth = "Evet (Parametre)"
                    is_public = "Hayır"
                else:
                    # Check class level auth? Usually it's method level in this project
                    if "@PreAuthorize" in content[:content.find(controller_name)]:
                         auth = "Evet (Class level)"
                         is_public = "Hayır"

                # Find method signature in subsequent lines
                sig_line = ""
                for j in range(i + 1, min(i + 10, len(lines))):
                    if "public" in lines[j] and "(" in lines[j]:
                        sig_line = lines[j]
                        break
                
                if sig_line:
                    sig_match = re.search(r'public\s+([\w<>?.,\s]+)\s+(\w+)\s*\(([^)]*)\)', sig_line)
                    if sig_match:
                        return_type = sig_match.group(1).strip()
                        params = sig_match.group(3)
                        
                        has_body = "Evet" if "@RequestBody" in params else "Hayır"
                        path_vars = ", ".join(re.findall(r'@PathVariable\s*(?:\("?([^"]*)"?\))?\s*[\w<>]+ \w+', params))
                        # Cleanup path_vars if empty names were captured
                        if not path_vars or path_vars == "":
                             path_vars = "Evet" if "@PathVariable" in params else "Hayır"
                        
                        query_params = "Evet" if "@RequestParam" in params else "Hayır"
                        
                        methods.append({
                            'controller': controller_name,
                            'method': m_type,
                            'path': base_path + m_path,
                            'auth': auth,
                            'body': has_body,
                            'params': f"Path: {path_vars}, Query: {query_params}",
                            'return_type': return_type
                        })

    return methods

def main():
    root_dir = 'src/main/java/com/serhat/secondhand'
    all_endpoints = []
    
    for root, dirs, files in os.walk(root_dir):
        for file in files:
            if file.endswith('Controller.java'):
                file_path = os.path.join(root, file)
                all_endpoints.extend(parse_controller(file_path))

    # Sort endpoints by path
    all_endpoints.sort(key=lambda x: x['path'])

    # Write report
    with open('.agents/ENDPOINT_AUDIT.md', 'w', encoding='utf-8') as f:
        f.write("# Endpoint Audit Raporu\n")
        f.write("_Tarih: 2026-06-22_\n\n")
        
        f.write("## Tutarsızlıklar\n\n")
        
        f.write("### Path Formatı Sorunları\n")
        f.write("| Controller | Mevcut Path | Olması Gereken | Sorun |\n")
        f.write("|-----------|-------------|----------------|-------|\n")
        
        # Analyze inconsistencies
        inconsistencies = []
        for ep in all_endpoints:
            path = ep['path']
            controller = ep['controller']
            issues = []
            
            # WebSocket check
            if any(ws in path for ws in ['/ws', '/stomp', '/topic', '/queue']):
                continue
                
            if not path.startswith('/api/v1/'):
                issues.append("v1 eksik veya yanlış başlangıç")
            
            # CamelCase check (simplified)
            if re.search(r'[a-z][A-Z]', path):
                issues.append("CamelCase kullanımı (kebab-case olmalı)")
            
            # Singular/Plural check is hard with regex, but we can flag some obvious ones
            # This is just a placeholder for manual review or simple rules
            
            if issues:
                # Suggest a fix
                fixed_path = path
                if not path.startswith('/api/v1/'):
                    if path.startswith('/api/'):
                        fixed_path = '/api/v1/' + path[5:]
                    else:
                        fixed_path = '/api/v1' + (path if path.startswith('/') else '/' + path)
                
                # Simple camel to kebab
                fixed_path = re.sub(r'([a-z])([A-Z])', r'\1-\2', fixed_path).lower()
                
                f.write(f"| {controller} | {path} | {fixed_path} | {', '.join(issues)} |\n")

        f.write("\n### Versiyon Eksikliği\n")
        f.write("| Controller | Path | Sorun |\n")
        f.write("|-----------|------|-------|\n")
        for ep in all_endpoints:
            if not ep['path'].startswith('/api/v1/') and not any(ws in ep['path'] for ws in ['/ws', '/stomp']):
                 f.write(f"| {ep['controller']} | {ep['path']} | /api/v1 eksik |\n")

        f.write("\n### Naming Convention İhlalleri\n")
        f.write("| Controller | Path | Sorun |\n")
        f.write("|-----------|------|-------|\n")
        for ep in all_endpoints:
            if re.search(r'[a-z][A-Z]', ep['path']):
                 f.write(f"| {ep['controller']} | {ep['path']} | kebab-case değil |\n")

        f.write("\n## Tam Endpoint Listesi\n")
        f.write("| # | Method | Path | Auth | Body | Params | Controller |\n")
        f.write("|---|--------|------|------|------|--------|-----------|\n")
        
        for i, ep in enumerate(all_endpoints, 1):
            f.write(f"| {i} | {ep['method']} | {ep['path']} | {ep['auth']} | {ep['body']} | {ep['params']} | {ep['controller']} |\n")

if __name__ == "__main__":
    main()
