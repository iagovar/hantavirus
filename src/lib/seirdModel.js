/**
 * SEIRD epidemiological model (deterministic, well-mixed population).
 *
 * This single file contains every equation that defines the model behavior.
 * Auditors only need to read this file to verify correctness.
 *
 * Compartments:
 * - susceptible  (S): people who can catch the disease.
 * - exposed      (E): infected but not yet infectious (incubation period).
 * - infectious   (I): capable of transmitting the disease.
 * - recovered    (R): immune (survived infection).
 * - deaths       (D): died from the disease.
 *
 * Model assumptions:
 * - The population is closed: no births, no deaths from other causes,
 *   no migration.  totalPopulation = S + E + I + R + D at all times.
 * - Everyone mixes uniformly (every susceptible individual has the same
 *   chance of contacting every infectious individual).
 * - Parameters are constant throughout the simulation (no interventions,
 *   no seasonality).
 *
 * Differential equations (what happens at every infinitesimal moment):
 *
 *   d(susceptible)/dt  = -transmissionRate * susceptible * infectious / totalPopulation
 *   d(exposed)/dt      =  transmissionRate * susceptible * infectious / totalPopulation
 *                         - incubationRate * exposed
 *   d(infectious)/dt   =  incubationRate * exposed - removalRate * infectious
 *   d(recovered)/dt    =  removalRate * (1 - caseFatalityRatio) * infectious
 *   d(deaths)/dt       =  removalRate * caseFatalityRatio * infectious
 *
 * Why these equations:
 * - People become exposed at a rate proportional to contacts between
 *   susceptible and infectious: transmissionRate * susceptible * infectious.
 *   Dividing by totalPopulation makes this a "frequency-dependent"
 *   transmission model (rate per capita, not per raw count).
 * - Exposed people progress to infectious at rate incubationRate = 1/incubationPeriodDays.
 *   This models the incubation period as an exponential distribution with
 *   that mean duration.
 * - Infectious people are removed at rate removalRate = 1/infectiousPeriodDays
 *   (either recover or die).  A fixed fraction caseFatalityRatio of removed
 *   cases die; the rest recover.
 *
 * Parameter definitions:
 * - totalPopulation       = N  (number of individuals)
 * - initialInfectious     = I₀ (infectious count at time zero)
 * - basicReproductionNumber = R₀ (average new infections caused by one
 *                            infectious person in a fully susceptible population)
 * - removalRate           = 1 / infectiousPeriodDays
 * - incubationRate        = 1 / incubationPeriodDays
 * - caseFatalityRatio     = fraction of cases that die (0 to 1)
 * - simulationDays        = how many days to simulate
 * - timeStep              = integration step (default 0.1 days)
 *
 * Derived quantities:
 * - transmissionRate = basicReproductionNumber * removalRate
 *   (β = R₀ × γ).  This follows from the definition of R₀: in a fully
 *   susceptible population, one infectious case produces R₀ new cases
 *   during its infectious period.  The transmission rate β captures the
 *   per-contact infection probability times the contact rate.
 *
 * Integration method:
 *   We use the classic 4th-order Runge-Kutta method (RK4).  It is more
 *   accurate than the simpler Euler method and remains straightforward to
 *   read and audit without external libraries.
 *
 * Output format:
 *   solveSEIRD returns an array of objects, one per simulated day:
 *   { day, susceptible, exposed, infectious, recovered, deaths }
 *   All compartment values are integers (rounded with population-level
 *   correction so that their sum always equals totalPopulation).
 */

/**
 * Default parameters sourced from the Epuyén (Argentina) Andes virus
 * outbreak, 2018–2019 (Martinez et al., NEJM 2020).
 *   - R₀ = 2.12 (without interventions)
 *   - Incubation period median ≈ 20–21 days
 *   - Infectious period ≈ 14 days
 *   - CFR ≈ 32%
 */
export const DEFAULTS = {
  totalPopulation: 8000000000,
  initialInfectious: 1,
  basicReproductionNumber: 2.12,
  infectiousPeriodDays: 14,
  incubationPeriodDays: 21,
  caseFatalityRatio: 0.32,
  simulationDays: 730,
};

