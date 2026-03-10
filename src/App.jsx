import { useState, useEffect, useRef } from 'react';
import QRCode from 'qrcode';
import { toPng } from 'html-to-image';
import './App.css';

function App() {
  const [url, setUrl] = useState('https://github.com/gemini-cli');
  const [caption, setCaption] = useState('Made with Gemini');
  const [fileName, setFileName] = useState('qr-code');
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
          const finalFileName = fileName.trim() === '' ? 'qr-code' : fileName;
          link.download = `${finalFileName}.png`;
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
      <h1>우리 노동부 AX 네트워크<br />QR 코드 생성기</h1>
      <div className="main-content">
        <div className="controls">
          <div className="input-group">
            <label>URL 또는 텍스트</label>
            <input
              type="text"
              value={url}
              onChange={(e) => setUrl(e.target.value)}
            />
          </div>
          <div className="input-group">
            <label>문구</label>
            <input
              type="text"
              value={caption}
              onChange={(e) => setCaption(e.target.value)}
            />
          </div>
          <div className="color-picker-group">
            <div className="input-group">
              <label>QR 코드 색상</label>
              <input
                type="color"
                value={fgColor}
                onChange={(e) => setFgColor(e.target.value)}
              />
            </div>
            <div className="input-group">
              <label>배경 색상</label>
              <input
                type="color"
                value={bgColor}
                onChange={(e) => setBgColor(e.target.value)}
              />
            </div>
          </div>
          <div className="input-group">
            <label>저장할 파일명</label>
            <input
              type="text"
              value={fileName}
              onChange={(e) => setFileName(e.target.value)}
              placeholder="예: my-qr-code"
            />
          </div>
          <button onClick={handleDownload}>QR 코드 다운로드</button>
        </div>
        <div className="preview">
          <h2>미리보기</h2>
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
