import os
import sys
from pydantic import BaseModel
from pypdf import PdfWriter, PdfReader

def merge_sentinel_manuals():
    backend_dir = os.path.dirname(os.path.abspath(__file__))
    
    pdf1_path = os.path.join(backend_dir, "SENTINEL_AI_System_Directory_and_Role_Capabilities.pdf")
    pdf2_path = os.path.join(backend_dir, "SENTINEL_AI_System_Input_Output_Manual.pdf")
    output_pdf_path = os.path.join(backend_dir, "SENTINEL_AI_Master_System_Comprehensive_Manual.pdf")

    writer = PdfWriter()

    # Append PDF 1: System Directory & Role Capabilities
    if os.path.exists(pdf1_path):
        print(f"[+] Merging {pdf1_path}...")
        reader1 = PdfReader(pdf1_path)
        for page in reader1.pages:
            writer.add_page(page)
    else:
        print(f"[-] Warning: {pdf1_path} not found.")

    # Append PDF 2: System Input Output Manual
    if os.path.exists(pdf2_path):
        print(f"[+] Merging {pdf2_path}...")
        reader2 = PdfReader(pdf2_path)
        for page in reader2.pages:
            writer.add_page(page)
    else:
        print(f"[-] Warning: {pdf2_path} not found.")

    with open(output_pdf_path, "wb") as f_out:
        writer.write(f_out)

    print(f"\n[SUCCESS] Successfully created Master Combined PDF at:")
    print(f"  - Path: {output_pdf_path}")
    print(f"  - Total Pages: {len(writer.pages)}")
    return output_pdf_path

if __name__ == "__main__":
    merge_sentinel_manuals()
