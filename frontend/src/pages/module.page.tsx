interface Props {
  title: string;
  description: string;
}

export function ModulePage({
  title,
  description,
}: Props) {
  return (
    <div className="page-stack">
      <section className="page-header">
        <div>
          <span className="eyebrow">
            Module
          </span>

          <h1>
            {title}
          </h1>

          <p>
            {description}
          </p>
        </div>
      </section>

      <section className="panel">
        <h2>
          Module disponible
        </h2>

        <p className="muted">
          Les écrans métier de ce
          module seront maintenant
          reliés aux endpoints déjà
          disponibles dans le backend.
        </p>
      </section>
    </div>
  );
}
