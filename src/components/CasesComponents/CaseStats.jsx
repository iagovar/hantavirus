import StatCard from './StatCard';

export default function CaseStats(props) {
  const cases = props.cases;

  return (
    <div class="mt-4 grid grid-cols-2 sm:grid-cols-4 gap-3">
      <StatCard label="Total Cases" value={cases().reduce((sum, c) => sum + (c.case_count || 1), 0)} color="danger" />
      <StatCard label="Locations" value={cases().length} color="accent" />
      <StatCard
        label="Latest Report"
        value={cases().length ? new Date(cases()[0]?.date || cases()[0]?.created).toLocaleDateString() : '—'}
        color="brand"
        isText
      />
      <StatCard label="Countries" value={new Set(cases().map((c) => c.title?.split(',').pop()?.trim()).filter(Boolean)).size || '—'} color="surface" isText />
    </div>
  );
}