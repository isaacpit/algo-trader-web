#!/bin/bash

# Check for case sensitivity issues in the codebase
echo "🔍 Checking for case sensitivity issues..."

# Check for files with similar names (different casing)
find src -type f -name "*.jsx" -o -name "*.js" | while read file; do
    filename=$(basename "$file")
    dirname=$(dirname "$file")

    # Count files with similar names (case-insensitive match)
    count=$(ls "$dirname" | grep -i "^${filename}$" | wc -l)

    if [ "$count" -gt 1 ]; then
        echo "❌ Case sensitivity issue found in $dirname:"
        ls "$dirname" | grep -i "^${filename}$"
        echo "Please fix case sensitivity issues before committing."
        exit 1
    fi
done

# Check import paths for case sensitivity
find src -name "*.jsx" -o -name "*.js" | while read file; do
    # Look for relative imports
    grep -n "import.*from.*['\"]\." "$file" | while read line; do
        # Extract the import path
        import_path=$(echo "$line" | sed -n "s/.*from ['\"]\([^'\"]*\)['\"].*/\1/p")

        if [[ "$import_path" == .* ]]; then
            # Resolve the path relative to the file's directory
            file_dir=$(dirname "$file")
            resolved_path=$(cd "$file_dir" && realpath "$import_path" 2>/dev/null)

            # If realpath failed, try manual resolution
            if [ -z "$resolved_path" ]; then
                # Remove leading ./ or ../
                clean_path=$(echo "$import_path" | sed 's|^\./||' | sed 's|^\.\./||')

                if [[ "$import_path" == ./* ]]; then
                    # Same directory import
                    resolved_path="$file_dir/$clean_path"
                elif [[ "$import_path" == ../* ]]; then
                    # Parent directory import
                    resolved_path="$(dirname "$file_dir")/$clean_path"
                fi
            fi

            # Check if the file exists (case-sensitive check)
            if [ ! -f "$resolved_path" ] && [ ! -f "$resolved_path.jsx" ] && [ ! -f "$resolved_path.js" ] && [ ! -f "$resolved_path/index.jsx" ] && [ ! -f "$resolved_path/index.js" ]; then
                echo "❌ Import path issue in $file:"
                echo "   Line: $line"
                echo "   Path: $import_path"
                echo "   Resolved: $resolved_path"
                echo "   File dir: $file_dir"
                echo "Please check the import path case sensitivity."
                exit 1
            fi
        fi
    done
done

echo "✅ No case sensitivity issues found."
exit 0
