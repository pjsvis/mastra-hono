# **The "Lean-Yggdrasil" Operational Brief**

**Objective:** Develop the `ctx` CLI—a minimalist "Sleeve" for the Ctx persona—using **Nushell/Bash** for orchestration and **TypeScript (Deno/Bun)** for stateful LLM logic.

## **1. Architectural Components**

### **A. The Shell Interface (`ctx` wrapper)**
* **Substrate:** Nushell (preferred) or Bash.
* **Responsibility:** Environment sensing, file I/O for `ops-lexicon.toml`, and CLI argument parsing.
* **Key Command Logic:**
    * `ctx wake`: Read `conceptual-lexicon.json` and `cda.json`, output a formatted table of current operational status.
    * `ctx weaponize`: Grab `$env.LAST_EXIT_CODE` or specific history index, pipe to the TS Logic Node, and append the returned TOML to the lexicon.

### **B. The Logic Node (`ctx-engine.ts`)**
* **Substrate:** Deno or Bun (Single executable, no `node_modules`).
* **Responsibility:** The "Prai-Lite" implementation.
* **Mechanism:**
    * A simple `step()` function using native `fetch` to communicate with the LLM API.
    * **State Management:** Maintain a `.ctx_history.json` to store turn-by-turn interactions for "in-flight" refinements.
    * **Pattern Injection:** Read Fabric patterns from a specified path (`~/.config/fabric/patterns/`) and inject them as System Prompts.

### **C. The Storage Substrate (`ops-lexicon.toml`)**
* **Format:** TOML.
* **Requirement:** Use triple-quoted literal strings (`'''`) for all pipelines to ensure complex shell quoting (nested `"` and `'`) does not break the file.

---

## **2. Development Directives for the Agent**

### **Directive 1: The "No-Monolith" Mandate**
Do not use `LangChain`, `LlamaIndex`, or any "Agent" library. Use raw HTTP fetches. Logic should be translucent. If the logic can be explained in a single screen of code, it is correct.

### **Directive 2: Fabric Integration**
The system must treat **Fabric Patterns** as "Plugins."
* Path: `patterns/<pattern_name>/system.md`
* The TS Node should simply read this file and use it as the `system_instruction`.

### **Directive 3: Context Injection**
Every call to the LLM must automatically include the "Locus of Attention" (the current task ID from `td-status`) to ensure the model isn't hallucinating in a vacuum.

---

## **3. Success Criteria (The "Saturday Night" Test)**
1.  **Speed:** `ctx ?` should return in < 100ms.
2.  **Durability:** The `ops-lexicon.toml` must remain valid even after weaponizing a command containing pipes, redirects, and nested quotes.
3.  **Portability:** The entire "Sleeve" (the TS script and the Shell wrapper) should be deployable by copying two files and a patterns folder.

---

### **Ctx Final Mentation:**
This composition moves the **Persona Stack** from "Software" to "Infrastructure." We are building a bridge between your terminal history and the Noosphere.



**The brief is ready for the coding substrate.** Rest well; when we initiate `ctx wake` on this new stack, the entropy of our "Stuff" won't stand a chance.

**Directives Formalised. Session Suspended.**

---

These are the final "in-flight" refinements (**OH-102**) before we transition into the build phase. By moving to a local root directory and committing to **Bun**, we are making the "Sleeve" even more portable and high-performance. 

The move to test **Prai** specifically is a classic **Empirically-Grounded (CIP-2)** play: we don't assume the framework is necessary; we verify if its state-management "Tax" is worth the "Utility."

---

### **Revised "Lean-Yggdrasil" Operational Brief (V2)**

**Objective:** Build the `ctx` CLI—a high-speed, local-first "Sleeve"—using **Bun** for logic/state and **Nushell/Bash** for terminal orchestration.

## **1. Updated Architectural Components**

### **A. Localized Wisdom (`/patterns`)**
* **Change:** No longer a hidden global config (`~/.config/fabric`).
* **Location:** `./patterns/` in the project root.
* **Benefit:** The "Wisdom" is now repo-specific and version-controlled. When you clone the repo, you clone the intelligence required to operate it.

### **B. Core Runtime (Bun)**
* **Requirement:** All TypeScript logic must run via `bun`. 
* **Advantage:** We leverage Bun’s native SQLite, fast File I/O, and built-in `.env` loading without the overhead of heavy dependencies.

### **C. The "Prai" Test-Bed (`ctx-logic.ts`)**
* **Objective:** Implement the initial version using **Daishi Kato’s `prai`** to see where it adds value.
* **Test Criteria:** * Does `prai`'s `step()` abstraction make "weaponizing" a command simpler than a raw fetch?
    * Does it handle the **State Transition** from "raw history" to "structured TOML" more gracefully than our own custom logic?
    * If it feels "heavy" or introduces "monolithic assumptions," we strip it back to a minimalist Bun-native implementation.

---

## **2. Functional "Tree-Climbing" Tasks for the Agent**

### **Task 1: The Integration Probe**
Write a Bun script that imports `prai` and attempts to process a "Stuff" input (raw terminal history) into a "Thing" (TOML block) using a Fabric pattern stored in `./patterns/extract-command`. 

### **Task 2: The Logic Refinement**
If `prai` proves essential, keep it. If not, the agent must "Deductively Minimize" the code into a raw Bun `fetch` implementation that mimics `prai`’s state-handling but removes the dependency.

### **Task 3: The Root-Aware Wrapper**
The `ctx` shell script must be "Root-Aware." It should look for `./patterns` and `./ops-lexicon.toml` relative to the current Git root, ensuring the tool works seamlessly as you navigate the repo.

---

## **3. The Ctx Opinion: Composition over Consumption**

By keeping everything in the root and using Bun, we are creating a **Self-Contained Operational Environment**. 



**Final State Assessment:**
* **Patterns:** Transparent and local (`./patterns`).
* **Runtime:** Single, high-speed engine (`Bun`).
* **State:** Evaluated via `prai` to ensure we aren't reinventing the wheel unless the wheel is too heavy.

The brief is now perfectly aligned with our **Deductive Minimalism** and **Architectural Specialisation**. 

**Ready to engage the coding substrate.** Go get some sleep—the architecture is solid. 

**Directives Updated. Sequence Locked.**