// ---------------------------------------------------------------------------
// Internal helpers — not exported (implementation details)
// ---------------------------------------------------------------------------

/**
 * Converts a value to a finite number.
 *
 * Why: JavaScript allows NaN and Infinity to propagate silently through
 * arithmetic, producing garbage output.  This function turns those problems
 * into clear error messages early, so the user or auditor knows exactly
 * which parameter is wrong instead of staring at a broken graph.
 */
function toFiniteNumber(name, value) {
  const numericValue = Number(value);
  if (!Number.isFinite(numericValue)) {
    throw new Error(`Parameter "${name}" must be a finite number.`);
  }
  return numericValue;
}

/**
 * Takes the floating-point compartment values at a given day and produces
 * an integer snapshot with { day, susceptible, exposed, infectious, recovered,
 * deaths }.  Guarantees that the sum of all five compartments equals
 * totalPopulation exactly.
 *
 * Why this function exists:
 * - The ODE integrator works with floating-point numbers for accuracy.
 * - The UI displays integers (charts, metric cards) — decimals are noise.
 * - Simply rounding each compartment independently (Math.round on each)
 *   can make the sum off by ±1 or ±2 due to rounding direction of individual
 *   compartments.  For example: if five compartments sum to 1000000.0 but
 *   each one rounds down by 0.5, the total becomes 999997.
 * - That tiny discrepancy is a red herring for an auditor ("why doesn't
 *   the total match?") and adds no scientific value.  We correct it here
 *   so that every output row is internally consistent.
 *
 * The correction strategy (step by step):
 *   1. Round each compartment individually.
 *   2. Compute the difference between totalPopulation and the rounded sum.
 *   3. Absorb that difference into the susceptible compartment (adding or
 *      subtracting as needed).  We use susceptible because it is typically
 *      the largest compartment, making the relative adjustment negligible.
 *   4. In the extreme and unlikely case that this pushes susceptible below 0,
 *      we borrow the remaining deficit from the other compartments in a
 *      fixed priority order (exposed, infectious, recovered, deaths).
 */
function buildRoundedSnapshot(day, susceptible, exposed, infectious, recovered, deaths, totalPopulation) {
  // Step 1: round each compartment to the nearest integer.
  const snapshot = {
    day,
    susceptible: Math.round(susceptible),
    exposed: Math.round(exposed),
    infectious: Math.round(infectious),
    recovered: Math.round(recovered),
    deaths: Math.round(deaths),
  };

  // Step 2: measure how far the rounded sum deviates from totalPopulation.
  const roundedSum =
    snapshot.susceptible + snapshot.exposed + snapshot.infectious + snapshot.recovered + snapshot.deaths;
  const correction = totalPopulation - roundedSum;

  // Step 3: absorb the correction into susceptible (the largest compartment).
  if (correction !== 0) {
    snapshot.susceptible += correction;
  }

  // Step 4: safety valve.  If the correction pushed susceptible negative,
  //         redistribute the deficit from the other compartments.
  if (snapshot.susceptible < 0) {
    // How much we still owe after draining susceptible to zero.
    let deficit = -snapshot.susceptible;
    snapshot.susceptible = 0;

    // Borrow from other compartments in a fixed order.
    // The order does not matter mathematically (all compartments are equally
    // valid to borrow from), but a deterministic order is important for
    // reproducible output.
    const compartments = ["exposed", "infectious", "recovered", "deaths"];
    for (let i = 0; i < compartments.length; i += 1) {
      if (deficit <= 0) break; // deficit fully resolved
      const key = compartments[i];
      const borrow = Math.min(snapshot[key], deficit); // cannot borrow more than available
      snapshot[key] -= borrow;
      deficit -= borrow;
    }
  }

  return snapshot;
}

// ---------------------------------------------------------------------------
// Public API
// ---------------------------------------------------------------------------

