import os
import re

html_files = [
    "about.html",
    "bookclub.html",
    "community.html",
    "contact.html",
    "impact.html",
    "index.html",
    "join.html",
    "programs.html",
    "special-focus.html",
    "structure.html",
    "summit.html"
]

base_dir = "c:\\Users\\NICOLE ZEPHONIE\\Desktop\\gapdrc-main"

for filename in html_files:
    filepath = os.path.join(base_dir, filename)
    if not os.path.exists(filepath):
        print(f"Skipping {filename}: not found.")
        continue

    with open(filepath, "r", encoding="utf-8") as f:
        content = f.read()

    # 1. Inject translations.js script tag before site.js
    if 'src="assets/js/translations.js"' not in content:
        content = content.replace(
            '<script defer src="assets/js/site.js"></script>',
            '<script defer src="assets/js/translations.js"></script>\n  <script defer src="assets/js/site.js"></script>'
        )

    # 2. Inject language switcher inside .header-tools with indentation matching
    if 'class="lang-selector-wrapper"' not in content:
        pattern = r'(<div class="header-tools">)(\s*)(<button class="theme-toggle")'
        replacement = (
            r'\1\2  <div class="lang-selector-wrapper">\n'
            r'\2    <button class="lang-btn" data-lang-btn="fr" aria-label="Langue Française">FR</button>\n'
            r'\2    <span class="lang-separator">|</span>\n'
            r'\2    <button class="lang-btn" data-lang-btn="en" aria-label="English Language">EN</button>\n'
            r'\2  </div>\n'
            r'\2\3'
        )
        content = re.sub(pattern, replacement, content)

    # 3. Fix data-page attributes to match translations dictionary mapping keys
    if filename == "index.html":
        content = content.replace('data-page="home"', 'data-page="index"')
    elif filename == "special-focus.html":
        content = content.replace('data-page="special-focus"', 'data-page="focus"')
    elif filename == "structure.html":
        content = content.replace('data-page="structure"', 'data-page="struct"')
    elif filename == "bookclub.html":
        content = content.replace('data-page="bookclub"', 'data-page="book"')

    with open(filepath, "w", encoding="utf-8") as f:
        f.write(content)

    print(f"Successfully processed {filename}")
