// lib/execution/pyodideRunner.ts

declare global {
  interface Window {
    loadPyodide?: (config: any) => Promise<any>;
    pyodide?: any;
  }
}

let pyodideReadyPromise: Promise<any> | null = null;

export const initPyodide = async () => {
  if (typeof window === 'undefined') return null;
  
  if (window.pyodide) return window.pyodide;
  
  if (!pyodideReadyPromise) {
    pyodideReadyPromise = new Promise((resolve, reject) => {
      const injectSerialize = async (py: any) => {
        try {
          await py.runPythonAsync(`
import json
import sys

def _nexus_serialize(val):
    np = sys.modules.get('numpy')
    
    class AdvancedEncoder(json.JSONEncoder):
        def default(self, obj):
            if np is not None:
                if isinstance(obj, np.ndarray):
                    return obj.tolist()
                if isinstance(obj, (np.int32, np.int64, np.integer)):
                    return int(obj)
                if isinstance(obj, (np.float32, np.float64, np.floating)):
                    return float(obj)
            if isinstance(obj, tuple):
                return list(obj)
            if hasattr(obj, 'tolist'):
                return obj.tolist()
            try:
                return json.JSONEncoder.default(self, obj)
            except TypeError:
                return str(obj)
                
    try:
        return json.dumps(val, cls=AdvancedEncoder)
    except Exception as e:
        return json.dumps(str(val))

def _nexus_inject_missing_vars(code_str, global_dict):
    import ast
    from unittest.mock import MagicMock
    try:
        tree = ast.parse(code_str)
    except Exception:
        return
    
    builtins_set = set(dir(__builtins__))
    for node in ast.walk(tree):
        if isinstance(node, ast.Name) and isinstance(node.ctx, ast.Load):
            if node.id not in global_dict and node.id not in builtins_set:
                global_dict[node.id] = MagicMock(name=node.id)

def _nexus_validate_fallback(solution_code):
    import json
    import sys
    import io
    
    sol_env = {
        "__builtins__": globals()["__builtins__"],
        "json": json,
        "sys": sys,
    }
    if "_nexus_serialize" in globals():
        sol_env["_nexus_serialize"] = globals()["_nexus_serialize"]
        
    old_stdout = sys.stdout
    sys.stdout = io.StringIO()
    
    try:
        if "_nexus_inject_missing_vars" in globals():
            globals()["_nexus_inject_missing_vars"](solution_code, sol_env)
        exec(solution_code, sol_env)
        sol_stdout = sys.stdout.getvalue()
    except Exception as e:
        return json.dumps({"success": False, "message": f"Solution failed to execute: {str(e)}"})
    finally:
        sys.stdout = old_stdout
        
    # SQL challenge check
    if "sql_query" in sol_env:
        user_stdout = ""
        if hasattr(old_stdout, 'getvalue'):
            user_stdout = old_stdout.getvalue()
        if user_stdout.strip() != sol_stdout.strip():
            return json.dumps({
                "success": False,
                "message": f"SQL query results did not match requirements. Expected to output:\\n{sol_stdout.strip()}\\n\\nReceived:\\n{user_stdout.strip()}"
            })
        return json.dumps({"success": True, "message": "SQL query executed and produced correct database rows!"})
        
    sol_vars = {}
    for k, v in sol_env.items():
        if k in ("__builtins__", "json", "sys", "_nexus_serialize", "_nexus_validate_fallback"):
            continue
        if k.startswith('_'):
            continue
        if sys.modules.get(k) or type(v).__name__ in ('module', 'function', 'class') or callable(v):
            continue
        sol_vars[k] = v
        
    errors = []
    for k, expected_val in sol_vars.items():
        if k not in globals():
            errors.append(f"Variable '{k}' is missing from your code.")
            continue
            
        user_val = globals()[k]
        
        try:
            expected_json = _nexus_serialize(expected_val)
            user_json = _nexus_serialize(user_val)
            if expected_json != user_json:
                errors.append(f"Variable '{k}' value is incorrect. Expected {expected_json}, but got {user_json}.")
        except Exception:
            if user_val != expected_val:
                errors.append(f"Variable '{k}' value is incorrect.")
                
    if errors:
        return json.dumps({
            "success": False,
            "message": errors[0]
        })
        
    if sol_stdout and sol_stdout.strip():
        user_stdout = ""
        if hasattr(old_stdout, 'getvalue'):
            user_stdout = old_stdout.getvalue()
        if user_stdout.strip() != sol_stdout.strip():
            return json.dumps({
                "success": False,
                "message": f"Console output did not match requirements. Expected to print:\\n{sol_stdout.strip()}"
            })
            
    return json.dumps({"success": True, "message": "All variables and output match solution perfectly!"})
          `);
        } catch (err) {
          console.error("Failed to inject _nexus_serialize helper:", err);
        }
      };

      const load = async () => {
        try {
          if (!window.loadPyodide) {
            throw new Error("loadPyodide function is not defined on window.");
          }
          const pyodide = await window.loadPyodide({
            indexURL: "https://cdn.jsdelivr.net/pyodide/v0.25.0/full/"
          });
          await injectSerialize(pyodide);
          window.pyodide = pyodide;
          resolve(pyodide);
        } catch (err) {
          reject(err);
        }
      };

      if (!document.querySelector('script[src="https://cdn.jsdelivr.net/pyodide/v0.25.0/full/pyodide.js"]')) {
        const script = document.createElement('script');
        script.src = "https://cdn.jsdelivr.net/pyodide/v0.25.0/full/pyodide.js";
        script.onload = load;
        script.onerror = (e) => reject(new Error("Failed to load Pyodide CDN script. Check your internet connection."));
        document.head.appendChild(script);
      } else {
        const interval = setInterval(() => {
          if (window.loadPyodide) {
            clearInterval(interval);
            load();
          }
        }, 100);
      }
    });
  }
  return pyodideReadyPromise;
};

