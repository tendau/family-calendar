import { format } from "date-fns";

/**
 * Parse a datetime string from the server, assuming it's in UTC if no timezone info is provided
 */
export const parseServerDateTime = (dateTimeString: string): Date => {
  // If the string doesn't end with 'Z' or have timezone info, assume it's UTC
  if (!dateTimeString.includes('Z') && !dateTimeString.includes('+') && !dateTimeString.includes('-', 10)) {
    // Add 'Z' to indicate UTC time
    return new Date(dateTimeString + 'Z');
  }
  return new Date(dateTimeString);
};

/**
 * Parse a server datetime as a local Date representing the calendar day.
 * For all-day events we must avoid timezone shifts: construct a local
 * midnight for the YYYY-MM-DD portion so the event appears on the
 * correct local day(s).
 */
export const parseServerDate = (dateTimeString: string, allDay = false): Date => {
  if (allDay) {
    // Expect "YYYY-MM-DD" or "YYYY-MM-DDTHH:MM:SS"; take the date portion
    const datePart = dateTimeString.split('T')[0];
    const [y, m, d] = datePart.split('-').map((s) => parseInt(s, 10));
    // Create a local Date at local midnight for that calendar day
    return new Date(y, m - 1, d);
  }
  return parseServerDateTime(dateTimeString);
};

/**
 * Format a server datetime string to local date and time
 */
export const formatServerDateTime = (dateTimeString: string): string => {
  try {
    const date = parseServerDateTime(dateTimeString);
    return format(date, "EEEE, MMM d, yyyy 'at' h:mm a");
  } catch {
    return dateTimeString;
  }
};

/**
 * Format a server datetime string to local date only
 */
export const formatServerDate = (dateTimeString: string): string => {
  try {
    const date = parseServerDateTime(dateTimeString);
    return format(date, "MMM d, yyyy");
  } catch {
    return dateTimeString;
  }
};

/**
 * Format a server datetime string to local time only
 */
export const formatServerTime = (dateTimeString: string): string => {
  try {
    const date = parseServerDateTime(dateTimeString);
    return format(date, "h:mm a");
  } catch {
    return dateTimeString;
  }
};

/**
 * Format a server datetime string with timezone information
 */
export const formatServerDateTimeWithTimezone = (dateTimeString: string) => {
  try {
    const date = parseServerDateTime(dateTimeString);
    const timezoneName = Intl.DateTimeFormat().resolvedOptions().timeZone;
    const timezoneAbbr = date.toLocaleTimeString('en-us', { timeZoneName: 'short' }).split(' ').pop();
    return {
      date: format(date, "EEEE, MMM d"),
      time: format(date, "h:mm a"),
      timezone: timezoneAbbr || timezoneName
    };
  } catch {
    return {
      date: dateTimeString,
      time: '',
      timezone: ''
    };
  }
};
