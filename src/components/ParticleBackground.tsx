import React, { useEffect, useRef } from 'react';

interface Particle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  radius: number;
  alpha: number;
  baseAlpha: number;
  color: string;
  glowColor: string;
  pulseSpeed: number;
  pulsePhase: number;
}

interface AmbientOrb {
  x: number;
  y: number;
  vx: number;
  vy: number;
  radius: number;
  color: string;
}

export const ParticleBackground: React.FC = () => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animationFrameId: number;
    let width = (canvas.width = window.innerWidth);
    let height = (canvas.height = window.innerHeight);

    const handleResize = () => {
      if (!canvas) return;
      width = canvas.width = window.innerWidth;
      height = canvas.height = window.innerHeight;
    };

    window.addEventListener('resize', handleResize);

    // High Real-Look Glowing Coconut Green & Coconut Brown/Gold palette
    const particleTypes = [
      { color: 'rgba(34, 197, 94, ', glow: '#22c55e' },   // Neon Tender Coconut Green
      { color: 'rgba(0, 230, 118, ', glow: '#00e676' },   // Electric Coconut Palm
      { color: 'rgba(46, 125, 50, ', glow: '#2e7d32' },   // Deep Coconut Canopy
      { color: 'rgba(217, 119, 6, ', glow: '#d97706' },   // Warm Coconut Husk Amber/Gold
      { color: 'rgba(198, 138, 76, ', glow: '#c68a4c' },  // Coconut Fiber Bronze
      { color: 'rgba(247, 250, 246, ', glow: '#ffffff' }, // Fresh Coconut Flesh White
    ];

    // Increased particle count for real, dense, cinematic feel
    const particleCount = Math.min(95, Math.max(50, Math.floor((width * height) / 14000)));
    const particles: Particle[] = [];

    for (let i = 0; i < particleCount; i++) {
      const type = particleTypes[Math.floor(Math.random() * particleTypes.length)];
      const baseAlpha = 0.35 + Math.random() * 0.45;
      particles.push({
        x: Math.random() * width,
        y: Math.random() * height,
        // High, vivid, active velocity for high live-motion
        vx: (Math.random() - 0.5) * 1.1,
        vy: (Math.random() - 0.5) * 1.1,
        radius: 1.6 + Math.random() * 2.8,
        alpha: baseAlpha,
        baseAlpha,
        color: type.color,
        glowColor: type.glow,
        pulseSpeed: 0.02 + Math.random() * 0.04,
        pulsePhase: Math.random() * Math.PI * 2,
      });
    }

    // Dynamic Ambient Light Orbs that drift in the background creating real depth
    const ambientOrbs: AmbientOrb[] = [
      { x: width * 0.2, y: height * 0.3, vx: 0.35, vy: 0.25, radius: Math.min(width, height) * 0.45, color: 'rgba(34, 197, 94, 0.08)' },
      { x: width * 0.8, y: height * 0.65, vx: -0.3, vy: -0.2, radius: Math.min(width, height) * 0.5, color: 'rgba(217, 119, 6, 0.06)' },
      { x: width * 0.5, y: height * 0.15, vx: 0.2, vy: -0.3, radius: Math.min(width, height) * 0.4, color: 'rgba(0, 230, 118, 0.07)' },
      { x: width * 0.35, y: height * 0.85, vx: -0.25, vy: 0.25, radius: Math.min(width, height) * 0.42, color: 'rgba(141, 91, 58, 0.07)' },
    ];

    let mouseX = -1000;
    let mouseY = -1000;
    let mouseActive = false;

    const handleMouseMove = (e: MouseEvent) => {
      mouseX = e.clientX;
      mouseY = e.clientY;
      mouseActive = true;
    };

    const handleMouseLeave = () => {
      mouseX = -1000;
      mouseY = -1000;
      mouseActive = false;
    };

    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('mouseleave', handleMouseLeave);

    let time = 0;

    const render = () => {
      time += 0.016;

      // Pitch black clear
      ctx.fillStyle = '#030503';
      ctx.fillRect(0, 0, width, height);

      // 1. Draw glowing ambient light orbs for deep, rich atmosphere
      ctx.save();
      for (const orb of ambientOrbs) {
        orb.x += orb.vx;
        orb.y += orb.vy;

        if (orb.x < -orb.radius * 0.3) orb.vx = Math.abs(orb.vx);
        if (orb.x > width + orb.radius * 0.3) orb.vx = -Math.abs(orb.vx);
        if (orb.y < -orb.radius * 0.3) orb.vy = Math.abs(orb.vy);
        if (orb.y > height + orb.radius * 0.3) orb.vy = -Math.abs(orb.vy);

        const grad = ctx.createRadialGradient(orb.x, orb.y, 0, orb.x, orb.y, orb.radius);
        grad.addColorStop(0, orb.color);
        grad.addColorStop(1, 'rgba(3, 5, 3, 0)');
        ctx.fillStyle = grad;
        ctx.beginPath();
        ctx.arc(orb.x, orb.y, orb.radius, 0, Math.PI * 2);
        ctx.fill();
      }
      ctx.restore();

      // 2. Interactive mouse gravity field aura
      if (mouseActive) {
        ctx.save();
        const mouseGrad = ctx.createRadialGradient(mouseX, mouseY, 0, mouseX, mouseY, 160);
        mouseGrad.addColorStop(0, 'rgba(34, 197, 94, 0.18)');
        mouseGrad.addColorStop(0.5, 'rgba(217, 119, 6, 0.08)');
        mouseGrad.addColorStop(1, 'rgba(3, 5, 3, 0)');
        ctx.fillStyle = mouseGrad;
        ctx.beginPath();
        ctx.arc(mouseX, mouseY, 160, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();
      }

      // 3. Draw realistic glowing constellation bonds between nearby particles
      const connectionDist = 140;
      for (let i = 0; i < particles.length; i++) {
        const p1 = particles[i];
        for (let j = i + 1; j < particles.length; j++) {
          const p2 = particles[j];
          const dx = p1.x - p2.x;
          const dy = p1.y - p2.y;
          const dist = Math.sqrt(dx * dx + dy * dy);

          if (dist < connectionDist) {
            const normDist = 1 - dist / connectionDist;
            const lineAlpha = normDist * normDist * 0.38;

            ctx.beginPath();
            ctx.moveTo(p1.x, p1.y);
            ctx.lineTo(p2.x, p2.y);

            // Radiant gradient line between points
            const lineGrad = ctx.createLinearGradient(p1.x, p1.y, p2.x, p2.y);
            lineGrad.addColorStop(0, `${p1.color}${lineAlpha})`);
            lineGrad.addColorStop(1, `${p2.color}${lineAlpha})`);

            ctx.strokeStyle = lineGrad;
            ctx.lineWidth = normDist > 0.6 ? 1.4 : 0.85;
            ctx.stroke();
          }
        }
      }

      // 4. Update and render high-motion glowing particles
      for (let i = 0; i < particles.length; i++) {
        const p = particles[i];

        // Smooth sinusoidal organic drift added to linear velocity
        p.pulsePhase += p.pulseSpeed;
        const pulse = (Math.sin(p.pulsePhase) + 1) / 2; // 0 to 1
        p.alpha = p.baseAlpha * (0.7 + pulse * 0.6);

        p.x += p.vx;
        p.y += p.vy;

        // Wrap around screen boundaries smoothly
        if (p.x < -20) p.x = width + 20;
        else if (p.x > width + 20) p.x = -20;
        if (p.y < -20) p.y = height + 20;
        else if (p.y > height + 20) p.y = -20;

        // Interactive mouse interaction (magnetic swirl + push)
        if (mouseActive) {
          const mdx = p.x - mouseX;
          const mdy = p.y - mouseY;
          const mdist = Math.sqrt(mdx * mdx + mdy * mdy);
          if (mdist < 140 && mdist > 0) {
            const force = (140 - mdist) / 140;
            // Push gently away and add slight tangential swirl
            p.x += (mdx / mdist) * force * 1.8 - (mdy / mdist) * force * 0.8;
            p.y += (mdy / mdist) * force * 1.8 + (mdx / mdist) * force * 0.8;
          }
        }

        // Outer radiant bloom halo
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.radius * 3.2, 0, Math.PI * 2);
        ctx.fillStyle = `${p.color}${p.alpha * 0.28})`;
        ctx.fill();

        // Secondary mid glow
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.radius * 1.8, 0, Math.PI * 2);
        ctx.fillStyle = `${p.color}${p.alpha * 0.65})`;
        ctx.fill();

        // Intense core node
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
        ctx.fillStyle = `${p.color}${Math.min(1, p.alpha * 1.4)})`;
        ctx.fill();
      }

      animationFrameId = requestAnimationFrame(render);
    };

    render();

    return () => {
      cancelAnimationFrame(animationFrameId);
      window.removeEventListener('resize', handleResize);
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseleave', handleMouseLeave);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className="fixed inset-0 pointer-events-none z-0"
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        width: '100vw',
        height: '100vh',
        zIndex: 0,
        background: '#030503',
      }}
    />
  );
};
