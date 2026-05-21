# Legacy query snippets

The files in this folder are historical query snippets from the first project skeleton.
Runtime code uses `src/services/*` with the current PostgreSQL schema names.

Do not import these files in production code without first updating them to the active schema:
`accounts`, `employees`, `smartphones`, `access_events`, and snake_case column names.
