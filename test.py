import math
import os
import time
import requests

# --- CONFIGURATION ---
# Define your area of interest (e.g., a small region in Tampa, FL)
MIN_LAT, MAX_LAT = 27.9300, 28.0000
MIN_LON, MAX_LON = -82.4800, -82.4200

# Define zoom levels to download (up to native max 19)
MIN_ZOOM = 15
MAX_ZOOM = 19

OUTPUT_DIR = "./offline_world_imagery"
# ---------------------

def deg2tile(lat, lon, zoom):
    lat_rad = math.radians(lat)
    n = 2.0 ** zoom
    xtile = int((lon + 180.0) / 360.0 * n)
    ytile = int((1.0 - math.asinh(math.tan(lat_rad)) / math.pi) / 2.0 * n)
    return xtile, ytile

url_template = "https://services.arcgisonline.com/arcgis/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}"
headers = {"User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64)"}

for z in range(MIN_ZOOM, MAX_ZOOM + 1):
    xmin, ymin = deg2tile(MAX_LAT, MIN_LON, z)
    xmax, ymax = deg2tile(MIN_LAT, MAX_LON, z)
    
    x_start, x_end = min(xmin, xmax), max(xmin, xmax)
    y_start, y_end = min(ymin, ymax), max(ymin, ymax)
    
    print(f"Downloading Zoom {z}: X ({x_start} to {x_end}), Y ({y_start} to {y_end})")
    
    for x in range(x_start, x_end + 1):
        for y in range(y_start, y_end + 1):
            tile_dir = os.path.join(OUTPUT_DIR, str(z), str(x))
            os.makedirs(tile_dir, exist_ok=True)
            tile_path = os.path.join(tile_dir, f"{y}.png")
            
            if os.path.exists(tile_path):
                continue  # Skip already downloaded tiles
                
            url = url_template.replace("{z}", str(z)).replace("{x}", str(x)).replace("{y}", str(y))
            
            try:
                response = requests.get(url, headers=headers, timeout=10)
                if response.status_code == 200:
                    with open(tile_path, "wb") as f:
                        f.write(response.content)
                else:
                    print(f"Failed to fetch {z}/{x}/{y}: Status {response.status_code}")
                time.sleep(0.05)  # Be polite to Esri servers
            except Exception as e:
                print(f"Error on {z}/{x}/{y}: {e}")

print("Download complete!")