# Script to parse V19 PDF and generate complete new structured data with sections
import json
import re

# We will read v19_extracted_text.txt and build the exact session hierarchy
with open('v19_extracted_text.txt', 'r') as f:
    text = f.read()

pages_raw = text.split('=== PAGE ')
page_dict = {}
for p in pages_raw:
    if not p.strip():
        continue
    lines = p.split('\n')
    page_num = int(lines[0].split()[0])
    page_dict[page_num] = lines[1:]

print("Loaded pages:", sorted(page_dict.keys()))
