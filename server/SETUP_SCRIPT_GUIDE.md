# Database Setup Script Guide

The `setup-database.js` script allows you to run SQL files (`create.sql`, `drop.sql`, `insert.sql`) flexibly.

## Quick Examples

### Run All Files (Recommended for Fresh Setup)
```bash
node setup-database.js --all
```
This runs: `drop.sql` → `create.sql` → `insert.sql` in order.

### Run Individual Files
```bash
# Just create tables
node setup-database.js create.sql

# Just drop tables (be careful!)
node setup-database.js drop.sql

# Just insert data
node setup-database.js insert.sql
```

### Run Multiple Files in Custom Order
```bash
# Drop and recreate
node setup-database.js drop.sql create.sql

# Create and populate
node setup-database.js create.sql insert.sql

# Full reset
node setup-database.js drop.sql create.sql insert.sql
```

### Use Flags with Default File Names
```bash
# Using flags (assumes files are named create.sql, drop.sql, insert.sql)
node setup-database.js --create
node setup-database.js --drop --create
node setup-database.js --drop --create --insert
```

## File Location

The script looks for files in the `server` directory by default. You can also provide absolute paths:

```bash
node setup-database.js /path/to/your/create.sql
```

## Execution Order

**Important:** Files are executed in the order you specify them.

- ✅ Good: `drop.sql create.sql insert.sql` (drops, then creates, then inserts)
- ❌ Bad: `insert.sql create.sql` (tries to insert before tables exist)

## Common Workflows

### Fresh Database Setup
```bash
node setup-database.js --all
```

### Recreate Tables (Keep Data)
```bash
node setup-database.js drop.sql create.sql
```

### Add/Update Data Only
```bash
node setup-database.js insert.sql
```

### Reset Everything
```bash
node setup-database.js drop.sql create.sql insert.sql
```

## Error Handling

- If a file doesn't exist, the script will show an error and stop
- If a file is empty, it will be skipped with a warning
- Database connection errors will be displayed clearly
- All errors include helpful messages

## Tips

1. **Always backup** before running `drop.sql` in production
2. **Test first** on a development database
3. **Check file paths** if you get "file not found" errors
4. **Use `--all`** for the most common workflow (fresh setup)
5. **Run files individually** when debugging specific issues

