import { render, screen } from '@testing-library/react';
import { LoadingScreen } from '../components/LoadingScreen';

describe('LoadingScreen Progress Fix', () => {
  it('should cap progress at 100% when given values over 100', () => {
    render(<LoadingScreen progress={110} message="Test" />);
    
    // Vérifier que le pourcentage affiché ne dépasse pas 100%
    const percentageElement = screen.getByText('100%');
    expect(percentageElement).toBeInTheDocument();
  });

  it('should cap progress bar width at 100% when given values over 100', () => {
    render(<LoadingScreen progress={110} message="Test" />);
    
    // Vérifier que la barre de progression ne dépasse pas 100%
    const progressBar = document.querySelector('.loading-progress-fill');
    expect(progressBar).toHaveStyle('width: 100%');
  });

  it('should maintain minimum 10% progress', () => {
    render(<LoadingScreen progress={5} message="Test" />);
    
    // Vérifier que la progression minimale est maintenue
    const progressBar = document.querySelector('.loading-progress-fill');
    expect(progressBar).toHaveStyle('width: 10%');
  });

  it('should display normal progress values correctly', () => {
    render(<LoadingScreen progress={50} message="Test" />);
    
    const percentageElement = screen.getByText('50%');
    expect(percentageElement).toBeInTheDocument();
    
    const progressBar = document.querySelector('.loading-progress-fill');
    expect(progressBar).toHaveStyle('width: 50%');
  });
});