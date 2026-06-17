const FEATURES = [
  {
    num: '01',
    title: 'Aerodynamic Mastery',
    desc: 'Active aero reduces drag by 32% and maximises downforce at speed.',
  },
  {
    num: '02',
    title: 'Carbon Architecture',
    desc: 'Full carbon-fiber monocoque delivers a 1:1 power-to-weight ratio.',
  },
  {
    num: '03',
    title: 'Neural Drive System',
    desc: 'AI drivetrain adapts to your style in real-time.',
  },
  {
    num: '04',
    title: 'Haptic Feedback Steering',
    desc: 'Feel every texture through our force-feedback system.',
  },
];

export default function Models() {
  return (
    <section id="models" className="section section-alt">
      <div className="container">
        <div className="split split-flip">
          <div className="split-content">
            <p className="tag">Performance</p>
            <h2>Engineered Perfection</h2>
            <p className="desc">Every component crafted for an unparalleled driving experience.</p>

            <div className="feature-list">
              {FEATURES.map((f, i) => (
                <div key={f.num} className="feature reveal" style={{ '--d': `${i * 0.1}s` }}>
                  <span className="feat-num">{f.num}</span>
                  <div>
                    <h4>{f.title}</h4>
                    <p>{f.desc}</p>
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
