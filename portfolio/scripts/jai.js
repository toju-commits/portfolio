const canvas = document.getElementById('jaiCore');
const ctx = canvas.getContext('2d');

const jai = {
  x: 20,
  y: 20,
  vx: 0.65,
  vy: 0.45,
  radius: 5,
  pulse: 0,
  trail: [],
  state: 'idle'
};

const mouse = {
  x: null,
  y: null,
  active: false
};

canvas.addEventListener('mousemove', (event) => {
  const rect = canvas.getBoundingClientRect();

  mouse.x = event.clientX - rect.left;
  mouse.y = event.clientY - rect.top;
  mouse.active = true;
});

canvas.addEventListener('mouseenter', () => {
  jai.state = 'aware';
});

canvas.addEventListener('mouseleave', () => {
    jai.state = 'idle';
    mouse.active = false;
});

function resizeCanvas() {
  const rect = canvas.getBoundingClientRect();
  const dpr = window.devicePixelRatio || 1;

  canvas.width = rect.width * dpr;
  canvas.height = rect.height * dpr;

  ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

  jai.x = Math.min(jai.x, rect.width - jai.radius);
  jai.y = Math.min(jai.y, rect.height - jai.radius);
}

resizeCanvas();
window.addEventListener('resize', resizeCanvas);

function update() {
    const width = canvas.clientWidth;
    const height = canvas.clientHeight;
    
    jai.x += jai.vx;
    jai.y += jai.vy;
    
    if (mouse.active) {
        const dx = mouse.x - jai.x;
        const dy = mouse.y - jai.y;
        const distance = Math.hypot(dx, dy);
        
        const influenceRadius = 90;

        if (distance > 0 && distance < influenceRadius) {
            const force = 1 - distance / influenceRadius;

            jai.vx -= (dx / distance) * force * 0.05;
            jai.vy -= (dy / distance) * force * 0.05;
        }
    }
    const speed = Math.hypot(jai.vx, jai.vy);
    const maxSpeed = 1.4;
    
    if (speed > maxSpeed) {
        jai.vx = (jai.vx / speed) * maxSpeed;
        jai.vy = (jai.vy / speed) * maxSpeed;
    }

    if (jai.x <= jai.radius) {
        jai.x = jai.radius;
        jai.vx = Math.abs(jai.vx);
    }

    if (jai.x >= width - jai.radius) {
        jai.x = width - jai.radius;
        jai.vx = -Math.abs(jai.vx);
    }

    if (jai.y <= jai.radius) {
        jai.y = jai.radius;
        jai.vy = Math.abs(jai.vy);
    }

    if (jai.y >= height - jai.radius) {
        jai.y = height - jai.radius;
        jai.vy = -Math.abs(jai.vy);
    }

    jai.pulse += 0.04;

    jai.trail.push({
        x: jai.x,
        y: jai.y
    });

    if (jai.trail.length > 18) {
        jai.trail.shift();
    }
}

