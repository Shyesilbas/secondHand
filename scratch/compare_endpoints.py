import re

def load_backend_endpoints():
    endpoints = []
    with open('.agents/ENDPOINT_AUDIT.md', 'r', encoding='utf-8') as f:
        lines = f.readlines()
        in_table = False
        for line in lines:
            if "## Tam Endpoint Listesi" in line:
                in_table = True
                continue
            if in_table and line.startswith('|') and not 'Method' in line and not '---' in line:
                parts = [p.strip() for p in line.split('|')]
                if len(parts) > 3:
                    method = parts[2]
                    path = parts[3]
                    # path might contain {id}, {listing-id}, etc.
                    # Convert to a format we can compare or just keep the raw path
                    endpoints.append((method, path))
    return endpoints

def load_frontend_endpoints():
    endpoints = []
    with open('secondhand-frontend/src/common/constants/apiEndpoints.js', 'r', encoding='utf-8') as f:
        content = f.read()
    
    # Simple regex to find string values
    # e.g., LOGIN: '/auth/login'
    # or CREATE_LISTING_ROOM: (listingId) => `/chat/rooms/listing/${listingId}`
    lines = content.split('\n')
    for line in lines:
        line = line.strip()
        if ':' in line and ('\'' in line or '`' in line):
            # Extract the string part
            match_string = re.search(r"'(.*?)'", line)
            match_template = re.search(r"`(.*?)`", line)
            
            key = line.split(':')[0].strip()
            
            if match_string:
                path = match_string.group(1)
                endpoints.append((key, path, line))
            elif match_template:
                path = match_template.group(1)
                endpoints.append((key, path, line))
    return endpoints

backend_eps = load_backend_endpoints()
backend_paths = [p for m, p in backend_eps]

frontend_eps = load_frontend_endpoints()

print("Mismatched Frontend Endpoints:")
for key, f_path, raw_line in frontend_eps:
    # Full frontend path will be /api + f_path (or similar, depending on API_BASE_URL)
    full_f_path = "/api" + (f_path if f_path.startswith('/') else '/' + f_path)
    
    # Replace ${...} with {...} for comparison
    clean_f_path = re.sub(r'\$\{.*?\}', '{id}', full_f_path)
    clean_f_path = re.sub(r'\{[a-zA-Z0-9_-]+\}', '{id}', clean_f_path)
    
    # Try to find a matching backend path
    found = False
    for b_path in backend_paths:
        clean_b_path = re.sub(r'\{[a-zA-Z0-9_-]+\}', '{id}', b_path)
        if clean_f_path == clean_b_path:
            found = True
            break
            
    if not found:
        print(f"NOT FOUND: {full_f_path} (from {key}: {f_path})")

