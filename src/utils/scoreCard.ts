import { GameStats } from '../types/game';

/**
 * Generate a viral, high-resolution arcade score card using Canvas
 * Aspect ratio: 1080x1350 (standard Instagram/TikTok story format)
 */
export async function generateScoreCard(
  stats: GameStats,
  playerName: string,
  rankTitle: string
): Promise<string> {
  const canvas = document.createElement('canvas');
  canvas.width = 1080;
  canvas.height = 1350;
  const ctx = canvas.getContext('2d');
  if (!ctx) throw new Error('Could not get canvas context');

  // 1. Deep Obsidian Gradient Background
  const bgGrad = ctx.createLinearGradient(0, 0, 1080, 1350);
  bgGrad.addColorStop(0, '#06060c');
  bgGrad.addColorStop(0.5, '#0d0d1a');
  bgGrad.addColorStop(1, '#050508');
  ctx.fillStyle = bgGrad;
  ctx.fillRect(0, 0, 1080, 1350);

  // 2. Cyberpunk Grid lines (subtle)
  ctx.strokeStyle = 'rgba(255, 255, 255, 0.03)';
  ctx.lineWidth = 1;
  const gridSize = 60;
  for (let x = 0; x < 1080; x += gridSize) {
    ctx.beginPath();
    ctx.moveTo(x, 0);
    ctx.lineTo(x, 1350);
    ctx.stroke();
  }
  for (let y = 0; y < 1350; y += gridSize) {
    ctx.beginPath();
    ctx.moveTo(0, y);
    ctx.lineTo(1080, y);
    ctx.stroke();
  }

  // 3. Neon Ambient Orbs (Purple & Cyan Glow)
  const radGlow1 = ctx.createRadialGradient(200, 250, 20, 200, 250, 450);
  radGlow1.addColorStop(0, 'rgba(176, 38, 255, 0.25)');
  radGlow1.addColorStop(1, 'rgba(176, 38, 255, 0)');
  ctx.fillStyle = radGlow1;
  ctx.fillRect(0, 0, 1080, 1350);

  const radGlow2 = ctx.createRadialGradient(880, 850, 20, 880, 850, 500);
  radGlow2.addColorStop(0, 'rgba(0, 240, 255, 0.2)');
  radGlow2.addColorStop(1, 'rgba(0, 240, 255, 0)');
  ctx.fillStyle = radGlow2;
  ctx.fillRect(0, 0, 1080, 1350);

  // 4. Outer Neon Cyber Border
  ctx.strokeStyle = 'rgba(0, 255, 136, 0.4)';
  ctx.lineWidth = 4;
  ctx.strokeRect(40, 40, 1000, 1270);

  // Corner Accent Brackets
  ctx.strokeStyle = '#00ff88';
  ctx.lineWidth = 8;
  const bSize = 60;
  // Top-left
  ctx.beginPath();
  ctx.moveTo(40, 40 + bSize);
  ctx.lineTo(40, 40);
  ctx.lineTo(40 + bSize, 40);
  ctx.stroke();
  // Top-right
  ctx.beginPath();
  ctx.moveTo(1040 - bSize, 40);
  ctx.lineTo(1040, 40);
  ctx.lineTo(1040, 40 + bSize);
  ctx.stroke();
  // Bottom-left
  ctx.beginPath();
  ctx.moveTo(40, 1310 - bSize);
  ctx.lineTo(40, 1310);
  ctx.lineTo(40 + bSize, 1310);
  ctx.stroke();
  // Bottom-right
  ctx.beginPath();
  ctx.moveTo(1040 - bSize, 1310);
  ctx.lineTo(1040, 1310);
  ctx.lineTo(1040, 1310 - bSize);
  ctx.stroke();

  // 5. Header: Game Logo "DON'T BLINK"
  ctx.textAlign = 'center';
  ctx.shadowColor = '#00ff88';
  ctx.shadowBlur = 25;
  ctx.fillStyle = '#00ff88';
  ctx.font = '900 68px "Courier New", monospace, sans-serif';
  ctx.fillText("DON'T BLINK", 540, 170);

  ctx.shadowBlur = 0;
  ctx.fillStyle = 'rgba(255, 255, 255, 0.6)';
  ctx.font = '600 24px sans-serif';
  ctx.fillText("30-SECOND REFLEX ARENA", 540, 215);

  // 6. Player Name Card
  ctx.fillStyle = 'rgba(255, 255, 255, 0.06)';
  roundRect(ctx, 240, 260, 600, 70, 35);
  ctx.fill();
  ctx.strokeStyle = 'rgba(255, 255, 255, 0.15)';
  ctx.lineWidth = 2;
  ctx.stroke();

  ctx.fillStyle = '#ffffff';
  ctx.font = '700 28px sans-serif';
  ctx.fillText(`PLAYER: ${playerName.toUpperCase()}`, 540, 305);

  // 7. Giant Score Display
  ctx.fillStyle = 'rgba(20, 20, 35, 0.7)';
  roundRect(ctx, 140, 380, 800, 320, 24);
  ctx.fill();
  ctx.strokeStyle = 'rgba(0, 255, 136, 0.6)';
  ctx.lineWidth = 3;
  ctx.stroke();

  ctx.fillStyle = 'rgba(255, 255, 255, 0.5)';
  ctx.font = '700 26px sans-serif';
  ctx.fillText('FINAL SCORE', 540, 440);

  ctx.shadowColor = '#00ff88';
  ctx.shadowBlur = 40;
  ctx.fillStyle = '#00ff88';
  ctx.font = '900 130px sans-serif';
  ctx.fillText(`${stats.score}`, 540, 575);
  ctx.shadowBlur = 0;

  // Rank Badge Pill
  ctx.fillStyle = 'rgba(255, 215, 0, 0.15)';
  roundRect(ctx, 260, 615, 560, 54, 27);
  ctx.fill();
  ctx.strokeStyle = '#ffd700';
  ctx.lineWidth = 2;
  ctx.stroke();

  ctx.fillStyle = '#ffd700';
  ctx.font = '800 24px sans-serif';
  ctx.fillText(rankTitle.toUpperCase(), 540, 650);

  // 8. Stats Grid (2x2 cards)
  const statCards = [
    { label: 'ACCURACY', val: `${stats.accuracy}%`, color: '#00f0ff' },
    { label: 'MAX COMBO', val: `x${stats.highestCombo}`, color: '#b026ff' },
    { label: 'GREEN HITS', val: `${stats.greenHits}`, color: '#00ff88' },
    { label: 'GOLD HITS', val: `${stats.goldHits}`, color: '#ffd700' },
  ];

  statCards.forEach((c, idx) => {
    const col = idx % 2;
    const row = Math.floor(idx / 2);
    const x = 140 + col * 420;
    const y = 740 + row * 160;

    ctx.fillStyle = 'rgba(255, 255, 255, 0.04)';
    roundRect(ctx, x, y, 380, 130, 16);
    ctx.fill();
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.08)';
    ctx.lineWidth = 1.5;
    ctx.stroke();

    ctx.fillStyle = 'rgba(255, 255, 255, 0.5)';
    ctx.font = '600 20px sans-serif';
    ctx.fillText(c.label, x + 190, y + 45);

    ctx.fillStyle = c.color;
    ctx.font = '800 46px sans-serif';
    ctx.fillText(c.val, x + 190, y + 102);
  });

  // 9. Call to action / Viral Challenge Footer
  ctx.fillStyle = 'rgba(176, 38, 255, 0.15)';
  roundRect(ctx, 140, 1100, 800, 120, 20);
  ctx.fill();
  ctx.strokeStyle = '#b026ff';
  ctx.lineWidth = 2;
  ctx.stroke();

  ctx.shadowColor = '#b026ff';
  ctx.shadowBlur = 15;
  ctx.fillStyle = '#ffffff';
  ctx.font = '800 28px sans-serif';
  ctx.fillText('CAN YOU BEAT MY REFLEXES?', 540, 1150);
  ctx.shadowBlur = 0;

  ctx.fillStyle = '#00f0ff';
  ctx.font = '700 22px sans-serif';
  ctx.fillText('TAP & PLAY AT: DONT-BLINK-ARENA.APP', 540, 1190);

  return canvas.toDataURL('image/png');
}

function roundRect(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  width: number,
  height: number,
  radius: number
) {
  ctx.beginPath();
  ctx.moveTo(x + radius, y);
  ctx.lineTo(x + width - radius, y);
  ctx.quadraticCurveTo(x + width, y, x + width, y + radius);
  ctx.lineTo(x + width, y + height - radius);
  ctx.quadraticCurveTo(x + width, y + height, x + width - radius, y + height);
  ctx.lineTo(x + radius, y + height);
  ctx.quadraticCurveTo(x, y + height, x, y + height - radius);
  ctx.lineTo(x, y + radius);
  ctx.quadraticCurveTo(x, y, x + radius, y);
  ctx.closePath();
}
