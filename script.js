/* =========================================================
   ESENCIA WOMEN FITNESS · Interacciones y animaciones
   ========================================================= */

const $ = (s, ctx = document) => ctx.querySelector(s);
const $$ = (s, ctx = document) => [...ctx.querySelectorAll(s)];
const reduceMotion = window.matchMedia(
  "(prefers-reduced-motion: reduce)",
).matches;
const fmt = (n, dec = 0) =>
  n.toLocaleString("es-ES", {
    minimumFractionDigits: dec,
    maximumFractionDigits: dec,
  });

/* ---------- Pantalla de carga ---------- */
document.body.classList.add("is-loading");

function startPage() {
  const loader = $("#loader");
  loader.classList.add("is-done");
  document.body.classList.remove("is-loading");
  setTimeout(() => loader.remove(), 1100);
  // Titular letra a letra
  $$("[data-split]").forEach((el) => el.classList.add("is-in"));
}

window.addEventListener("load", () =>
  setTimeout(startPage, reduceMotion ? 0 : 1500),
);
// Por si alguna fuente tarda demasiado
setTimeout(() => $("#loader") && startPage(), 4000);

/* ---------- Partir el titular en letras ---------- */
$$("[data-split]").forEach((el) => {
  const text = el.textContent;
  el.textContent = "";
  [...text].forEach((ch, i) => {
    const span = document.createElement("span");
    span.className = "char";
    span.textContent = ch;
    span.style.transitionDelay = `${0.08 * i}s`;
    el.appendChild(span);
  });
});

/* ---------- Navegación ---------- */
const nav = $("#nav");
const burger = $("#burger");
const navLinks = $("#navLinks");
let lastY = 0;

burger.addEventListener("click", () => {
  const open = burger.classList.toggle("is-open");
  navLinks.classList.toggle("is-open", open);
  document.body.style.overflow = open ? "hidden" : "";
});
$$("a", navLinks).forEach((a) =>
  a.addEventListener("click", () => {
    burger.classList.remove("is-open");
    navLinks.classList.remove("is-open");
    document.body.style.overflow = "";
  }),
);

/* ---------- Scroll: barra de progreso, nav y parallax ---------- */
const progress = $("#progress");
const parallaxEls = $$("[data-parallax]");

function onScroll() {
  const y = window.scrollY;
  const max = document.documentElement.scrollHeight - window.innerHeight;
  progress.style.transform = `scaleX(${max > 0 ? y / max : 0})`;

  nav.classList.toggle("is-scrolled", y > 40);
  const menuOpen = navLinks.classList.contains("is-open");
  nav.classList.toggle("is-hidden", !menuOpen && y > lastY && y > 400);
  lastY = y;

  if (!reduceMotion) {
    parallaxEls.forEach((el) => {
      el.style.transform = `translateY(${y * parseFloat(el.dataset.parallax)}px)`;
    });
  }
}
window.addEventListener("scroll", () => requestAnimationFrame(onScroll), {
  passive: true,
});
onScroll();

/* ---------- Aparición al hacer scroll ---------- */
// Escalonar elementos hermanos
$$(".reveal").forEach((el) => {
  const siblings = [...el.parentElement.children].filter((c) =>
    c.classList.contains("reveal"),
  );
  const idx = siblings.indexOf(el);
  if (idx > 0) el.style.setProperty("--d", `${Math.min(idx, 6) * 0.09}s`);
});

const revealObserver = new IntersectionObserver(
  (entries) => {
    entries.forEach((entry) => {
      if (!entry.isIntersecting) return;
      const el = entry.target;
      el.classList.add("is-in");
      $$("[data-count]", el).forEach(countUp);
      if (el.matches("[data-count]")) countUp(el);
      if (el.classList.contains("bar")) {
        $(".bar__fill", el).style.width =
          `${(parseFloat(el.dataset.value) / 36.1) * 100}%`;
      }
      revealObserver.unobserve(el);
    });
  },
  { threshold: 0.15, rootMargin: "0px 0px -40px 0px" },
);

$$(".reveal").forEach((el) => revealObserver.observe(el));

