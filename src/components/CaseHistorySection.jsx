import { createSignal } from 'solid-js';
import CaseForm from './CasesComponents/CaseForm';
import CaseHistoryTable from './HistoryComponents/CaseHistoryTable';
import CaseStats from './CasesComponents/CaseStats';
import CaseClassification from './CasesComponents/CaseClassification';
import pb from '../lib/pocketbase';

export default function CaseHistorySection(props) {
  const { cases, createCase, updateCase, deleteCase } = props;
  const isLoggedIn = () => pb.authStore.isValid;

  const [showForm, setShowForm] = createSignal(false);
  const [editingId, setEditingId] = createSignal(null);
  const [formMode, setFormMode] = createSignal('coords');
  const [formData, setFormData] = createSignal({
    lat: '',
    lng: '',
    searchQuery: '',
    title: '',
    description: '',
    caseCount: 1,
    date: new Date().toISOString().split('T')[0],
  });
  const [searchResults, setSearchResults] = createSignal([]);
  const [searching, setSearching] = createSignal(false);
  const [submitting, setSubmitting] = createSignal(false);
  const [error, setError] = createSignal('');

  async function searchLocation() {
    const q = formData().searchQuery.trim();
    if (!q) return;
    setSearching(true);
    setSearchResults([]);
    try {
      const resp = await fetch(
        `https://nominatim.openstreetmap.org/search?format=json&accept-language=en&q=${encodeURIComponent(q)}&limit=5`,
        { headers: { 'User-Agent': 'HantavirusTracker2026/1.0' } }
      );
      const data = await resp.json();
      setSearchResults(data);
    } catch (e) {
      setError('Geocoding search failed. Please try again.');
    } finally {
      setSearching(false);
    }
  }

  function selectSearchResult(result) {
    setFormData((prev) => ({
      ...prev,
      lat: parseFloat(result.lat).toFixed(5),
      lng: parseFloat(result.lon).toFixed(5),
      searchQuery: result.display_name,
      title: prev.title || result.display_name.split(',')[0],
    }));
    setSearchResults([]);
  }

  function handleEdit(caseItem) {
    setEditingId(caseItem.id);
    setFormData({
      lat: String(caseItem.lat ?? ''),
      lng: String(caseItem.lng ?? ''),
      searchQuery: '',
      title: caseItem.title || '',
      description: caseItem.description || '',
      caseCount: caseItem.case_count || 1,
      date: caseItem.date ? caseItem.date.split('T')[0] : new Date().toISOString().split('T')[0],
    });
    setFormMode('coords');
    setSearchResults([]);
    setError('');
    setShowForm(true);
  }

  async function handleDelete(id) {
    setError('');
    try {
      await deleteCase(id);
    } catch (e) {
      setError(`Failed to delete case: ${e.message}`);
    }
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setError('');
    const d = formData();

    if (!d.lat || !d.lng) {
      setError('Please provide coordinates or search for a location.');
      return;
    }

    setSubmitting(true);
    try {
      if (editingId()) {
        await updateCase(editingId(), {
          lat: parseFloat(d.lat),
          lng: parseFloat(d.lng),
          title: d.title,
          description: d.description,
          case_count: parseInt(d.caseCount) || 1,
          date: d.date,
        });
      } else {
        await createCase({
          lat: parseFloat(d.lat),
          lng: parseFloat(d.lng),
          title: d.title,
          description: d.description,
          case_count: parseInt(d.caseCount) || 1,
          date: d.date,
        });
      }
      setShowForm(false);
      resetForm();
    } catch (e) {
      setError(`Failed to save case: ${e.message}`);
    } finally {
      setSubmitting(false);
    }
  }

  function resetForm() {
    setEditingId(null);
    setFormData({
      lat: '',
      lng: '',
      searchQuery: '',
      title: '',
      description: '',
      caseCount: 1,
      date: new Date().toISOString().split('T')[0],
    });
    setSearchResults([]);
  }

  return (
    <section id="case-history-section" class="space-y-6">
      <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 class="text-2xl font-bold text-surface-900">Case History</h2>
          <p class="text-sm text-surface-500 mt-1">{cases().length} case{cases().length !== 1 ? 's' : ''} reported. Click column headers to sort.</p>
        </div>
        {isLoggedIn() && (
          <button
            onClick={() => { setShowForm(!showForm()); if (showForm()) resetForm(); }}
            class="inline-flex items-center gap-2 px-5 py-2.5 bg-brand-500 hover:bg-brand-600 text-white rounded-xl text-sm font-semibold shadow-sm transition-all duration-200 cursor-pointer hover:shadow-md active:scale-[0.98]"
          >
            <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2.5">
              <path stroke-linecap="round" stroke-linejoin="round" d="M12 4v16m8-8H4" />
            </svg>
            {showForm() ? 'Close Form' : 'Add Case'}
          </button>
        )}
      </div>

      <div class="bg-amber-50 border border-amber-200 rounded-xl px-4 py-3 text-sm text-amber-800">
        <span class="font-semibold">Volunteers needed</span> — Help keep case data up to date.{' '}
        <a href="https://x.com/iagovar" target="_blank" rel="noopener noreferrer" class="text-amber-900 underline underline-offset-2 hover:text-amber-950 font-medium">
          Contact @iagovar on X
        </a>
      </div>

      {showForm() && (
        <CaseForm
          formData={formData} setFormData={setFormData}
          formMode={formMode} setFormMode={setFormMode}
          searchResults={searchResults}
          searching={searching}
          submitting={submitting}
          error={error}
          onSearch={searchLocation}
          onSelectResult={selectSearchResult}
          onSubmit={handleSubmit}
          onCancel={() => { setShowForm(false); resetForm(); }}
        />
      )}

      <CaseHistoryTable
        cases={cases}
        isLoggedIn={isLoggedIn()}
        onEdit={handleEdit}
        onDelete={handleDelete}
      />
      <CaseStats cases={cases} />
      <CaseClassification />
    </section>
  );
}