type Props = {
    className?: string;
  };
  
  const chamferPath = (x: number, y: number, s: number, c: number) => {
    const x2 = x + s;
    const y2 = y + s;
    return `M${x} ${y + c}
            L${x + c} ${y}
            H${x2 - c}
            L${x2} ${y + c}
            V${y2 - c}
            L${x2 - c} ${y2}
            H${x + c}
            L${x} ${y2 - c}
            Z`;
  };
  
  export default function BoxingRingArt({ className = "" }: Props) {
    const C = 210;
  
    // Groq Orange
    const ORANGE = "#f43e01";
  
    // Neutrals (fallbacks to match your theme)
    const bg = "var(--background, #ffffff)";
    const n200 = "var(--neutral-200, #e5e5e5)";
    const n300 = "var(--neutral-300, #d4d4d4)";
    const n500 = "var(--neutral-500, #737373)";
    const n700 = "var(--neutral-700, #404040)";
  
    // Arena + ring geometry
    const pkg0 = 30;
    const pkg = 360;
  
    const ring0 = 80;
    const ring = 260;
  
    const ropeInset1 = 0;
    const ropeInset2 = 8;
    const ropeInset3 = 16;
  
    const canvas = 208;
    const canvas0 = C - canvas / 2; // 106
  
    // --- Seats (filled everywhere) ---
    const seatW = 12;
    const backH = 4;
    const seatH = 4;
    const seatGap = 1;
    const seatTotalH = backH + seatGap + seatH; // 9
  
    const seatPitch = 16;
    const seatInset = 14;
  
    const topRowY0 = ring0 - 8 - seatTotalH; // near ring
    const topRowY1 = topRowY0 - 12; // outer row
  
    const botRowY0 = ring0 + ring + 8; // near ring
    const botRowY1 = botRowY0 + 12; // outer row
  
    const xStart = ring0 + seatInset;
    const xEnd = ring0 + ring - seatInset - seatW;
    const seatXs: number[] = [];
    for (let x = xStart; x <= xEnd; x += seatPitch) seatXs.push(x);
  
    const yStart = ring0 + seatInset;
    const yEnd = ring0 + ring - seatInset - seatW;
    const seatYs: number[] = [];
    for (let y = yStart; y <= yEnd; y += seatPitch) seatYs.push(y);
  
    const sideNearX_L0 = ring0 - 8 - seatTotalH;
    const sideNearX_L1 = sideNearX_L0 - 12;
  
    const sideNearX_R0 = ring0 + ring + 8;
    const sideNearX_R1 = sideNearX_R0 + 12;
  
    // --- Chip-on-mat geometry (mat == chip) ---
    const chipMargin = 14;
    const chip0 = canvas0 + chipMargin;
    const chipS = canvas - chipMargin * 2; // 180
    const chipChamfer = 14;
  
    const lidMargin = 42;
    const lid0 = canvas0 + lidMargin;
    const lidS = canvas - lidMargin * 2; // 124
  
    // Pads around chip package
    const pad = 4;
    const padCount = 10;
    const padGap = (chipS - 28) / (padCount - 1);
    const padLine = Array.from({ length: padCount }, (_, i) => chip0 + 14 + i * padGap);
  
    // Decaps around the “lid”
    const capW = 10;
    const capH = 4;
    const capN = 8;
    const capStep = (lidS - 18) / (capN - 1);
  
    // Via fields (systematic)
    const via = 2;
    const viaN = 6;
    const viaStep = 7;
  
    const viaBlock = (x0: number, y0: number, key: string) =>
      Array.from({ length: viaN }).flatMap((_, r) =>
        Array.from({ length: viaN }).map((__, c) => (
          <rect
            key={`${key}-${r}-${c}`}
            x={x0 + c * viaStep}
            y={y0 + r * viaStep}
            width={via}
            height={via}
            fill={n500}
            opacity="0.18"
          />
        )),
      );
  
    // Straight fanout traces (representative, not “brackets”)
    const fanCount = 6;
    const fanIdx = [1, 3, 5, 6, 8, 9].slice(0, fanCount);
  
    return (
      <svg
        viewBox="0 0 420 420"
        className={className}
        fill="none"
        aria-label="Boxing ring chip illustration"
        shapeRendering="crispEdges"
      >
        <g strokeLinecap="square" strokeLinejoin="miter" vectorEffect="non-scaling-stroke">
          {/* Optional arena boundary (quiet) */}
          <path d={chamferPath(pkg0, pkg0, pkg, 18)} stroke={n300} strokeWidth="2" opacity="0.55" />
  
          {/* === Seats (top/bottom) filled === */}
          {[0, 1].map((row) => {
            const yTop = row === 0 ? topRowY0 : topRowY1;
            const yBot = row === 0 ? botRowY0 : botRowY1;
  
            // depth: inner row stronger
            const backOp = row === 0 ? 0.7 : 0.55;
            const seatOp = row === 0 ? 0.45 : 0.32;
  
            return (
              <g key={`tb-row-${row}`}>
                {seatXs.map((x, i) => (
                  <g key={`seat-tb-${row}-${i}`}>
                    {/* TOP */}
                    <rect x={x} y={yTop} width={seatW} height={backH} fill={ORANGE} opacity={backOp} rx="1" />
                    <rect
                      x={x}
                      y={yTop + backH + seatGap}
                      width={seatW}
                      height={seatH}
                      fill={ORANGE}
                      opacity={seatOp}
                      rx="1"
                    />
  
                    {/* BOTTOM */}
                    <rect x={x} y={yBot} width={seatW} height={backH} fill={ORANGE} opacity={backOp} rx="1" />
                    <rect
                      x={x}
                      y={yBot + backH + seatGap}
                      width={seatW}
                      height={seatH}
                      fill={ORANGE}
                      opacity={seatOp}
                      rx="1"
                    />
                  </g>
                ))}
              </g>
            );
          })}
  
          {/* === Seats (left/right) filled === */}
          {[0, 1].map((row) => {
            const xL = row === 0 ? sideNearX_L0 : sideNearX_L1;
            const xR = row === 0 ? sideNearX_R0 : sideNearX_R1;
  
            const backOp = row === 0 ? 0.7 : 0.55;
            const seatOp = row === 0 ? 0.45 : 0.32;
  
            // Vertical seat: backrest is outer slab, seat is inner slab
            const backW = backH;
            const seatWv = seatH;
  
            return (
              <g key={`lr-row-${row}`}>
                {seatYs.map((y, i) => (
                  <g key={`seat-lr-${row}-${i}`}>
                    {/* LEFT */}
                    <rect x={xL} y={y} width={backW} height={seatW} fill={ORANGE} opacity={backOp} rx="1" />
                    <rect
                      x={xL + backW + seatGap}
                      y={y}
                      width={seatWv}
                      height={seatW}
                      fill={ORANGE}
                      opacity={seatOp}
                      rx="1"
                    />
  
                    {/* RIGHT */}
                    <rect
                      x={xR + seatWv + seatGap}
                      y={y}
                      width={backW}
                      height={seatW}
                      fill={ORANGE}
                      opacity={backOp}
                      rx="1"
                    />
                    <rect x={xR} y={y} width={seatWv} height={seatW} fill={ORANGE} opacity={seatOp} rx="1" />
                  </g>
                ))}
              </g>
            );
          })}
  
          {/* === Ring ropes (reads as ring) === */}
          <rect
            x={ring0 + ropeInset1}
            y={ring0 + ropeInset1}
            width={ring - ropeInset1 * 2}
            height={ring - ropeInset1 * 2}
            stroke={n700}
            strokeWidth="2"
            opacity="0.6"
          />
          <rect
            x={ring0 + ropeInset2}
            y={ring0 + ropeInset2}
            width={ring - ropeInset2 * 2}
            height={ring - ropeInset2 * 2}
            stroke={n500}
            strokeWidth="2"
            opacity="0.35"
          />
          <rect
            x={ring0 + ropeInset3}
            y={ring0 + ropeInset3}
            width={ring - ropeInset3 * 2}
            height={ring - ropeInset3 * 2}
            stroke={n300}
            strokeWidth="2"
            opacity="0.22"
          />
  
          {/* Rope ties */}
          <g fill={n300} opacity="0.55">
            {Array.from({ length: 6 }).map((_, i) => {
              const t = ring0 + (i + 1) * (ring / 7);
              return (
                <g key={`tie-${i}`}>
                  <rect x={t - 1} y={ring0 - 2} width="2" height="4" />
                  <rect x={t - 1} y={ring0 + ring - 2} width="2" height="4" />
                  <rect x={ring0 - 2} y={t - 1} width="4" height="2" />
                  <rect x={ring0 + ring - 2} y={t - 1} width="4" height="2" />
                </g>
              );
            })}
          </g>
  
          {/* Corner posts */}
          {[
            [ring0, ring0],
            [ring0 + ring, ring0],
            [ring0, ring0 + ring],
            [ring0 + ring, ring0 + ring],
          ].map(([x, y], i) => (
            <g key={`post-${i}`}>
              <rect x={x - 8} y={y - 8} width="16" height="16" fill={bg} stroke={n300} strokeWidth="2" />
              <rect x={x - 4} y={y - 4} width="8" height="8" fill={n200} opacity="0.95" />
            </g>
          ))}
  
          {/* === Mat = Chip === */}
          {/* Mat base */}
          <rect x={canvas0} y={canvas0} width={canvas} height={canvas} fill={bg} stroke={n300} strokeWidth="1.5" />
  
          {/* Chip package outline */}
          <path d={chamferPath(chip0, chip0, chipS, chipChamfer)} fill={bg} stroke={n300} strokeWidth="2" />
  
          {/* Package pads (ALL neutral — no orange dashes) */}
          <g opacity="0.78">
            {padLine.map((p, i) => (
              <g key={`pads-${i}`}>
                {/* top */}
                <rect x={p} y={chip0 - 8} width={pad} height={pad} fill={n200} opacity={0.55} />
                {/* bottom */}
                <rect x={p} y={chip0 + chipS + 4} width={pad} height={pad} fill={n200} opacity={0.55} />
                {/* left */}
                <rect x={chip0 - 8} y={p} width={pad} height={pad} fill={n200} opacity={0.55} />
                {/* right */}
                <rect x={chip0 + chipS + 4} y={p} width={pad} height={pad} fill={n200} opacity={0.55} />
              </g>
            ))}
          </g>
  
          {/* Central lid / die */}
          <rect x={lid0} y={lid0} width={lidS} height={lidS} fill={bg} stroke={n300} strokeWidth="2" />
          <rect x={lid0 + 10} y={lid0 + 10} width={lidS - 20} height={lidS - 20} stroke={n200} strokeWidth="2" opacity="0.6" />
  
          {/* Decap banks (systematic) */}
          <g fill={n200} opacity="0.32">
            {Array.from({ length: capN }).map((_, i) => {
              const p = lid0 + 9 + i * capStep;
              return (
                <g key={`cap-${i}`}>
                  {/* top band */}
                  <rect x={p} y={lid0 - 18} width={capW} height={capH} />
                  {/* bottom band */}
                  <rect x={p} y={lid0 + lidS + 14} width={capW} height={capH} />
                  {/* left band */}
                  <rect x={lid0 - 18} y={p} width={capH} height={capW} />
                  {/* right band */}
                  <rect x={lid0 + lidS + 14} y={p} width={capH} height={capW} />
                </g>
              );
            })}
          </g>
  
          {/* Straight fanout traces (neutral) */}
          <g stroke={n300} strokeWidth="1.5" opacity="0.55">
            {/* top/bottom */}
            {fanIdx.map((k) => {
              const x = padLine[k] + pad / 2;
              return (
                <g key={`fan-tb-${k}`}>
                  <path d={`M${x} ${chip0 - 4} V${lid0 - 10}`} />
                  <path d={`M${x} ${chip0 + chipS + 6} V${lid0 + lidS + 10}`} />
                </g>
              );
            })}
            {/* left/right */}
            {fanIdx.map((k) => {
              const y = padLine[k] + pad / 2;
              return (
                <g key={`fan-lr-${k}`}>
                  <path d={`M${chip0 - 4} ${y} H${lid0 - 10}`} />
                  <path d={`M${chip0 + chipS + 6} ${y} H${lid0 + lidS + 10}`} />
                </g>
              );
            })}
          </g>
  
          {/* Via fields (4 quadrants) */}
          {viaBlock(lid0 - 22, lid0 - 22, "vTL")}
          {viaBlock(lid0 + lidS + 6, lid0 - 22, "vTR")}
          {viaBlock(lid0 - 22, lid0 + lidS + 6, "vBL")}
          {viaBlock(lid0 + lidS + 6, lid0 + lidS + 6, "vBR")}
  
          {/* Real Groq logo in the middle.*/}
          <g shapeRendering="auto">
            <image
              href="/groqLogos/Bolt + Groq Orange.svg"
              x={C - 46.4}
              y={C - 9.6}
              width={92.8}
              height={28.8}
              preserveAspectRatio="xMidYMid meet"
              opacity="0.16"
            />
          </g>
        </g>
      </svg>
    );
  }
  