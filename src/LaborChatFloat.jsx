import { useState, useEffect, useRef, useCallback } from 'react';
import './LaborChatFloat.css';

const STORAGE_KEY = 'laborFloatState_v1';
const CHAT_URL = 'https://ai.moel.go.kr/llc/labor-law-chat';

const DEFAULT_STATE = {
  btnRight: 24,
  btnBottom: 24,
  panelWidth: 380,
  panelHeight: 640,
  minimized: false,
};

const MIN_W = 280;
const MIN_H = 320;
const HEADER_H = 52;
const BTN_SIZE = 56;

const SUGGESTIONS = [
  '야간근로 가산수당은 얼마나 받을 수 있나요?',
  '5인 미만 사업장도 연차가 발생하나요?',
  '퇴직금은 언제부터 받을 수 있어요?',
  '권고사직과 해고는 어떻게 다른가요?',
];

function loadState() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return { ...DEFAULT_STATE };
    return { ...DEFAULT_STATE, ...JSON.parse(raw) };
  } catch {
    return { ...DEFAULT_STATE };
  }
}

// ── 노법이 마스코트 SVG (원본과 동일) ────────────────────
function Mascot({ size }) {
  const showSpark = size >= 32;
  const showFlag = size >= 40;
  const path = 'M -34 -10 L -32 -34 L -18 -26 L -10 -34 L 0 -28 L 10 -34 L 18 -26 L 32 -34 L 34 -10 Q 38 14 24 28 Q 0 38 -24 28 Q -38 14 -34 -10 Z';
  const uid = `m${size}`;
  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="-50 -50 100 100" width={size} height={size} aria-hidden="true" focusable="false" style={{ display: 'block' }}>
      <defs>
        <linearGradient id={`${uid}-r`} x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#3b6f96" />
          <stop offset="45%" stopColor="#2f4c7e" />
          <stop offset="100%" stopColor="#2c2e56" />
        </linearGradient>
        <radialGradient id={`${uid}-i`} cx="50%" cy="42%" r="62%">
          <stop offset="0%" stopColor="#252e3d" />
          <stop offset="100%" stopColor="#11161f" />
        </radialGradient>
      </defs>
      <path d={path} fill={`url(#${uid}-r)`} />
      <g transform="translate(0 3) scale(0.84)"><path d={path} fill={`url(#${uid}-i)`} /></g>
      {showFlag && <path d="M -22 -32 L -22 -16 L -18 -20 L -14 -16 L -14 -32 Z" fill="#f0c781" opacity="0.95" />}
      <g transform="translate(0 2) scale(0.84)">
        <ellipse cx="-11" cy="0" rx="3.0" ry="4.0" fill="white" />
        <ellipse cx="11" cy="0" rx="3.0" ry="4.0" fill="white" />
        <ellipse cx="-10" cy="-1.2" rx="0.8" ry="1" fill="white" opacity="0.85" />
        <ellipse cx="12" cy="-1.2" rx="0.8" ry="1" fill="white" opacity="0.85" />
        <path d="M -4 9 Q 0 12.5 4 9" stroke="white" strokeWidth="2.2" fill="none" strokeLinecap="round" />
      </g>
      {showSpark && <>
        <circle cx="38" cy="-38" r="3.2" fill="#f0c781" />
        <circle cx="44" cy="-44" r="1.4" fill="#f0c781" opacity="0.75" />
      </>}
    </svg>
  );
}

const Icon = {
  history: <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="9"/><polyline points="12 7 12 12 15 14"/></svg>,
  plus: <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>,
  globe: <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><path d="M12 2a14.5 14.5 0 0 0 0 20 14.5 14.5 0 0 0 0-20"/><path d="M2 12h20"/></svg>,
  settings: <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 1 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 1 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 1 1-2.83-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 1 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 1 1 2.83-2.83l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 1 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 1 1 2.83 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 1 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z"/></svg>,
  minus: <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round"><line x1="5" y1="12" x2="19" y2="12"/></svg>,
  close: <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>,
  chevron: <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="9 18 15 12 9 6"/></svg>,
  arrow: <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M5 12h14M13 5l7 7-7 7"/></svg>,
  resize: <svg width="14" height="14" viewBox="0 0 14 14" style={{ display: 'block', opacity: 0.6 }}><path d="M1 5 L1 1 L5 1 M1 9 L1 1 M9 1 L1 1" stroke="currentColor" strokeWidth="1.5" fill="none" strokeLinecap="round"/></svg>,
};

