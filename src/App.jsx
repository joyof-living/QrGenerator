import { useState, useEffect, useRef } from 'react';
import QRCode from 'qrcode';
import { toPng } from 'html-to-image';
import './App.css';

function App() {
  const [url, setUrl] = useState('https://github.com/gemini-cli');
  const [caption, setCaption] = useState('Made with Gemini');
  const [fgColor, setFgColor] = useState('#000000');
  const [bgColor, setBgColor] = useState('#ffffff');
  const canvasRef = useRef(null);
  const qrCodeRef = useRef(null);

  useEffect(() => {
    if (canvasRef.current) {
      QRCode.toCanvas(canvasRef.current, url, {
        width: 280,
        margin: 2,
        color: {
          dark: fgColor,
          light: bgColor,
        },
      }, (error) => {
        if (error) console.error(error);
      });
    }
  }, [url, fgColor, bgColor]);

  const handleDownload = () => {
    if (qrCodeRef.current) {
      toPng(qrCodeRef.current, { cacheBust: true })
        .then((dataUrl) => {
          const link = document.createElement('a');
          link.download = 'my-qr-code.png';
          link.href = dataUrl;
          link.click();
        })
        .catch((err) => {
          console.error(err);
        });
    }
  };

  return (
    <div className="app-container">
      <h1>QR Code Generator</h1>
      <div className="main-content">
        <div className="controls">
          <div className="input-group">
            <label>URL or Text</label>
            <input
              type="text"
              value={url}
              onChange={(e) => setUrl(e.target.value)}
            />
          </div>
          <div className="input-group">
            <label>Caption</label>
            <input
              type="text"
              value={caption}
              onChange={(e) => setCaption(e.target.value)}
            />
          </div>
          <div className="color-picker-group">
            <div className="input-group">
              <label>Foreground Color</label>
              <input
                type="color"
                value={fgColor}
                onChange={(e) => setFgColor(e.target.value)}
              />
            </div>
            <div className="input-group">
              <label>Background Color</label>
              <input
                type="color"
                value={bgColor}
                onChange={(e) => setBgColor(e.target.value)}
              />
            </div>
          </div>
          <button onClick={handleDownload}>Download QR Code</button>
        </div>
        <div className="preview">
          <h2>Preview</h2>
          <div ref={qrCodeRef} className="qr-code-container">
            <canvas ref={canvasRef}></canvas>
            {caption && <p className="caption">{caption}</p>}
          </div>
        </div>
      </div>
    </div>
  );
}

export default App;
