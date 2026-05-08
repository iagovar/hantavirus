import { createSignal } from 'solid-js';

const COLUMNS = [
  { key: 'title', label: 'Title' },
  { key: 'case_count', label: 'Cases' },
  { key: 'date', label: 'Date' },
  { key: 'lat', label: 'Lat' },
  { key: 'lng', label: 'Lng' },
  { key: 'description', label: 'Description' },
  { key: 'id', label: 'ID' },
];

const SORT_LABEL = { asc: '\u2191', desc: '\u2193' };

export default function CaseHistoryTable(props) {
  const cases = props.cases;
  const isLoggedIn = props.isLoggedIn;
  const onEdit = props.onEdit;
  const onDelete = props.onDelete;
  const [sortKey, setSortKey] = createSignal('date');
  const [sortDir, setSortDir] = createSignal('desc');
  const [deleting, setDeleting] = createSignal(null);

  function handleSort(key) {
    if (sortKey() === key) {
      setSortDir((d) => (d === 'asc' ? 'desc' : 'asc'));
    } else {
      setSortKey(key);
      setSortDir('asc');
    }
  }

  function sortedCases() {
    const list = [...cases()];
    const key = sortKey();
    const dir = sortDir();

    list.sort((a, b) => {
      const va = a[key] != null ? a[key] : '';
      const vb = b[key] != null ? b[key] : '';
      let cmp;
      if (typeof va === 'number' && typeof vb === 'number') {
        cmp = va - vb;
      } else {
        cmp = String(va).localeCompare(String(vb));
      }
      return dir === 'desc' ? -cmp : cmp;
    });

    return list;
  }

  function formatValue(key, val) {
    if (key === 'date' && val) {
      return new Date(val).toLocaleDateString();
    }
    if (key === 'id' && val) {
      return val.slice(0, 8);
    }
    if (key === 'description' && val && val.length > 60) {
      return val.slice(0, 60) + '\u2026';
    }
    return val ?? '\u2014';
  }

  return (
    <div class="bg-white border border-surface-200 rounded-2xl shadow-sm overflow-hidden">
      <div class="overflow-x-auto">
        <table class="w-full text-sm">
          <thead>
            <tr class="bg-surface-50/80">
              {COLUMNS.map((col) => (
                <th
                  onClick={() => handleSort(col.key)}
                  class="text-left px-4 py-3 font-semibold text-surface-600 uppercase tracking-wide text-xs cursor-pointer hover:bg-surface-100 transition select-none"
                >
                  {col.label}
                  {sortKey() === col.key && (
                    <span class="ml-1 text-brand-500">{SORT_LABEL[sortDir()]}</span>
                  )}
                </th>
              ))}
              {isLoggedIn && (
                <th class="text-left px-4 py-3 font-semibold text-surface-600 uppercase tracking-wide text-xs w-[100px]">
                  Actions
                </th>
              )}
            </tr>
          </thead>
          <tbody>
            {sortedCases().map((c) => (
              <tr class="border-t border-surface-100 hover:bg-brand-50/30 transition-colors">
                {COLUMNS.map((col) => (
                  <td class="px-4 py-3 text-surface-700 align-top">
                    {formatValue(col.key, c[col.key])}
                  </td>
                ))}
                {isLoggedIn && (
                  <td class="px-4 py-3 align-top">
                    <div class="flex gap-1.5">
                      <button
                        onClick={() => onEdit(c)}
                        class="inline-flex items-center justify-center w-7 h-7 rounded-md bg-brand-500 hover:bg-brand-600 text-white text-xs transition cursor-pointer"
                        title="Edit case"
                      >
                        &#9998;
                      </button>
                      <button
                        onClick={() => {
                          if (deleting() === c.id) {
                            onDelete(c.id);
                            setDeleting(null);
                          } else {
                            setDeleting(c.id);
                          }
                        }}
                        class={`inline-flex items-center justify-center rounded-md text-xs transition-all duration-200 cursor-pointer ${
                          deleting() === c.id
                            ? 'w-8 h-8 bg-danger-600 text-white ring-2 ring-danger-300 ring-offset-1 scale-110'
                            : 'w-7 h-7 bg-danger-500 hover:bg-danger-600 text-white'
                        }`}
                        title={deleting() === c.id ? 'Click again to confirm' : 'Delete case'}
                      >
                        {deleting() === c.id ? '\u2713' : '\u2715'}
                      </button>
                    </div>
                  </td>
                )}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      {cases().length === 0 && (
        <div class="px-4 py-12 text-center text-surface-400 text-sm">
          No cases reported yet.
        </div>
      )}
    </div>
  );
}