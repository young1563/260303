import os
import fitz  # PyMuPDF

def extract_images_from_pdf(pdf_path, output_dir):
    if not os.path.exists(output_dir):
        os.makedirs(output_dir)
        
    doc = fitz.open(pdf_path)
    count = 0
    for i in range(len(doc)):
        page = doc.load_page(i)
        image_list = page.get_images(full=True)
        for image_index, img in enumerate(image_list, start=1):
            xref = img[0]
            base_image = doc.extract_image(xref)
            image_bytes = base_image["image"]
            image_ext = base_image["ext"]
            image_name = f"page{i+1}_img{image_index}.{image_ext}"
            
            with open(os.path.join(output_dir, image_name), "wb") as f:
                f.write(image_bytes)
            count += 1
    print(f"Extracted {count} images.")

if __name__ == "__main__":
    pdf_path = "data/Gamesforum-Intelligence-Hypercasual-Gaming-Report.pdf"
    output_dir = "img/report_images"
    extract_images_from_pdf(pdf_path, output_dir)
