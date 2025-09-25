import React from 'react';
import { ExpandableText } from './ExpandableText';

export const ExpandableTextExample: React.FC = () => {
  const examples = [
    {
      title: 'Short Text (No Expansion)',
      text: 'This is a short text that does not need expansion.',
      variant: 'description' as const,
      maxLines: 3
    },
    {
      title: 'Long Text with Expansion',
      text: 'This is a much longer text that will definitely exceed the maximum number of lines and should trigger the expandable functionality. It contains multiple sentences and should demonstrate how the component handles overflow gracefully. The text continues with more content to ensure we have enough material to test the expansion feature properly.',
      variant: 'description' as const,
      maxLines: 3
    },
    {
      title: 'Text with Long Words',
      text: 'This text contains supercalifragilisticexpialidocious words that are extraordinarily long and should be broken appropriately. It also has https://www.verylongdomainname.com/very/long/path/to/resource URLs and verylongusername@verylongdomainname.organization.com email addresses.',
      variant: 'description' as const,
      maxLines: 2,
      maxLength: 150
    },
    {
      title: 'HTML Content',
      text: '<p>This text contains <strong>HTML tags</strong> that should be <em>cleaned</em> and displayed properly. It also has <a href="https://example.com">links</a> and other <span style="color: red;">formatted content</span>.</p>',
      variant: 'description' as const,
      maxLines: 2
    },
    {
      title: 'Title Variant',
      text: 'IREC Seminar - Prof. Élise Belaidi Institut NeuroMyoGène (INMG) CNRS 5261 – INSERM U1315 - UCBL1 Faculté de Médecine et de Pharmacie - Very Long Title That Should Be Truncated',
      variant: 'title' as const,
      maxLines: 2
    },
    {
      title: 'Special Content',
      text: 'Rendez-vous urgent le 26/09/2025 à 12h00 - Contact: prof.belaidi@uclouvain.be - Tél: +32 10 47 43 02 - Attention: événement reporté! Visitez https://www.uclouvain.be/irec pour plus d\'informations.',
      variant: 'description' as const,
      maxLines: 2
    }
  ];

  return (
    <div style={{ padding: '20px', maxWidth: '800px', margin: '0 auto' }}>
      <h1>ExpandableText Component Examples</h1>
      
      {examples.map((example, index) => (
        <div key={index} style={{ marginBottom: '40px', border: '1px solid #ddd', padding: '20px', borderRadius: '8px' }}>
          <h3 style={{ marginTop: 0, color: '#003d7a' }}>{example.title}</h3>
          
          <div style={{ marginBottom: '10px' }}>
            <strong>Original text:</strong>
            <div style={{ fontSize: '12px', color: '#666', fontFamily: 'monospace', background: '#f5f5f5', padding: '8px', borderRadius: '4px', marginTop: '5px' }}>
              {example.text}
            </div>
          </div>
          
          <div>
            <strong>Rendered component:</strong>
            <div style={{ marginTop: '10px', border: '1px solid #eee', padding: '15px', borderRadius: '4px', background: '#fafafa' }}>
              <ExpandableText
                text={example.text}
                variant={example.variant}
                maxLines={example.maxLines}
                maxLength={example.maxLength}
                onExpand={() => console.log(`Expanded: ${example.title}`)}
                onCollapse={() => console.log(`Collapsed: ${example.title}`)}
              />
            </div>
          </div>
        </div>
      ))}
      
      <div style={{ marginTop: '40px', padding: '20px', background: '#f0f8ff', borderRadius: '8px' }}>
        <h3>Screen Size Testing</h3>
        <p>Test the component with different screen sizes:</p>
        
        {['mobile', 'tablet', 'desktop', 'tv'].map(screenSize => (
          <div key={screenSize} style={{ marginBottom: '20px' }}>
            <h4>{screenSize.charAt(0).toUpperCase() + screenSize.slice(1)} View:</h4>
            <ExpandableText
              text="This is a test text that adapts to different screen sizes. The typography and truncation behavior should change based on the screen size setting."
              variant="description"
              screenSize={screenSize as any}
              maxLines={2}
            />
          </div>
        ))}
      </div>
    </div>
  );
};

export default ExpandableTextExample;