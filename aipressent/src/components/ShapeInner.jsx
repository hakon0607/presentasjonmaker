// Delt figur-tegner for både redigering (Canvas) og visning (SlideStage).
export default function ShapeInner({ el, W, H }) {
  const f = el.fill
  const sw = el.strokeW || 0
  const sc = el.stroke || '#000000'
  const svgStroke = sw > 0 ? { stroke: sc, strokeWidth: sw, vectorEffect: 'non-scaling-stroke' } : {}
  const borderStyle = sw > 0 ? { border: `${sw}px solid ${sc}`, boxSizing: 'border-box' } : {}
  switch (el.kind) {
    case 'silhouette':
      return <svg width={W} height={H} viewBox="0 0 100 100" preserveAspectRatio="xMidYMid meet" style={el.flipH ? { transform: 'scaleX(-1)' } : undefined}><path d={el.path} fill={f} fillRule="evenodd" strokeLinejoin="round" {...svgStroke} /></svg>
    case 'circle':
      return <div style={{ width: '100%', height: '100%', background: f, borderRadius: '50%', ...borderStyle }} />
    case 'line':
      return <svg width={W} height={H}><line x1="2" y1={H / 2} x2={W - 2} y2={H / 2} stroke={f} strokeWidth={Math.max(2, H * 0.6)} strokeLinecap="round" /></svg>
    case 'arrow':
      return (
        <svg width={W} height={H}>
          <line x1="3" y1={H / 2} x2={W - H * 0.55} y2={H / 2} stroke={f} strokeWidth={Math.max(2, H * 0.4)} strokeLinecap="round" />
          <polygon points={`${W - H * 0.7},${H * 0.12} ${W - 1},${H / 2} ${W - H * 0.7},${H * 0.88}`} fill={f} />
        </svg>
      )
    case 'star':
      return <svg width={W} height={H} viewBox="0 0 100 100" preserveAspectRatio="none"><polygon points="50,3 61,38 98,38 68,59 79,96 50,73 21,96 32,59 2,38 39,38" fill={f} strokeLinejoin="round" {...svgStroke} /></svg>
    case 'triangle':
      return <svg width={W} height={H} viewBox="0 0 100 100" preserveAspectRatio="none"><polygon points="50,5 97,95 3,95" fill={f} strokeLinejoin="round" {...svgStroke} /></svg>
    case 'hexagon':
      return <svg width={W} height={H} viewBox="0 0 100 100" preserveAspectRatio="none"><polygon points="27,6 73,6 97,50 73,94 27,94 3,50" fill={f} strokeLinejoin="round" {...svgStroke} /></svg>
    case 'heart':
      return <svg width={W} height={H} viewBox="0 0 100 100" preserveAspectRatio="none"><path d="M50,86 C16,60 6,38 20,24 C33,11 47,20 50,32 C53,20 67,11 80,24 C94,38 84,60 50,86 Z" fill={f} strokeLinejoin="round" {...svgStroke} /></svg>
    case 'bubble':
      return <svg width={W} height={H} viewBox="0 0 100 100" preserveAspectRatio="none"><path d="M6,6 H94 V64 H38 L22,92 V64 H6 Z" fill={f} strokeLinejoin="round" {...svgStroke} /></svg>
    default:
      return <div style={{ width: '100%', height: '100%', background: f, borderRadius: (el.radius || 0), ...borderStyle }} />
  }
}