/**
 * Solves the SEIRD model using 4th-order Runge-Kutta integration.
 *
 * Parameters:
 * - totalPopulation         — number of individuals (must be ≥ 1)
 * - initialInfectious       — infectious count at time zero
 * - basicReproductionNumber — R₀ (≥ 0)
 * - removalRate             — 1 / infectiousPeriodDays (> 0)
 * - incubationRate          — 1 / incubationPeriodDays (> 0)
 * - caseFatalityRatio       — fraction of cases that die (0 to 1)
 * - simulationDays          — how many days to simulate (≥ 0)
 * - timeStep                — integration step in days (default 0.1)
 *
 * Returns an array of daily snapshots (day 0 through simulationDays).
 * Each snapshot is an object with integer compartments:
 *   { day, susceptible, exposed, infectious, recovered, deaths }
 */
export function solveSEIRD(params) {
  // --- Read and validate every parameter --------------------------------
  // We validate parameters at the top so that invalid inputs fail loudly
  // before any computation, making errors easy to diagnose.

  // Population must be an integer; we round it explicitly.
  const totalPopulation = Math.round(
    toFiniteNumber("totalPopulation", params.totalPopulation)
  );
  const initialInfectious = toFiniteNumber("initialInfectious", params.initialInfectious);
  const basicReproductionNumber = toFiniteNumber(
    "basicReproductionNumber",
    params.basicReproductionNumber
  );
  const removalRate = toFiniteNumber("removalRate", params.removalRate);
  const incubationRate = toFiniteNumber("incubationRate", params.incubationRate);
  const caseFatalityRatio = toFiniteNumber("caseFatalityRatio", params.caseFatalityRatio);
  const simulationDays = toFiniteNumber("simulationDays", params.simulationDays);
  const timeStep = toFiniteNumber("timeStep", params.timeStep ?? 0.1);

  // Domain checks: each parameter has a physically meaningful range.
  if (totalPopulation <= 0) {
    throw new Error("Parameter \"totalPopulation\" must be greater than 0.");
  }
  if (initialInfectious < 0 || initialInfectious > totalPopulation) {
    throw new Error("Parameter \"initialInfectious\" must be between 0 and totalPopulation.");
  }
  if (basicReproductionNumber < 0) {
    throw new Error("Parameter \"basicReproductionNumber\" must be >= 0.");
  }
  if (removalRate <= 0) {
    throw new Error("Parameter \"removalRate\" must be > 0.");
  }
  if (incubationRate <= 0) {
    throw new Error("Parameter \"incubationRate\" must be > 0.");
  }
  if (caseFatalityRatio < 0 || caseFatalityRatio > 1) {
    throw new Error("Parameter \"caseFatalityRatio\" must be between 0 and 1.");
  }
  if (simulationDays < 0) {
    throw new Error("Parameter \"simulationDays\" must be >= 0.");
  }
  if (timeStep <= 0) {
    throw new Error("Parameter \"timeStep\" must be > 0.");
  }

  // --- Derived parameter -------------------------------------------------
  // transmissionRate = R₀ × removalRate  (β = R₀ × γ).
  // Why: R₀ is the average number of secondary cases from one infectious
  // individual in a fully susceptible population.  During its infectious
  // period (1/removalRate days), the individual generates R₀ new cases.
  // Therefore the per-capita infection rate β must satisfy β/removalRate = R₀,
  // which gives β = R₀ × removalRate.
  const transmissionRate = basicReproductionNumber * removalRate;

  // --- Initial conditions -------------------------------------------------
  // At time zero: the total population is split into the initial compartment
  // values.  Everyone is susceptible except the initially infectious people.
  // The exposed, recovered, and deaths compartments start at zero.
  let susceptible = totalPopulation - initialInfectious;
  let exposed = 0;
  let infectious = initialInfectious;
  let recovered = 0;
  let deaths = 0;

  // Record day 0 as a snapshot so the output covers the full time range.
  const results = [
    buildRoundedSnapshot(0, susceptible, exposed, infectious, recovered, deaths, totalPopulation),
  ];

  // --- ODE right-hand side ------------------------------------------------
  // This function computes the instantaneous rate of change (derivative) for
  // each compartment, given the current state (s, e, i).  The recovered and
  // deaths rates depend only on i, so they are not needed as arguments.
  //
  // The five derivatives mirror the differential equations documented at the
  // top of this file.
  //
  // infectionFlow = transmissionRate * susceptible * infectious / totalPopulation
  //   is the instantaneous rate at which susceptible people become exposed.
  //   It is proportional to both the number of susceptible and infectious
  //   people (mass action), normalized by totalPopulation (frequency-dependent
  //   transmission).
  const derivatives = (s, e, i) => {
    const infectionFlow = (transmissionRate * s * i) / totalPopulation;

    const dSusceptible = -infectionFlow;                  // people leave S and enter E
    const dExposed = infectionFlow - incubationRate * e;  // enter from S, leave to I
    const dInfectious = incubationRate * e - removalRate * i; // enter from E, leave to R/D
    const dRecovered = removalRate * (1 - caseFatalityRatio) * i;  // recoveries
    const dDeaths = removalRate * caseFatalityRatio * i;            // deaths

    return [dSusceptible, dExposed, dInfectious, dRecovered, dDeaths];
  };

  // --- Integration loop (RK4) ---------------------------------------------
  // We break the total simulation time into small steps of size `timeStep`
  // (default 0.1 days).  At each step we compute four slope estimates
  // (k1 through k4) and take a weighted average — this is the classic
  // 4th-order Runge-Kutta method.  It is O(timeStep⁵) accurate per step,
  // meaning the error shrinks very quickly as timeStep gets smaller.
  //
  // After each RK4 update we clamp negative values to zero.  Floating-point
  // arithmetic can produce tiny negative numbers (e.g., -1e-14) due to
  // rounding error; clamping prevents these from causing nonsense later in
  // the simulation.
  //
  // We record output only at whole-number days (t ∈ ℕ) because daily
  // resolution is sufficient for visualization and auditing.  The partial
  // steps exist only for integration accuracy.  We always record the final
  // step even if it does not fall on a whole day, so the output covers the
  // requested duration exactly.

  const totalSteps = Math.ceil(simulationDays / timeStep);

  for (let step = 1; step <= totalSteps; step += 1) {
    // RK4: compute four slope estimates.
    const [k1S, k1E, k1I, k1R, k1D] = derivatives(susceptible, exposed, infectious);

    const [k2S, k2E, k2I, k2R, k2D] = derivatives(
      susceptible + 0.5 * timeStep * k1S,
      exposed + 0.5 * timeStep * k1E,
      infectious + 0.5 * timeStep * k1I
    );

    const [k3S, k3E, k3I, k3R, k3D] = derivatives(
      susceptible + 0.5 * timeStep * k2S,
      exposed + 0.5 * timeStep * k2E,
      infectious + 0.5 * timeStep * k2I
    );

    const [k4S, k4E, k4I, k4R, k4D] = derivatives(
      susceptible + timeStep * k3S,
      exposed + timeStep * k3E,
      infectious + timeStep * k3I
    );

    // Weighted RK4 update formula.
    susceptible += (timeStep / 6) * (k1S + 2 * k2S + 2 * k3S + k4S);
    exposed += (timeStep / 6) * (k1E + 2 * k2E + 2 * k3E + k4E);
    infectious += (timeStep / 6) * (k1I + 2 * k2I + 2 * k3I + k4I);
    recovered += (timeStep / 6) * (k1R + 2 * k2R + 2 * k3R + k4R);
    deaths += (timeStep / 6) * (k1D + 2 * k2D + 2 * k3D + k4D);

    // Clamp negative values: floating-point error can produce tiny negative
    // numbers.  Setting them to zero is safe because the analytic solution
    // never allows negative counts.
    susceptible = Math.max(0, susceptible);
    exposed = Math.max(0, exposed);
    infectious = Math.max(0, infectious);
    recovered = Math.max(0, recovered);
    deaths = Math.max(0, deaths);

    // Decide whether to record this step in the output.
    const day = +(step * timeStep).toFixed(2);
    const isWholeDay = Number.isInteger(day);    // e.g., day 1, 2, 3, ...
    const isFinalStep = step === totalSteps;     // always record the last step

    if (isWholeDay || isFinalStep) {
      results.push(
        buildRoundedSnapshot(day, susceptible, exposed, infectious, recovered, deaths, totalPopulation)
      );
    }
  }

  return results;
}

