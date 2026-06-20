import os
import re

dirs = [
    "src/main/java/com/serhat/secondHand/auth",
    "src/main/java/com/serhat/secondHand/listing",
    "src/main/java/com/serhat/secondHand/ewallet",
    "src/main/java/com/serhat/secondHand/ai"
]

def refactor_file(path):
    with open(path, 'r') as f:
        content = f.read()

    original = content

    if "RestController" not in content and "ControllerSupport" not in path:
        return

    # Add imports
    if "import com.serhat.secondhand.core.result.Result;" not in content:
        content = re.sub(r'package (.*?);\n', r'package \1;\n\nimport com.serhat.secondhand.core.result.Result;\nimport com.serhat.secondhand.core.result.ResultResponses;\n', content)

    # Convert return types to ResponseEntity<?>
    # Match public ResponseEntity<Foo> methodName(
    content = re.sub(r'(public\s+)ResponseEntity<[a-zA-Z0-9_<>,\s?]+>(\s+[a-zA-Z0-9_]+\()', r'\1ResponseEntity<?>\2', content)

    # Convert return statements
    content = re.sub(r'return\s+ResponseEntity\.ok\((.+?)\);', r'return ResultResponses.ok(Result.success(\1));', content)
    content = re.sub(r'return\s+ResponseEntity\.ok\(\)\.build\(\);', r'return ResultResponses.ok(Result.success());', content)
    content = re.sub(r'return\s+ResponseEntity\.noContent\(\)\.build\(\);', r'return ResultResponses.noContent(Result.success());', content)
    content = re.sub(r'return\s+ResponseEntity\.created\([^)]+\)\.body\((.+?)\);', r'return ResultResponses.created(Result.success(\1));', content)

    if content != original:
        with open(path, 'w') as f:
            f.write(content)
        print(f"Refactored {path}")

for d in dirs:
    for root, _, files in os.walk(d):
        for file in files:
            if file.endswith(".java"):
                refactor_file(os.path.join(root, file))
