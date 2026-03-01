import os
import re

def extract_inline_resources(directory):
    # Regex for Component decorator
    # Matches @Component({...})
    # Inside, looks for template: `...` and styles: [`...`]

    # Simple regex for template (assumes backticks)
    template_pattern = re.compile(r"template:\s*`([^`]*)`")
    # Simple regex for styles (assumes array of strings in backticks)
    styles_pattern = re.compile(r"styles:\s*\[\s*`([^`]*)`\s*\]")

    for root, dirs, files in os.walk(directory):
        if 'node_modules' in root:
            continue

        for file in files:
            if file.endswith('.ts'):
                filepath = os.path.join(root, file)

                with open(filepath, 'r') as f:
                    content = f.read()

                # Check if it's a component
                if '@Component' not in content:
                    continue

                base_name = os.path.splitext(file)[0]
                html_file = f"{base_name}.html"
                scss_file = f"{base_name}.scss"

                modified = False

                # Extract Template
                template_match = template_pattern.search(content)
                if template_match:
                    template_content = template_match.group(1)
                    # Write HTML file
                    with open(os.path.join(root, html_file), 'w') as f:
                        f.write(template_content)

                    # Replace in TS
                    content = template_pattern.sub(f"templateUrl: './{html_file}'", content)
                    modified = True
                    print(f"Extracted template for {file}")

                # Extract Styles
                styles_match = styles_pattern.search(content)
                if styles_match:
                    styles_content = styles_match.group(1)
                    # Write SCSS file
                    with open(os.path.join(root, scss_file), 'w') as f:
                        f.write(styles_content)

                    # Replace in TS
                    content = styles_pattern.sub(f"styleUrls: ['./{scss_file}']", content)
                    modified = True
                    print(f"Extracted styles for {file}")

                if modified:
                    with open(filepath, 'w') as f:
                        f.write(content)

if __name__ == '__main__':
    print("Extracting inline components...")
    extract_inline_resources('libs')
    extract_inline_resources('apps')
    print("Done.")
