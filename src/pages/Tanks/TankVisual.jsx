const visualStyles = `
@keyframes bubble {
  0% { transform: translateY(0); opacity: 0.5; }
  50% { opacity: 0.8; }
  100% { transform: translateY(-80px); opacity: 0; }
}
@keyframes sway {
  0%, 100% { transform: rotate(-2deg); }
  50% { transform: rotate(2deg); }
}
@keyframes waterShift {
  0%, 100% { transform: translateY(0); }
  50% { transform: translateY(-2px); }
}
`;

function TankVisual({ tank }) {
  const isPlanted = tank.TankType === 'PlantedHighTech' || tank.TankType === 'PlantedLowTech';
  const isAquascape = tank.TankType === 'Aquascape';
  const isShrimp = tank.TankType === 'Shrimp';
  const hasCO2 = tank.Co2Injection;
  const showPlants = isPlanted || isAquascape;

  const sizeL = tank.SizeLiters || 60;
  const aspectW = Math.min(Math.max(sizeL / 60, 0.6), 1.6);

  return (
    <div style={{ position: 'relative', maxWidth: 360, margin: '0 auto' }}>
      <style>{visualStyles}</style>
      <svg viewBox={`0 0 ${Math.round(300 * aspectW)} 200`} width="100%" style={{ display: 'block' }}>
        <defs>
          <linearGradient id="waterGrad" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="rgba(100,180,220,0.25)" />
            <stop offset="100%" stopColor="rgba(30,100,160,0.35)" />
          </linearGradient>
          <linearGradient id="glassGrad" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stopColor="rgba(200,230,255,0.3)" />
            <stop offset="50%" stopColor="rgba(255,255,255,0.05)" />
            <stop offset="100%" stopColor="rgba(180,210,240,0.2)" />
          </linearGradient>
        </defs>

        <rect x="10" y="10" width={280 * aspectW} height="180" rx="3" ry="3"
          fill="url(#glassGrad)" stroke="rgba(135,206,235,0.5)" strokeWidth="1.5" />

        <rect x="14" y="22" width={272 * aspectW} height="164" rx="2" ry="2"
          fill="url(#waterGrad)" style={{ transformOrigin: `${14 + 136 * aspectW}px 104px`, animation: 'waterShift 4s ease-in-out infinite' }} />

        <rect x="14" y="168" width={272 * aspectW} height="18" rx="2" ry="2"
          fill="rgba(196,164,108,0.7)" />

        {showPlants && (
          <g style={{ transformOrigin: `${14 + 50 * aspectW}px 168px`, animation: 'sway 3s ease-in-out infinite' }}>
            <path d={`M${16 + 44 * aspectW},168 Q${16 + 42 * aspectW},145 ${16 + 38 * aspectW},125`} stroke="#2d8a4e" strokeWidth="2" fill="none" />
            <ellipse cx={16 + 38 * aspectW} cy="120" rx="8" ry="12" fill="#3aaf5c" transform={`rotate(-15 ${16 + 38 * aspectW} 120)`} />
            <ellipse cx={16 + 34 * aspectW} cy="130" rx="6" ry="9" fill="#4ec96d" transform={`rotate(10 ${16 + 34 * aspectW} 130)`} />
          </g>
        )}

        {showPlants && (
          <g style={{ transformOrigin: `${14 + 230 * aspectW}px 168px`, animation: 'sway 3.5s ease-in-out infinite 0.5s' }}>
            <path d={`M${14 + 226 * aspectW},168 Q${14 + 228 * aspectW},140 ${14 + 232 * aspectW},115`} stroke="#2d8a4e" strokeWidth="2" fill="none" />
            <ellipse cx={14 + 232 * aspectW} cy="110" rx="10" ry="14" fill="#3aaf5c" transform={`rotate(10 ${14 + 232 * aspectW} 110)`} />
            <ellipse cx={14 + 237 * aspectW} cy="122" rx="7" ry="10" fill="#4ec96d" transform={`rotate(-10 ${14 + 237 * aspectW} 122)`} />
          </g>
        )}

        {isShrimp && (
          <g transform={`translate(${48 * aspectW}, 145)`}>
            <ellipse cx="0" cy="0" rx="6" ry="3" fill="#ff6b4a" opacity="0.8" />
            <path d="M-6,0 Q-12,-5 -14,-1" stroke="#ff6b4a" strokeWidth="1" fill="none" opacity="0.7" />
            <circle cx="4" cy="-2" r="1" fill="#222" />
          </g>
        )}

        <circle cx={14 + 35 * aspectW} cy="90" r="4" fill="rgba(255,255,255,0.45)" style={{ transformOrigin: `${14 + 35 * aspectW}px 90px`, animation: 'bubble 3s ease-in infinite' }} />
        <circle cx={14 + 120 * aspectW} cy="125" r="3.5" fill="rgba(255,255,255,0.4)" style={{ transformOrigin: `${14 + 120 * aspectW}px 125px`, animation: 'bubble 2.5s ease-in infinite 0.8s' }} />
        <circle cx={14 + 200 * aspectW} cy="70" r="5" fill="rgba(255,255,255,0.45)" style={{ transformOrigin: `${14 + 200 * aspectW}px 70px`, animation: 'bubble 3.5s ease-in infinite 1.2s' }} />
        <circle cx={14 + 160 * aspectW} cy="100" r="3" fill="rgba(255,255,255,0.4)" style={{ transformOrigin: `${14 + 160 * aspectW}px 100px`, animation: 'bubble 2.8s ease-in infinite 1.8s' }} />
        <circle cx={14 + 75 * aspectW} cy="55" r="3.5" fill="rgba(255,255,255,0.35)" style={{ transformOrigin: `${14 + 75 * aspectW}px 55px`, animation: 'bubble 3.2s ease-in infinite 0.4s' }} />

        {hasCO2 && (
          <g transform={`translate(${280 * aspectW - 10}, 28)`}>
            <rect x="-2" y="-6" width="14" height="12" rx="2" fill="rgba(100,200,100,0.4)" stroke="rgba(100,200,100,0.6)" strokeWidth="0.5" />
            <text x="5" y="3" fontSize="7" fill="rgba(255,255,255,0.8)" textAnchor="middle" fontFamily="system-ui">CO₂</text>
          </g>
        )}

        <text x={14 + 40 * aspectW} y="155" fontSize="10" fill="rgba(255,255,255,0.5)" fontFamily="system-ui">
          {sizeL}L
        </text>
        {tank.Substrate && (
          <text x={14 + 40 * aspectW} y="145" fontSize="8" fill="rgba(255,255,255,0.35)" fontFamily="system-ui">
            {tank.Substrate}
          </text>
        )}
      </svg>
    </div>
  );
}

export default TankVisual;
