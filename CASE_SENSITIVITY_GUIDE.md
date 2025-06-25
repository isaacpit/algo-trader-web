# Case Sensitivity Guide

This guide helps you avoid case sensitivity issues when developing on macOS (case-insensitive) and deploying to Linux (case-sensitive).

## **🔍 The Problem**

- **macOS**: File system is case-insensitive by default
- **Linux (GitHub Actions)**: File system is case-sensitive
- **Result**: Code that works locally fails in CI/CD

## **🛠️ Solutions**

### **1. Git Configuration**

```bash
# Make Git case-sensitive (recommended)
git config core.ignorecase false

# Check current setting
git config core.ignorecase
```

### **2. Pre-commit Hook**

A pre-commit hook automatically checks for case sensitivity issues:

```bash
# The hook is already installed at .git/hooks/pre-commit
# It will run automatically before each commit
```

**Manual check:**

```bash
./check-case-sensitivity.sh
```

### **3. Local Testing with Act**

Test your workflow locally before pushing:

```bash
# Test the lint-and-test job
npm run test:workflow

# Test with debug output
npm run test:workflow:debug

# Test the full workflow
act
```

### **4. Import Testing**

Test all imports work correctly:

```bash
npm run test:imports
```

### **5. Case Sensitivity Check**

Check for case sensitivity issues:

```bash
npm run test:case-sensitivity
```

## **📁 File Naming Conventions**

### **✅ Good (Consistent)**

```
src/components/Navbar.jsx          # Component file
src/components/layout/PageLayout.jsx # Layout component
src/pages/Dashboard.jsx             # Page component
src/utils/helpers.js                # Utility file
```

### **❌ Bad (Inconsistent)**

```
src/components/NavBar.jsx           # Mixed case
src/components/layout/pageLayout.jsx # Inconsistent
src/pages/dashboard.jsx             # Inconsistent
```

## **🔧 Best Practices**

### **1. Use Consistent Naming**

- **Components**: PascalCase (`Navbar.jsx`, `PageLayout.jsx`)
- **Files**: Match the component name exactly
- **Imports**: Match the file name exactly

### **2. Import Paths**

```javascript
// ✅ Good
import { Navbar } from "../Navbar";
import { PageLayout } from "./PageLayout";

// ❌ Bad (case mismatch)
import { Navbar } from "../NavBar";
import { PageLayout } from "./pageLayout";
```

### **3. Development Workflow**

```bash
# Before committing
npm run test:case-sensitivity
npm run test:imports
npm run test:workflow

# If all pass, commit
git add .
git commit -m "Your commit message"
```

## **🚨 Common Issues & Fixes**

### **Issue 1: "Could not resolve '../Navbar' from 'PageLayout.jsx'**

**Cause**: File is named `NavBar.jsx` but import is `../Navbar`

**Fix**:

```bash
# Rename the file to match the import
mv src/components/NavBar.jsx src/components/Navbar.jsx
```

### **Issue 2: "Module not found" in GitHub Actions**

**Cause**: Case sensitivity mismatch

**Fix**:

```bash
# Check for case issues
npm run test:case-sensitivity

# Fix any issues found
# Commit and push
```

### **Issue 3: Import works locally but fails in CI**

**Cause**: macOS case-insensitive vs Linux case-sensitive

**Fix**:

```bash
# Test locally with Act (Linux environment)
act -j lint-and-test
```

## **🔍 Debugging Commands**

### **Check File Structure**

```bash
# List all files with case info
find src -type f -exec basename {} \;

# Check for duplicate names (different case)
find src -name "*.jsx" | while read f; do echo $(basename "$f"); done | sort | uniq -i -d
```

### **Check Import Paths**

```bash
# Find all relative imports
grep -r "import.*from.*['\"]\." src/

# Check if import paths exist
find src -name "*.jsx" -exec grep -l "import.*from.*['\"]\." {} \;
```

### **Test with Act**

```bash
# Test specific job
act -j lint-and-test

# Test with debug
act -vvv -j lint-and-test

# Dry run
act -n
```

## **📋 Pre-commit Checklist**

Before committing, run these checks:

- [ ] `npm run test:case-sensitivity`
- [ ] `npm run test:imports`
- [ ] `npm run test:workflow`
- [ ] `npm run lint`
- [ ] `npm run build`

## **🎯 Quick Fix Commands**

### **If you have case sensitivity issues:**

```bash
# 1. Check what's wrong
npm run test:case-sensitivity

# 2. Fix the issues (usually rename files)

# 3. Test locally
npm run test:workflow

# 4. Commit and push
git add .
git commit -m "Fix case sensitivity issues"
git push origin main
```

## **🔧 VS Code Settings**

Add to `.vscode/settings.json`:

```json
{
  "files.associations": {
    "*.jsx": "javascriptreact"
  },
  "typescript.preferences.importModuleSpecifier": "relative",
  "javascript.preferences.importModuleSpecifier": "relative"
}
```

## **📞 Troubleshooting**

### **Still having issues?**

1. **Check the GitHub Actions logs** for specific error messages
2. **Run Act locally** to reproduce the issue
3. **Use the debug steps** in the workflow
4. **Check file permissions** and ownership

### **Need help?**

- Check the workflow logs in GitHub Actions
- Run `act -vvv` for detailed debugging
- Use the `test-imports.js` script to verify imports
