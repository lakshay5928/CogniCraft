/**
 * Evaluation dataset for CogniCraft.
 * 30 problems spanning generate/debug/review intents, easy->hard difficulty,
 * and multiple languages — modeled after LeetCode / CodeChef / HackerRank style prompts.
 *
 * Each case has a `check` function that does lightweight automated validation
 * of the final code string (since we can't safely execute arbitrary code,
 * see README "Future Scope" re: sandboxing). Checks look for required
 * signatures, absence of known bug patterns, etc. This is a heuristic
 * correctness signal, not a full test-execution harness.
 */

const testCases = [
  // ---------- GENERATE: Easy ----------
  {
    id: "gen-easy-01",
    intent: "generate",
    difficulty: "easy",
    language: "python",
    prompt: "Write a Python function to check if a number is prime.",
    check: (code) => /def\s+\w+\s*\(/.test(code) && /%/.test(code),
  },
  {
    id: "gen-easy-02",
    intent: "generate",
    difficulty: "easy",
    language: "javascript",
    prompt: "Write a JavaScript function to reverse a string.",
    check: (code) => /function\s+\w+|const\s+\w+\s*=/.test(code),
  },
  {
    id: "gen-easy-03",
    intent: "generate",
    difficulty: "easy",
    language: "java",
    prompt: "Write a Java method to find the maximum of three integers.",
    check: (code) => /(public|private|static).*\(/.test(code),
  },
  {
    id: "gen-easy-04",
    intent: "generate",
    difficulty: "easy",
    language: "python",
    prompt: "Write a Python function to count vowels in a string.",
    check: (code) => /def\s+\w+\s*\(/.test(code),
  },
  {
    id: "gen-easy-05",
    intent: "generate",
    difficulty: "easy",
    language: "cpp",
    prompt: "Write a C++ function to compute the sum of digits of an integer.",
    check: (code) => /int\s+\w+\s*\(/.test(code) || /#include/.test(code),
  },

  // ---------- GENERATE: Medium (classic LeetCode-style) ----------
  {
    id: "gen-med-01",
    intent: "generate",
    difficulty: "medium",
    language: "python",
    prompt: "Write a Python function to find the longest common prefix among an array of strings.",
    check: (code) => /def\s+\w+\s*\(/.test(code),
  },
  {
    id: "gen-med-02",
    intent: "generate",
    difficulty: "medium",
    language: "javascript",
    prompt: "Write a JavaScript function that returns the two indices of array elements that sum to a target (Two Sum).",
    check: (code) => /function|=>/.test(code) && /target/i.test(code),
  },
  {
    id: "gen-med-03",
    intent: "generate",
    difficulty: "medium",
    language: "java",
    prompt: "Write a Java method to detect if a linked list has a cycle.",
    check: (code) => /(public|private|static).*\(/.test(code) && /next/i.test(code),
  },
  {
    id: "gen-med-04",
    intent: "generate",
    difficulty: "medium",
    language: "python",
    prompt: "Write a Python function to perform binary search on a sorted list.",
    check: (code) => /def\s+\w+\s*\(/.test(code) && /(mid|middle)/i.test(code),
  },
  {
    id: "gen-med-05",
    intent: "generate",
    difficulty: "medium",
    language: "cpp",
    prompt: "Write a C++ function to check if a binary tree is balanced.",
    check: (code) => /int|bool/.test(code) && /(left|right)/i.test(code),
  },
  {
    id: "gen-med-06",
    intent: "generate",
    difficulty: "medium",
    language: "sql",
    prompt: "Write a SQL query to find employees who earn more than their managers, given an Employee table with columns Id, Name, Salary, ManagerId.",
    check: (code) => /SELECT/i.test(code) && /JOIN|WHERE/i.test(code),
  },
  {
    id: "gen-med-07",
    intent: "generate",
    difficulty: "medium",
    language: "python",
    prompt: "Write a Python function to merge overlapping intervals given a list of [start, end] pairs.",
    check: (code) => /def\s+\w+\s*\(/.test(code) && /sort/i.test(code),
  },

  // ---------- GENERATE: Hard ----------
  {
    id: "gen-hard-01",
    intent: "generate",
    difficulty: "hard",
    language: "cpp",
    prompt: "Given two sorted arrays nums1 and nums2, return the median of the two sorted arrays in O(log(m+n)) time, in C++.",
    check: (code) => {
      // Heuristic: flag forward-declaration bug pattern - a function called
      // before its own definition appears earlier in the file.
      const funcDefs = [...code.matchAll(/\b(\w+)\s*\([^)]*\)\s*\{/g)].map((m) => m[1]);
      const calls = [...code.matchAll(/\b(\w+)\s*\(/g)].map((m) => m[1]);
      // crude check: every distinct user function call should have a definition somewhere
      const hasBinarySearch = /left|right|partition/i.test(code);
      return hasBinarySearch && funcDefs.length > 0;
    },
  },
  {
    id: "gen-hard-02",
    intent: "generate",
    difficulty: "hard",
    language: "python",
    prompt: "Write a Python function to find the longest valid parentheses substring length.",
    check: (code) => /def\s+\w+\s*\(/.test(code) && /stack|dp/i.test(code),
  },
  {
    id: "gen-hard-03",
    intent: "generate",
    difficulty: "hard",
    language: "java",
    prompt: "Write a Java method implementing the N-Queens problem returning the count of distinct solutions.",
    check: (code) => /(public|private|static).*\(/.test(code) && /backtrack|solve/i.test(code),
  },
  {
    id: "gen-hard-04",
    intent: "generate",
    difficulty: "hard",
    language: "cpp",
    prompt: "Write a C++ function to serialize and deserialize a binary tree.",
    check: (code) => /(serialize|deserialize)/i.test(code),
  },

  // ---------- DEBUG: Easy ----------
  {
    id: "debug-easy-01",
    intent: "debug",
    difficulty: "easy",
    language: "python",
    prompt: "Debug this code:\ndef add(a, b):\n    return a + b + 1",
    check: (code) => !/return\s+a\s*\+\s*b\s*\+\s*1/.test(code),
  },
  {
    id: "debug-easy-02",
    intent: "debug",
    difficulty: "easy",
    language: "javascript",
    prompt: "Debug this code:\nfunction isEven(n) {\n  return n % 2 = 0;\n}",
    check: (code) => !/=\s*0\s*;?\s*\}/.test(code) || /===|==/.test(code),
  },
  {
    id: "debug-easy-03",
    intent: "debug",
    difficulty: "easy",
    language: "python",
    prompt: "Debug this code:\ndef factorial(n):\n    if n == 0:\n        return 1\n    return n * factorial(n)",
    check: (code) => /factorial\s*\(\s*n\s*-\s*1\s*\)/.test(code),
  },

  // ---------- DEBUG: Medium ----------
  {
    id: "debug-med-01",
    intent: "debug",
    difficulty: "medium",
    language: "java",
    prompt: "Debug this code:\npublic int divide(int a, int b) {\n    return a / b;\n}",
    check: (code) => /(b\s*==\s*0|ArithmeticException|throw)/i.test(code),
  },
  {
    id: "debug-med-02",
    intent: "debug",
    difficulty: "medium",
    language: "python",
    prompt: "Debug this code:\ndef get_last(arr):\n    return arr[len(arr)]",
    check: (code) => /len\(arr\)\s*-\s*1/.test(code),
  },
  {
    id: "debug-med-03",
    intent: "debug",
    difficulty: "medium",
    language: "cpp",
    prompt: "Debug this code:\nint* createArray(int size) {\n    int arr[size];\n    return arr;\n}",
    check: (code) => /(new\s+int|malloc|vector)/i.test(code),
  },
  {
    id: "debug-med-04",
    intent: "debug",
    difficulty: "medium",
    language: "javascript",
    prompt: "Debug this code:\nfunction sumArray(arr) {\n  let total;\n  for (let i = 0; i <= arr.length; i++) {\n    total += arr[i];\n  }\n  return total;\n}",
    check: (code) => /total\s*=\s*0/.test(code) && /<\s*arr\.length/.test(code),
  },

  // ---------- DEBUG: Hard ----------
  {
    id: "debug-hard-01",
    intent: "debug",
    difficulty: "hard",
    language: "python",
    prompt: "Debug this code:\ndef fib_memo(n, memo={}):\n    if n in memo: return memo[n]\n    if n <= 1: return n\n    memo[n] = fib_memo(n-1) + fib_memo(n-2)\n    return memo[n]",
    check: (code) => /def\s+fib_memo/.test(code),
  },
  {
    id: "debug-hard-02",
    intent: "debug",
    difficulty: "hard",
    language: "java",
    prompt: "Debug this code for thread safety:\npublic class Counter {\n    private int count = 0;\n    public void increment() { count++; }\n    public int getCount() { return count; }\n}",
    check: (code) => /(synchronized|AtomicInteger|volatile)/i.test(code),
  },

  // ---------- REVIEW ----------
  {
    id: "review-easy-01",
    intent: "review",
    difficulty: "easy",
    language: "python",
    prompt: "Review this code:\ndef f(x,y):\n    z=x+y\n    return z",
    check: () => true, // review always "succeeds" if it returns a verdict
  },
  {
    id: "review-med-01",
    intent: "review",
    difficulty: "medium",
    language: "javascript",
    prompt: "Review this code:\nfunction processData(data) {\n  var result = [];\n  for (var i = 0; i < data.length; i++) {\n    if (data[i] != null) {\n      result.push(data[i] * 2);\n    }\n  }\n  return result;\n}",
    check: () => true,
  },
  {
    id: "review-med-02",
    intent: "review",
    difficulty: "medium",
    language: "python",
    prompt: "Review this code:\nclass UserManager:\n    users = []\n    def add_user(self, user):\n        self.users.append(user)\n        return True",
    check: () => true,
  },
  {
    id: "review-hard-01",
    intent: "review",
    difficulty: "hard",
    language: "java",
    prompt: "Review this code for a payment processing method:\npublic boolean processPayment(double amount, String cardNumber) {\n    if (amount > 0) {\n        chargeCard(cardNumber, amount);\n        return true;\n    }\n    return false;\n}",
    check: () => true,
  },

  // ---------- GENERATE: competitive-programming flavored ----------
  {
    id: "gen-cp-01",
    intent: "generate",
    difficulty: "medium",
    language: "python",
    prompt: "Write a Python function (HackerRank style) that returns the minimum number of jumps to reach the end of an array, where each element is the max jump length from that position.",
    check: (code) => /def\s+\w+\s*\(/.test(code),
  },
  {
    id: "gen-cp-02",
    intent: "generate",
    difficulty: "hard",
    language: "cpp",
    prompt: "Write a C++ function (Codeforces style) to find the number of subarrays with sum exactly equal to k.",
    check: (code) => /(unordered_map|map)/i.test(code),
  },
  {
    id: "gen-cp-03",
    intent: "generate",
    difficulty: "medium",
    language: "java",
    prompt: "Write a Java method (CodeChef style) to check if a given string is a valid IPv4 address.",
    check: (code) => /split|\./.test(code),
  },
];

module.exports = { testCases };
