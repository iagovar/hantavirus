const ROWS = [
  {
    feature: 'Causative virus',
    data: 'Andes virus (ANDV)',
    context: 'Specific strain: Epuyén/18–19. Belongs to the hantavirus family.',
  },
  {
    feature: 'Transmission routes',
    data: 'Rodent → Human, Human → Human',
    context: 'It is the only known hantavirus worldwide with confirmed person-to-person transmission capabilities.',
  },
  {
    feature: 'R₀ (Without interventions)',
    data: '2.12',
    context: 'Exceptionally high rate that allowed rapid spread through "super-spreading events" (parties, wakes).',
  },
  {
    feature: 'R₀ (With interventions)',
    data: '0.96',
    context: 'Achieved through strict isolation of confirmed cases and up to a month of quarantine for close contacts.',
  },
  {
    feature: 'Incubation period',
    data: 'Median: 20–21 days (range: 8–31)',
    context: 'The long asymptomatic period made early control of the outbreak difficult and required unusually long quarantines.',
  },
  {
    feature: 'Case fatality rate',
    data: '~32%',
    context: 'In this outbreak, there were 11 deaths out of a total of 34 confirmed cases.',
  },
  {
    feature: 'Main syndrome',
    data: 'Hantavirus Pulmonary Syndrome (HPS)',
    context: 'Starts with non-specific symptoms (fever) and can lead to severe respiratory distress.',
  },
  {
    feature: 'Factors of transmissibility',
    data: 'High viral load, Liver injury',
    context: 'Patients who transmitted the virus had significantly higher viral titers and markers of liver damage, regardless of the overall severity of their illness.',
  },
];

export default function StudySummary() {
  return (
    <div class="bg-white border border-surface-200 rounded-2xl shadow-sm overflow-hidden" id="study-summary">
      <div class="px-6 py-5 border-b border-surface-100 bg-gradient-to-r from-brand-50/60 to-transparent">
        <div class="flex items-start gap-3">
          <div class="w-10 h-10 rounded-xl bg-brand-100 flex items-center justify-center flex-shrink-0 mt-0.5">
            <svg class="w-5 h-5 text-brand-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
              <path stroke-linecap="round" stroke-linejoin="round" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
            </svg>
          </div>
          <div>
            <h3 class="text-lg font-bold text-surface-900">
              Reference Study: Epuyén Outbreak 2018–2019
            </h3>
            <p class="text-sm text-surface-500 mt-1">
              Martinez, V.P. et al. —{' '}
              <a
                href="https://www.nejm.org/doi/full/10.1056/NEJMoa2009040"
                target="_blank"
                rel="noopener noreferrer"
                class="text-brand-600 hover:text-brand-700 underline underline-offset-2 font-medium"
              >
                "Person-to-Person Transfer of Andes Virus" — NEJM (2020)
              </a>
            </p>
          </div>
        </div>
      </div>

      <div class="overflow-x-auto">
        <table class="w-full text-sm">
          <thead>
            <tr class="bg-surface-50/80">
              <th class="text-left px-6 py-3 font-semibold text-surface-600 uppercase tracking-wide text-xs w-[200px]">Feature</th>
              <th class="text-left px-6 py-3 font-semibold text-surface-600 uppercase tracking-wide text-xs w-[220px]">Key Data</th>
              <th class="text-left px-6 py-3 font-semibold text-surface-600 uppercase tracking-wide text-xs">Context / Notes</th>
            </tr>
          </thead>
          <tbody>
            {ROWS.map((row, i) => (
              <tr class={`border-t border-surface-100 ${i % 2 === 0 ? '' : 'bg-surface-50/40'} hover:bg-brand-50/30 transition-colors`}>
                <td class="px-6 py-4 font-semibold text-surface-800 align-top">{row.feature}</td>
                <td class="px-6 py-4 text-surface-700 font-medium align-top">{row.data}</td>
                <td class="px-6 py-4 text-surface-500 align-top leading-relaxed">{row.context}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div class="px-6 py-4 bg-accent-50/50 border-t border-accent-100">
        <div class="flex gap-2 items-start">
          <svg class="w-4 h-4 text-accent-500 mt-0.5 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
            <path stroke-linecap="round" stroke-linejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
          </svg>
          <p class="text-xs text-accent-700 leading-relaxed">
            <strong>Important note:</strong> This data (especially the R₀ and the case fatality rate) corresponds
            specifically to the dynamics observed during the Epuyén outbreak between 2018 and 2019. Other hantavirus
            outbreaks may present variations depending on the strain, early intervention, and environmental conditions.
          </p>
        </div>
      </div>
    </div>
  );
}
