import './Experience.css';

const STEPS = [
  {
    num: '01',
    title: 'Private Consultation',
    desc: 'Every detail — from exterior finishes to cabin materials — is yours to command.',
  },
  {
    num: '02',
    title: 'Bespoke Configuration',
    desc: 'Watch your dream car materialize with photorealistic accuracy.',
  },
  {
    num: '03',
    title: 'Track Day Experience',
    desc: 'Feel the raw power firsthand at our exclusive circuit.',
  },
  {
    num: '04',
    title: 'White Glove Delivery',
    desc: 'Your masterpiece arrives in a ceremony befitting its creation.',
  },
];

export default function Experience() {
  return (
    <section id="experience" className="section section-alt">
      <div className="container">
        <div className="exp-header reveal">
          <p className="tag">The Journey</p>
          <h2>The LUXE Experience</h2>
          <p className="desc">From the moment of inquiry to the thrill of the open road.</p>
        </div>

        <div className="exp-track">
          <div className="exp-line" />
          {STEPS.map((step, i) => (
            <div key={step.num} className="exp-step reveal" style={{ '--d': `${i * 0.12}s` }}>
              <div className="exp-node">
                <span>{step.num}</span>
              </div>
              <div className="exp-card">
                <h4>{step.title}</h4>
                <p>{step.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
