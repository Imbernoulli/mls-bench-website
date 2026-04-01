export default function Footer() {
  return (
    <footer className="mt-auto border-t border-[var(--color-border)] bg-[var(--color-bg-secondary)]">
      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        <div className="flex flex-col items-center justify-between gap-4 sm:flex-row">
          <p className="text-sm text-[var(--color-text-secondary)]">
            MLS-Bench: Machine Learning Science Benchmark
          </p>
          <div className="flex gap-4 text-sm text-[var(--color-text-secondary)]">
            <a
              href="https://github.com/Imbernoulli/MLS-Bench"
              target="_blank"
              rel="noopener noreferrer"
              className="hover:text-[var(--color-text)]"
            >
              GitHub
            </a>
            <a href="/about" className="hover:text-[var(--color-text)]">
              About
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
}
