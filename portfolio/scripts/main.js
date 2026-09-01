  (function buildHero() {
    var lines = document.querySelectorAll('#heroName .line');
    var totalDelay = 0;
    lines.forEach(function(line) {
      var text = line.dataset.text;
      var isSignal = line.dataset.signal === 'true';
      line.innerHTML = '';
      var chars = text.split('');
      chars.forEach(function(char, i) {
        var span = document.createElement('span');
        span.className = 'ch' + (isSignal ? ' signal' : '');
        span.textContent = char === ' ' ? '\u00A0' : char;
        span.style.animationDelay = (totalDelay + i * 0.04) + 's';
        
        if (i === chars.length - 1){
          span.addEventListener('animationend', function(){
            line.classList.add('reveal-complete');
          }, {once: true});
        }
        
        line.appendChild(span);
      });
      totalDelay += text.length * 0.04 + 0.1;
    });
  })();

  (function ambientSpotlight() {
    var ambient = document.getElementById('ambient');
    var raf = null, mx = 50, my = 30;
    window.addEventListener('mousemove', function(e) {
      mx = (e.clientX / window.innerWidth) * 100;
      my = (e.clientY / window.innerHeight) * 100;
      if (raf) return;
      raf = requestAnimationFrame(function() {
        ambient.style.setProperty('--mx', mx + '%');
        ambient.style.setProperty('--my', my + '%');
        raf = null;
      });
    });
  })();

  (function customCursor() {
    var dot = document.getElementById('cursorDot');
    var ring = document.getElementById('cursorRing');
    var mx = 0, my = 0, rx = 0, ry = 0;

    window.addEventListener('mousemove', function(e) {
      mx = e.clientX; my = e.clientY;
      dot.style.left = mx + 'px';
      dot.style.top = my + 'px';
    });

    function tick() {
      rx += (mx - rx) * 0.18;
      ry += (my - ry) * 0.18;
      ring.style.left = rx + 'px';
      ring.style.top = ry + 'px';
      requestAnimationFrame(tick);
    }
    tick();

    document.addEventListener('mouseover', function(e) {
      var link = e.target.closest('a, button, [data-link]');
      if (link) ring.classList.add('hover');
    });
    document.addEventListener('mouseout', function(e) {
      var link = e.target.closest('a, button, [data-link]');
      if (link) ring.classList.remove('hover');
    });

    document.addEventListener('mouseleave', function() {
      dot.style.opacity = '0';
      ring.style.opacity = '0';
    });
    document.addEventListener('mouseenter', function() {
      dot.style.opacity = '1';
      ring.style.opacity = '1';
    });
  })();

  (function scrollReveal() {
    var obs = new IntersectionObserver(function(entries) {
      entries.forEach(function(entry) {
        if (entry.isIntersecting) {
          entry.target.classList.add('in');
          obs.unobserve(entry.target);
        }
      });
    }, { threshold: 0.12, rootMargin: '0px 0px -60px 0px' });

    document.querySelectorAll('.reveal').forEach(function(el) { obs.observe(el); });
  })();