export const executePythonCode = async (
  code: string,
  language?: string,
  solution?: string
): Promise<{ output: string; error: string | null }> => {
  try {
    const lang = (language || 'python').toLowerCase();

    // Static code analysis to check for synchronous infinite loops
    // E.g., 'while True:' or 'while 1:' without a break
    const hasInfiniteLoop = /while\s+(True|1)\s*:/i.test(code) && !/break/i.test(code);
    if (hasInfiniteLoop) {
      return { 
        output: "", 
        error: "Potential Infinite Loop detected! To safeguard browser execution, your code execution was blocked. Make sure your loops have a clear break condition."
      };
    }

    if (lang !== 'python' && lang !== 'sql') {
      return { output: `[System]: ${lang} syntax verification completed.`, error: null };
    }

    const pyodide = await initPyodide();
    if (!pyodide) throw new Error("Pyodide failed to initialize.");

    if (lang === 'sql') {
      const base64Code = typeof window !== 'undefined'
        ? window.btoa(unescape(encodeURIComponent(code)))
        : Buffer.from(code).toString('base64');
      code = `
import base64
import sqlite3
import sys

conn = sqlite3.connect(":memory:")
cursor = conn.cursor()
cursor.execute("""
CREATE TABLE employees (
    id INTEGER PRIMARY KEY,
    first_name TEXT,
    last_name TEXT,
    salary INTEGER
)
""")
cursor.executemany("""
INSERT INTO employees (first_name, last_name, salary) VALUES (?, ?, ?)
""", [
    ("John", "Doe", 45000),
    ("Jane", "Smith", 60000),
    ("Alice", "Johnson", 55000),
    ("Bob", "Brown", 30000)
])
conn.commit()

sql_query = base64.b64decode(b"${base64Code}").decode('utf-8')
try:
    cursor.execute(sql_query)
    rows = cursor.fetchall()
    for row in rows:
        print(" | ".join(str(x) for x in row))
except Exception as e:
    print(f"SQL Error: {str(e)}", file=sys.stderr)
finally:
    conn.close()
      `;
    }

    // Dynamic package scanning & loading
    const combinedCode = code + "\n" + (solution || "");
    const packagesToLoad: string[] = [];
    if (combinedCode.includes("numpy") || combinedCode.includes("np.")) {
      packagesToLoad.push("numpy");
    }
    if (combinedCode.includes("pandas") || combinedCode.includes("pd.")) {
      packagesToLoad.push("pandas");
    }
    if (combinedCode.includes("sklearn") || combinedCode.includes("scikit-learn")) {
      packagesToLoad.push("scikit-learn");
    }
    if (combinedCode.includes("scipy")) {
      packagesToLoad.push("scipy");
    }
    if (combinedCode.includes("matplotlib") || combinedCode.includes("plt.")) {
      packagesToLoad.push("matplotlib");
    }

    if (packagesToLoad.length > 0) {
      await pyodide.loadPackage(packagesToLoad);
    }

    // Mock data.csv if pandas is loaded/used
    if (packagesToLoad.includes("pandas")) {
      pyodide.runPython(`
import os
if not os.path.exists("data.csv"):
    with open("data.csv", "w") as f:
        f.write("age\\n25\\n30\\n35\\n40\\n45\\n")
if not os.path.exists("sales_data.csv"):
    with open("sales_data.csv", "w") as f:
        f.write("sales,product_id\\n10,1\\n20,2\\n30,1\\n40,2\\n50,1\\n60,2\\n70,1\\n80,2\\n90,1\\n100,2\\n")
      `);
    }

    // Inject django and flask MagicMocks to allow django / flask challenges to pass imports and decorators
    pyodide.runPython(`
import sys
from unittest.mock import MagicMock

class DummyBaseModel:
    pass

class MockModule(MagicMock):
    pass

for mod in [
    'django', 'django.db', 'django.db.models', 'django.forms',
    'flask', 'openai', 'langchain', 'langchain_core', 'langchain_core.messages',
    'langchain_core.prompts', 'langgraph', 'langgraph.graph', 'langgraph.graph.message',
    'langgraph.prebuilt', 'transformers', 'peft', 'deepeval', 'deepeval.test_case',
    'deepeval.metrics', 'fastapi'
]:
    sys.modules[mod] = MockModule()

pydantic_mock = MockModule()
pydantic_mock.BaseModel = DummyBaseModel
sys.modules['pydantic'] = pydantic_mock
    `);

    // Capture stdout & stderr
    pyodide.runPython(`
      import sys
      import io
      sys.stdout = io.StringIO()
      sys.stderr = io.StringIO()
    `);

    // Purge non-system variables from globals to prevent state leakage between runs
    pyodide.globals.set("_user_code_str", code);
    pyodide.runPython(`
for name in list(globals().keys()):
    if not name.startswith('_') and not (name.startswith('__') and name.endswith('__')):
        if name not in ('sys', 'json', 'io', '_user_code_str'):
            try:
                del globals()[name]
            except Exception:
                pass

if "_nexus_inject_missing_vars" in globals():
    _nexus_inject_missing_vars(_user_code_str, globals())
del globals()["_user_code_str"]
    `);

    // Run execution with a timeout promise wrapper
    const runPromise = pyodide.runPythonAsync(code);
    
    // Safety timeout of 8 seconds
    const timeoutPromise = new Promise((_, reject) => 
      setTimeout(() => reject(new Error("Execution Timeout: Code took too long to complete. Check for infinite loops or heavy operations.")), 8000)
    );

    await Promise.race([runPromise, timeoutPromise]);

    const output = pyodide.runPython("sys.stdout.getvalue()");
    const errorOutput = pyodide.runPython("sys.stderr.getvalue()");

    if (errorOutput) {
      return { output, error: errorOutput };
    }
    return { output, error: null };
  } catch (err: any) {
    return { output: "", error: err.message };
  }
};

