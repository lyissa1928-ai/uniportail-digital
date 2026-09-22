interface SectionPageProps {
  title: string;

  description: string;
}

export default function SectionPage({
  title,
  description,
}: SectionPageProps) {
  return (
    <div>
      <div
        className="page-header"
      >
        <div>
          <h1>
            {title}
          </h1>

          <p>
            {description}
          </p>
        </div>
      </div>

      <div
        className="empty-panel"
      >
        Module prêt pour
        l'intégration avec l'API.
      </div>
    </div>
  );
}