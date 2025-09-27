import { writeFileSync, mkdirSync } from 'node:fs';
import { join } from 'node:path';

const OUT = 'assets/svg/headers';
mkdirSync(OUT, { recursive: true });

const common = (title, desc, body) => `<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" role="img" aria-labelledby="title desc"
     viewBox="0 0 1200 240" width="1200" height="240" preserveAspectRatio="xMidYMid meet">
  <title id="title">${title}</title>
  <desc id="desc">${desc}</desc>
  <defs>
    <linearGradient id="g" x1="0" x2="1" y1="0" y2="0">
      <stop offset="0%" stop-color="#0ea5e9"/>
      <stop offset="100%" stop-color="#22d3ee"/>
    </linearGradient>
    <pattern id="dots" width="20" height="20" patternUnits="userSpaceOnUse">
      <circle cx="2" cy="2" r="1" fill="#0ea5e922"/>
    </pattern>
  </defs>
  <style>
    @keyframes drift { from { transform: translateX(0) } to { transform: translateX(-200px) } }
    @keyframes pulse { 0%,100% { opacity:.8 } 50% { opacity:1 } }
    @keyframes sweep { 0% { transform: translateX(-1200px) } 100% { transform: translateX(1200px) } }
    @keyframes rotate { from { transform: rotate(0deg) } to { transform: rotate(360deg) } }
    @keyframes orbit { from { transform: rotate(0deg) } to { transform: rotate(360deg) } }
    @keyframes shimmer { 0%,100% { opacity: 0.3 } 50% { opacity: 0.8 } }
    @keyframes draw { from { stroke-dasharray: 0,800 } to { stroke-dasharray: 800,0 } }
    @keyframes march { from { stroke-dashoffset: 0 } to { stroke-dashoffset: 12 } }

    /* reduce motion */
    @media (prefers-reduced-motion: reduce) {
      * { animation: none !important }
    }

    .bg { fill: url(#dots) }
    .accent { fill: url(#g) }
    .stroke { stroke: url(#g); stroke-width: 2; fill: none; opacity: .7 }
    .drift { animation: drift 60s linear infinite }
    .pulse { animation: pulse 4s ease-in-out infinite }
    .sweep { animation: sweep 8s linear infinite }
    .rotate { animation: rotate 20s linear infinite }
    .orbit { animation: orbit 6s linear infinite }
    .shimmer { animation: shimmer 3s ease-in-out infinite }
    .draw { animation: draw 3s ease-in-out forwards }
    .march { animation: march 1s linear infinite }
    text.title { font-size: 42px; font-weight: 700; fill: #0b1220; font-family: system-ui, -apple-system, Segoe UI, Roboto, Ubuntu, Cantarell, 'Helvetica Neue', Arial, 'Noto Sans', 'Liberation Sans', sans-serif; }
    text.sub { font-size: 18px; fill: #0b122099; font-family: system-ui, -apple-system, Segoe UI, Roboto, Ubuntu, Cantarell, 'Helvetica Neue', Arial, 'Noto Sans', 'Liberation Sans', sans-serif; }
  </style>
  <rect class="bg" x="0" y="0" width="1200" height="240"/>
  ${body}
</svg>`;

