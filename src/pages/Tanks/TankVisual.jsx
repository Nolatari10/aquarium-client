const visualStyles = `
@keyframes bubble {
  0%   { transform: translateY(0); opacity: 0.5; }
  50%  { opacity: 0.8; }
  100% { transform: translateY(-80px); opacity: 0; }
}
@keyframes bubble-slow {
  0%   { transform: translateY(0); opacity: 0.4; }
  60%  { opacity: 0.7; }
  100% { transform: translateY(-100px); opacity: 0; }
}
@keyframes sway {
  0%, 100% { transform: rotate(-2deg); }
  50%      { transform: rotate(2deg); }
}
@keyframes sway-gentle {
  0%, 100% { transform: rotate(-1deg); }
  50%      { transform: rotate(1.5deg); }
}
@keyframes waterShift {
  0%, 100% { transform: translateY(0); }
  50%      { transform: translateY(-2px); }
}
@keyframes swim {
  0%   { transform: translateX(-12px); }
  100% { transform: translateX(12px); }
}
@keyframes drift-leaf {
  0%   { transform: translateX(0) rotate(0deg); opacity: 0.6; }
  50%  { transform: translateX(6px) rotate(3deg); }
  100% { transform: translateX(0) rotate(0deg); opacity: 0.6; }
}
@keyframes fin-wave {
  0%, 100% { transform: scaleY(1); }
  50%      { transform: scaleY(0.6); }
}
@keyframes pulse-medical {
  0%, 100% { opacity: 0.5; }
  50%      { opacity: 0.9; }
}
`;

// ── Water color gradient stops by tank type ──
const WATER_PALETTE = {
  PlantedHighTech:  { top: 'rgba(80,180,200,0.25)',  bottom: 'rgba(20,90,150,0.40)' },
  PlantedLowTech:   { top: 'rgba(90,175,190,0.22)',  bottom: 'rgba(25,85,140,0.35)' },
  Aquascape:        { top: 'rgba(70,190,210,0.28)',  bottom: 'rgba(15,100,160,0.42)' },
  Biotope:          { top: 'rgba(180,140,80,0.22)',   bottom: 'rgba(100,70,30,0.38)' },
  Shrimp:           { top: 'rgba(100,190,180,0.20)',  bottom: 'rgba(30,100,120,0.32)' },
  Breeding:         { top: 'rgba(140,200,200,0.18)',  bottom: 'rgba(40,110,130,0.30)' },
  Quarantine:       { top: 'rgba(180,200,210,0.14)',  bottom: 'rgba(140,160,180,0.22)' },
  Other:            { top: 'rgba(100,180,220,0.20)',  bottom: 'rgba(30,100,160,0.35)' },
};

// ── Substrate color by tank type ──
const SUBSTRATE = {
  PlantedHighTech: '#3a3528',
  PlantedLowTech:  '#4a4538',
  Aquascape:       '#3d3528',
  Biotope:         '#8a7a60',
  Shrimp:          '#5a5040',
  Breeding:        '#4a4538',
  Quarantine:      null,
  Other:           '#9a8a70',
};