export default function LaborChatFloat() {
  const [open, setOpen] = useState(false);
  const [state, setState] = useState(loadState);
  const [iframeKey, setIframeKey] = useState(0);
  const [iframeLoading, setIframeLoading] = useState(true);
  const [chipsCollapsed, setChipsCollapsed] = useState(true);
  const [chipsClosed, setChipsClosed] = useState(false);
  const [toast, setToast] = useState('');
  const stateRef = useRef(state);
  const toastTimer = useRef(0);

  useEffect(() => { stateRef.current = state; }, [state]);

  const persist = useCallback((next) => {
    setState(next);
    stateRef.current = next;
    try { localStorage.setItem(STORAGE_KEY, JSON.stringify(next)); } catch { /* ignore */ }
  }, []);

  const showToast = useCallback((msg) => {
    setToast(msg);
    clearTimeout(toastTimer.current);
    toastTimer.current = setTimeout(() => setToast(''), 1800);
  }, []);

  // 단축키
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

  // 버튼 위치 = 패널 위치 (오른쪽/아래 기준). 헤더 드래그도 이 값을 변경.
  const startPosDrag = (e) => {
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
      const right = Math.max(0, Math.min(window.innerWidth - BTN_SIZE, startRight - dx));
      const bottom = Math.max(0, Math.min(window.innerHeight - BTN_SIZE, startBottom - dy));
      setState((s) => ({ ...s, btnRight: right, btnBottom: bottom }));
    };
    const onUp = () => {
      window.removeEventListener('mousemove', onMove);
      window.removeEventListener('mouseup', onUp);
      persist(stateRef.current);
    };
    window.addEventListener('mousemove', onMove);
    window.addEventListener('mouseup', onUp);
    void moved;
  };

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
      const right = Math.max(0, Math.min(window.innerWidth - BTN_SIZE, startRight - dx));
      const bottom = Math.max(0, Math.min(window.innerHeight - BTN_SIZE, startBottom - dy));
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
      const w = Math.max(MIN_W, Math.min(window.innerWidth - 24, startW + dx));
      const h = Math.max(MIN_H, Math.min(window.innerHeight - 40, startH + dy));
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
  const newChat = () => {
    setIframeLoading(true);
    setIframeKey((k) => k + 1);
    setChipsClosed(false);
  };
  const notSupported = () => showToast('확장 프로그램 전용 기능입니다');

  const onChipClick = async (text) => {
    try {
      await navigator.clipboard.writeText(text);
      showToast('질문이 복사됐어요. 입력창에 붙여넣으세요');
    } catch {
      showToast('복사 실패 — 직접 입력해 주세요');
    }
  };

  const panelW = state.panelWidth;
  const panelH = state.minimized ? HEADER_H : state.panelHeight;
  const panelRight = state.btnRight;
  const panelBottom = state.btnBottom + BTN_SIZE + 12;

  return (
    <>
      {open && (
        <div
          className="lcf-panel"
          style={{ right: panelRight, bottom: panelBottom, width: panelW, height: panelH }}
          role="dialog"
          aria-label="AI 노동법 상담"
        >
          {!state.minimized && (
            <div className="lcf-resize" onMouseDown={startResize} title="크기 조정">
              {Icon.resize}
            </div>
          )}
          <div className="lcf-header" onMouseDown={(e) => {
            if (e.target.closest('.lcf-icon-btn')) return;
            startPosDrag(e);
          }}>
            <div className="lcf-brand">
              <div className="lcf-brand-mark"><Mascot size={30} /></div>
              <div className="lcf-brand-name">AI 노동법 상담</div>
            </div>
            <div className="lcf-actions">
              <button className="lcf-icon-btn" onClick={notSupported} title="대화 기록" aria-label="대화 기록">{Icon.history}</button>
              <button className="lcf-icon-btn" onClick={newChat} title="새 대화" aria-label="새 대화">{Icon.plus}</button>
              <button className="lcf-icon-btn" onClick={notSupported} title="언어 선택" aria-label="언어 선택">{Icon.globe}</button>
              <button className="lcf-icon-btn" onClick={notSupported} title="설정" aria-label="설정">{Icon.settings}</button>
              <button className="lcf-icon-btn" onClick={toggleMinimize} title={state.minimized ? '복원' : '최소화'} aria-label="최소화">{Icon.minus}</button>
              <button className="lcf-icon-btn" onClick={close} title="닫기" aria-label="닫기">{Icon.close}</button>
            </div>
          </div>

          {!state.minimized && (
            <>
              {!chipsClosed && (
                <div className="lcf-chips-wrap">
                  <div className="lcf-chips-header" onClick={(e) => {
                    if (e.target.closest('.lcf-chips-close')) return;
                    setChipsCollapsed((c) => !c);
                  }}>
                    <span className="lcf-chips-title">자주 묻는 질문</span>
                    <button className={`lcf-chips-toggle ${chipsCollapsed ? 'is-collapsed' : ''}`} title="접기/펼치기" aria-label="추천 질문 접기/펼치기">{Icon.chevron}</button>
                    <button className="lcf-chips-close" title="추천 질문 닫기" aria-label="추천 질문 닫기" onClick={(e) => { e.stopPropagation(); setChipsClosed(true); }}>{Icon.close}</button>
                  </div>
                  {!chipsCollapsed && (
                    <div className="lcf-chips-list">
                      {SUGGESTIONS.map((text) => (
                        <button key={text} className="lcf-chip" onClick={() => onChipClick(text)}>
                          <span className="lcf-chip-label">{text}</span>
                          <span className="lcf-chip-arrow">{Icon.arrow}</span>
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              )}

              <div className="lcf-iframe-wrap">
                <iframe
                  key={iframeKey}
                  src={CHAT_URL}
                  title="AI 노동법 상담"
                  allow="clipboard-write"
                  onLoad={() => setIframeLoading(false)}
                />
                {iframeLoading && (
                  <div className="lcf-spinner"><div className="lcf-spin" /></div>
                )}
              </div>
            </>
          )}

          {toast && <div className="lcf-toast">{toast}</div>}
        </div>
      )}

      <button
        className="lcf-fab"
        style={{ right: state.btnRight, bottom: state.btnBottom }}
        onMouseDown={startBtnDrag}
        title="AI 노동법 상담 (Ctrl+Shift+L) — 드래그로 위치 이동"
        aria-label="AI 노동법 상담 열기"
      >
        <span className="lcf-fab-label">AI 노동법 상담</span>
        <span className="lcf-fab-mascot"><Mascot size={40} /></span>
      </button>
    </>
  );
}