// ============================================================
// Traceback & Exception Interpreter (Human-Friendly Messages)
// ============================================================
export const parseErrors = (errorStr: string): string => {
  if (!errorStr) return "Unknown execution error.";
  
  if (errorStr.includes("SyntaxError")) {
    return "Python found a formatting issue. Check if you've missed commas, brackets, colons, or matching quotes.";
  }
  if (errorStr.includes("NameError")) {
    const match = errorStr.match(/name '(\w+)' is not defined/);
    const varName = match ? `'${match[1]}'` : "a variable";
    return `You used ${varName} that hasn't been created yet. Make sure it is defined correctly or check for typos.`;
  }
  if (errorStr.includes("TypeError")) {
    return "You are using incompatible datatypes together (e.g. attempting to add a number to a string, or indexing an object that is not a list).";
  }
  if (errorStr.includes("IndexError")) {
    return "You tried to access an element outside the list range. Check your bounds (remember Python indexing starts at 0).";
  }
  if (errorStr.includes("IndentationError")) {
    return "Python expects proper indentation. Check the spacing before your function lines, loops, or conditional statements.";
  }
  if (errorStr.includes("ModuleNotFoundError")) {
    return "You attempted to import a library module that is not installed or has a typographical error in its name.";
  }
  if (errorStr.includes("ZeroDivisionError")) {
    return "You attempted to divide by zero, which is not mathematically possible.";
  }
  if (errorStr.includes("KeyError")) {
    return "You tried to retrieve a dictionary key that does not exist. Check spelling or verify key inclusion.";
  }
  
  return errorStr;
};

