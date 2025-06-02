import fitz  # PyMuPDF
from uuid import uuid4
from typing import List, Dict
import os

def extract_pdf_text(file_path: str) -> str:
    doc = fitz.open(file_path)
    return "".join([page.get_text() for page in doc])

def extract_property_images_from_pdf(
    file_path: str,
    static_dir: str,
    min_width=300,
    min_height=200,
    min_filesize=10 * 1024,
    min_aspect_ratio=1.0,
    max_aspect_ratio=4.0,
) -> List[Dict]:
    """
    Extract images from PDF that match criteria,
    save them to static_dir and return metadata list.
    """
    os.makedirs(static_dir, exist_ok=True)

    doc = fitz.open(file_path)
    property_images = []

    for page_num in range(len(doc)):
        for img_index, img in enumerate(doc[page_num].get_images(full=True)):
            xref = img[0]
            base_image = doc.extract_image(xref)
            width = base_image.get("width", 0)
            height = base_image.get("height", 0)
            image_bytes = base_image["image"]
            filesize = len(image_bytes)
            ext = base_image["ext"]

            aspect_ratio = width / height if height > 0 else 0

            if (
                width >= min_width
                and height >= min_height
                and filesize >= min_filesize
                and min_aspect_ratio <= aspect_ratio <= max_aspect_ratio
            ):
                filename = f"{uuid4().hex}_p{page_num + 1}.{ext}"
                filepath = os.path.join(static_dir, filename)
                with open(filepath, "wb") as f:
                    f.write(image_bytes)

                property_images.append({
                    "page": page_num + 1,
                    "filename": filename,
                    "filepath": filepath,
                    "size": filesize,
                    "width": width,
                    "height": height,
                    "aspect_ratio": aspect_ratio,
                    "url": f"/images/{filename}",
                })

    # Sort images by page then descending size
    property_images.sort(key=lambda x: (x["page"], -x["size"]))
    return property_images
