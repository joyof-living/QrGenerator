import { useState, useEffect, useRef } from 'react';
import QRCode from 'qrcode';
import { toPng } from 'html-to-image';
import './App.css';

function App() {
  const [url, setUrl] = useState('https://moel.go.kr');
  const [caption, setCaption] = useState('고용노동부 누리집');
  const [fileName, setFileName] = useState('');
  const [fgColor, setFgColor] = useState('#000000');
  const [bgColor, setBgColor] = useState('#ffffff');
  const canvasRef = useRef(null);
  const qrCodeRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    if (url) {
      QRCode.toCanvas(canvas, url, {
        width: 280,
        margin: 2,
        color: {
          dark: fgColor,
          light: bgColor,
        },
      }, (error) => {
        if (error) console.error(error);
      });
    } else {
      // Clear the canvas if URL is empty
      const context = canvas.getContext('2d');
      context.clearRect(0, 0, canvas.width, canvas.height);
    }
  }, [url, fgColor, bgColor]);

  const handleShare = async () => {
    if (!qrCodeRef.current || !url) {
      return;
    }

    try {
      const dataUrl = await toPng(qrCodeRef.current, { cacheBust: true });
      const finalFileName = (fileName.trim() === '' ? 'qr-code' : fileName) + '.png';

      // Use Web Share API if available
      if (navigator.share && navigator.canShare) {
        const response = await fetch(dataUrl);
        const blob = await response.blob();
        const file = new File([blob], finalFileName, { type: blob.type });

        if (navigator.canShare({ files: [file] })) {
          await navigator.share({
            files: [file],
            title: fileName || 'QR Code',
            text: caption || url,
          });
          return; // Exit if share is successful
        }
      }

      // Fallback to direct download if sharing is not available or fails
      const link = document.createElement('a');
      link.download = finalFileName;
      link.href = dataUrl;
      link.click();
    } catch (err) {
      console.error('Failed to share or download QR code', err);
      // Attempt a final fallback on any error
      handleDirectDownload();
    }
  };

  const handleDirectDownload = async () => {
    if (!qrCodeRef.current || !url) {
      return;
    }
    try {
      const dataUrl = await toPng(qrCodeRef.current, { cacheBust: true });
      const finalFileName = (fileName.trim() === '' ? 'qr-code' : fileName) + '.png';
      const link = document.createElement('a');
      link.download = finalFileName;
      link.href = dataUrl;
      link.click();
    } catch (err) {
      console.error('Failed to execute direct download', err);
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
              placeholder="예. https://moel.go.kr"
            />
          </div>
          <div className="input-group">
            <label>문구</label>
            <input
              type="text"
              value={caption}
              onChange={(e) => setCaption(e.target.value)}
              placeholder="예. 고용노동부 누리집"
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
                    <div className="button-group">
            <button onClick={handleShare} disabled={!url}>공유하기(사진첩 저장 가능)</button>
            <button onClick={handleDirectDownload} disabled={!url}>내려받기</button>
          </div>
        </div>
        <div className="preview">
          <h2>미리보기</h2>
          <div ref={qrCodeRef} className="qr-code-container" style={{ visibility: url ? 'visible' : 'hidden' }}>
            <canvas ref={canvasRef}></canvas>
            {caption && <p className="caption">{caption}</p>}
          </div>
        </div>
      </div>
    </div>
  );
}

export default App;