const pages = [
  {
    file: 'tools-overview.svg',
    title: 'Phys-MCP Tools',
    desc: 'Flowing field lines over a physics grid, representing tool orchestration.',
    body: `
      <!-- moving field lines -->
      <g class="drift" transform="translate(0,0)">
        ${Array.from({length:7}).map((_,i)=>`
          <path class="stroke" d="M -100 ${40+i*25} C 200 ${20+i*25}, 400 ${60+i*25}, 700 ${30+i*25}" />
        `).join('')}
      </g>
      <!-- title -->
      <g transform="translate(40,150)">
        <text class="title">Phys-MCP · Tooling Overview</text>
        <text class="sub" y="28">Composable tools, reproducible physics workflows</text>
      </g>`
  },
  {
    file: 'cas-toolkit.svg',
    title: 'CAS Toolkit',
    desc: 'Interlocking rings hinting at symbolic algebra gears with a blinking caret.',
    body: `
      <g transform="translate(1020,120)">
        ${[0,1,2].map(i=>`
          <circle r="${28+i*10}" class="stroke" transform="rotate(${i*20})">
            <animateTransform attributeName="transform" type="rotate" from="0" to="${i%2==0?'360':'-360'}" dur="${20+i*8}s" repeatCount="indefinite"/>
          </circle>
        `).join('')}
      </g>
      <g transform="translate(40,150)">
        <text class="title">CAS Toolkit</text>
        <text class="sub" y="28">Symbolic • Units • Simplification</text>
      </g>
      <!-- blinking caret -->
      <rect x="420" y="120" width="2" height="28" fill="#0b1220">
        <animate attributeName="opacity" values="1;0;1" dur="1.2s" repeatCount="indefinite"/>
      </rect>`
  },
  {
    file: 'quantum-tools.svg',
    title: 'Quantum Tools',
    desc: 'Orbitals with orbiting electrons and a shimmering wave band.',
    body: `
      <g transform="translate(1040,120)">
        <ellipse rx="70" ry="28" class="stroke"/>
        <ellipse rx="70" ry="28" class="stroke" transform="rotate(60)"/>
        <ellipse rx="70" ry="28" class="stroke" transform="rotate(-60)"/>
        ${[0,120,240].map(a=>`
          <circle r="4" class="accent">
            <animateMotion dur="6s" repeatCount="indefinite" path="M 70 0 A 70 28 0 1 1 -70 0 A 70 28 0 1 1 70 0" rotate="auto"/>
            <animateTransform attributeName="transform" type="rotate" from="${a}" to="${a+360}" dur="6s" repeatCount="indefinite"/>
          </circle>`).join('')}
      </g>
      <rect x="0" y="190" width="1200" height="8" class="accent pulse"/>
      <g transform="translate(40,150)">
        <text class="title">Quantum Tools</text>
        <text class="sub" y="28">States • Operators • Measurement</text>
      </g>`
  },
  {
    file: 'plotting-viz.svg',
    title: 'Plotting &amp; Viz',
    desc: 'Animated scanning sweep over axes with pulsing data points.',
    body: `
      <g transform="translate(860,50)">
        <rect x="0" y="0" width="280" height="140" fill="#ffffffaa" rx="8"/>
        <path d="M0,140 L0,0 L280,0" class="stroke"/>
        <g class="sweep">
          <rect x="0" y="0" width="40" height="140" fill="#22d3ee22"/>
        </g>
        ${[ [20,120], [60,90], [100,70], [140,60], [180,45], [220,30], [260,25] ].map(([x,y],i)=>`
          <circle cx="${x}" cy="${y}" r="4" class="accent pulse" style="animation-delay:${i*0.3}s"/>
        `).join('')}
      </g>
      <g transform="translate(40,150)">
        <text class="title">Plotting &amp; Visualization</text>
        <text class="sub" y="28">From quick looks to publication-ready</text>
      </g>`
  },
  {
    file: 'numerics-solvers.svg',
    title: 'Numerics &amp; Solvers',
    desc: 'Converging dots with "marching ants" bracket motif.',
    body: `
      ${Array.from({length:12}).map((_,i)=>`
        <circle cx="${200 + i*40}" cy="${120 + (Math.cos(i)*18).toFixed(1)}" r="${6 - i*0.3}" class="accent" style="opacity:${1 - i*0.05}"/>
      `).join('')}
      <rect x="180" y="84" width="380" height="72" fill="none" stroke="#0ea5e9" stroke-width="2" stroke-dasharray="6 6" class="march"/>
      <g transform="translate(40,150)">
        <text class="title">Numerics &amp; Solvers</text>
        <text class="sub" y="28">Stability • Convergence • Performance</text>
      </g>`
  },
  {
    file: 'educators.svg',
    title: 'Educators',
    desc: 'Chalkboard scribble underline with gentle dust specks.',
    body: `
      <rect x="760" y="40" width="380" height="160" fill="#0b1220" rx="10"/>
      <path d="M780,150 C 840,140 900,160 980,150 1060,140 1100,160 1120,150" stroke="#f9fafb" stroke-width="4" fill="none" class="draw"/>
      ${Array.from({length:18}).map((_,i)=>`
        <circle cx="${780 + Math.random()*320}" cy="${60 + Math.random()*120}" r="${Math.random()*1.5+0.3}" fill="#f9fafb" opacity=".15" class="pulse" style="animation-delay:${i*0.2}s"/>
      `).join('')}
      <g transform="translate(40,150)">
        <text class="title">For Educators</text>
        <text class="sub" y="28">Classroom-ready modules &amp; demos</text>
      </g>`
  },
  {
    file: 'data-io.svg',
    title: 'Data &amp; I/O',
    desc: 'Flowing data streams with file icons and connection lines.',
    body: `
      <g transform="translate(900,60)">
        ${Array.from({length:5}).map((_,i)=>`
          <rect x="${i*50}" y="20" width="30" height="40" fill="#ffffff" stroke="#0ea5e9" stroke-width="2" rx="4"/>
          <path d="M${15+i*50},10 L${15+i*50},20" stroke="#0ea5e9" stroke-width="2"/>
          <circle cx="${15+i*50}" cy="8" r="3" fill="#0ea5e9"/>
        `).join('')}
      </g>
      <g class="drift" transform="translate(0,0)">
        ${Array.from({length:4}).map((_,i)=>`
          <path class="stroke" d="M -50 ${80+i*20} C 200 ${60+i*20}, 400 ${100+i*20}, 800 ${70+i*20}" />
        `).join('')}
      </g>
      <g transform="translate(40,150)">
        <text class="title">Data &amp; I/O</text>
        <text class="sub" y="28">Import • Export • Processing</text>
      </g>`
  },
  {
    file: 'distributed.svg',
    title: 'Distributed Computing',
    desc: 'Network nodes with connecting lines and data flow.',
    body: `
      <g transform="translate(900,80)">
        ${[[0,0],[100,20],[200,0],[150,60],[50,60]].map(([x,y],i)=>`
          <circle cx="${x}" cy="${y}" r="12" class="accent pulse" style="animation-delay:${i*0.5}s"/>
          <text x="${x}" y="${y+4}" text-anchor="middle" fill="#0b1220" font-size="10" font-weight="bold">${i+1}</text>
        `).join('')}
        ${[[0,100],[100,20],[200,0],[150,60],[50,60]].map(([x,y],i)=>`
          <line x1="${x}" y1="${y}" x2="${(i+1)%5===0?0:(i+1)*50}" y2="${(i+1)%5===0?0:20+Math.sin(i)*20}" class="stroke" stroke-dasharray="4 4">
            <animate attributeName="stroke-dashoffset" from="0" to="8" dur="2s" repeatCount="indefinite"/>
          </line>
        `).join('')}
      </g>
      <g transform="translate(40,150)">
        <text class="title">Distributed Computing</text>
        <text class="sub" y="28">Jobs • Clusters • Collaboration</text>
      </g>`
  },
  {
    file: 'ml-ai.svg',
    title: 'ML &amp; AI Augmentation',
    desc: 'Neural network nodes with flowing connections and gradient patterns.',
    body: `
      <g transform="translate(900,60)">
        ${Array.from({length:3}).map((_,i)=>`
          <g transform="translate(${i*80},0)">
            ${Array.from({length:4}).map((_,j)=>`
              <circle cx="0" cy="${j*25}" r="8" class="accent pulse" style="animation-delay:${i*0.3+j*0.2}s"/>
              ${j<3?`<line x1="0" y1="${j*25+8}" x2="80" y2="${(j+1)*25-8}" class="stroke" stroke-width="1"/>`:''}
            `).join('')}
          </g>
        `).join('')}
      </g>
      <g transform="translate(40,150)">
        <text class="title">ML &amp; AI Augmentation</text>
        <text class="sub" y="28">Neural Networks • Pattern Recognition</text>
      </g>`
  }
];

for (const p of pages) {
  writeFileSync(join(OUT, p.file), common(p.title, p.desc, p.body));
}
console.log(`Wrote ${pages.length} animated headers to ${OUT}`);
