// Hantavirus Tracker App - v1.0.1
import { createSignal, createEffect, onMount, onCleanup } from 'solid-js';
import { useCases } from './lib/casesModel';
import Header from './components/Header';
import MapSection from './components/MapSection';
import CaseHistorySection from './components/CaseHistorySection';
import ModelSection from './components/ModelSection';
import Footer from './components/Footer';

const HASH_MAP = { '#case-map': 'map', '#case-history': 'history', '#sir-model': 'model' };
const TAB_HASH = { map: '#case-map', history: '#case-history', model: '#sir-model' };

function tabFromHash(hash) {
  return HASH_MAP[hash] || 'map';
}

export default function App() {
  const { cases, loadCases, createCase, updateCase, deleteCase } = useCases();
  const [activeTab, setActiveTab] = createSignal(
    tabFromHash(window.location.hash)
  );

  onMount(() => {
    loadCases();
    if (!HASH_MAP[window.location.hash]) {
      window.location.hash = '#case-map';
    }
    const onHashChange = () => setActiveTab(tabFromHash(window.location.hash));
    window.addEventListener('hashchange', onHashChange);
    onCleanup(() => window.removeEventListener('hashchange', onHashChange));
  });

  createEffect(() => {
    const hash = TAB_HASH[activeTab()];
    if (window.location.hash !== hash) {
      history.pushState(null, '', hash);
    }
  });

  return (
    <div class="min-h-screen flex flex-col bg-surface-50">
      <Header activeTab={activeTab} setActiveTab={setActiveTab} />

      <main class="flex-1 w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {activeTab() === 'map'
          ? <MapSection cases={cases} createCase={createCase} />
          : activeTab() === 'history'
            ? <CaseHistorySection cases={cases} createCase={createCase} updateCase={updateCase} deleteCase={deleteCase} />
            : <ModelSection />
        }
      </main>

      <Footer />
    </div>
  );
}