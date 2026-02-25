# Debrief: td-fc7e38

## Summary of Changes
- Added a dedicated Nushell agent usage guide with Everyday and Development modes, examples, and troubleshooting.
- Created a Nushell agent playbook with operational rules and approved patterns.
- Linked the Nushell docs/playbook from `AGENTS.md` and referenced the playbook from `playbooks/td-agent-playbook.md`.
- Updated Nushell configuration to use `td --json` (no DB coupling).

## Key Achievements
- Established Nushell as the agent sensory tier with structured task queries.
- Documented repeatable workflows and shortcuts for everyday usage.
- Formalized development-mode guidance for creating new Nushell tooling.

## Playbooks Created/Updated
- Created: `playbooks/nushell-agent-playbook.md`
- Updated: `playbooks/td-agent-playbook.md`

## Decisions & Rationale
- Standardized on `td current --json` and `td list --json` for structured state rather than reading `td` DB paths.
- Split Nushell usage into Everyday vs Development modes for clarity and safety.

## Notes
- `station-status` now derives the focused task via `td` JSON output.
- Documentation includes examples, shortcuts, and piping patterns for future agents.