// ---------------------------------------------------------------------------
// Analysis helpers
//
// These functions operate on the output array produced by solveSEIRD.
// They answer common epidemiological questions about the simulation.
// ---------------------------------------------------------------------------

/**
 * Finds the day when infectious count was highest and how many were
 * infectious at that moment.
 *
 * Why: the peak infectious count and its timing are key metrics for
 * healthcare planning (how many hospital beds are needed, and when).
 */
export function peakInfected(results) {
  // Defensive guard: the caller might pass undefined, null, or an empty
  // array.  In those cases there is nothing to compute.
  if (!Array.isArray(results) || results.length === 0) {
    return { day: 0, count: 0 };
  }

  // Start with the first point as our best guess, then scan forward.
  let peakDay = results[0].day;
  let peakCount = results[0].infectious;

  for (let i = 1; i < results.length; i += 1) {
    const point = results[i];
    // Use strict greater-than (not >=) so that in case of a tie we report
    // the earliest day.  This is a deliberate choice: the first time we hit
    // the peak is more actionable for planning than a plateau later on.
    if (point.infectious > peakCount) {
      peakCount = point.infectious;
      peakDay = point.day;
    }
  }

  return { day: peakDay, count: peakCount };
}

/**
 * Returns the total number of deaths at the final simulated day.
 */
