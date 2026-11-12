# Runtime Environment

- Node.js 24 is installed through NVM at `~/.nvm/versions/node/v24.19.0`.
- Do not treat the system Node.js 18 installation as authoritative.
- For Node-based commands, source `~/.nvm/nvm.sh` or prepend `~/.nvm/versions/node/v24.19.0/bin` to `PATH`.

## Subagent Session Hygiene
- Child (subagent) sessions are reaped by age: `opencode-session-reap --days 7` lists them, and `--execute` deletes them. It only touches sessions that have a parent_id and skips anything the server reports as active.
- Never delete the current session, and never hand-delete a session without a parent_id.
