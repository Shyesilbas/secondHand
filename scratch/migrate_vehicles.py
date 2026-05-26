import os
import json
import re

def to_kebab_case(name):
    # e.g., MERCEDES_BENZ -> mercedes-benz
    name = name.lower()
    return re.sub(r'[^a-z0-9]+', '-', name).strip('-')

def main():
    source_file = "/Users/serhat/IdeaProjects/secondHand/src/main/resources/seed/vehicle.json"
    target_base_dir = "/Users/serhat/IdeaProjects/secondHand/src/main/resources/data/vehicles"
    
    if not os.path.exists(source_file):
        print(f"Source file {source_file} not found!")
        return

    with open(source_file, "r", encoding="utf-8") as f:
        catalog = json.load(f)
        
    brands_list = catalog.get("brands", [])
    types_list = catalog.get("types", [])
    models_list = catalog.get("models", [])
    
    # Map brand keys to labels for display name
    brand_labels = {b["key"]: b["label"] for b in brands_list}
    
    # We group models by brand + type
    # For brands.json structure, we collect all active brands and their supported types
    brand_types_map = {}
    
    # Group models into their respective brand+type arrays
    grouped_models = {}
    for model in models_list:
        brand = model.get("brand")
        type_ = model.get("type")
        if not brand or not type_:
            continue
            
        key = (brand, type_)
        if key not in grouped_models:
            grouped_models[key] = []
        grouped_models[key].append(model)
        
        if brand not in brand_types_map:
            brand_types_map[brand] = set()
        brand_types_map[brand].add(type_)

    # Create directories
    type_subfolders = {
        "CAR": "cars",
        "MOTORCYCLE": "motorcycles",
        "OTHER": "commercial"
    }

    # Make target directories
    for sub in ["cars", "motorcycles", "commercial"]:
        os.makedirs(os.path.join(target_base_dir, sub), exist_ok=True)

    # Let's build the brands.json
    brands_json_output = []
    
    for brand_key in sorted(brand_labels.keys()):
        display_name = brand_labels[brand_key]
        supported_types = []
        
        # Check active types in models list
        active_types = sorted(list(brand_types_map.get(brand_key, set())))
        if not active_types:
            # Fallback/placeholder, default to CAR if brand exists but has no models
            active_types = ["CAR"]
            
        for t in active_types:
            subfolder = type_subfolders.get(t, "commercial")
            file_name = f"{to_kebab_case(brand_key)}.json"
            rel_path = f"{subfolder}/{file_name}"
            
            supported_types.append({
                "type": t,
                "dataFile": rel_path
            })
            
            # Write specific brand+type models
            models_for_key = grouped_models.get((brand_key, t), [])
            # Always output an array
            dest_file = os.path.join(target_base_dir, subfolder, file_name)
            
            # Merge models if we are writing the same file name (in case different types go to same file, but here type+brand is unique or file_name is brand_key based)
            # To be absolutely sure, let's load existing models from that file if it was already created, or just write them
            existing_data = []
            if os.path.exists(dest_file):
                try:
                    with open(dest_file, "r", encoding="utf-8") as df:
                        existing_data = json.load(df)
                except Exception:
                    existing_data = []
            
            # Combine unique by model name
            combined = {m["name"]: m for m in existing_data}
            for m in models_for_key:
                combined[m["name"]] = m
                
            with open(dest_file, "w", encoding="utf-8") as df:
                json.dump(list(combined.values()), df, indent=2, ensure_ascii=False)
                print(f"Wrote brand data file: {dest_file}")
                
        brands_json_output.append({
            "brand": brand_key,
            "displayName": display_name,
            "supportedTypes": supported_types
        })
        
    brands_dest = os.path.join(target_base_dir, "brands.json")
    with open(brands_dest, "w", encoding="utf-8") as f:
        json.dump(brands_json_output, f, indent=2, ensure_ascii=False)
        print(f"Wrote brands.json metadata index: {brands_dest}")

if __name__ == "__main__":
    main()
