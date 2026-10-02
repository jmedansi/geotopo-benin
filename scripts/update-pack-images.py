import os
import shutil
from PIL import Image

source_dir = r"C:\Users\jmeda\Downloads\Produits"
packs_dir = r"d:\boutique-benin\src\content\packs"

def convert_to_webp(src_file, dest_file):
    try:
        with Image.open(src_file) as img:
            img.convert("RGB").save(dest_file, "WEBP", quality=88)
            print(f"[OK] Cover WebP cree: {dest_file}")
            return True
    except Exception as e:
        print(f"Erreur conversion {src_file}: {e}")
        return False

# 1. Pack Topographe Complet (Station totale + trepied + canne + reflecteur)
path_pack1 = os.path.join(source_dir, "station total avec ces accessoires ( réflecteur, canne et trépied)", "WhatsApp Image 2026-09-28 at 22.42.34.jpeg")
dest_pack1 = os.path.join(packs_dir, "pack-topographe-complet", "cover.webp")

if os.path.exists(path_pack1):
    convert_to_webp(path_pack1, dest_pack1)
else:
    print(f"File not found: {path_pack1}")

# 2. Pack Brigade GNSS RTK Master (GNSS complet avec 2 trepieds, canne, reflecteur, bras, radio, PDA)
path_pack2 = os.path.join(source_dir, "Voici un gnss complet avec ses accessoires ( 2 trépied, canne, réflecteur, le bras, la radio, l'antenne et le PDA)", "WhatsApp Image 2026-09-28 at 23.02.13 (1).jpeg")
dest_pack2 = os.path.join(packs_dir, "pack-brigade-gnss-rtk", "cover.webp")

if os.path.exists(path_pack2):
    convert_to_webp(path_pack2, dest_pack2)
else:
    print(f"File not found: {path_pack2}")

# 3. Pack Nivellement Expert (Niveau Leica avec trepied et mire)
path_pack3 = os.path.join(source_dir, "Niveau de marque Leica model  NA532 avec ses accessoires ( trépied et Mire)", "WhatsApp Image 2026-09-28 at 22.48.26.jpeg")
dest_pack3 = os.path.join(packs_dir, "pack-nivellement-expert", "cover.webp")

if os.path.exists(path_pack3):
    convert_to_webp(path_pack3, dest_pack3)
else:
    print(f"File not found: {path_pack3}")

print("--- PACK COVERS REELS MIS A JOUR ---")
