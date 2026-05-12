import { useSEIRDModel } from '../lib/useSEIRDModel';
import SIRChart from './ModelSectionComponents/SIRChart';
import ModelControls from './ModelSectionComponents/ModelControls';
import ModelMetrics from './ModelSectionComponents/ModelMetrics';
import StudySummary from './ModelSectionComponents/StudySummary';

export default function ModelSection() {
  const model = useSEIRDModel();
  const { params, results, setters, reset } = model;

  return (
    <section id="model-section" class="space-y-8">
      <div>
        <h2 class="text-2xl font-bold text-surface-900">SEIRD Epidemiological Model</h2>
        <p class="text-sm text-surface-500 mt-1">
          Simulate human-to-human hantavirus outbreak dynamics with an exposed (incubation) compartment.
          Default values are based on the{' '}
          <a
            href="https://www.nejm.org/doi/full/10.1056/NEJMoa2009040"
            target="_blank"
            rel="noopener noreferrer"
            class="text-brand-600 hover:text-brand-700 underline underline-offset-2"
          >
            Epuyén outbreak study (NEJM)
          </a>.
        </p>
        <p class="text-xs text-surface-400 mt-1">
          <a
            href="https://github.com/iagovar/hantavirus/blob/main/src/lib/seirdModel.js"
            target="_blank"
            rel="noopener noreferrer"
            class="hover:text-brand-600 underline underline-offset-2 transition"
          >
            Audit the model source code
          </a>
        </p>
      </div>

      <ModelMetrics
        results={results}
        basicReproductionNumber={params.basicReproductionNumber}
        caseFatalityRatio={params.caseFatalityRatio}
        removalRate={params.removalRate}
        simulationDays={params.simulationDays}
      />

      <div class="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <SIRChart results={results} />
        <ModelControls
          totalPopulation={params.totalPopulation} setTotalPopulation={setters.setTotalPopulation}
          initialInfectious={params.initialInfectious} setInitialInfectious={setters.setInitialInfectious}
          basicReproductionNumber={params.basicReproductionNumber} setBasicReproductionNumber={setters.setBasicReproductionNumber}
          infectiousPeriodDays={params.infectiousPeriodDays} setInfectiousPeriodDays={setters.setInfectiousPeriodDays}
          incubationPeriodDays={params.incubationPeriodDays} setIncubationPeriodDays={setters.setIncubationPeriodDays}
          caseFatalityRatio={params.caseFatalityRatio} setCaseFatalityRatio={setters.setCaseFatalityRatio}
          simulationDays={params.simulationDays} setSimulationDays={setters.setSimulationDays}
          onReset={reset}
        />
      </div>

      <StudySummary />
    </section>
  );
}