function TankVisual({ tank }) {
  const t = tank.TankType || 'Other';
  const isPlanted = t === 'PlantedHighTech' || t === 'PlantedLowTech';
  const isAquascape = t === 'Aquascape';
  const isBiotope = t === 'Biotope';
  const isShrimp = t === 'Shrimp';
  const isBreeding = t === 'Breeding';
  const isQuarantine = t === 'Quarantine';

  const hasCO2 = tank.Co2Injection;
  const showPlants = isPlanted || isAquascape;
  const sizeL = tank.SizeLiters || 60;
  const aspectW = Math.min(Math.max(sizeL / 60, 0.6), 1.6);
  const w = Math.round(300 * aspectW);
  const left = 14;
  const top = 22;
  const innerW = w - 28;
  const innerH = 164;
  const substrateY = top + 148;
  const substrateH = 18;
  const cx = left + innerW / 2;
  const palette = WATER_PALETTE[t] || WATER_PALETTE.Other;
  const subColor = SUBSTRATE[t];

  return (
    <div style={{ position: 'relative', maxWidth: 360, margin: '0 auto' }}>
      <style>{visualStyles}</style>
      <svg viewBox={`0 0 ${w} 200`} width="100%" style={{ display: 'block' }}>
        <defs>
          {/* Glass reflection gradient */}
          <linearGradient id="glassGrad" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%"   stopColor="rgba(200,230,255,0.28)" />
            <stop offset="40%"  stopColor="rgba(255,255,255,0.04)" />
            <stop offset="100%" stopColor="rgba(180,210,240,0.16)" />
          </linearGradient>
          {/* Water body gradient — type-specific */}
          <linearGradient id="waterGrad" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%"   stopColor={palette.top} />
            <stop offset="100%" stopColor={palette.bottom} />
          </linearGradient>
          {/* Clipping for content inside water */}
          <clipPath id="waterClip">
            <rect x={left} y={top} width={innerW} height={innerH} rx="2" />
          </clipPath>
        </defs>

        {/* ── Glass tank outline ── */}
        <rect x="10" y="10" width={w - 20} height="180" rx="3"
          fill="url(#glassGrad)"
          stroke="var(--aqua-scheme-border)"
          strokeWidth="1.5" />

        {/* ── Water body ── */}
        <rect x={left} y={top} width={innerW} height={innerH} rx="1"
          fill="url(#waterGrad)"
          style={{ transformOrigin: `${cx}px ${top + innerH / 2}px`, animation: 'waterShift 4s ease-in-out infinite' }} />

        {/* ── Tank contents (clipped to water area) ── */}
        <g clipPath="url(#waterClip)">

          {/* ── Hardscape / Decorations ── */}

          {/* Aquascape: dragon stone + driftwood */}
          {isAquascape && (
            <g>
              {/* Dragon stone (angular gray rock) */}
              <polygon points={`${left + 60},${substrateY} ${left + 52},${substrateY - 35} ${left + 62},${substrateY - 52} ${left + 75},${substrateY - 40} ${left + 80},${substrateY - 18} ${left + 72},${substrateY}`}
                fill="rgba(120,125,135,0.8)" stroke="rgba(100,105,115,0.5)" strokeWidth="0.5" />
              <polygon points={`${left + 62},${substrateY - 30} ${left + 68},${substrateY - 48} ${left + 73},${substrateY - 35}`}
                fill="rgba(135,140,150,0.6)" stroke="none" />
              {/* Driftwood branch */}
              <path d={`M${left + innerW - 80},${substrateY} Q${left + innerW - 60},${substrateY - 50} ${left + innerW - 40},${substrateY - 65} Q${left + innerW - 25},${substrateY - 55} ${left + innerW - 30},${substrateY - 42}`}
                stroke="rgba(130,90,60,0.75)" strokeWidth="4" fill="none" strokeLinecap="round" />
              <path d={`M${left + innerW - 60},${substrateY - 28} Q${left + innerW - 45},${substrateY - 40} ${left + innerW - 38},${substrateY - 35}`}
                stroke="rgba(130,90,60,0.6)" strokeWidth="2.5" fill="none" strokeLinecap="round" />
              {/* Carpet plant (small green rectangles) */}
              {[3, 2, 5, 1, 4, 2].map((offset, i) => (
                <rect key={`carpet-${i}`}
                  x={left + 25 + i * 18}
                  y={substrateY - 4 - offset}
                  width="8" height="6" rx="1"
                  fill="rgba(58,175,92,0.65)" />
              ))}
            </g>
          )}

          {/* Biotope: driftwood, leaf litter, tannin water */}
          {isBiotope && (
            <g>
              {/* Large driftwood */}
              <path d={`M${left + innerW - 100},${substrateY} Q${left + innerW - 70},${substrateY - 70} ${left + innerW - 30},${substrateY - 40} Q${left + innerW - 10},${substrateY - 25} ${left + innerW - 20},${substrateY - 15}`}
                stroke="rgba(100,65,35,0.7)" strokeWidth="5" fill="none" strokeLinecap="round" />
              <path d={`M${left + innerW - 70},${substrateY - 45} Q${left + innerW - 55},${substrateY - 55} ${left + innerW - 40},${substrateY - 42}`}
                stroke="rgba(100,65,35,0.5)" strokeWidth="3" fill="none" strokeLinecap="round" />
              {/* Leaf litter on substrate */}
              {Array.from({ length: 8 }, (_, i) => (
                <ellipse key={`leaf-${i}`}
                  cx={left + 15 + i * (innerW / 9)} cy={substrateY - 2 - (i % 2) * 4}
                  rx="7" ry="3"
                  fill={`rgba(${140 + i * 5},${90 + i * 3},${50 - i * 2},0.55)`}
                  transform={`rotate(${(i - 4) * 5} ${left + 15 + i * (innerW / 9)} ${substrateY - 2})`} />
              ))}
              {/* Floating botanicals */}
              <ellipse cx={left + innerW - 50} cy={top + 40} rx="5" ry="2.5"
                fill="rgba(160,120,60,0.3)" style={{ animation: 'drift-leaf 4s ease-in-out infinite' }} />
            </g>
          )}

          {/* Breeding: spawning cone, soft green water */}
          {isBreeding && (
            <g>
              {/* Spawning cone */}
              <polygon points={`${cx - 14},${substrateY} ${cx},${substrateY - 38} ${cx + 14},${substrateY}`}
                fill="rgba(180,120,80,0.45)" stroke="rgba(160,100,60,0.35)" strokeWidth="1" />
              {/* Fish pair (small silhouettes) */}
              <g transform={`translate(${left + 40}, ${top + 75})`}
                style={{ animation: 'swim 5s ease-in-out infinite alternate' }}>
                <ellipse cx="0" cy="0" rx="8" ry="3.5" fill="rgba(255,255,255,0.4)" />
                <polygon points="8,0 14,-5 14,5" fill="rgba(255,255,255,0.3)" />
                <circle cx="-6" cy="-1" r="1" fill="rgba(30,30,30,0.3)" />
              </g>
              <g transform={`translate(${left + innerW - 55}, ${top + 55})`}
                style={{ animation: 'swim 6s ease-in-out infinite alternate 1s' }}>
                <ellipse cx="0" cy="0" rx="7" ry="3" fill="rgba(255,255,255,0.35)" />
                <polygon points="7,0 12,-4 12,4" fill="rgba(255,255,255,0.25)" />
                <circle cx="-5" cy="-1" r="1" fill="rgba(30,30,30,0.3)" />
              </g>
            </g>
          )}

          {/* Quarantine: bare, medical, sterile */}
          {isQuarantine && (
            <g>
              {/* Medical cross */}
              <g style={{ animation: 'pulse-medical 2s ease-in-out infinite' }}>
                <rect x={cx - 4} y={top + 60} width="8" height="24" rx="1" fill="rgba(245,108,108,0.4)" />
                <rect x={cx - 12} y={top + 68} width="24" height="8" rx="1" fill="rgba(245,108,108,0.4)" />
              </g>
              {/* Bare glass indicator — no substrate, no plants */}
            </g>
          )}

          {/* Shrimp-specific: moss ball + rock */}
          {isShrimp && (
            <g>
              {/* Moss-covered rock */}
              <ellipse cx={left + 60} cy={substrateY - 4} rx="14" ry="10"
                fill="rgba(100,110,105,0.5)" />
              <ellipse cx={left + 57} cy={substrateY - 7} rx="16" ry="6"
                fill="rgba(58,175,92,0.45)" />
              <ellipse cx={left + 63} cy={substrateY - 9} rx="10" ry="5"
                fill="rgba(72,195,112,0.4)" />
              {/* Shrimp (small, on substrate) */}
              <g transform={`translate(${left + 45}, ${substrateY - 8})`}>
                <ellipse cx="0" cy="0" rx="5" ry="2.5" fill="rgba(255,107,74,0.7)" />
                <path d="M-5,0 Q-10,-4 -12,-1" stroke="rgba(255,107,74,0.5)" strokeWidth="0.8" fill="none" />
                <circle cx="3" cy="-1.5" r="0.8" fill="rgba(30,30,30,0.4)" />
              </g>
              {/* Another shrimp */}
              <g transform={`translate(${left + innerW - 60}, ${substrateY - 5}) scale(-1,1)`}>
                <ellipse cx="0" cy="0" rx="4" ry="2" fill="rgba(255,140,100,0.55)" />
                <path d="M-4,0 Q-8,-3 -10,0" stroke="rgba(255,140,100,0.4)" strokeWidth="0.7" fill="none" />
                <circle cx="2.5" cy="-1" r="0.6" fill="rgba(30,30,30,0.35)" />
              </g>
            </g>
          )}

          {/* ── Plants (for planted / aquascape types) ── */}
          {showPlants && (
            <>
              {/* Left plant — tall stem */}
              <g style={{ transformOrigin: `${left + 50}px ${substrateY}px`, animation: 'sway 3s ease-in-out infinite' }}>
                <path d={`M${left + 48},${substrateY} Q${left + 44},${substrateY - 50} ${left + 38},${substrateY - 80}`}
                  stroke="rgba(45,138,78,0.7)" strokeWidth="2.5" fill="none" />
                {[1, 2, 3, 4, 5].map((n, i) => (
                  <ellipse key={`ls-${n}`}
                    cx={left + 38 - (i % 2) * 5}
                    cy={substrateY - 15 - i * 14}
                    rx={6 - i * 0.5} ry={9 - i * 0.5}
                    fill="rgba(58,175,92,0.7)"
                    transform={`rotate(${-15 + i * 3} ${left + 38 - (i % 2) * 5} ${substrateY - 15 - i * 14})`} />
                ))}
              </g>
              {/* Left plant — broad leaf */}
              <g style={{ transformOrigin: `${left + 55}px ${substrateY}px`, animation: 'sway-gentle 3.5s ease-in-out infinite 0.3s' }}>
                <path d={`M${left + 54},${substrateY} Q${left + 56},${substrateY - 30} ${left + 50},${substrateY - 55}`}
                  stroke="rgba(40,120,65,0.7)" strokeWidth="2" fill="none" />
                <ellipse cx={left + 48} cy={substrateY - 42} rx="7" ry="11"
                  fill="rgba(62,185,100,0.7)" transform={`rotate(-10 ${left + 48} ${substrateY - 42})`} />
                <ellipse cx={left + 53} cy={substrateY - 48} rx="6" ry="9"
                  fill="rgba(78,200,110,0.65)" transform={`rotate(5 ${left + 53} ${substrateY - 48})`} />
              </g>
              {/* Right plant — bushy stem */}
              <g style={{ transformOrigin: `${left + innerW - 40}px ${substrateY}px`, animation: 'sway 3.5s ease-in-out infinite 0.5s' }}>
                <path d={`M${left + innerW - 42},${substrateY} Q${left + innerW - 38},${substrateY - 45} ${left + innerW - 32},${substrateY - 75}`}
                  stroke="rgba(45,138,78,0.7)" strokeWidth="2.5" fill="none" />
                {[1, 2, 3, 4, 5].map((n, i) => (
                  <ellipse key={`rs-${n}`}
                    cx={left + innerW - 32 - (i % 2) * 6}
                    cy={substrateY - 12 - i * 13}
                    rx={7 - i * 0.5} ry={10 - i * 0.5}
                    fill="rgba(50,165,85,0.7)"
                    transform={`rotate(${10 - i * 2} ${left + innerW - 32 - (i % 2) * 6} ${substrateY - 12 - i * 13})`} />
                ))}
              </g>
              {/* Right plant — grass blade */}
              <g style={{ transformOrigin: `${left + innerW - 50}px ${substrateY}px`, animation: 'sway-gentle 4s ease-in-out infinite' }}>
                <path d={`M${left + innerW - 55},${substrateY} Q${left + innerW - 52},${substrateY - 40} ${left + innerW - 48},${substrateY - 65}`}
                  stroke="rgba(60,160,80,0.6)" strokeWidth="1.5" fill="none" />
                <path d={`M${left + innerW - 52},${substrateY} Q${left + innerW - 48},${substrateY - 35} ${left + innerW - 44},${substrateY - 55}`}
                  stroke="rgba(65,170,90,0.55)" strokeWidth="1.5" fill="none" />
              </g>
            </>
          )}

          {/* ── Fish silhouette for types that have them ── */}
          {!isQuarantine && !isShrimp && (
            <g transform={`translate(${left + 30}, ${top + 55})`}
              style={{ animation: 'swim 6s ease-in-out infinite alternate' }}>
              <ellipse cx="0" cy="0" rx="10" ry="4.5" fill="rgba(255,255,255,0.35)" />
              <polygon points="10,0 17,-7 17,7" fill="rgba(255,255,255,0.25)" />
              <circle cx="-7" cy="-1.5" r="1.2" fill="rgba(30,30,30,0.35)" />
            </g>
          )}

          {/* ── Substrate layer ── */}
          {subColor && (
            <g>
              <rect x={left} y={substrateY} width={innerW} height={substrateH} rx="2"
                fill={subColor} opacity="0.75" />
              {/* Substrate texture dots */}
              {Array.from({ length: 14 }, (_, i) => (
                <circle key={`sub-${i}`}
                  cx={left + 8 + i * (innerW / 15)}
                  cy={substrateY + 3 + (i % 3) * 5}
                  r={1.2 + (i % 3) * 0.5}
                  fill={`rgba(255,255,255,${0.08 + (i % 3) * 0.04})`} />
              ))}
            </g>
          )}

          {/* ── Bubbles ── */}
          {!isQuarantine && (
            <>
              <circle cx={left + innerW * 0.12} cy={top + innerH - 30} r="4"
                fill="rgba(255,255,255,0.4)"
                style={{ animation: 'bubble 3s ease-in infinite' }} />
              <circle cx={left + innerW * 0.35} cy={top + innerH - 20} r="3.5"
                fill="rgba(255,255,255,0.35)"
                style={{ animation: 'bubble 2.5s ease-in infinite 0.8s' }} />
              <circle cx={left + innerW * 0.60} cy={top + innerH - 45} r="5"
                fill="rgba(255,255,255,0.4)"
                style={{ animation: 'bubble 3.5s ease-in infinite 1.2s' }} />
              <circle cx={left + innerW * 0.50} cy={top + innerH - 25} r="3"
                fill="rgba(255,255,255,0.35)"
                style={{ animation: 'bubble 2.8s ease-in infinite 1.8s' }} />
              <circle cx={left + innerW * 0.22} cy={top + innerH - 60} r="3.5"
                fill="rgba(255,255,255,0.3)"
                style={{ animation: 'bubble-slow 3.2s ease-in infinite 0.4s' }} />
              <circle cx={left + innerW * 0.80} cy={top + innerH - 35} r="2.5"
                fill="rgba(255,255,255,0.3)"
                style={{ animation: 'bubble 2.2s ease-in infinite 2.0s' }} />
            </>
          )}
        </g>

        {/* ── Equipment overlays (outside water clip for clarity) ── */}

        {/* CO₂ indicator */}
        {hasCO2 && (
          <g transform={`translate(${w - 30}, 28)`}>
            <rect x="-4" y="-7" width="16" height="14" rx="2"
              fill="rgba(34,199,201,0.18)" stroke="rgba(34,199,201,0.35)" strokeWidth="0.5" />
            <text x="4" y="3" fontSize="7" fill="var(--aqua-accent)" textAnchor="middle" fontFamily="system-ui" fontWeight="600">
              CO₂
            </text>
          </g>
        )}

        {/* Heater indicator (for Other type) */}
        {t === 'Other' && (
          <g transform={`translate(${w - 50}, 34)`}>
            <rect x="0" y="0" width="4" height="28" rx="1" fill="rgba(245,108,108,0.25)" />
            <rect x="-2" y="14" width="8" height="4" rx="1" fill="rgba(245,108,108,0.3)" />
          </g>
        )}

        {/* Filter outlet ripple */}
        {(t === 'Other' || isPlanted) && (
          <g transform={`translate(${w - 22}, ${top + 30})`}>
            {[0, 1, 2].map(i => (
              <path key={`ripple-${i}`}
                d={`M0,${i * 12} Q4,${i * 12 - 5} 8,${i * 12}`}
                stroke="rgba(255,255,255,0.2)" strokeWidth="0.7" fill="none"
                style={{ animation: `bubble 2s ease-in infinite ${i * 0.7}s` }} />
            ))}
          </g>
        )}

        {/* ── Info text ── */}
        <text x={left + 5} y={substrateY + 8} fontSize="9"
          fill="rgba(255,255,255,0.45)" fontFamily="system-ui" fontWeight="500">
          {sizeL}L
        </text>
        {tank.Substrate && (
          <text x={left + 45} y={substrateY + 8} fontSize="8"
            fill="rgba(255,255,255,0.3)" fontFamily="system-ui">
            {tank.Substrate}
          </text>
        )}
      </svg>
    </div>
  );
}

export default TankVisual;
