import ParamSlider from './ParamSlider';

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

export default function ModelControls(props) {
  const {
    totalPopulation, setTotalPopulation,
    initialInfectious, setInitialInfectious,
    basicReproductionNumber, setBasicReproductionNumber,
    infectiousPeriodDays, setInfectiousPeriodDays,
    incubationPeriodDays, setIncubationPeriodDays,
    caseFatalityRatio, setCaseFatalityRatio,
    simulationDays, setSimulationDays,
    onReset,
  } = props;

  return (
    <div class="bg-white border border-surface-200 rounded-2xl shadow-sm p-6 space-y-5">
      <h3 class="font-semibold text-surface-800 text-sm uppercase tracking-wide">Model Parameters</h3>

      <div>
        <div class="flex items-center justify-between mb-1.5">
          <label for="param-population" class="text-sm font-medium text-surface-700">
            Population (N)
          </label>
          <span class="text-sm font-semibold text-brand-600 tabular-nums">
            {totalPopulation().toLocaleString()}
          </span>
        </div>
        <input
          id="param-population"
          type="number"
          min="1"
          step="1000000"
          value={totalPopulation()}
          onInput={(e) => setTotalPopulation(Math.max(1, parseInt(e.target.value, 10) || 1))}
          class="w-full px-4 py-2.5 border border-surface-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-brand-400/50 focus:border-brand-400 transition"
        />
        <div class="flex gap-2 mt-2">
          <button
            onClick={() => setTotalPopulation(50000000)}
            class="flex-1 px-3 py-1.5 text-xs font-medium bg-surface-100 hover:bg-surface-200 text-surface-600 rounded-lg transition cursor-pointer"
          >
            50M
          </button>
          <button
            onClick={() => setTotalPopulation(8000000000)}
            class="flex-1 px-3 py-1.5 text-xs font-medium bg-surface-100 hover:bg-surface-200 text-surface-600 rounded-lg transition cursor-pointer"
          >
            World
          </button>
        </div>
      </div>

      <ParamSlider
        id="param-initial-infected"
        label="Initial Infected (I₀)"
        value={initialInfectious()}
        onChange={setInitialInfectious}
        min={1}
        max={1000}
        step={1}
        format={(v) => v.toString()}
      />
      <ParamSlider
        id="param-r0"
        label="Basic Reproduction Number (R₀)"
        value={basicReproductionNumber()}
        onChange={setBasicReproductionNumber}
        min={0.1}
        max={10}
        step={0.01}
        format={(v) => v.toFixed(2)}
      />
      <ParamSlider
        id="param-incubation-period"
        label="Incubation Period (days)"
        value={incubationPeriodDays()}
        onChange={setIncubationPeriodDays}
        min={5}
        max={40}
        step={1}
        format={(v) => `${v} days`}
      />
      <ParamSlider
        id="param-infectious-period"
        label="Infectious Period (days)"
        value={infectiousPeriodDays()}
        onChange={setInfectiousPeriodDays}
        min={1}
        max={60}
        step={1}
        format={(v) => `${v} days`}
      />
      <ParamSlider
        id="param-cfr"
        label={<span>Case Fatality Rate (μ)<InfoTip text="CFR shown here is based on the contained Epuyén outbreak. In uncontrolled scenarios with health-system saturation, effective fatality could be higher." /></span>}
        value={caseFatalityRatio()}
        onChange={setCaseFatalityRatio}
        min={0}
        max={1}
        step={0.01}
        format={(v) => `${(v * 100).toFixed(0)}%`}
      />
      <ParamSlider
        id="param-days"
        label="Simulation Duration"
        value={simulationDays()}
        onChange={setSimulationDays}
        min={30}
        max={1460}
        step={1}
        format={(v) => `${v} days`}
      />

      <button
        id="reset-defaults-btn"
        onClick={onReset}
        class="w-full mt-2 px-4 py-2.5 bg-surface-100 hover:bg-surface-200 text-surface-700 rounded-xl text-sm font-medium transition cursor-pointer"
      >
        ↻ Reset to Epuyén Defaults
      </button>
    </div>
  );
}
