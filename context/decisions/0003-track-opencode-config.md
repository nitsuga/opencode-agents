---
type: Decision
title: Track the OpenCode configuration in this repo
decision_status: accepted
tags: [decision, config, agents, repository]
fork: 2
generated:
  by: deepseek/deepseek-flash
  at: 2026-11-12T18:20:00Z
---

# Context

The agent and delegation definitions, their skills, and `opencode.jsonc` lived only
in `~/.config/opencode/` — not a git repository, not covered by the dotfiles repo.
Six agent definitions that shape every session existed as unversioned files on one
machine. A change was impossible to review, diff, roll back, or reproduce.

The plugin was already in its own repo (`opencode-native-sidebar`).

# Decision

Track the configuration in the **same repo as the plugin**, renamed
`opencode-agents` to say what it is:

- `agents/`, `skills/`, and `config/{opencode.jsonc,cli.json,AGENTS.md}` are the
  tracked copies.
- `scripts/link-config.sh` **symlinks** them into `~/.config/opencode`, so the
  tracked copy is the live copy: edits deploy immediately and the two cannot drift.
- Secrets stay out: `service.json` (the server password), `*.bak*`, and
  `plugin-meta.json` are never tracked or linked.
- The plugin moves to `plugin/`, keeping the repo top level about agents while
  `plugin/tui.tsx` remains at its own directory root (ADR 0002).

# Alternatives considered

1. **A separate repo for the config.** Rejected: the agent definitions and the
   plugin that displays them are one concern, and the user wants them together.
2. **Put the config in the dotfiles repo.** Rejected: that repo tracks machine and
   shell setup; OpenCode's agents, skills, and model choices have their own
   lifecycle and are worth their own history and issues.
3. **Copy the config in, deploy by copy.** Rejected: copies drift, and a stale
   copy silently changes agent behavior. Symlinks make drift impossible and are
   what `--check` verifies.
4. **Keep the repo named for the plugin.** Rejected: once it holds the agents, the
   name misdescribes it.

# Consequences

- Editing an agent file changes the next turn of every running session. That is the
  point, but it makes a bad edit immediately visible.
- The repo must exist on the machine: deleting the working copy breaks the live
  config, because the symlinks point into it.
- `scripts/link-config.sh --check` is the drift guard; run it after moving the repo.
- GitHub redirects the old `opencode-native-sidebar` URLs, and issue #1 moved with
  the repo.
