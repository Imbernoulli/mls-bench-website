export default function AboutPage() {
  return (
    <div className="mx-auto max-w-3xl px-4 py-10 sm:px-6 lg:px-8">
      <h1 className="text-3xl font-bold">About MLS-Bench</h1>

      <section className="mt-8 prose prose-sm dark:prose-invert max-w-none">
        <h2>What is MLS-Bench?</h2>
        <p>
          MLS-Bench (Machine Learning Science Benchmark) evaluates whether LLM
          agents can make generalizable, atomic ML science contributions — the
          kind of discoveries researchers make daily by modifying model
          architectures, loss functions, optimization strategies, and training
          procedures.
        </p>

        <h2>ML Science vs ML Engineering</h2>
        <p>
          We draw a sharp distinction between ML science and ML engineering:
        </p>
        <ul>
          <li>
            <strong>ML Engineering</strong> is holistic: combine many techniques
            (feature engineering, ensembling, hyperparameter tuning, data
            augmentation, ...) to maximize a metric on one specific dataset or
            competition. This is what MLE-Bench evaluates.
          </li>
          <li>
            <strong>ML Science</strong> is atomic and generalizable: discover a
            single modular improvement — like replacing LayerNorm with RMSNorm,
            inventing a new activation function, designing a better learning
            rate schedule — that transfers across models, datasets, and tasks.
          </li>
        </ul>

        <h2>Benchmark Design</h2>
        <p>
          Each task isolates a well-defined research question where the agent
          must propose and implement a novel algorithmic component, then
          demonstrate its effectiveness under controlled evaluation. Tasks span
          multiple domains including reinforcement learning, computer vision,
          language models, AI for science, and more.
        </p>

        <h2>Evaluation</h2>
        <p>
          Agents are evaluated on whether their proposed modifications improve
          upon established baselines. Each task provides:
        </p>
        <ul>
          <li>A clear task description with the research question</li>
          <li>Annotated source code with editable regions</li>
          <li>Multiple baseline implementations for comparison</li>
          <li>Automated evaluation across multiple random seeds</li>
        </ul>

        <h2>Citation</h2>
        <p>If you use MLS-Bench in your research, please cite:</p>
        <pre className="bg-muted rounded-lg p-4 text-xs overflow-x-auto">
{`@article{mlsbench2026,
  title={MLS-Bench: A Benchmark for Machine Learning Science},
  author={...},
  year={2026}
}`}
        </pre>
      </section>
    </div>
  );
}