/* ---------- Contadores animados ---------- */
function countUp(el) {
  if (el.dataset.done) return;
  el.dataset.done = "1";
  const target = parseFloat(el.dataset.count);
  const prefix = el.dataset.prefix || "";
  const suffix = el.dataset.suffix || "";
  const duration = reduceMotion ? 0 : 1800;
  const start = performance.now();

  function tick(now) {
    const p = duration ? Math.min((now - start) / duration, 1) : 1;
    const eased = 1 - Math.pow(1 - p, 4);
    el.textContent = prefix + fmt(Math.round(target * eased)) + suffix;
    if (p < 1) requestAnimationFrame(tick);
  }
  requestAnimationFrame(tick);
}
// Los números que no están dentro de un .reveal (p. ej. precios)
const countObserver = new IntersectionObserver(
  (entries) => {
    entries.forEach((e) => {
      if (e.isIntersecting) {
        countUp(e.target);
        countObserver.unobserve(e.target);
      }
    });
  },
  { threshold: 0.5 },
);
$$("[data-count]").forEach((el) => countObserver.observe(el));

/* ---------- Cursor personalizado ---------- */
const cursor = $("#cursor");
if (window.matchMedia("(hover: hover)").matches && !reduceMotion) {
  let cx = 0,
    cy = 0,
    tx = 0,
    ty = 0;
  window.addEventListener("mousemove", (e) => {
    tx = e.clientX;
    ty = e.clientY;
    cursor.style.opacity = 1;
  });
  (function loop() {
    cx += (tx - cx) * 0.2;
    cy += (ty - cy) * 0.2;
    cursor.style.left = cx + "px";
    cursor.style.top = cy + "px";
    requestAnimationFrame(loop);
  })();
  $$("a, button, input, select, .tilt").forEach((el) => {
    el.addEventListener("mouseenter", () => cursor.classList.add("is-hover"));
    el.addEventListener("mouseleave", () =>
      cursor.classList.remove("is-hover"),
    );
  });
}

/* ---------- Botones magnéticos ---------- */
if (window.matchMedia("(hover: hover)").matches && !reduceMotion) {
  $$(".magnetic").forEach((btn) => {
    btn.addEventListener("mousemove", (e) => {
      const r = btn.getBoundingClientRect();
      const x = e.clientX - r.left - r.width / 2;
      const y = e.clientY - r.top - r.height / 2;
      btn.style.transform = `translate(${x * 0.25}px, ${y * 0.35}px)`;
    });
    btn.addEventListener("mouseleave", () => (btn.style.transform = ""));
  });

  /* Tarjetas con inclinación 3D */
  $$(".tilt").forEach((card) => {
    card.addEventListener("mousemove", (e) => {
      const r = card.getBoundingClientRect();
      const px = (e.clientX - r.left) / r.width - 0.5;
      const py = (e.clientY - r.top) / r.height - 0.5;
      card.style.transform = `perspective(800px) rotateY(${px * 12}deg) rotateX(${-py * 12}deg) translateY(-6px)`;
    });
    card.addEventListener("mouseleave", () => (card.style.transform = ""));
  });
}

/* =========================================================
   CALCULADORA DE PESO IDEAL
   ========================================================= */
const ageIn = $("#age");
const heightIn = $("#height");
const weightIn = $("#weight");
let activity = 1.375;
let goal = 0;

function paintRange(input) {
  const pct = ((input.value - input.min) / (input.max - input.min)) * 100;
  input.style.setProperty("--fill", pct + "%");
}

function setText(id, value) {
  const el = $(id);
  if (el.textContent === value) return;
  el.textContent = value;
  el.classList.remove("pop");
  void el.offsetWidth; // reinicia la animación
  el.classList.add("pop");
}