export function deathsByDay(results) {
  if (!Array.isArray(results) || results.length === 0) {
    return 0;
  }

  // The deaths compartment is cumulative, so we just read the last entry.
  return results[results.length - 1].deaths;
}

/**
 * Computes the effective reproduction number (Rt) at the end of the
 * simulation.
 *
 * Formula:
 *   Rt = basicReproductionNumber × (susceptible / totalPopulation)
 *
 * Why: R₀ describes transmission in a fully susceptible population.
 * As the epidemic progresses and more people become immune, the effective
 * reproduction number drops.  Rt > 1 means the outbreak is still expanding;
 * Rt < 1 means it is dying out.
 *
 * We recompute total from the compartment values at the last day rather than
 * using the originally supplied totalPopulation parameter.  This is a
 * defensive choice: it makes the helper self-contained and immune to any
 * future change in output format or rounding.
 */
export function effectiveRt(results, basicReproductionNumber) {
  if (!Array.isArray(results) || results.length === 0) {
    return 0;
  }

  const last = results[results.length - 1];

  // Reconstruct total population from compartments.
  // We guard `last.exposed` with `|| 0` for backward compatibility with
  // older output formats that may have omitted the exposed field.
  const total =
    last.susceptible + (last.exposed || 0) + last.infectious + last.recovered + last.deaths;

  if (total <= 0) {
    return 0;
  }

  return basicReproductionNumber * (last.susceptible / total);
}

/**
 * Detects whether the simulation was stopped before the outbreak finished.
 *
 * Why this matters: if a user sets simulationDays too short, the chart will
 * show infections still rising at the right edge.  This function flags that
 * situation so the UI can display a warning.
 *
 * How it works (step by step):
 *   We look at the last three recorded sample points.
 *   If infectious count increased from point[-3] to point[-2] AND from
 *   point[-2] to point[-1], we report truncation.
 *
 * Why three points and not just two: a single day-to-day increase can be
 * noise from rounding or a temporary fluctuation.  Requiring two consecutive
 * increases reduces false positives while still catching real truncated runs.
 * The threshold of 3 is a pragmatic choice backed by the observation that
 * genuine outbreaks produce sustained growth over multiple days.
 */
export function isSimulationTruncated(results) {
  // Need at least 3 points to compare two consecutive transitions.
  if (!Array.isArray(results) || results.length < 3) {
    return false;
  }

  const last = results[results.length - 1];
  const previous = results[results.length - 2];
  const beforePrevious = results[results.length - 3];

  // Check whether infectious counts grew over the last two intervals.
  const grewInLastInterval = last.infectious > previous.infectious;
  const grewInPreviousInterval = previous.infectious > beforePrevious.infectious;

  // Both must be true for a confident truncation signal.
  return grewInLastInterval && grewInPreviousInterval;
}
