interface Column {
  key:       string;
  header:    string;
  width?:    string;
  align?:    'left' | 'center' | 'right';
  render?:   (value: any, row: any) => React.ReactNode;
}

interface TableProps {
  columns:       Column[];
  data:          any[];
  emptyMessage?: string;
  loading?:      boolean;
  onRowClick?:   (row: any) => void;
}

export default function Table({
  columns, data, emptyMessage = 'No records found.',
  loading = false, onRowClick,
}: TableProps) {
  return (
    <div className="bg-white rounded-2xl border shadow-sm overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="bg-gray-50 border-b">
            <tr>
              {columns.map(col => (
                <th
                  key={col.key}
                  style={{ width: col.width }}
                  className={`px-4 py-3 text-xs font-semibold uppercase tracking-wide text-gray-500
                    text-${col.align || 'left'}`}
                >
                  {col.header}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-50">
            {loading ? (
              <tr>
                <td colSpan={columns.length} className="text-center py-12 text-gray-400">
                  <div className="flex items-center justify-center gap-2">
                    <div className="w-5 h-5 border-2 border-blue-500 border-t-transparent
                                    rounded-full animate-spin" />
                    Loading…
                  </div>
                </td>
              </tr>
            ) : data.length === 0 ? (
              <tr>
                <td colSpan={columns.length}
                  className="text-center py-12 text-gray-400 text-sm">
                  {emptyMessage}
                </td>
              </tr>
            ) : data.map((row, i) => (
              <tr
                key={row._id || row.id || i}
                onClick={() => onRowClick?.(row)}
                className={`hover:bg-gray-50 transition
                  ${onRowClick ? 'cursor-pointer' : ''}`}
              >
                {columns.map(col => (
                  <td
                    key={col.key}
                    className={`px-4 py-3 text-gray-700 text-${col.align || 'left'}`}
                  >
                    {col.render
                      ? col.render(row[col.key], row)
                      : row[col.key] ?? '—'
                    }
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
