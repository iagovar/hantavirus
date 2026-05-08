import { createSignal } from 'solid-js';

export default function CaseClassification() {
  const [open, setOpen] = createSignal(false);

  return (
    <div class="mt-4 bg-white border border-surface-200 rounded-2xl shadow-sm overflow-hidden">
      <button
        onClick={() => setOpen(!open())}
        class="w-full flex items-center justify-between px-5 py-3 text-sm font-semibold text-surface-700 hover:bg-surface-50 transition cursor-pointer"
      >
        <span>Case classification criteria</span>
        <svg
          class={`w-4 h-4 transition-transform ${open() ? 'rotate-180' : ''}`}
          fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2"
        >
          <path stroke-linecap="round" stroke-linejoin="round" d="M6 9l6 6 6-6" />
        </svg>
      </button>
      {open() && (
        <div class="px-5 pb-4 text-sm text-surface-600 space-y-3 border-t border-surface-100 pt-4">
          <div>
            <p class="font-semibold text-surface-800">What counts as a confirmed case?</p>
            <p class="mt-1">
              A <strong>confirmed case</strong> requires laboratory evidence — positive PCR or serology for Andes virus (ANDV).
            </p>
          </div>
          <div>
            <p class="font-semibold text-surface-800">Why do suspected cases appear in these reports?</p>
            <p class="mt-1">
              During an active outbreak, suspected cases are included in alerts because they meet two fundamental criteria:
            </p>
            <ul class="mt-1 ml-4 list-disc space-y-0.5">
              <li>
                <strong>Epidemiological link:</strong> The individuals were in the same closed environment and during the same period as confirmed cases.
              </li>
              <li>
                <strong>Clinical picture:</strong> They developed symptoms compatible with Hantavirus Pulmonary Syndrome (HPS), such as severe respiratory distress and fever, which in some instances led to death.
              </li>
            </ul>
          </div>
          <p class="text-xs text-surface-400">
            Source: Martinez, V.P. et al. — NEJM (2020). These criteria follow standard outbreak investigation practice.
          </p>
        </div>
      )}
    </div>
  );
}