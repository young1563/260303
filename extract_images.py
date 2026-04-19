import os
from PyPDF2 import PdfReader

def extract_images(pdf_path, output_dir):
    if not os.path.exists(output_dir):
        os.makedirs(output_dir)
        
    reader = PdfReader(pdf_path)
    count = 0
    for page_num, page in enumerate(reader.pages):
        for image_file_object in page.images:
            with open(os.path.join(output_dir, str(count) + "_" + image_file_object.name), "wb") as fp:
                fp.write(image_file_object.data)
                count += 1
                
if __name__ == "__main__":
    pdf_path = "data/Gamesforum-Intelligence-Hypercasual-Gaming-Report.pdf"
    output_dir = "img/report_images"
    try:
        extract_images(pdf_path, output_dir)
        print("Images extracted successfully.")
    except Exception as e:
        print(f"Error: {e}")
