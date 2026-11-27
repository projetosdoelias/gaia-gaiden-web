/**
 * Date-only values (plant stage dates) are stored at UTC midnight,
 * so they must be formatted in UTC to avoid off-by-one days in
 * timezones like America/Sao_Paulo.
 */
export function formatStageDate(iso: string): string {
  return new Date(iso).toLocaleDateString("en-US", {
    timeZone: "UTC",
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

/** Real timestamps (createdAt/updatedAt) are shown in the user's local time. */
export function formatTimestamp(iso: string): string {
  return new Date(iso).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

/** Bucket size of an aggregated telemetry series. */
type SeriesBucket = "hour" | "day";

/**
 * Short axis tick for a series bucket, in the series time zone:
 * `14:00` for hourly buckets, `Nov 19` for daily ones.
 */
export function formatBucketTick(
  iso: string | Date,
  bucket: SeriesBucket,
  timeZone: string,
): string {
  const date = new Date(iso);
  return bucket === "hour"
    ? date.toLocaleTimeString("en-US", {
        timeZone,
        hour: "2-digit",
        minute: "2-digit",
        hourCycle: "h23",
      })
    : date.toLocaleDateString("en-US", { timeZone, month: "short", day: "numeric" });
}

/**
 * Full label for a series bucket (tooltip, table), in the series time zone:
 * `Nov 19, 14:00` for hourly buckets, `Nov 19, 2026` for daily ones.
 */
export function formatBucketLabel(
  iso: string | Date,
  bucket: SeriesBucket,
  timeZone: string,
): string {
  const date = new Date(iso);
  return bucket === "hour"
    ? date.toLocaleString("en-US", {
        timeZone,
        month: "short",
        day: "numeric",
        hour: "2-digit",
        minute: "2-digit",
        hourCycle: "h23",
      })
    : date.toLocaleDateString("en-US", {
        timeZone,
        month: "short",
        day: "numeric",
        year: "numeric",
      });
}

/** ISO string at UTC midnight → `YYYY-MM-DD` for `<input type="date">`. */
export function isoToDateInput(iso: string | null): string {
  return iso ? iso.slice(0, 10) : "";
}

const pad = (n: number) => String(n).padStart(2, "0");

/** Local calendar day of a timestamp, as `YYYY-MM-DD` (for grouping). */
export function localDayKey(iso: string | Date): string {
  const d = new Date(iso);
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
}

/** Day heading for a timeline group: `Today`, `Yesterday` or `Nov 17, 2026` (local time). */
export function formatDayHeading(iso: string, now: Date = new Date()): string {
  const key = localDayKey(iso);
  if (key === localDayKey(now)) return "Today";
  const yesterday = new Date(now);
  yesterday.setDate(now.getDate() - 1);
  if (key === localDayKey(yesterday)) return "Yesterday";
  return new Date(iso).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

/** Time of day of a timestamp, in local time: `02:30 PM`. */
export function formatTimeOfDay(iso: string): string {
  return new Date(iso).toLocaleTimeString("en-US", {
    hour: "2-digit",
    minute: "2-digit",
  });
}

/** Timestamp → local `YYYY-MM-DDTHH:mm` for `<input type="datetime-local">`. */
export function isoToDateTimeLocal(iso: string | Date): string {
  const d = new Date(iso);
  return `${localDayKey(d)}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
}

/**
 * `<input type="datetime-local">` value (local wall time) → ISO string in UTC.
 * Returns null for an empty or unparsable value.
 */
export function dateTimeLocalToIso(value: string): string | null {
  if (!value) return null;
  const time = new Date(value).getTime();
  return Number.isNaN(time) ? null : new Date(time).toISOString();
}
