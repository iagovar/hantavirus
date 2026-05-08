import { createSignal } from 'solid-js';
import pb from './pocketbase';

export function useCases() {
  const [cases, setCases] = createSignal([]);

  async function loadCases() {
    try {
      const records = await pb.collection('cases').getFullList({ sort: '-date' });
      setCases(records);
    } catch (e) {
      console.info('PocketBase not available yet:', e.message);
    }
  }

  async function createCase(data) {
    const record = await pb.collection('cases').create(data);
    setCases((prev) => [record, ...prev]);
    return record;
  }

  async function updateCase(id, data) {
    const record = await pb.collection('cases').update(id, data);
    setCases((prev) => prev.map((c) => (c.id === id ? record : c)));
    return record;
  }

  async function deleteCase(id) {
    await pb.collection('cases').delete(id);
    setCases((prev) => prev.filter((c) => c.id !== id));
  }

  return { cases, loadCases, createCase, updateCase, deleteCase };
}