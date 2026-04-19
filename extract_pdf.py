import PyPDF2
import sys

def extract_text(pdf_path, output_path):
    with open(pdf_path, 'rb') as file:
        reader = PyPDF2.PdfReader(file)
        text = ""
        for i, page in enumerate(reader.pages):
            text += f"--- Page {i + 1} ---\n"
            text += page.extract_text() + "\n\n"
    
    with open(output_path, 'w', encoding='utf-8') as file:
        file.write(text)

if __name__ == "__main__":
    extract_text("data/Gamesforum-Intelligence-Hypercasual-Gaming-Report.pdf", "data/Gamesforum-Intelligence-Hypercasual-Gaming-Report.txt")
