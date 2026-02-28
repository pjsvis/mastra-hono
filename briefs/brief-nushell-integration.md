This brief is designed to be ingested by an agent stationed at a **Rigging Station** (worktree). It provides the exact sequence to move Nushell from a "system binary" to a "integrated sensory tool" within our Loft.

---

# Station Brief: Nushell Rigging & Integration

## **1. Objective**

Install and configure Nushell (`nu`) as the primary **Sensory Tier** for the project. Ensure it has full access to the **Cognitive Rigging** tools (`td`, `skate`, `bun`, `gh`).

## **2. Constraints & Directives**

* **Non-Destructive:** Do not change the system's default shell (keep `zsh`).
* **Symmetric Access:** Ensure environment variables and paths are mirrored from the host to the Nushell environment.
* **Agentic Awareness:** Document the installation in the **Loft Log** (`td`).

---

## **3. Implementation Checklist**

### **Step 1: Presence Check (Kinetic)**

Verify if the binary exists. If not, install via the appropriate channel.

```bash
# Agent shall run this in just-bash
which nu || brew install nushell

```

### **Step 2: Environment Mirroring (The "Right Place")**

Nushell requires an `env.nu` file to see our rigging. Create or update the `env.nu` to include our critical paths.

**Target Path:** `~/.config/nushell/env.nu` (or platform equivalent)

```nushell
# Define the Rigging Path
$env.PATH = (
    $env.PATH | split row (char esep)
    | append '/usr/local/bin'
    | append ($env.HOME | path join '.bun' 'bin')
    | append ($env.HOME | path join '.local' 'bin')
    | uniq
)

```

### **Step 3: Custom Commands & Aliases (Dynamic Trim)**

Add specific "Rigging Aliases" to `config.nu` to make `td` and `skate` feel native to the sensory layer.

**Target Path:** `~/.config/nushell/config.nu`

```nushell
# Rigging Aliases
alias tdu = td usage --new-session
alias tdl = td list
alias skg = skate get

# Custom Sensory Command: Query the active station (JSON-only, no DB access)
def station-status [] {
    let focused = (td current --json | from json | get focused.issue.id?)
    if $focused == null {
        return []
    }
    td list --json
        | from json
        | where id == $focused
        | first
}

```

### **Step 4: Integration Verification**

The agent must verify that the **Sensory Tier** can see the **Rigging**.

```bash
# Test command
nu -c "station-status | to json"

# Validate JSON shapes (debug)
nu -c "td current --json | from json | to json"
nu -c "td list --json | from json | first | to json"

```

---

## **4. Handoff & Documentation**

Upon successful rigging, the agent must:

1. **Log Decision**: `td log --decision "Nushell integrated as Sensory Tier; paths mirrored for bun/td/skate."`
2. **Update `AGENTS.md**`: Add a note under **Environment Tools** that `nu` is available for structured data ingestion.
3. **Perform Handoff**: `td handoff <issue-id> --done "Nushell installed and configured with project rigging aliases."`

---

## **Ctx Opinion: The Correct Tension**

By executing this brief, we ensure the agent isn't "flying blind." The `env.nu` setup is the equivalent of checking the tension on the stays before raising the mast. Without mirroring the paths, the agent will have the "handkerchief" but won't be able to find the "winch" (`skate`) or the "cleat" (`td`).

**Would you like me to initiate a `td` task for this installation right now, or shall we wait for the next agent session to pick it up?**