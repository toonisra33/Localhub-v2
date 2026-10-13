import os
import zipfile

def package_project():
    output_zip = 'public/localhub-latest-source.zip'
    exclude_dirs = {'.git', 'node_modules', 'dist', '.cache'}
    exclude_files = {'bun.lock', '.DS_Store', 'localhub-latest-source.zip', 'LocalHub-aab-package.zip', 'app-release.aab'}

    print("Packaging source code into:", output_zip)
    with zipfile.ZipFile(output_zip, 'w', zipfile.ZIP_DEFLATED) as zipf:
        for root, dirs, files in os.walk('.'):
            # prune excluded dirs
            dirs[:] = [d for d in dirs if d not in exclude_dirs and not d.startswith('.vite')]
            for file in files:
                if file in exclude_files or file.endswith('.pyc') or file.endswith('.zip') or file.endswith('.aab'):
                    continue
                full_path = os.path.join(root, file)
                rel_path = os.path.relpath(full_path, '.')
                if rel_path.startswith('public/localhub-latest-source.zip'):
                    continue
                zipf.write(full_path, rel_path)
    
    size_mb = os.path.getsize(output_zip) / (1024 * 1024)
    print(f"Done! Created {output_zip} ({size_mb:.2f} MB)")

if __name__ == '__main__':
    package_project()
