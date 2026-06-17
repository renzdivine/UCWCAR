import phantomImg from '../assets/phantom.png';
import spectreImg from '../assets/spectre.png';
import venomImg from '../assets/venom.png';
import './Collection.css';

const CARDS = [
  {
    name: 'Phantom GT',
    sub: 'Grand Touring · V12 Twin-Turbo',
    price: 'From $285,000',
    bg: phantomImg,
    delay: '0s',
  },
  {
    name: 'Spectre EV',
    sub: 'Electric Hypercar · Dual Motor',
    price: 'From $420,000',
    bg: spectreImg,
    delay: '0.1s',
  },
  {
    name: 'Venom RS',
    sub: 'Track Weapon · Hybrid V8',
    price: 'From $560,000',
    bg: venomImg,
    delay: '0.2s',
  },
];

export default function Collection() {
  return (
    <section id="collection" className="section">
      <div className="container">
        <div className="split">
          <div className="split-content">
            <p className="tag">Our Fleet</p>
            <h2>The Collection</h2>
            <p className="desc">Handcrafted masterpieces for those who demand the extraordinary.</p>

            <div className="card-list">
              {CARDS.map((card) => (
                <div key={card.name} className="car-card reveal" style={{ '--d': card.delay }}>
                  <div className="car-card-img">
                    <img src={card.bg} alt={card.name} />
                  </div>
                  <div className="car-card-body">
                    <h3>{card.name}</h3>
                    <p>{card.sub}</p>
                    <span className="price">{card.price}</span>
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
