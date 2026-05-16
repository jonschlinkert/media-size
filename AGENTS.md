# Agent Instructions

- Never run `git` commands
- Don't ever delete files to update them, as this destroys editor history. Do concise, targeted patches.
- Only read files specified by the user. Ask permission before reading other files.
- When making edits/updates, don't delete the file first, even if the changes are extensive. This prevents the user from doing undo/redo in the editor and losing all changes. Make targeted patches to the file instead.
- Never run type checks or unit tests unless explicitly requested by the user.
