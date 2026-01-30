#### Guides

# Metadata Fields

Metadata fields allow you to attach structured attributes to documents in a collection. These fields enable:

* **Filtered retrieval** — Narrow search results to documents matching specific criteria (e.g., `author="Sandra Kim"`)
* **Contextual embeddings** — Inject metadata into chunks to improve retrieval accuracy (e.g., prepending document title to each chunk)
* **Data integrity constraints** — Enforce required fields or uniqueness across documents

## Creating a Collection with Metadata Fields

Define metadata fields using `field_definitions` when creating a collection:

### Field Definition Options

| Option | Description |
|--------|-------------|
| `required` | Document uploads must include this field. Defaults to `false`. |
| `unique` | Only one document in the collection can have a given value for this field. Defaults to `false`. |
| `inject_into_chunk` | Prepends this field's value to every embedding chunk, improving retrieval by providing context. Defaults to `false`. |

## Uploading Documents with Metadata

Include metadata as a JSON object in the `fields` parameter:

## Filtering Documents in Search

Use the `filter` parameter to restrict search results based on metadata values. The filter uses AIP-160 syntax:

### Supported Filter Operators

| Operator | Example | Description |
|----------|---------|-------------|
| `=` | `author="Jane"` | Equals |
| `!=` | `status!="draft"` | Not equals |
| `<`, `>`, `<=`, `>=` | `year>=2020` | Numeric/lexical comparison |
| `AND` | `a="x" AND b="y"` | Both conditions must match |
| `OR` | `a="x" OR a="y"` | Either condition matches |

`OR` has higher precedence than `AND`. Use parentheses for clarity: `a="x" AND (b="y" OR b="z")`.

Wildcard matching (e.g., `author="E*"`) is not supported. All string comparisons are exact matches.

Filtering on fields that don't exist in your documents returns no results. Double-check that field names match your collection's `field_definitions`.

## AIP-160 Filter String Examples

### Basic Examples

```bash
# Equality (double or single quotes for strings with spaces)
author="Sandra Kim"
author='Sandra Kim'

# Equality (no quotes needed for simple values)
year=2024
status=active

# Not equal
status!="archived"
status!='archived'
```

### Comparison Operators

```bash
# Numeric comparisons
year>=2020
year>2019
score<=0.95
price<100

# Combined comparisons (range)
year>=2020 AND year<=2024
```

### Logical Operators

```bash
# AND - both conditions must match
author="Sandra Kim" AND year=2024

# OR - either condition matches
status="pending" OR status="in_progress"

# Combined (OR has higher precedence than AND)
department="Engineering" AND status="active" OR status="pending"

# Use parentheses for clarity
department="Engineering" AND (status="active" OR status="pending")
```

### Complex Examples

```bash
# Multiple conditions
author="Sandra Kim" AND year>=2020 AND status!="draft"

# Nested logic with parentheses
(author="Sandra Kim" OR author="John Doe") AND year>=2020

# Multiple fields with mixed operators
category="finance" AND (year=2023 OR year=2024) AND status!="archived"
```

## Quick Reference

| Use Case | Filter String |
|----------|---------------|
| Exact match | `author="Sandra Kim"` |
| Numeric comparison | `year>=2020` |
| Not equal | `status!="archived"` |
| Multiple conditions | `author="Sandra Kim" AND year=2024` |
| Either condition | `status="pending" OR status="draft"` |
| Grouped logic | `(status="active" OR status="pending") AND year>=2020` |
| Complex filter | `category="finance" AND year>=2020 AND status!="archived"` |