function draw() {
    const width = canvas.clientWidth;
    const height = canvas.clientHeight;
    
    ctx.clearRect(0, 0, width, height);
    
    // trail
    jai.trail.forEach((point, index) => {
        const alpha = index / jai.trail.length;
        
        ctx.beginPath();
        ctx.arc(point.x, point.y, 1.5, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(255, 180, 0, ${alpha * 0.25})`;
        ctx.fill();
    });
    
    // breathing effect
    const pulseSize = Math.sin(jai.pulse) * 1.5;
    const currentRadius = jai.radius + pulseSize;
    
    // outer field / halo
    const haloRadius = currentRadius + 7 + Math.sin(jai.pulse * 0.7) * 1.5;
    ctx.beginPath();
    ctx.arc(
        jai.x,
        jai.y,
        haloRadius,
        0,
        Math.PI * 2
    );
    
    ctx.strokeStyle =
        jai.state === 'aware'
            ? 'rgba(255, 180, 0, 0.3)'
            : 'rgba(255, 180, 0, 0.18)';
            
    ctx.lineWidth = 1;
    ctx.shadowColor = '#ffb400';
    ctx.shadowBlur = 10;
    ctx.stroke();

    
    
    // orbiting particles
    const orbitRadius = haloRadius + 5;
    const orbitSpeed = jai.state === 'aware' ? 1.7 : 1.1;
    const orbitAngle = jai.pulse * orbitSpeed;

    // subtle orbit ring
    ctx.beginPath();
    ctx.arc(jai.x, jai.y, orbitRadius, 0, Math.PI * 2);
    ctx.strokeStyle = 'rgba(255, 180, 0, 0.1)';
    ctx.lineWidth = 0.8;
    ctx.shadowBlur = 0;
    ctx.stroke();

    const orbitX = jai.x + Math.cos(orbitAngle) * orbitRadius;
    const orbitY = jai.y + Math.sin(orbitAngle) * orbitRadius;

    const orbitX2 = jai.x + Math.cos(orbitAngle + Math.PI) * orbitRadius;
    const orbitY2 = jai.y + Math.sin(orbitAngle + Math.PI) * orbitRadius;

    ctx.beginPath();
    ctx.arc(orbitX, orbitY, 1.6, 0, Math.PI * 2);
    ctx.fillStyle = 'rgba(255, 180, 0, 0.8)';
    ctx.shadowColor = '#ffb400';
    ctx.shadowBlur = 8;
    ctx.fill();

    ctx.beginPath();
    ctx.arc(orbitX2, orbitY2, 1.6, 0, Math.PI * 2);
    ctx.fillStyle = 'rgba(255, 180, 0, 0.8)';
    ctx.shadowColor = '#ffb400';
    ctx.shadowBlur = 8;
    ctx.fill();

    // core
    ctx.beginPath();
    ctx.arc(
    jai.x,
    jai.y,
    currentRadius,
    0,
    Math.PI * 2
    );

    ctx.fillStyle = '#ffb400';
    ctx.shadowColor = '#ffb400';
    ctx.shadowBlur = jai.state === 'aware' ? 26 : 18;
    ctx.fill();

    ctx.shadowBlur = 0;
}

function animate() {
  update();
  draw();

  requestAnimationFrame(animate);
}

animate();

(function jaiDrawer() {
  const trigger = document.querySelector('.jai-cta');
  const drawer = document.getElementById('jaiDrawer');

  if (!trigger || !drawer) return;

  const panel = drawer.querySelector('.jai-drawer-panel');
  const closeButton = drawer.querySelector('.jai-drawer-close');
  const backdrop = drawer.querySelector('.jai-drawer-backdrop');
  let lastFocusedElement = null;

  function openDrawer() {
    lastFocusedElement = document.activeElement;
    drawer.classList.add('is-open');
    drawer.setAttribute('aria-hidden', 'false');
    trigger.setAttribute('aria-expanded', 'true');
    document.body.classList.add('jai-drawer-open');
    closeButton.focus();
  }

  function closeDrawer() {
    drawer.classList.remove('is-open');
    drawer.setAttribute('aria-hidden', 'true');
    trigger.setAttribute('aria-expanded', 'false');
    document.body.classList.remove('jai-drawer-open');

    if (lastFocusedElement) lastFocusedElement.focus();
  }

  trigger.addEventListener('click', openDrawer);
  closeButton.addEventListener('click', closeDrawer);
  backdrop.addEventListener('click', closeDrawer);

  document.addEventListener('keydown', (event) => {
    if (!drawer.classList.contains('is-open')) return;

    if (event.key === 'Escape') {
      closeDrawer();
      return;
    }

    if (event.key === 'Tab') {
      const focusable = panel.querySelectorAll('button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])');
      const first = focusable[0];
      const last = focusable[focusable.length - 1];

      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault();
        first.focus();
      }
    }
  });
})();
