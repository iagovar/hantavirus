export default function CaseForm(props) {
  const {
    formData, setFormData,
    formMode, setFormMode,
    searchResults,
    searching,
    submitting,
    error,
    onSearch,
    onSelectResult,
    onSubmit,
    onCancel,
  } = props;

  return (
    <div class="bg-white border border-surface-200 rounded-2xl p-6 mb-6 shadow-sm animate-in">
      <h3 class="text-lg font-semibold text-surface-800 mb-4">Report New Case</h3>

      <div class="flex gap-2 mb-5">
        <button
          onClick={() => setFormMode('search')}
          class={`px-4 py-2 rounded-lg text-sm font-medium transition-all cursor-pointer ${
            formMode() === 'search'
              ? 'bg-brand-50 text-brand-700 border border-brand-200'
              : 'bg-surface-100 text-surface-500 hover:text-surface-700 border border-transparent'
          }`}
        >
          🔍 Search Location
        </button>
        <button
          onClick={() => setFormMode('coords')}
          class={`px-4 py-2 rounded-lg text-sm font-medium transition-all cursor-pointer ${
            formMode() === 'coords'
              ? 'bg-brand-50 text-brand-700 border border-brand-200'
              : 'bg-surface-100 text-surface-500 hover:text-surface-700 border border-transparent'
          }`}
        >
          📍 GPS Coordinates
        </button>
      </div>

      <form onSubmit={onSubmit} class="space-y-4">
        {formMode() === 'search' ? (
          <div>
            <label class="block text-sm font-medium text-surface-700 mb-1.5">
              Search country, region, or city
            </label>
            <div class="flex gap-2">
              <input
                id="location-search"
                type="text"
                value={formData().searchQuery}
                onInput={(e) => setFormData((p) => ({ ...p, searchQuery: e.target.value }))}
                placeholder="e.g. Buenos Aires, Argentina"
                class="flex-1 px-4 py-2.5 border border-surface-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-brand-400/50 focus:border-brand-400 transition"
              />
              <button
                type="button"
                onClick={onSearch}
                disabled={searching()}
                class="px-4 py-2.5 bg-surface-800 hover:bg-surface-700 text-white rounded-xl text-sm font-medium transition cursor-pointer disabled:opacity-50"
              >
                {searching() ? 'Searching…' : 'Search'}
              </button>
            </div>
            {searchResults().length > 0 && (
              <ul class="mt-2 bg-white border border-surface-200 rounded-xl shadow-lg overflow-hidden">
                {searchResults().map((r) => (
                  <li>
                    <button
                      type="button"
                      onClick={() => onSelectResult(r)}
                      class="w-full text-left px-4 py-3 text-sm hover:bg-brand-50 transition border-b border-surface-100 last:border-0 cursor-pointer"
                    >
                      <div class="font-medium text-surface-800">{r.display_name.split(',')[0]}</div>
                      <div class="text-xs text-surface-400 mt-0.5 truncate">{r.display_name}</div>
                    </button>
                  </li>
                ))}
              </ul>
            )}
          </div>
        ) : (
          <div class="grid grid-cols-2 gap-4">
            <div>
              <label class="block text-sm font-medium text-surface-700 mb-1.5">Latitude</label>
              <input
                id="input-lat"
                type="number"
                step="any"
                value={formData().lat}
                onInput={(e) => setFormData((p) => ({ ...p, lat: e.target.value }))}
                placeholder="-34.6037"
                class="w-full px-4 py-2.5 border border-surface-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-brand-400/50 focus:border-brand-400 transition"
              />
            </div>
            <div>
              <label class="block text-sm font-medium text-surface-700 mb-1.5">Longitude</label>
              <input
                id="input-lng"
                type="number"
                step="any"
                value={formData().lng}
                onInput={(e) => setFormData((p) => ({ ...p, lng: e.target.value }))}
                placeholder="-58.3816"
                class="w-full px-4 py-2.5 border border-surface-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-brand-400/50 focus:border-brand-400 transition"
              />
            </div>
          </div>
        )}

        <div class="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div>
            <label class="block text-sm font-medium text-surface-700 mb-1.5">Title</label>
            <input
              id="input-title"
              type="text"
              value={formData().title}
              onInput={(e) => setFormData((p) => ({ ...p, title: e.target.value }))}
              placeholder="Location name"
              class="w-full px-4 py-2.5 border border-surface-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-brand-400/50 focus:border-brand-400 transition"
            />
          </div>
          <div>
            <label class="block text-sm font-medium text-surface-700 mb-1.5">Number of Cases</label>
            <input
              id="input-casecount"
              type="number"
              min="1"
              value={formData().caseCount}
              onInput={(e) => setFormData((p) => ({ ...p, caseCount: e.target.value }))}
              class="w-full px-4 py-2.5 border border-surface-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-brand-400/50 focus:border-brand-400 transition"
            />
          </div>
          <div>
            <label class="block text-sm font-medium text-surface-700 mb-1.5">Date</label>
            <input
              id="input-date"
              type="date"
              value={formData().date}
              onInput={(e) => setFormData((p) => ({ ...p, date: e.target.value }))}
              class="w-full px-4 py-2.5 border border-surface-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-brand-400/50 focus:border-brand-400 transition"
            />
          </div>
        </div>

        <div>
          <label class="block text-sm font-medium text-surface-700 mb-1.5">Description (optional)</label>
          <textarea
            id="input-description"
            value={formData().description}
            onInput={(e) => setFormData((p) => ({ ...p, description: e.target.value }))}
            rows="2"
            placeholder="Additional details about the case(s)…"
            class="w-full px-4 py-2.5 border border-surface-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-brand-400/50 focus:border-brand-400 transition resize-none"
          />
        </div>

        {formData().lat && formData().lng && (
          <div class="flex items-center gap-2 text-xs text-brand-600 bg-brand-50 rounded-lg px-3 py-2">
            <svg class="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
              <path stroke-linecap="round" stroke-linejoin="round" d="M5 13l4 4L19 7" />
            </svg>
            Coordinates: {formData().lat}, {formData().lng}
          </div>
        )}

        {error() && (
          <div class="text-sm text-danger-600 bg-danger-50 rounded-lg px-3 py-2">
            {error()}
          </div>
        )}

        <div class="flex justify-end gap-3 pt-2">
          <button
            type="button"
            onClick={onCancel}
            class="px-5 py-2.5 text-sm font-medium text-surface-600 hover:text-surface-800 transition cursor-pointer"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={submitting()}
            class="px-6 py-2.5 bg-brand-500 hover:bg-brand-600 text-white rounded-xl text-sm font-semibold shadow-sm transition cursor-pointer disabled:opacity-50 hover:shadow-md active:scale-[0.98]"
          >
            {submitting() ? 'Saving…' : 'Save Case'}
          </button>
        </div>
      </form>
    </div>
  );
}