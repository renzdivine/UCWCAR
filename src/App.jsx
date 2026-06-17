import { useState, useEffect } from 'react';
import { useCarScene }  from './hooks/useCarScene';
import { useReveal }    from './components/useReveal';
import Loader     from './components/Loader';
import Navbar     from './components/Navbar';
import Hero       from './components/Hero';
import Collection from './components/Collection';
import Models     from './components/Models';
import Gallery    from './components/Gallery';
import Experience from './components/Experience';
import Contact    from './components/Contact';
import Footer     from './components/Footer';

/**
 * Responsive drag-hit area over the 3D car.
 * Desktop: centred vertically (50%).
 * Mobile (≤900px): the hero has 3 rows — text / car / stats.
 *   The car row starts roughly after the text block (~40% down) so we
 *   shift the hit zone down to ~52% to sit inside that window.
 */
function DragArea({ dragAreaRef }) {
  const [style, setStyle] = useState({});

  useEffect(() => {
    function compute() {
      const mobile = window.innerWidth <= 900;
      setStyle(
        mobile
          ? {
              position: 'fixed',
              top: '52%',
              left: '50%',
              transform: 'translate(-50%, -50%)',
              width: '90vw',
              height: 'clamp(160px, 40vw, 280px)',
              zIndex: 1000,
              cursor: 'grab',
              borderRadius: '12px',
            }
          : {
              position: 'fixed',
              top: '50%',
              left: '50%',
              transform: 'translate(-50%, -50%)',
              width: '420px',
              height: '240px',
              zIndex: 1000,
              cursor: 'grab',
              borderRadius: '12px',
            }
      );
    }
    compute();
    window.addEventListener('resize', compute);
    return () => window.removeEventListener('resize', compute);
  }, []);

  return <div ref={dragAreaRef} style={style} />;
}

export default function App() {
  const [loaderHidden, setLoaderHidden] = useState(false);
  const [progress, setProgress]         = useState(0);
  const [loaderText, setLoaderText]     = useState('Loading Experience...');
  const [heroReady, setHeroReady]       = useState(false);

  const { canvasRef, dragAreaRef } = useCarScene({
    onProgress: (pct) => {
      setProgress(pct);
      setLoaderText(`Loading ${pct}%`);
    },
    onLoaded: () => {
      setProgress(100);
      setLoaderText('Ready');
      setTimeout(() => {
        setLoaderHidden(true);
        document.body.classList.remove('loading');
        setHeroReady(true);
      }, 600);
    },
    onError: () => {
      setLoaderHidden(true);
      document.body.classList.remove('loading');
      setHeroReady(true);
    },
  });

  // Lock scroll while loading
  useEffect(() => {
    document.body.classList.add('loading');
  }, []);

  // Activate scroll-reveal after page is visible
  useReveal();

  return (
    <>
      <Loader progress={progress} text={loaderText} hidden={loaderHidden} />
      <canvas id="carCanvas" ref={canvasRef} />
      {/* Transparent hit area — sits over the car's screen position, enables drag */}
      <DragArea dragAreaRef={dragAreaRef} />
      <Navbar />
      <Hero heroReady={heroReady} />
      <Collection />
      <Models />
      <Gallery />
      <Experience />
      <Contact />
      <Footer />
    </>
  );
}
