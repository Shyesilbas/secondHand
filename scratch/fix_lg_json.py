import json
import os

files_to_fix = [
    "src/main/resources/data/electronics/monitors/lg.json",
    "src/main/resources/data/electronics/speakers/lg.json",
    "src/main/resources/data/electronics/air_conditioners/lg.json",
    "src/main/resources/data/electronics/washing_machines/lg.json",
    "src/main/resources/data/electronics/robot_vacuums/lg.json",
    "src/main/resources/data/electronics/phones/lg.json"
]

for file_path in files_to_fix:
    print(f"Processing {file_path}...")
    with open(file_path, 'r') as f:
        data = json.load(f)

    if isinstance(data, dict) and "models" in data:
        brand = data.get("brand")
        etype = data.get("type")
        models = data.get("models")

        new_data = []
        for model in models:
            new_model = {
                "brand": brand,
                "type": etype,
                "name": model.get("name"),
                "releaseYear": model.get("releaseYear"),
                "isLegacy": model.get("isLegacy"),
                "aliases": model.get("aliases")
            }
            new_data.append(new_model)

        with open(file_path, 'w') as f:
            json.dump(new_data, f, indent=2)
        print(f"Successfully converted {file_path}")
    else:
        print(f"Skipping {file_path}, already in correct format or unknown format.")

