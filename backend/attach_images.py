import os
import shutil
import django

os.environ.setdefault("DJANGO_SETTINGS_MODULE", "config.settings")
django.setup()

from rental.models import Tractor

# Directory setup
MEDIA_TRACTORS_DIR = os.path.join(os.path.dirname(__file__), "media", "tractors")
os.makedirs(MEDIA_TRACTORS_DIR, exist_ok=True)

# Generated image paths
generated_images = {
    "Mahindra": r"C:\Users\ARJUN\.gemini\antigravity-ide\brain\1b9c2e34-48ad-4243-8e38-c57a3e728f03\mahindra_tractor_1786451023951.png",
    "Swaraj": r"C:\Users\ARJUN\.gemini\antigravity-ide\brain\1b9c2e34-48ad-4243-8e38-c57a3e728f03\swaraj_tractor_1786451037592.png",
    "John Deere": r"C:\Users\ARJUN\.gemini\antigravity-ide\brain\1b9c2e34-48ad-4243-8e38-c57a3e728f03\johndeere_tractor_1786451294664.png",
    "Sonalika": r"C:\Users\ARJUN\.gemini\antigravity-ide\brain\1b9c2e34-48ad-4243-8e38-c57a3e728f03\sonalika_tractor_1786451719610.png",
    "Farmtrac": r"C:\Users\ARJUN\.gemini\antigravity-ide\brain\1b9c2e34-48ad-4243-8e38-c57a3e728f03\farmtrac_tractor_1786451991909.png",
}

for brand, src_path in generated_images.items():
    if os.path.exists(src_path):
        filename = f"{brand.lower().replace(' ', '_')}_gen.png"
        dest_path = os.path.join(MEDIA_TRACTORS_DIR, filename)
        shutil.copy2(src_path, dest_path)
        print(f"Copied {src_path} -> {dest_path}")

        # Update database
        tractors = Tractor.objects.filter(brand__icontains=brand)
        for t in tractors:
            t.image = f"tractors/{filename}"
            t.save()
            print(f"Updated tractor ID {t.id} ({t.name}) with image: tractors/{filename}")

print("Finished attaching images to all database tractors!")
