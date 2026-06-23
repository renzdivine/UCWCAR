import { useState, useEffect } from 'react';
import { useCarScene } from './hooks/useCarScene';
import { useReveal } from './components/useReveal';
import Loader from './components/Loader';
import Navbar from './components/Navbar';
import Hero from './components/Hero';
import Collection from './components/Collection';
import Models from './components/Models';
import Gallery from './components/Gallery';
import Experience from './components/Experience';
import Contact from './components/Contact';
import Footer from './components/Footer';

export default function App() {
  const [loaderHidden, setLoaderHidden] = useState(false);
  const [progress, setProgress] = useState(0);
  const [loaderText, setLoaderText] = useState('Loading Experience...');
  const [heroReady, setHeroReady] = useState(false);

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

  useEffect(() => {
    document.body.classList.add('loading');
  }, []);

  useReveal();

  return (
    <>
      <Loader progress={progress} text={loaderText} hidden={loaderHidden} />
      <Navbar />
      <Hero heroReady={heroReady} canvasRef={canvasRef} dragAreaRef={dragAreaRef} />
      <Collection />
      <Models />
      <Gallery />
      <Experience />
      <Contact />
      <Footer />
    </>
  );
}
