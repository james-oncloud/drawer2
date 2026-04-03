# Save every query to a new markdown file (user preference)

## User query

> user preference: save every query to new .md file

## Notes / answer

Implemented as a **Cursor project rule** so this applies in future sessions for this workspace:

- **Rule file**: `.cursor/rules/07_save-queries-to-markdown.mdc` (`alwaysApply: true`)
- **Output folder**: this project folder (`Architecture_SAP_C02/`)
- **Naming**: `NN_kebab-case-topic.md` (index prefix; **no date** in the filename)

The rule tells the agent to create a **new** markdown file per substantive user request, with sections for the query and the answer, with small exceptions (e.g. trivial one-word replies).

This file is the record for **this** preference-setting message.
