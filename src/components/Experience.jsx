import './Experience.css';

const STEPS = [
  {
    title: 'Private Consultation',
    desc: 'Every detail — from exterior finishes to cabin materials — is yours to command.',
  },
  {
    title: 'Bespoke Configuration',
    desc: 'Watch your dream car materialize with photorealistic accuracy.',
  },
  {
    title: 'Track Day Experience',
    desc: 'Feel the raw power firsthand at our exclusive circuit.',
  },
  {
    title: 'White Glove Delivery',
    desc: 'Your masterpiece arrives in a ceremony befitting its creation.',
  },
];

export default function Experience() {
  return (
    <section id="experience" className="section section-alt">
      <div className="container">
        <div className="split split-flip">
          <div className="split-content">
            <p className="tag">The Journey</p>
            <h2>The LUXE Experience</h2>
            <p className="desc">From the moment of inquiry to the thrill of the open road.</p>

            <div className="timeline">
              {STEPS.map((step, i) => (
                <div key={step.title} className="t-item reveal" style={{ '--d': `${(i + 1) * 0.1}s` }}>
                  <div className="t-dot" />
                  <div>
                    <h4>{step.title}</h4>
                    <p>{step.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="split-car" />
        </div>
      </div>
    </section>
  );
}
