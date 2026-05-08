import MetricCard from './MetricCard';
import {
  peakInfected,
  deathsByDay,
  effectiveRt,
  isSimulationTruncated,
} from '../../lib/seirdModel';

function InfoTip(props) {
  return (
    <span
      class="ml-1 cursor-help align-top text-[10px] text-surface-400 hover:text-surface-600 transition-colors"
      title={props.text}
    >
      ⓘ
    </span>
  );
}

export default function ModelMetrics(props) {
  const { results, basicReproductionNumber, caseFatalityRatio, removalRate, simulationDays } = props;

  const peak = () => peakInfected(results());
  const deaths = () => deathsByDay(results());
  const rt = () => effectiveRt(results(), basicReproductionNumber());
  const truncated = () => isSimulationTruncated(results());

  return (
    <div class="space-y-3">
      <div class="grid grid-cols-2 lg:grid-cols-5 gap-3">
        <MetricCard
          label={<span>R₀<InfoTip text="Average number of secondary infections caused by one infectious individual in a fully susceptible population." /></span>}
          value={basicReproductionNumber().toFixed(2)}
          sub={basicReproductionNumber() > 1 ? 'Baseline spread > 1' : 'Baseline spread <= 1'}
          color={basicReproductionNumber() > 1 ? 'danger' : 'brand'}
        />
        <MetricCard
          label="Peak in window"
          value={peak().count.toLocaleString()}
          sub={`Day ${peak().day}`}
          color="accent"
        />
        <MetricCard
          label={`Deaths by day ${simulationDays()}`}
          value={deaths().toLocaleString()}
          sub={`CFR: ${(caseFatalityRatio() * 100).toFixed(0)}%`}
          color="surface"
        />
        <MetricCard
          label={<span>β (transmission)<InfoTip text="Rate at which susceptible people become exposed. β = R₀ × γ." /></span>}
          value={(basicReproductionNumber() * removalRate()).toFixed(4)}
          sub={`γ = ${removalRate().toFixed(4)}`}
          color="brand"
        />
        <MetricCard
          label={<span>R_t (effective)<InfoTip text="Time-dependent reproduction number. R_t = R₀ × S(t)/N. If R_t > 1, the outbreak is still expanding." /></span>}
          value={rt().toFixed(2)}
          sub={rt() > 1 ? 'Currently growing' : 'Currently declining'}
          color={rt() > 1 ? 'danger' : 'brand'}
        />
      </div>

      {truncated() && (
        <div class="rounded-xl border border-accent-200 bg-accent-50 px-4 py-3 text-sm text-accent-800">
          ⚠️ Simulation truncated at day {simulationDays()}. The outbreak is still growing; extend duration for full-cycle outcomes.
        </div>
      )}
    </div>
  );
}
