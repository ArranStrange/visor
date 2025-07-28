// Simple Accessibility Testing Script
// This script can be run in the browser console to check for common accessibility issues

(function () {
  "use strict";

  console.log("🔍 Running Accessibility Audit...");

  const issues = [];
  const warnings = [];
  const passes = [];

  // Check for images without alt text
  const images = document.querySelectorAll("img");
  images.forEach((img, index) => {
    if (!img.alt && !img.getAttribute("aria-label")) {
      issues.push(`Image ${index + 1} missing alt text or aria-label`);
    } else {
      passes.push(`Image ${index + 1} has proper alt text`);
    }
  });

  // Check for form inputs without labels
  const inputs = document.querySelectorAll("input, select, textarea");
  inputs.forEach((input, index) => {
    const hasLabel = input.labels && input.labels.length > 0;
    const hasAriaLabel = input.getAttribute("aria-label");
    const hasPlaceholder = input.placeholder;

    if (!hasLabel && !hasAriaLabel && !hasPlaceholder) {
      issues.push(
        `Form input ${index + 1} missing label, aria-label, or placeholder`
      );
    } else {
      passes.push(`Form input ${index + 1} has proper labeling`);
    }
  });

  // Check for buttons without accessible names
  const buttons = document.querySelectorAll('button, [role="button"]');
  buttons.forEach((button, index) => {
    const hasText = button.textContent.trim();
    const hasAriaLabel = button.getAttribute("aria-label");
    const hasTitle = button.title;

    if (!hasText && !hasAriaLabel && !hasTitle) {
      issues.push(`Button ${index + 1} missing accessible name`);
    } else {
      passes.push(`Button ${index + 1} has accessible name`);
    }
  });

  // Check for proper heading structure
  const headings = document.querySelectorAll("h1, h2, h3, h4, h5, h6");
  let previousLevel = 0;
  headings.forEach((heading, index) => {
    const level = parseInt(heading.tagName.charAt(1));
    if (level > previousLevel + 1) {
      warnings.push(
        `Heading structure issue: ${heading.tagName} follows ${
          previousLevel > 0 ? "h" + previousLevel : "no heading"
        }`
      );
    }
    previousLevel = level;
  });

  // Check for focusable elements
  const focusableElements = document.querySelectorAll(
    "a, button, input, select, textarea, [tabindex]"
  );
  focusableElements.forEach((element, index) => {
    if (element.tabIndex === -1) {
      warnings.push(`Focusable element ${index + 1} has tabindex="-1"`);
    }
  });

  // Check for color contrast (basic check)
  const textElements = document.querySelectorAll(
    "p, span, div, h1, h2, h3, h4, h5, h6"
  );
  textElements.forEach((element, index) => {
    const style = window.getComputedStyle(element);
    const color = style.color;
    const backgroundColor = style.backgroundColor;

    if (color === backgroundColor) {
      issues.push(`Text element ${index + 1} has same color as background`);
    }
  });

  // Check for skip links
  const skipLinks = document.querySelectorAll('.skip-link, [href^="#main"]');
  if (skipLinks.length === 0) {
    warnings.push("No skip link found");
  } else {
    passes.push("Skip link found");
  }

  // Check for main landmark
  const mainElement = document.querySelector('main, [role="main"]');
  if (!mainElement) {
    issues.push("No main landmark found");
  } else {
    passes.push("Main landmark found");
  }

  // Check for navigation landmarks
  const navElements = document.querySelectorAll('nav, [role="navigation"]');
  if (navElements.length === 0) {
    warnings.push("No navigation landmark found");
  } else {
    passes.push(`${navElements.length} navigation landmark(s) found`);
  }

  // Check for proper ARIA attributes
  const ariaElements = document.querySelectorAll("[aria-*]");
  ariaElements.forEach((element, index) => {
    const ariaAttributes = Array.from(element.attributes).filter((attr) =>
      attr.name.startsWith("aria-")
    );
    ariaAttributes.forEach((attr) => {
      if (attr.value === "") {
        warnings.push(
          `Empty ARIA attribute: ${attr.name} on element ${index + 1}`
        );
      }
    });
  });

  // Report results
  console.log("\n📊 Accessibility Audit Results:");
  console.log("================================");

  if (issues.length > 0) {
    console.log(`❌ ${issues.length} Critical Issues Found:`);
    issues.forEach((issue) => console.log(`   • ${issue}`));
  }

  if (warnings.length > 0) {
    console.log(`⚠️  ${warnings.length} Warnings:`);
    warnings.forEach((warning) => console.log(`   • ${warning}`));
  }

  if (passes.length > 0) {
    console.log(`✅ ${passes.length} Passed Checks:`);
    passes.slice(0, 10).forEach((pass) => console.log(`   • ${pass}`));
    if (passes.length > 10) {
      console.log(`   ... and ${passes.length - 10} more`);
    }
  }

  console.log("\n🎯 Summary:");
  console.log(`   Total Issues: ${issues.length}`);
  console.log(`   Total Warnings: ${warnings.length}`);
  console.log(`   Total Passes: ${passes.length}`);

  if (issues.length === 0 && warnings.length === 0) {
    console.log("🎉 No accessibility issues found!");
  } else if (issues.length === 0) {
    console.log("👍 Only minor warnings found. Good accessibility!");
  } else {
    console.log("🔧 Please address the critical issues above.");
  }

  console.log("\n💡 Tips:");
  console.log("   • Use a screen reader to test navigation");
  console.log("   • Test keyboard-only navigation");
  console.log("   • Check color contrast with tools like WebAIM");
  console.log("   • Validate with axe-core or similar tools");
})();
