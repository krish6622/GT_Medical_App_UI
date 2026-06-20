/**
 * Self-contained, premium warehouse/logistics scene used as the login hero fallback.
 * No people, no watermark, fully offline. Drop a real photo at /public/hero.jpg to override.
 */
export function WarehouseScene({ className = "" }: { className?: string }) {
  const VPX = 600, VPY = 330;
  // Carton palette — muted, premium (cool slates + a hint of sky/teal/amber).
  const palette = ["#334155", "#3b4d66", "#1e3a5f", "#2a4a52", "#3d3a2a", "#2d3b52"];

  // Build one receding shelf bank (a column of bays) on a side.
  function bank(side: "L" | "R") {
    const dir = side === "L" ? -1 : 1;
    const baseX = 600 + dir * 560; // front (near) x at the floor edge
    const rows = [820, 690, 560, 450]; // shelf y positions (near -> far up)
    const bays = 4;
    const nodes = [];
    // shelving uprights + beams receding to the vanishing point
    for (let b = 0; b <= bays; b++) {
      const t = b / bays;
      const x = baseX + (VPX - baseX) * t * 0.78;
      const yTop = 360 + (VPY - 360) * t * 0.2;
      nodes.push(
        <line key={`${side}-up-${b}`} x1={x} y1="860" x2={x} y2={yTop} stroke="#0b1220" strokeWidth={3} opacity={0.7 - t * 0.4} />
      );
    }
    rows.forEach((y, ri) => {
      const yFar = y + (VPY - y) * 0.42;
      const xFar = baseX + (VPX - baseX) * 0.62;
      nodes.push(
        <line key={`${side}-beam-${ri}`} x1={baseX} y1={y} x2={xFar} y2={yFar} stroke="#0b1220" strokeWidth={2.5} opacity={0.55} />
      );
      // cartons on the two nearest bays
      for (let c = 0; c < 5; c++) {
        const t = c / 6;
        const x = baseX + (xFar - baseX) * t;
        const yy = y + (yFar - y) * t;
        const w = (1 - t) * 60 + 14;
        const h = (1 - t) * 42 + 10;
        nodes.push(
          <rect key={`${side}-box-${ri}-${c}`} x={dir < 0 ? x : x - w} y={yy - h} width={w} height={h} rx={2}
            fill={palette[(ri * 3 + c) % palette.length]} opacity={0.85 - t * 0.4}
            stroke="#0b1220" strokeWidth={1} />
        );
      }
    });
    return <g key={side}>{nodes}</g>;
  }

  return (
    <svg className={className} viewBox="0 0 1200 900" preserveAspectRatio="xMidYMid slice" aria-hidden="true">
      <defs>
        <linearGradient id="sky" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#0b1326" />
          <stop offset="55%" stopColor="#0f1d36" />
          <stop offset="100%" stopColor="#0a1424" />
        </linearGradient>
        <radialGradient id="lamp" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor="#7dd3fc" stopOpacity="0.55" />
          <stop offset="100%" stopColor="#7dd3fc" stopOpacity="0" />
        </radialGradient>
        <radialGradient id="vignette" cx="50%" cy="42%" r="75%">
          <stop offset="55%" stopColor="#000000" stopOpacity="0" />
          <stop offset="100%" stopColor="#020617" stopOpacity="0.85" />
        </radialGradient>
        <linearGradient id="floor" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#10203a" />
          <stop offset="100%" stopColor="#0a1322" />
        </linearGradient>
      </defs>

      <rect width="1200" height="900" fill="url(#sky)" />

      {/* ceiling light strips, angled toward the vanishing point */}
      {[-260, -90, 90, 260].map((dx, i) => (
        <g key={i}>
          <ellipse cx={VPX + dx} cy={120 + Math.abs(dx) * 0.05} rx={150} ry={26} fill="url(#lamp)" />
          <rect x={VPX + dx - 60} y={118 + Math.abs(dx) * 0.05} width={120} height={5} rx={3} fill="#bae6fd" opacity={0.5} />
        </g>
      ))}

      {/* floor */}
      <polygon points={`0,900 1200,900 ${VPX + 220},${VPY + 90} ${VPX - 220},${VPY + 90}`} fill="url(#floor)" />
      {/* floor perspective lines */}
      {[-560, -360, -180, 0, 180, 360, 560].map((dx, i) => (
        <line key={i} x1={VPX + dx * 2.1} y1="900" x2={VPX + dx * 0.18} y2={VPY + 80} stroke="#1b2c49" strokeWidth={1.5} opacity={0.6} />
      ))}
      {[760, 830, 895].map((y, i) => (
        <line key={`h-${i}`} x1="0" y1={y} x2="1200" y2={y} stroke="#16263f" strokeWidth={1} opacity={0.5} />
      ))}

      {bank("L")}
      {bank("R")}

      {/* soft bokeh highlights */}
      <circle cx="300" cy="220" r="6" fill="#7dd3fc" opacity="0.5" />
      <circle cx="900" cy="180" r="5" fill="#bae6fd" opacity="0.45" />
      <circle cx="720" cy="260" r="4" fill="#7dd3fc" opacity="0.4" />

      <rect width="1200" height="900" fill="url(#vignette)" />
    </svg>
  );
}
