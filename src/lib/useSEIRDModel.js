import { createSignal, createEffect } from 'solid-js';
import { solveSEIRD, DEFAULTS } from './seirdModel';

/**
 * SolidJS hook that wires UI parameters to the SEIRD solver.
 *
 * This file contains no epidemic equations.
 * It only manages reactive state for the frontend.
 */
export function useSEIRDModel() {
  const [totalPopulation, setTotalPopulation] = createSignal(DEFAULTS.totalPopulation);
  const [initialInfectious, setInitialInfectious] = createSignal(DEFAULTS.initialInfectious);
  const [basicReproductionNumber, setBasicReproductionNumber] = createSignal(DEFAULTS.basicReproductionNumber);
  const [infectiousPeriodDays, setInfectiousPeriodDays] = createSignal(DEFAULTS.infectiousPeriodDays);
  const [incubationPeriodDays, setIncubationPeriodDays] = createSignal(DEFAULTS.incubationPeriodDays);
  const [caseFatalityRatio, setCaseFatalityRatio] = createSignal(DEFAULTS.caseFatalityRatio);
  const [simulationDays, setSimulationDays] = createSignal(DEFAULTS.simulationDays);

  const removalRate = () => 1 / infectiousPeriodDays();
  const incubationRate = () => 1 / incubationPeriodDays();

  const [results, setResults] = createSignal([]);

  createEffect(() => {
    const data = solveSEIRD({
      totalPopulation: totalPopulation(),
      initialInfectious: initialInfectious(),
      basicReproductionNumber: basicReproductionNumber(),
      removalRate: removalRate(),
      incubationRate: incubationRate(),
      caseFatalityRatio: caseFatalityRatio(),
      simulationDays: simulationDays(),
    });

    setResults(data);
  });

  const reset = () => {
    setTotalPopulation(DEFAULTS.totalPopulation);
    setInitialInfectious(DEFAULTS.initialInfectious);
    setBasicReproductionNumber(DEFAULTS.basicReproductionNumber);
    setInfectiousPeriodDays(DEFAULTS.infectiousPeriodDays);
    setIncubationPeriodDays(DEFAULTS.incubationPeriodDays);
    setCaseFatalityRatio(DEFAULTS.caseFatalityRatio);
    setSimulationDays(DEFAULTS.simulationDays);
  };

  return {
    params: {
      totalPopulation,
      initialInfectious,
      basicReproductionNumber,
      infectiousPeriodDays,
      incubationPeriodDays,
      caseFatalityRatio,
      simulationDays,
      removalRate,
      incubationRate,
    },
    results,
    setters: {
      setTotalPopulation,
      setInitialInfectious,
      setBasicReproductionNumber,
      setInfectiousPeriodDays,
      setIncubationPeriodDays,
      setCaseFatalityRatio,
      setSimulationDays,
    },
    reset,
  };
}
