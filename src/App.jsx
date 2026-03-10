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
  const [error, setError] = useState('');
  const canvasRef = useRef(null);
  const qrCodeRef = useRef(null);

  // QR 생성 디바운스 처리 (입력 중 불필요한 재생성 방지)
  useEffect(() => {
    const t = setTimeout(() => {
      const canvas = canvasRef.current;
      if (!canvas) return;

      if (url) {
        QRCode.toCanvas(canvas, url, {
          width: 280,
          margin: 2,
          color: { dark: fgColor, light: bgColor },
        }, (err) => { if (err) console.error(err); });
      } else {
        const ctx = canvas.getContext('2d');
        ctx.clearRect(0, 0, canvas.width, canvas.height);
      }
    }, 300);

    return () => clearTimeout(t);
  }, [url, fgColor, bgColor]);

  const captureImage = async () => {
    const dataUrl = await toPng(qrCodeRef.current, { cacheBust: true });
    const finalFileName = (fileName.trim() === '' ? 'qr-code' : fileName) + '.png';
    return { dataUrl, finalFileName };
  };

  const handleShare = async () => {
    if (!qrCodeRef.current || !url) return;
    setError('');
    try {
      const { dataUrl, finalFileName } = await captureImage();

      if (navigator.share && navigator.canShare) {
        const response = await fetch(dataUrl);
        const blob = await response.blob();
        const file = new File([blob], finalFileName, { type: blob.type });

        if (navigator.canShare({ files: [file] })) {
          await navigator.share({ files: [file], title: fileName || 'QR Code', text: caption || url });
          return;
        }
      }

      // 공유 미지원 브라우저 폴백: 다운로드
      const link = document.createElement('a');
      link.download = finalFileName;
      link.href = dataUrl;
      link.click();
    } catch (err) {
      console.error('공유 또는 저장 실패', err);
      setError('공유 또는 저장에 실패했습니다. 다시 시도해 주세요.');
    }
  };

  const handleDirectDownload = async () => {
    if (!qrCodeRef.current || !url) return;
    setError('');
    try {
      const { dataUrl, finalFileName } = await captureImage();
      const link = document.createElement('a');
      link.download = finalFileName;
      link.href = dataUrl;
      link.click();
    } catch (err) {
      console.error('내려받기 실패', err);
      setError('내려받기에 실패했습니다. 다시 시도해 주세요.');
    }
  };

  return (
    <div className="app-container">
      <div className="app-header">
        <h1>우리 노동부 AX 네트워크<br />QR 코드 생성기</h1>
      </div>
      <div className="main-content">
        <div className="controls">
          <div className="input-group">
            <label htmlFor="url-input">URL 또는 텍스트</label>
            <input
              id="url-input"
              type="text"
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              placeholder="예. https://moel.go.kr"
            />
          </div>
          <div className="input-group">
            <label htmlFor="caption-input">문구</label>
            <input
              id="caption-input"
              type="text"
              value={caption}
              onChange={(e) => setCaption(e.target.value)}
              placeholder="예. 고용노동부 누리집"
            />
          </div>
          <div className="color-picker-group">
            <div className="input-group">
              <label htmlFor="fg-color">QR 코드 색상</label>
              <input
                id="fg-color"
                type="color"
                value={fgColor}
                onChange={(e) => setFgColor(e.target.value)}
              />
            </div>
            <div className="input-group">
              <label htmlFor="bg-color">배경 색상</label>
              <input
                id="bg-color"
                type="color"
                value={bgColor}
                onChange={(e) => setBgColor(e.target.value)}
              />
            </div>
          </div>
          <div className="input-group">
            <label htmlFor="file-name">저장할 파일명</label>
            <input
              id="file-name"
              type="text"
              value={fileName}
              onChange={(e) => setFileName(e.target.value)}
              placeholder="예: my-qr-code"
            />
          </div>
          {error && <p className="error-message" role="alert">{error}</p>}
          <div className="button-group">
            <button onClick={handleShare} disabled={!url}>공유하기<br />(사진첩 저장 가능)</button>
            <button onClick={handleDirectDownload} disabled={!url} className="secondary">내려받기</button>
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
