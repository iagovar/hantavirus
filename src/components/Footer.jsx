export default function Footer() {
  return (
    <footer class="border-t border-surface-200 bg-white mt-auto">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div class="flex flex-col sm:flex-row items-center justify-between gap-4 text-sm text-surface-400">
          <p>
            © 2026 Hantavirus Tracker — For informational purposes only.
          </p>
          <div class="flex items-center gap-4">
            <a
              href="https://www.nejm.org/doi/full/10.1056/NEJMoa2009040"
              target="_blank"
              rel="noopener noreferrer"
              class="hover:text-brand-600 transition"
            >
              NEJM Study
            </a>
            <span class="text-surface-200">·</span>
            <a
              href="https://github.com/iagovar/hantavirus/"
              target="_blank"
              rel="noopener noreferrer"
              class="hover:text-brand-600 transition"
            >
              GitHub
            </a>
            <span class="text-surface-200">·</span>
            <a
              href="https://iagovar.com"
              target="_blank"
              rel="noopener noreferrer"
              class="hover:text-brand-600 transition"
            >
              iagovar.com
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
}
