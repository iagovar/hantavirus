export default function StatCard(props) {
  const colorMap = {
    danger: 'bg-danger-50 text-danger-600 border-danger-100',
    accent: 'bg-accent-50 text-accent-600 border-accent-100',
    brand: 'bg-brand-50 text-brand-600 border-brand-100',
    surface: 'bg-surface-100 text-surface-600 border-surface-200',
  };

  return (
    <div class={`rounded-xl border p-4 ${colorMap[props.color] || colorMap.surface}`}>
      <div class="text-xs font-medium uppercase tracking-wide opacity-70 mb-1">{props.label}</div>
      <div class={`font-bold ${props.isText ? 'text-sm' : 'text-2xl'}`}>{props.value}</div>
    </div>
  );
}