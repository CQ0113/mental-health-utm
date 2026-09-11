# Templates

Files used as upload templates for PsyCare 2.0 features.

## Slot Import CSV (AS06 — Import CSV Template)

Used in **Slot Manager → CSV Import** (`/admin/slots` and `/counsellor/slots`) to prepare appointment slots in bulk.

| File | Purpose |
| --- | --- |
| `slot-import-template.csv` | Blank template — header row only, fill in your own rows |
| `slot-import-example.csv` | Filled example using the seeded demo counsellors |

### Column format

```csv
date,start,end,counselor,sessionTypes
2026-09-07,09:00,10:00,Dr. Aisha Rahman,physical|online
```

| Column | Format | Rules |
| --- | --- | --- |
| `date` | `YYYY-MM-DD` | Required |
| `start` | `HH:MM` (24-hour) | Required |
| `end` | `HH:MM` (24-hour) | Required — must be after `start`; slot times cannot overlap another slot for the same counsellor on the same date |
| `counselor` | Full name | Required — must match an **existing counsellor's name exactly** (case-insensitive). Rows with unknown names are skipped and counted in the import summary |
| `sessionTypes` | `physical`, `online`, or `physical\|online` | Required — at least one; separate multiple values with a pipe `\|` |

### Behaviour notes

- The header row is optional — any first line containing the word `date` is treated as a header and skipped.
- Invalid rows are **skipped, not rejected**: the import summary reports how many rows were skipped, valid rows still load into the draft schedule.
- Importing only fills the **draft** schedule ("not yet saved"). Nothing is written to the database until **Save Slot Changes** is clicked (AS04 AF5).
- The **Replace existing slots on imported dates** checkbox removes existing slots on matching dates before adding imported ones; leave it off to append.

## Bulk Setup slot templates (AS05 — for reference)

These are built into the Slot Manager UI, not files:

| Template | Slots generated per matched day |
| --- | --- |
| Morning | 09:00–10:00, 10:30–11:30 |
| Afternoon | 13:30–14:30, 15:00–16:00 |
| Full Day | all four blocks above |
