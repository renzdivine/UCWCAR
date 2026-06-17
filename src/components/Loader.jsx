import './Loader.css';

export default function Loader({ progress, text, hidden }) {
  return (
    <div id="loader" className={hidden ? 'hidden' : ''}>
      <div className="loader-inner">
        <div className="loader-logo">UCW</div>
        <div className="loader-bar-track">
          <div className="loader-bar-fill" style={{ width: `${progress}%` }} />
        </div>
        <div className="loader-text">{text}</div>
      </div>
    </div>
  );
}
