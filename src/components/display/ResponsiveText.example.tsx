import React from 'react';
import { ResponsiveText } from './ResponsiveText';

/**
 * Example usage of the ResponsiveText component
 * This file demonstrates how to use the component with different variants and screen sizes
 */

export const ResponsiveTextExamples: React.FC = () => {
  const sampleTitle = "IREC Seminar - Prof. Élise Belaidi Institut NeuroMyoGène (INMG) CNRS 5261 – INSERM U1315 - UCBL1 Faculté de Médecine et de Pharmacie";
  const sampleDescription = "Join us for an exciting seminar on neuromuscular research. This presentation will cover the latest advances in gene therapy and molecular mechanisms underlying neuromuscular diseases. The event will take place in the main auditorium and will be followed by a Q&A session.";
  const sampleMetadata = "26 septembre 2025 • 14h00-16h00 • Auditoire MEDI 91";

  return (
    <div style={{ padding: '20px', maxWidth: '800px' }}>
      <h2>ResponsiveText Component Examples</h2>
      
      <section style={{ marginBottom: '40px' }}>
        <h3>Title Variant</h3>
        <div style={{ border: '1px solid #ddd', padding: '16px', marginBottom: '16px' }}>
          <h4>Desktop (default)</h4>
          <ResponsiveText 
            text={sampleTitle} 
            variant="title" 
          />
        </div>
        
        <div style={{ border: '1px solid #ddd', padding: '16px', marginBottom: '16px' }}>
          <h4>Mobile Override</h4>
          <ResponsiveText 
            text={sampleTitle} 
            variant="title" 
            screenSize="mobile"
          />
        </div>
        
        <div style={{ border: '1px solid #ddd', padding: '16px', marginBottom: '16px' }}>
          <h4>TV Override</h4>
          <ResponsiveText 
            text={sampleTitle} 
            variant="title" 
            screenSize="tv"
          />
        </div>
      </section>

      <section style={{ marginBottom: '40px' }}>
        <h3>Description Variant</h3>
        <div style={{ border: '1px solid #ddd', padding: '16px', marginBottom: '16px' }}>
          <h4>Full Description</h4>
          <ResponsiveText 
            text={sampleDescription} 
            variant="description" 
          />
        </div>
        
        <div style={{ border: '1px solid #ddd', padding: '16px', marginBottom: '16px' }}>
          <h4>With Line Clamping (2 lines)</h4>
          <ResponsiveText 
            text={sampleDescription} 
            variant="description" 
            maxLines={2}
          />
        </div>
      </section>

      <section style={{ marginBottom: '40px' }}>
        <h3>Metadata Variant</h3>
        <div style={{ border: '1px solid #ddd', padding: '16px', marginBottom: '16px' }}>
          <ResponsiveText 
            text={sampleMetadata} 
            variant="metadata" 
          />
        </div>
      </section>

      <section style={{ marginBottom: '40px' }}>
        <h3>Screen Size Comparison</h3>
        {(['mobile', 'tablet', 'desktop', 'tv'] as const).map(screenSize => (
          <div key={screenSize} style={{ border: '1px solid #ddd', padding: '16px', marginBottom: '16px' }}>
            <h4>{screenSize.charAt(0).toUpperCase() + screenSize.slice(1)}</h4>
            <ResponsiveText 
              text="Sample event title for comparison" 
              variant="title" 
              screenSize={screenSize}
            />
            <br />
            <ResponsiveText 
              text="Sample description text to show how it scales across different screen sizes." 
              variant="description" 
              screenSize={screenSize}
            />
            <br />
            <ResponsiveText 
              text="METADATA INFO" 
              variant="metadata" 
              screenSize={screenSize}
            />
          </div>
        ))}
      </section>
    </div>
  );
};

export default ResponsiveTextExamples;