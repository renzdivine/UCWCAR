import './Models.css';

const FEATURES = [
  {
    num: '01',
    title: 'Aerodynamic Mastery',
    desc: 'Active aero reduces drag by 32% and maximises downforce at speed.',
    accent: 'Drag Coefficient 0.28',
  },
  {
    num: '02',
    title: 'Carbon Architecture',
    desc: 'Full carbon-fiber monocoque delivers a 1:1 power-to-weight ratio.',
    accent: '1,380 kg dry weight',
  },
  {
    num: '03',
    title: 'Neural Drive System',
    desc: 'AI drivetrain adapts to your style in real-time.',
    accent: '8ms reaction time',
  },
  {
    num: '04',
    title: 'Haptic Feedback Steering',
    desc: 'Feel every texture through our force-feedback system.',
    accent: '360° torque sensing',
  },
];

export default function Models() {
  return (
    <section id="models" className="section section-alt">
      <div className="container">
        <div className="models-header reveal">
          <p className="tag">Performance</p>
          <h2>Engineered Perfection</h2>
          <p className="desc">Every component crafted for an unparalleled driving experience.</p>
        </div>

        <div className="models-grid">
          {FEATURES.map((f, i) => (
            <div key={f.num} className="model-card reveal" style={{ '--d': `${i * 0.1}s` }}>
              <span className="model-bg-num">{f.num}</span>
              <div className="model-card-inner">
                <span className="model-accent-pill">{f.accent}</span>
                <h4>{f.title}</h4>
                <p>{f.desc}</p>
              </div>
              <div className="model-card-bar" />
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
