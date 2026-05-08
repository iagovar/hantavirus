export default function MetricCard(props) {
  const colors = {
    danger: 'border-danger-100 bg-danger-50',
    accent: 'border-accent-100 bg-accent-50',
    brand: 'border-brand-100 bg-brand-50',
    surface: 'border-surface-200 bg-surface-50',
  };

  const textColors = {
    danger: 'text-danger-600',
    accent: 'text-accent-600',
    brand: 'text-brand-600',
    surface: 'text-surface-700',
  };

  return (
    <div class={`rounded-xl border p-4 ${colors[props.color]}`}>
      <div class="text-xs font-medium uppercase tracking-wide text-surface-400 mb-1">{props.label}</div>
      <div class={`text-xl font-bold tabular-nums ${textColors[props.color]}`}>{props.value}</div>
      <div class="text-xs text-surface-400 mt-0.5">{props.sub}</div>
    </div>
  );
}