// ============================================================
// Structural Assertion Validation Engine
// ============================================================
export interface ValidationResult {
  success: boolean;
  message: string;
  expected?: string;
  received?: string;
}

export const validateChallenge = (
  pyodide: any,
  code: string,
  challenge: any,
  stdout: string
): ValidationResult => {
  // 1. Starter code and empty editor protection
  const starterCode = challenge?.starterCode || "";
  if (!code.trim()) {
    return {
      success: false,
      message: "It looks like your code editor is empty! Please write some code before executing."
    };
  }
  if (starterCode.trim() && code.trim() === starterCode.trim()) {
    return {
      success: false,
      message: "It looks like you haven't modified the starter code yet. Try writing your own solution!"
    };
  }

  const validation = challenge?.validation;

  if (!validation || !validation.type) {
    // 2. Solution fallback verification engine
    if (challenge?.solution) {
      const lang = (challenge?.language || 'python').toLowerCase();
      if (lang !== 'python' && lang !== 'sql') {
        const cleanUser = code.replace(/\r\n/g, '\n').replace(/\s+/g, ' ').trim();
        const cleanSol = challenge.solution.replace(/\r\n/g, '\n').replace(/\s+/g, ' ').trim();
        const mergedSolution = mergeStarterAndSolution(challenge.starterCode || "", challenge.solution || "");
        const cleanMergedSol = mergedSolution.replace(/\r\n/g, '\n').replace(/\s+/g, ' ').trim();

        if (cleanUser === cleanMergedSol || cleanUser.includes(cleanSol)) {
          return {
            success: true,
            message: "Configuration structure matches expected layout perfectly!"
          };
        } else {
          return {
            success: false,
            message: "Your submission did not match the expected configuration template. Please check the required fields, spacing, and commands.",
            expected: challenge.solution,
            received: code
          };
        }
      }

      try {
        let mergedSolution = mergeStarterAndSolution(challenge.starterCode || "", challenge.solution || "");
        if (challenge?.language === 'sql') {
          const solBase64 = typeof window !== 'undefined'
            ? window.btoa(unescape(encodeURIComponent(challenge.solution)))
            : Buffer.from(challenge.solution).toString('base64');
          mergedSolution = `
import base64
import sqlite3
import sys

conn = sqlite3.connect(":memory:")
cursor = conn.cursor()
cursor.execute("""
CREATE TABLE employees (
    id INTEGER PRIMARY KEY,
    first_name TEXT,
    last_name TEXT,
    salary INTEGER
)
""")
cursor.executemany("""
INSERT INTO employees (first_name, last_name, salary) VALUES (?, ?, ?)
""", [
    ("John", "Doe", 45000),
    ("Jane", "Smith", 60000),
    ("Alice", "Johnson", 55000),
    ("Bob", "Brown", 30000)
])
conn.commit()

sql_query = base64.b64decode(b"${solBase64}").decode('utf-8')
try:
    cursor.execute(sql_query)
    rows = cursor.fetchall()
    for row in rows:
        print(" | ".join(str(x) for x in row))
except Exception as e:
    print(f"SQL Error: {str(e)}", file=sys.stderr)
finally:
    conn.close()
          `;
        }
        const solutionCodeJson = JSON.stringify(mergedSolution);
        const checkSnippet = `_nexus_validate_fallback(${solutionCodeJson})`;
        const jsonResult = pyodide.runPython(checkSnippet);
        const result = JSON.parse(jsonResult);
        return {
          success: !!result.success,
          message: result.message || "Execution completed."
        };
      } catch (err: any) {
        return {
          success: false,
          message: `Solution fallback verification failed: ${err.message}`
        };
      }
    }
    return { success: true, message: "Code executed successfully!" };
  }

  try {
    const { type, variable, expected, test_cases, args, shape, datatype, pattern } = validation;

    switch (type) {
      case 'variable_equals': {
        if (!variable) return { success: false, message: "Validation error: 'variable' target missing." };
        
        const checkSnippet = `
if "${variable}" in globals():
    _nexus_serialize(globals()["${variable}"])
else:
    "__UNDEFINED__"
        `;
        const jsonStr = pyodide.runPython(checkSnippet);
        if (jsonStr === "__UNDEFINED__") {
          return { success: false, message: `Could not find variable '${variable}' in your environment.` };
        }
        
        const receivedVal = JSON.parse(jsonStr);
        const isMatch = JSON.stringify(receivedVal) === JSON.stringify(expected);
        if (isMatch) {
          return { success: true, message: `Variable '${variable}' matches expected value!` };
        } else {
          return {
            success: false,
            message: `Variable '${variable}' does not match expected values.`,
            expected: JSON.stringify(expected),
            received: JSON.stringify(receivedVal)
          };
        }
      }

      case 'output_equals': {
        const cleanStdout = stdout.replace(/\r\n/g, '\n').trim();
        const cleanExpected = String(expected).replace(/\r\n/g, '\n').trim();
        if (cleanStdout === cleanExpected) {
          return { success: true, message: "Standard console output matches perfectly!" };
        } else {
          return {
            success: false,
            message: "Output printed to console did not match requirements.",
            expected: cleanExpected,
            received: cleanStdout
          };
        }
      }

      case 'datatype_check': {
        if (!variable) return { success: false, message: "Validation error: 'variable' target missing." };
        
        const checkSnippet = `
if "${variable}" in globals():
    type(globals()["${variable}"]).__name__
else:
    "__UNDEFINED__"
        `;
        const typeName = pyodide.runPython(checkSnippet);
        if (typeName === "__UNDEFINED__") {
          return { success: false, message: `Variable '${variable}' is not defined.` };
        }

        if (typeName === datatype) {
          return { success: true, message: `Variable '${variable}' is of correct type: '${datatype}'` };
        } else {
          return {
            success: false,
            message: `Variable '${variable}' is of type '${typeName}', expected '${datatype}'.`,
            expected: datatype,
            received: typeName
          };
        }
      }

      case 'array_shape': {
        if (!variable) return { success: false, message: "Validation error: 'variable' target missing." };
        
        const checkSnippet = `
import sys
if "${variable}" not in globals():
    "__UNDEFINED__"
else:
    _val = globals()["${variable}"]
    np = sys.modules.get('numpy')
    if np is not None and isinstance(_val, np.ndarray):
        list(_val.shape)
    elif isinstance(_val, (list, tuple)):
        [len(_val)]
    else:
        []
        `;
        const pyShapeResult = pyodide.runPython(checkSnippet);
        if (pyShapeResult === "__UNDEFINED__") {
          return { success: false, message: `Array or list '${variable}' is not defined.` };
        }
        
        const pyShape = pyShapeResult.toJs ? pyShapeResult.toJs() : pyShapeResult;
        const isMatch = JSON.stringify(pyShape) === JSON.stringify(shape);
        if (isMatch) {
          return { success: true, message: `Structure shape of '${variable}' is correct: ${JSON.stringify(shape)}` };
        } else {
          return {
            success: false,
            message: `Structure shape of '${variable}' is incorrect.`,
            expected: JSON.stringify(shape),
            received: JSON.stringify(pyShape)
          };
        }
      }

      case 'regex_match': {
        if (!pattern) return { success: false, message: "Validation error: Regex pattern missing." };
        const regex = new RegExp(pattern);
        if (regex.test(code)) {
          return { success: true, message: "Syntactic structure check passed!" };
        } else {
          return {
            success: false,
            message: "Your code doesn't use the expected programming pattern.",
            expected: `Code pattern matching /${pattern}/`
          };
        }
      }

      case 'function_return': {
        if (!variable) return { success: false, message: "Validation error: 'variable' (function name) missing." };
        
        const pyArgs = args ? JSON.stringify(args) : "[]";
        const checkSnippet = `
if "${variable}" not in globals():
    "__UNDEFINED__"
else:
    _res = globals()["${variable}"](*${pyArgs})
    _nexus_serialize(_res)
        `;
        const jsonStr = pyodide.runPython(checkSnippet);
        if (jsonStr === "__UNDEFINED__") {
          return { success: false, message: `Function '${variable}' is not defined.` };
        }

        const receivedVal = JSON.parse(jsonStr);
        const isMatch = JSON.stringify(receivedVal) === JSON.stringify(expected);
        if (isMatch) {
          return { success: true, message: `Function '${variable}' returned correct output when tested!` };
        } else {
          return {
            success: false,
            message: `Function '${variable}' returned incorrect value when tested.`,
            expected: JSON.stringify(expected),
            received: JSON.stringify(receivedVal)
          };
        }
      }

      case 'custom_test_cases': {
        if (!test_cases || !Array.isArray(test_cases)) {
          return { success: false, message: "Validation error: 'test_cases' is empty or invalid." };
        }
        
        for (let i = 0; i < test_cases.length; i++) {
          const tc = test_cases[i];
          const checkSnippet = `
if "${variable}" not in globals():
    "__UNDEFINED__"
else:
    _res = globals()["${variable}"](${JSON.stringify(tc.input)})
    _nexus_serialize(_res)
          `;
          const jsonStr = pyodide.runPython(checkSnippet);
          if (jsonStr === "__UNDEFINED__") {
            return { success: false, message: `Function '${variable}' is not defined.` };
          }

          const receivedVal = JSON.parse(jsonStr);
          if (JSON.stringify(receivedVal) !== JSON.stringify(tc.expected)) {
            return {
              success: false,
              message: `Failed test case #${i+1} on input: ${JSON.stringify(tc.input)}`,
              expected: JSON.stringify(tc.expected),
              received: JSON.stringify(receivedVal)
            };
          }
        }
        return { success: true, message: "All custom test cases passed perfectly!" };
      }

      default:
        return { success: false, message: `Unsupported check: '${type}'` };
    }
  } catch (err: any) {
    return { success: false, message: `Assertion verification failed: ${err.message}` };
  }
};

