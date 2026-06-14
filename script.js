const header = document.querySelector("[data-header]");
const navLinks = [...document.querySelectorAll(".nav a")];
const matrixCanvas = document.querySelector("[data-matrix-bg]");
const sections = navLinks
  .map((link) => document.querySelector(link.getAttribute("href")))
  .filter(Boolean);

const matrixSettings = {
  symbols: "01ABCDEFGHIJKLMNOPQRSTUVWXYZ#$%&<>[]{}+-=/",
  fontSize: 18,
  fade: 0.075,
  speed: 42,
  color: "#52ff8f",
  highlightColor: "#d8ffe6",
};

const setHeaderState = () => {
  header?.classList.toggle("is-scrolled", window.scrollY > 12);
};

const observer = new IntersectionObserver(
  (entries) => {
    const visible = entries
      .filter((entry) => entry.isIntersecting)
      .sort((a, b) => b.intersectionRatio - a.intersectionRatio)[0];

    if (!visible) return;

    navLinks.forEach((link) => {
      link.classList.toggle("active", link.getAttribute("href") === `#${visible.target.id}`);
    });
  },
  {
    rootMargin: "-35% 0px -50% 0px",
    threshold: [0.08, 0.2, 0.4],
  }
);

sections.forEach((section) => observer.observe(section));
setHeaderState();
window.addEventListener("scroll", setHeaderState, { passive: true });

const startMatrixBackground = (canvas) => {
  if (!canvas) return;

  const context = canvas.getContext("2d");
  let columns = 0;
  let drops = [];
  let animationFrame = 0;
  let lastFrameTime = 0;

  const resize = () => {
    const pixelRatio = window.devicePixelRatio || 1;
    const { width, height } = canvas.getBoundingClientRect();

    canvas.width = Math.floor(width * pixelRatio);
    canvas.height = Math.floor(height * pixelRatio);
    context.setTransform(pixelRatio, 0, 0, pixelRatio, 0, 0);

    columns = Math.ceil(width / matrixSettings.fontSize);
    drops = Array.from({ length: columns }, () => Math.random() * -height);
  };

  const draw = (time) => {
    if (time - lastFrameTime < matrixSettings.speed) {
      animationFrame = requestAnimationFrame(draw);
      return;
    }

    lastFrameTime = time;
    const width = canvas.clientWidth;
    const height = canvas.clientHeight;

    context.fillStyle = `rgba(2, 6, 4, ${matrixSettings.fade})`;
    context.fillRect(0, 0, width, height);
    context.font = `${matrixSettings.fontSize}px Consolas, "Courier New", monospace`;

    drops.forEach((drop, index) => {
      const symbol = matrixSettings.symbols[Math.floor(Math.random() * matrixSettings.symbols.length)];
      const x = index * matrixSettings.fontSize;
      const y = drop * matrixSettings.fontSize;

      context.fillStyle = Math.random() > 0.965 ? matrixSettings.highlightColor : matrixSettings.color;
      context.fillText(symbol, x, y);

      if (y > height && Math.random() > 0.975) {
        drops[index] = 0;
      } else {
        drops[index] = drop + 1;
      }
    });

    animationFrame = requestAnimationFrame(draw);
  };

  resize();
  animationFrame = requestAnimationFrame(draw);
  window.addEventListener("resize", resize, { passive: true });

  document.addEventListener("visibilitychange", () => {
    if (document.hidden) {
      cancelAnimationFrame(animationFrame);
      return;
    }

    lastFrameTime = 0;
    animationFrame = requestAnimationFrame(draw);
  });
};

startMatrixBackground(matrixCanvas);
