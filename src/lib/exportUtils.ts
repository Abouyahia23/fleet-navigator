import { format } from 'date-fns';

/**
 * Export an array of objects to CSV and trigger download.
 * Respects RLS: only data already fetched (user-visible) is exported.
 */
export function exportToCsv(rows: Record<string, any>[], filename: string) {
  if (!rows.length) return;

  const headers = Object.keys(rows[0]);
  const csvContent = [
    headers.join(';'),
    ...rows.map(row =>
      headers
        .map(h => {
          const v = row[h];
          if (v == null) return '';
          const str = String(v);
          return str.includes(';') || str.includes('"') || str.includes('\n')
            ? `"${str.replace(/"/g, '""')}"`
            : str;
        })
        .join(';')
    ),
  ].join('\n');

  const blob = new Blob(['\ufeff' + csvContent], { type: 'text/csv;charset=utf-8;' });
  const link = document.createElement('a');
  link.href = URL.createObjectURL(blob);
  link.download = `${filename}_${format(new Date(), 'yyyy-MM-dd')}.csv`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(link.href);
}
