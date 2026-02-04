import React from 'react';
import { Pin, ExternalLink } from 'lucide-react';
import '../styles/other-agendas.css';

export interface OtherAgendaItem {
  title: string;
  description: string;
  url: string;
  label?: string;
}

const OTHER_AGENDAS: OtherAgendaItem[] = [
  {
    title: 'PINDARE – Agenda CRef',
    description: 'Agenda des événements interuniversitaires (Éthique, Open Science, Formation, Intégrité scientifique…).',
    url: 'https://pindare.cref.be/fr/agenda/',
    label: 'Voir l’agenda',
  },
];

export const OtherAgendasSection: React.FC = () => {
  if (OTHER_AGENDAS.length === 0) return null;

  return (
    <section className="other-agendas-section" aria-labelledby="other-agendas-heading">
      <h2 id="other-agendas-heading" className="other-agendas-heading">
        <Pin size={24} aria-hidden />
        Autres agendas
      </h2>
      <p className="other-agendas-intro">
        Découvrez d’autres calendriers d’événements utiles.
      </p>
      <div className="other-agendas-grid">
        {OTHER_AGENDAS.map((item) => (
          <a
            key={item.url}
            href={item.url}
            target="_blank"
            rel="noopener noreferrer"
            className="other-agenda-card"
          >
            <div className="other-agenda-card-content">
              <h3 className="other-agenda-card-title">{item.title}</h3>
              <p className="other-agenda-card-desc">{item.description}</p>
              <span className="other-agenda-card-link">
                {item.label ?? 'Voir l’agenda'}
                <ExternalLink size={14} className="other-agenda-card-arrow" aria-hidden />
              </span>
            </div>
          </a>
        ))}
      </div>
    </section>
  );
};
