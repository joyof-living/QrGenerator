import { useState, useEffect, useRef, useCallback } from 'react';
import './LaborChatFloat.css';

const STORAGE_KEY = 'laborFloatState_v1';
const CHAT_URL = 'https://ai.moel.go.kr/llc/labor-law-chat';

const DEFAULT_STATE = {
  btnRight: 24,
  btnBottom: 24,
  panelWidth: 420,
  panelHeight: 640,
  minimized: false,
};

const MIN_W = 320;
const MIN_H = 360;

function loadState() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return { ...DEFAULT_STATE };
    return { ...DEFAULT_STATE, ...JSON.parse(raw) };
  } catch {
    return { ...DEFAULT_STATE };
  }
}

export default function LaborChatFloat() {
  const [open, setOpen] = useState(false);
  const [state, setState] = useState(loadState);
  const [iframeKey, setIframeKey] = useState(0);
  const [hovered, setHovered] = useState(false);
  const stateRef = useRef(state);
  stateRef.current = state;

  const persist = useCallback((next) => {
    setState(next);
    try { localStorage.setItem(STORAGE_KEY, JSON.stringify(next)); } catch {}
  }, []);

  // 단축키 Ctrl+Shift+L
  useEffect(() => {
    const onKey = (e) => {
      if ((e.ctrlKey || e.metaKey) && e.shiftKey && (e.key === 'L' || e.key === 'l')) {
        e.preventDefault();
        setOpen((o) => !o);
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, []);

  // 버튼 드래그
  const startBtnDrag = (e) => {
    e.preventDefault();
    const startX = e.clientX;
    const startY = e.clientY;
    const startRight = stateRef.current.btnRight;
    const startBottom = stateRef.current.btnBottom;
    let moved = false;
    const onMove = (ev) => {
      const dx = ev.clientX - startX;
      const dy = ev.clientY - startY;
      if (Math.abs(dx) + Math.abs(dy) > 4) moved = true;
      const right = Math.max(8, Math.min(window.innerWidth - 80, startRight - dx));
      const bottom = Math.max(8, Math.min(window.innerHeight - 80, startBottom - dy));
      setState((s) => ({ ...s, btnRight: right, btnBottom: bottom }));
    };
    const onUp = () => {
      window.removeEventListener('mousemove', onMove);
      window.removeEventListener('mouseup', onUp);
      persist(stateRef.current);
      if (!moved) setOpen((o) => !o);
    };
    window.addEventListener('mousemove', onMove);
    window.addEventListener('mouseup', onUp);
  };

  // 패널 좌상단 모서리 리사이즈
  const startResize = (e) => {
    e.preventDefault();
    e.stopPropagation();
    const startX = e.clientX;
    const startY = e.clientY;
    const startW = stateRef.current.panelWidth;
    const startH = stateRef.current.panelHeight;
    const onMove = (ev) => {
      const dx = startX - ev.clientX;
      const dy = startY - ev.clientY;
      const w = Math.max(MIN_W, Math.min(window.innerWidth - 32, startW + dx));
      const h = Math.max(MIN_H, Math.min(window.innerHeight - 32, startH + dy));
      setState((s) => ({ ...s, panelWidth: w, panelHeight: h }));
    };
    const onUp = () => {
      window.removeEventListener('mousemove', onMove);
      window.removeEventListener('mouseup', onUp);
      persist(stateRef.current);
    };
    window.addEventListener('mousemove', onMove);
    window.addEventListener('mouseup', onUp);
  };

  const toggleMinimize = () => persist({ ...stateRef.current, minimized: !stateRef.current.minimized });
  const close = () => setOpen(false);
  const reload = () => setIframeKey((k) => k + 1);

  const panelW = state.panelWidth;
  const panelH = state.minimized ? 52 : state.panelHeight;
  const panelRight = state.btnRight;
  const panelBottom = state.btnBottom + 56 + 12;

  return (
    <>
      {open && (
        <div
          className="lcf-panel"
          style={{
            right: panelRight,
            bottom: panelBottom,
            width: panelW,
            height: panelH,
          }}
          role="dialog"
          aria-label="AI 노동법 상담"
        >
          {!state.minimized && (
            <div className="lcf-resize" onMouseDown={startResize} title="크기 조정" />
          )}
          <div className="lcf-header">
            <div className="lcf-title">
              <img src="/mascot.svg" alt="" className="lcf-title-mascot" />
              <span>AI 노동법 상담</span>
            </div>
            <div className="lcf-actions">
              <button className="lcf-icon-btn" onClick={reload} title="새 대화 (다시 불러오기)" aria-label="새 대화">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="23 4 23 10 17 10"/><path d="M20.49 15a9 9 0 1 1-2.12-9.36L23 10"/></svg>
              </button>
              <button className="lcf-icon-btn" onClick={toggleMinimize} title={state.minimized ? '복원' : '최소화'} aria-label="최소화">
                {state.minimized ? (
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="6 9 12 15 18 9"/></svg>
                ) : (
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="5" y1="12" x2="19" y2="12"/></svg>
                )}
              </button>
              <button className="lcf-icon-btn" onClick={close} title="닫기" aria-label="닫기">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
              </button>
            </div>
          </div>
          {!state.minimized && (
            <div className="lcf-body">
              <iframe
                key={iframeKey}
                src={CHAT_URL}
                title="AI 노동법 상담"
                allow="clipboard-write"
              />
            </div>
          )}
        </div>
      )}

      <button
        className={`lcf-fab ${hovered ? 'lcf-fab-hover' : ''}`}
        style={{ right: state.btnRight, bottom: state.btnBottom }}
        onMouseDown={startBtnDrag}
        onMouseEnter={() => setHovered(true)}
        onMouseLeave={() => setHovered(false)}
        title="AI 노동법 상담 (Ctrl+Shift+L)"
        aria-label="AI 노동법 상담 열기"
      >
        <img src="/mascot.svg" alt="" className="lcf-fab-mascot" draggable={false} />
        <span className="lcf-fab-label">AI 노동법 상담</span>
      </button>
    </>
  );
}