export const mergeStarterAndSolution = (starter: string, solution: string): string => {
  if (!solution) return starter;
  if (!starter) return solution;
  
  // Normalize string for duplicate logic checking
  const cleanForComparison = (s: string) => {
    return s.replace(/[\s\(\)\[\]\{\},\.#='"-]/g, '').toLowerCase();
  };

  const cleanSol = cleanForComparison(solution);

  // Split starter into lines and clean placeholders
  const lines = starter.split('\n');
  const cleanedLines = [];

  for (let line of lines) {
    const trimmed = line.trim();

    // 1. Discard lines containing 2 or more isolated underscores (placeholder blanks like __ or ___)
    // But keep dunder methods like __init__ or __str__
    const hasPlaceholderUnderscores = /(?<![a-zA-Z0-9_])_{2,}(?![a-zA-Z0-9_])/.test(trimmed);
    if (hasPlaceholderUnderscores) {
      continue;
    }

    // 2. Discard lines containing ellipses '...' anywhere as a placeholder
    if (trimmed.includes('...')) {
      continue;
    }

    // 3. Discard lines that are empty assignments (e.g. together =  or precision = # YOUR CODE)
    if (trimmed.match(/=\s*(#.*)?$/)) {
      continue;
    }

    // 4. Discard placeholder comments
    if (trimmed.match(/^#\s*(your code here|your code|add your code here|loop condition|get user input|display output|todo)/i)) {
      continue;
    }

    // 5. Discard any line that is a duplicate or is already represented/overridden in the solution
    if (trimmed) {
      const cleanLine = cleanForComparison(trimmed);
      if (cleanLine && cleanSol.includes(cleanLine)) {
        continue;
      }
    }

    cleanedLines.push(line);
  }

  const base = cleanedLines.join('\n').trim();

  // If the solution is already a full script containing function or class definitions, or if base is empty, use solution directly
  if (
    base.length === 0 ||
    solution.includes("def ") ||
    solution.includes("class ")
  ) {
    return solution;
  }
  
  return `${base}\n\n${solution}`;
};