function calculate() {
  const age = +ageIn.value;
  const h = +heightIn.value; // cm
  const w = +weightIn.value; // kg
  const m = h / 100;

  $("#ageOut").textContent = age;
  $("#heightOut").textContent = h;
  $("#weightOut").textContent = w;
  [ageIn, heightIn, weightIn].forEach(paintRange);

  // Peso ideal: media de fórmulas clásicas para mujeres
  const over = h - 152.4;
  const devine = 45.5 + 0.9055 * over;
  const robinson = 49 + 0.6693 * over;
  const miller = 53.1 + 0.5562 * over;
  const ideal = (devine + robinson + miller) / 3;

  // Rango saludable según IMC 18,5 – 24,9
  const minW = 18.5 * m * m;
  const maxW = 24.9 * m * m;

  // IMC
  const bmi = w / (m * m);

  // Calorías (Mifflin-St Jeor, mujer) × actividad × objetivo
  const bmr = 10 * w + 6.25 * h - 5 * age - 161;
  const kcal = bmr * activity * (1 + goal);

  // Agua: 35 ml por kg; proteína: 1,6 g por kg
  const water = (w * 35) / 1000;
  const protein = w * 1.6;

  setText("#idealWeight", fmt(ideal, 0));
  setText("#healthyRange", `${fmt(minW, 0)} – ${fmt(maxW, 0)} kg`);
  setText("#bmiValue", fmt(bmi, 1));
  setText("#kcal", fmt(Math.round(kcal / 10) * 10));
  setText("#water", `${fmt(water, 1)} L`);
  setText("#protein", `${fmt(protein, 0)} g`);

  // Posición del marcador (escala 15 – 40)
  const pos = Math.max(0, Math.min(1, (bmi - 15) / 25)) * 100;
  $("#bmiMarker").style.left = pos + "%";

  // Mensaje cercano, sin juicios
  let msg;
  if (bmi < 18.5)
    msg =
      "Estás por debajo del rango saludable. Te ayudamos a ganar fuerza y energía de forma segura. ♡";
  else if (bmi < 25)
    msg =
      "¡Estás en un rango saludable! Ahora toca ganar fuerza y sentirte aún mejor. ✦";
  else if (bmi < 30)
    msg =
      "Un poco por encima del rango. Con pequeños hábitos y acompañamiento se notan grandes cambios. ♡";
  else
    msg =
      "Tu salud es lo primero. Nuestras entrenadoras te preparan un plan a tu medida, paso a paso. ♡";
  $("#bmiMsg").textContent = msg;
}

[ageIn, heightIn, weightIn].forEach((input) =>
  input.addEventListener("input", calculate),
);

function setupChips(groupId, onPick) {
  $$(".chip", $(groupId)).forEach((chip) => {
    chip.addEventListener("click", () => {
      $$(".chip", $(groupId)).forEach((c) => c.classList.remove("is-active"));
      chip.classList.add("is-active");
      onPick(parseFloat(chip.dataset.value));
      calculate();
    });
  });
}
setupChips("#activity", (v) => (activity = v));
setupChips("#goal", (v) => (goal = v));

calculate();

/* ---------- Pestañas Misión / Visión / Valores ---------- */
const tabBtns = $$(".tabs__btn");
const indicator = $("#tabIndicator");

function moveIndicator(btn) {
  indicator.style.left = btn.offsetLeft + "px";
  indicator.style.width = btn.offsetWidth + "px";
}
tabBtns.forEach((btn) => {
  btn.addEventListener("click", () => {
    tabBtns.forEach((b) => b.classList.remove("is-active"));
    $$(".tabs__panel").forEach((p) => p.classList.remove("is-active"));
    btn.classList.add("is-active");
    $("#" + btn.dataset.tab).classList.add("is-active");
    moveIndicator(btn);
  });
});
window.addEventListener("load", () => moveIndicator($(".tabs__btn.is-active")));
window.addEventListener("resize", () =>
  moveIndicator($(".tabs__btn.is-active")),
);
document.fonts &&
  document.fonts.ready.then(() => moveIndicator($(".tabs__btn.is-active")));

/* ---------- Formulario de contacto ---------- */
const toast = $("#toast");
function showToast(text) {
  toast.textContent = text;
  toast.classList.add("is-show");
  setTimeout(() => toast.classList.remove("is-show"), 4000);
}

$("#contactForm").addEventListener("submit", (e) => {
  e.preventDefault();
  const fields = [
    { el: $("#name"), ok: (v) => v.trim().length > 1 },
    { el: $("#email"), ok: (v) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v) },
    { el: $("#interest"), ok: (v) => v !== "" },
  ];
  let valid = true;
  fields.forEach(({ el, ok }) => {
    const wrap = el.parentElement;
    wrap.classList.remove("is-error");
    if (!ok(el.value)) {
      void wrap.offsetWidth;
      wrap.classList.add("is-error");
      valid = false;
    }
  });

  if (!valid) {
    $("#formMsg").textContent = "Revisa los campos marcados, por favor.";
    return;
  }

  const name = $("#name").value.trim().split(" ")[0];
  $("#formMsg").textContent = "";
  e.target.reset();
  showToast(
    `¡Gracias, ${name}! Te escribiremos para reservar tu clase gratis ♡`,
  );
});
