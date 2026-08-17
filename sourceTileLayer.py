
"""
File: sourceTileLayer.py
Robotics @ Maryland - Terraformers Software

Description: This contains a scraping program that downloads tile layer data from a specified lat, long bounding box 
at a range of zoom levels from ESRI World Imagery servers.

Author: Leo Abubucker
Sub-Team: User Interface
Contact: Leo Abubucker (leokumar@outlook.com)

Last Modified: 08-17-2026 (MM-DD-YYYY)
"""
import math # required to convert lat, long degrees to tiles
import os # required to save files and create folders
import time # required to briefly sleep between requests
import requests # required to access ESRI World Imagery servers

# --- CONFIGURATION ---
# 2-mile bounding box around Badlands Community Facility, Drumheller, AB (51.46715, -112.70603)
MIN_LAT, MAX_LAT = 51.4381, 51.4962
MIN_LON, MAX_LON = -112.7530, -112.6590

# Define zoom levels to download (up to native max 19)
MIN_ZOOM = 15
MAX_ZOOM = 19

OUTPUT_DIR = "./offline_world_imagery_circ"
# ---------------------

"""
Description: converts a given lat, long, and zoom level to an x and y tile

Parameters: 
lat (float): latitude to convert
long (float): longitude to convert
zoom (int): zoom level to use

Returns:
(int, int): x-tile, y-tile
"""
def deg2tile(lat, lon, zoom):
    lat_rad = math.radians(lat)
    n = 2.0 ** zoom
    xtile = int((lon + 180.0) / 360.0 * n)
    ytile = int((1.0 - math.asinh(math.tan(lat_rad)) / math.pi) / 2.0 * n)
    return xtile, ytile

"""
Description: main execution function that queries ESRI World Imagery servers on ARCGIS and downloads tiles between MIN_ZOOM and MAX_ZOOM 
between the min and max lat, long into the folder structure that leaflet and other map visualization tools expect.
"""
def main():
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
                # Exports as folder/zoomlevel/subfolder/img -> OUTPUT_DIR/z/x/y.png
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
                    time.sleep(0.05)  # don't hammer the servers
                except Exception as e:
                    print(f"Error on {z}/{x}/{y}: {e}")

    print("Download complete!")

main()