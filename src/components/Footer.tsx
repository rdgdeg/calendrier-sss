import React from 'react';
import { VisitStats } from './VisitStats';

export const Footer: React.FC = () => {
  return (
    <footer className="calendar-footer">
      <div className="footer-content">
        <div className="footer-section">
          <h4>Secteur des Sciences de la Santé</h4>
          <p>UCLouvain - Secteur des Sciences de la Santé</p>
          <p>Rue Martin V 40, Batiment Les Arches</p>
          <p>1200 Woluwe-Saint-Lambert</p>
        </div>
        

        
        <div className="footer-section">
          <h4>Support technique</h4>
          <p>En cas de souci technique, s'adresser à :</p>
          <p>
            <a href="mailto:raphael.degand@uclouvain.be" className="footer-link">
              raphael.degand@uclouvain.be
            </a>
          </p>
        </div>
        
        <div className="footer-section">
          <h4>Liens utiles</h4>
          <p>
            <a 
              href="https://www.uclouvain.be/fr/secteurs/sss" 
              target="_blank" 
              rel="noopener noreferrer"
              className="footer-link"
            >
              Site du secteur SSS
            </a>
          </p>
          <p>
            <a 
              href="https://www.uclouvain.be" 
              target="_blank" 
              rel="noopener noreferrer"
              className="footer-link"
            >
              UCLouvain
            </a>
          </p>
        </div>
      </div>
      
      <div className="footer-bottom">
        <p>&copy; {new Date().getFullYear()} UCLouvain - Secteur des Sciences de la Santé</p>
        <div className="footer-version">
          <p>Version 2.1.0 • Dernière mise à jour : {new Date().toLocaleDateString('fr-FR', { 
            year: 'numeric', 
            month: 'long', 
            day: 'numeric' 
          })}</p>
        </div>
        <VisitStats className="footer-stats" />
      </div>
    </footer>
  );
};