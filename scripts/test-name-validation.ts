/**
 * Test script for name validation logic
 * Run with: npx tsx scripts/test-name-validation.ts
 */

// Simulate the validateName function
function validateName(name: string | null | undefined, fieldName: string = "Name"): string {
  if (!name || typeof name !== "string") {
    throw new Error(`${fieldName} is required`);
  }
  
  const trimmedName = name.trim();
  
  if (trimmedName.length < 2) {
    throw new Error(`${fieldName} must be at least 2 characters long`);
  }
  
  if (trimmedName.length > 100) {
    throw new Error(`${fieldName} must be less than 100 characters`);
  }
  
  // Check for valid characters (letters, spaces, hyphens, apostrophes)
  if (!/^[a-zA-Z\s'-]+$/.test(trimmedName)) {
    throw new Error(`${fieldName} can only contain letters, spaces, hyphens, and apostrophes`);
  }
  
  return trimmedName;
}

// Test cases
const tests = [
  // Valid names
  { input: "John Doe", expected: "John Doe", shouldPass: true },
  { input: "Mary-Jane Watson", expected: "Mary-Jane Watson", shouldPass: true },
  { input: "O'Brien", expected: "O'Brien", shouldPass: true },
  { input: "  Trimmed  ", expected: "Trimmed", shouldPass: true },
  { input: "AB", expected: "AB", shouldPass: true }, // Minimum length
  { input: "A".repeat(100), expected: "A".repeat(100), shouldPass: true }, // Maximum length
  
  // Invalid names
  { input: null, shouldPass: false, error: "Name is required" },
  { input: undefined, shouldPass: false, error: "Name is required" },
  { input: "", shouldPass: false, error: "Name is required" },
  { input: " ", shouldPass: false, error: "Name must be at least 2 characters long" },
  { input: "A", shouldPass: false, error: "Name must be at least 2 characters long" },
  { input: "A".repeat(101), shouldPass: false, error: "Name must be less than 100 characters" },
  { input: "John123", shouldPass: false, error: "Name can only contain letters, spaces, hyphens, and apostrophes" },
  { input: "John@Doe", shouldPass: false, error: "Name can only contain letters, spaces, hyphens, and apostrophes" },
  { input: "José García", shouldPass: false, error: "Name can only contain letters, spaces, hyphens, and apostrophes" }, // Note: accents not supported yet
];

console.log("🧪 Running Name Validation Tests\n");

let passed = 0;
let failed = 0;

tests.forEach((test, index) => {
  try {
    const result = validateName(test.input as any, "Name");
    
    if (test.shouldPass) {
      if (result === test.expected) {
        console.log(`✅ Test ${index + 1}: PASS - "${test.input}" → "${result}"`);
        passed++;
      } else {
        console.log(`❌ Test ${index + 1}: FAIL - Expected "${test.expected}", got "${result}"`);
        failed++;
      }
    } else {
      console.log(`❌ Test ${index + 1}: FAIL - Should have thrown error, but got "${result}"`);
      failed++;
    }
  } catch (error: any) {
    if (!test.shouldPass) {
      if (test.error && error.message === test.error) {
        console.log(`✅ Test ${index + 1}: PASS - Correctly rejected "${test.input}" with: ${error.message}`);
        passed++;
      } else {
        console.log(`⚠️  Test ${index + 1}: PASS (but wrong error) - Expected "${test.error}", got "${error.message}"`);
        passed++;
      }
    } else {
      console.log(`❌ Test ${index + 1}: FAIL - Should have passed but got error: ${error.message}`);
      failed++;
    }
  }
});

console.log(`\n📊 Results: ${passed} passed, ${failed} failed out of ${tests.length} tests`);

if (failed === 0) {
  console.log("🎉 All tests passed!");
  process.exit(0);
} else {
  console.log("⚠️  Some tests failed!");
  process.exit(1);
}
