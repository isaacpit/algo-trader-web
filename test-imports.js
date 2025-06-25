#!/usr/bin/env node

/**
 * Import Test Script
 * Tests that all key components can be imported without errors
 * This helps catch case sensitivity and path issues before build
 */

console.log("🧪 Testing imports...\n");

const tests = [
  {
    name: "Navbar Component",
    path: "./src/components/Navbar.jsx",
    test: () => {
      try {
        // Test if file exists
        const fs = require("fs");
        if (!fs.existsSync("./src/components/Navbar.jsx")) {
          throw new Error("File does not exist");
        }

        // Test if we can read the file
        const content = fs.readFileSync("./src/components/Navbar.jsx", "utf8");
        if (!content.includes("export const Navbar")) {
          throw new Error("Navbar export not found");
        }

        return {
          success: true,
          message: "✅ Navbar component file exists and has correct export",
        };
      } catch (error) {
        return {
          success: false,
          message: `❌ Navbar component test failed: ${error.message}`,
        };
      }
    },
  },
  {
    name: "PageLayout Component",
    path: "./src/components/layout/PageLayout.jsx",
    test: () => {
      try {
        const fs = require("fs");
        if (!fs.existsSync("./src/components/layout/PageLayout.jsx")) {
          throw new Error("File does not exist");
        }

        const content = fs.readFileSync(
          "./src/components/layout/PageLayout.jsx",
          "utf8"
        );
        console.log(content)
        if (!content.includes("import { Navbar }")) {
          throw new Error("Navbar import not found");
        }

        if (!content.includes('from "../Navbar"')) {
          throw new Error("Navbar import path incorrect");
        }

        return {
          success: true,
          message: "✅ PageLayout component imports Navbar correctly",
        };
      } catch (error) {
        return {
          success: false,
          message: `❌ PageLayout component test failed: ${error.message}`,
        };
      }
    },
  },
  {
    name: "App Component",
    path: "./src/App.jsx",
    test: () => {
      try {
        const fs = require("fs");
        if (!fs.existsSync("./src/App.jsx")) {
          throw new Error("File does not exist");
        }

        const content = fs.readFileSync("./src/App.jsx", "utf8");
        if (!content.includes("import { PageLayout }")) {
          throw new Error("PageLayout import not found");
        }

        return {
          success: true,
          message: "✅ App component imports PageLayout correctly",
        };
      } catch (error) {
        return {
          success: false,
          message: `❌ App component test failed: ${error.message}`,
        };
      }
    },
  },
  {
    name: "Main Entry Point",
    path: "./src/main.jsx",
    test: () => {
      try {
        const fs = require("fs");
        if (!fs.existsSync("./src/main.jsx")) {
          throw new Error("File does not exist");
        }

        const content = fs.readFileSync("./src/main.jsx", "utf8");
        if (!content.includes("import App")) {
          throw new Error("App import not found");
        }

        return {
          success: true,
          message: "✅ Main entry point imports App correctly",
        };
      } catch (error) {
        return {
          success: false,
          message: `❌ Main entry point test failed: ${error.message}`,
        };
      }
    },
  },
  {
    name: "Package.json Dependencies",
    path: "./package.json",
    test: () => {
      try {
        const fs = require("fs");
        if (!fs.existsSync("./package.json")) {
          throw new Error("File does not exist");
        }

        const packageJson = JSON.parse(
          fs.readFileSync("./package.json", "utf8")
        );
        const requiredDeps = ["react", "react-dom", "react-router-dom"];

        for (const dep of requiredDeps) {
          if (!packageJson.dependencies[dep]) {
            throw new Error(`Missing dependency: ${dep}`);
          }
        }

        return {
          success: true,
          message: "✅ All required dependencies present in package.json",
        };
      } catch (error) {
        return {
          success: false,
          message: `❌ Package.json test failed: ${error.message}`,
        };
      }
    },
  },
  {
    name: "File Structure Check",
    path: "./src/",
    test: () => {
      try {
        const fs = require("fs");
        const path = require("path");

        const requiredFiles = [
          "src/components/Navbar.jsx",
          "src/components/layout/PageLayout.jsx",
          "src/App.jsx",
          "src/main.jsx",
          "package.json",
          "package-lock.json",
        ];

        const missingFiles = [];
        for (const file of requiredFiles) {
          if (!fs.existsSync(file)) {
            missingFiles.push(file);
          }
        }

        if (missingFiles.length > 0) {
          throw new Error(`Missing files: ${missingFiles.join(", ")}`);
        }

        return { success: true, message: "✅ All required files exist" };
      } catch (error) {
        return {
          success: false,
          message: `❌ File structure test failed: ${error.message}`,
        };
      }
    },
  },
];

// Run all tests
let allPassed = true;

for (const test of tests) {
  console.log(`Testing: ${test.name}`);
  const result = test.test();
  console.log(result.message);

  if (!result.success) {
    allPassed = false;
  }
  console.log("");
}

// Summary
console.log("📊 Test Summary:");
console.log(allPassed ? "✅ All tests passed!" : "❌ Some tests failed!");

// Exit with appropriate code
process.exit(allPassed ? 0 : 1);
