"use strict";

(() => {
  const $ = (id) => document.getElementById(id);
  const $$ = (sel) => Array.from(document.querySelectorAll(sel));

  function fmt(n, digits = 6) {
    const value = Number(n);
    if (!Number.isFinite(value)) return String(n);
    return value.toLocaleString("ca-ES", { maximumFractionDigits: digits });
  }

  function readNumber(id) {
    const el = $(id);
    if (!el) throw new Error(`Falta el camp ${id}.`);
    const value = Number(String(el.value).replace(",", "."));
    if (!Number.isFinite(value)) throw new Error(`El camp ${id} ha de ser numèric.`);
    return value;
  }

  function readList(id) {
    const el = $(id);
    if (!el) throw new Error(`Falta el camp ${id}.`);
    const values = el.value
      .split(",")
      .map((x) => Number(x.trim().replace(",", ".")))
      .filter(Number.isFinite);
    if (!values.length) throw new Error("Escriu dades separades per comes.");
    return values;
  }

  function positive(value, name) {
    if (!(Number.isFinite(value) && value > 0)) throw new Error(`${name} ha de ser positiu.`);
  }

  function nonZero(value, name) {
    if (Math.abs(value) < 1e-12) throw new Error(`${name} no pot ser 0.`);
  }

  function resultHTML({ title, summary, extra = "", steps = [] }) {
    return `
      <h2>${title}</h2>
      <p>${summary}</p>
      ${extra}
      ${steps.length ? `<div class="proc"><strong>Procediment</strong><ol>${steps.map((s) => `<li>${s}</li>`).join("")}</ol></div>` : ""}
    `;
  }

  function render(payload) {
    const box = $("result");
    if (!box) return;
    box.innerHTML = resultHTML(payload);
    box.classList.remove("updated");
    void box.offsetWidth;
    box.classList.add("updated");
    box.scrollIntoView({ behavior: "smooth", block: "nearest" });
  }

  function renderError(title, message) {
    render({
      title,
      summary: `<span class="error">${message}</span>`,
      steps: [
        "Revisa les dades introduïdes.",
        "Comprova que no hi hagi denominadors zero, valors impossibles o camps buits."
      ]
    });
  }

  function badges(items) {
    return `<div class="badge-row">${items.map((x) => `<span class="badge">${x}</span>`).join("")}</div>`;
  }

  function kpis(items) {
    return `<div class="kpi-grid">${items.map(([label, value]) => `<div class="kpi"><span>${label}</span><strong>${value}</strong></div>`).join("")}</div>`;
  }

  function freqTable(freq) {
    const rows = Object.entries(freq)
      .sort((a, b) => Number(a[0]) - Number(b[0]))
      .map(([value, count]) => `<tr><td>${value}</td><td>${count}</td></tr>`)
      .join("");
    return `<table class="result-table"><thead><tr><th>Valor</th><th>Freqüència</th></tr></thead><tbody>${rows}</tbody></table>`;
  }

  function table(rows) {
    return `<table class="result-table"><tbody>${rows.map(([a, b]) => `<tr><th>${a}</th><td>${b}</td></tr>`).join("")}</tbody></table>`;
  }

  function showView(id) {
    $$(".view").forEach((view) => view.classList.toggle("active", view.id === id));
    $$(".tab").forEach((tab) => tab.classList.toggle("active", tab.dataset.view === id));
  }

  const COURSES = {
    "1eso": {
      title: "1r ESO",
      focus: ["nombres", "mesura", "geometria bàsica", "taules", "gràfics"],
      tools: ["Percentatges", "Proporcionalitat", "Geometria bàsica", "Estadística bàsica"],
      situations: ["Organitzem una excursió", "Dissenyem una aula", "Analitzem una enquesta"]
    },
    "2eso": {
      title: "2n ESO",
      focus: ["fraccions", "percentatges", "escales", "equacions simples", "àrees i volums"],
      tools: ["Equació lineal", "Proporcionalitat", "Percentatges", "Geometria"],
      situations: ["Comparem tarifes", "Gestionem un pressupost", "Interpretem mapes"]
    },
    "3eso": {
      title: "3r ESO",
      focus: ["funcions", "equacions", "estadística", "probabilitat", "geometria analítica inicial"],
      tools: ["Equació quadràtica", "Gràfica de funció", "Estadística", "Probabilitat"],
      situations: ["Modelem dades amb funcions", "Planifiquem una competició", "Notícia amb dades"]
    },
    "4eso": {
      title: "4t ESO",
      focus: ["modelització", "funcions avançades", "trigonometria", "sistemes", "presa de decisions"],
      tools: ["Gràfiques", "Equacions", "Trigonometria", "Estadística i probabilitat"],
      situations: ["Consum energètic", "Dissenyem un envàs", "Simulació i presa de decisions"]
    }
  };

  const SITUATIONS = {
    excursion: {
      title: "Organitzem una excursió",
      math: ["decimals", "percentatges", "pressupost", "proporcionalitat"],
      template: `
        <label>Nombre d’alumnes<input id="sa-a" type="number" value="28" step="1"></label>
        <label>Cost del bus (€)<input id="sa-b" type="number" value="420" step="any"></label>
        <label>Entrada per alumne (€)<input id="sa-c" type="number" value="7.5" step="any"></label>
        <label>Menjar per alumne (€)<input id="sa-d" type="number" value="5" step="any"></label>
        <label>Descompte global (%)<input id="sa-e" type="number" value="10" step="any"></label>
        <label>Pressupost disponible (€)<input id="sa-f" type="number" value="700" step="any"></label>`
    },
    room: {
      title: "Dissenyem una aula o habitació",
      math: ["àrees", "perímetres", "escales", "unitats"],
      template: `
        <label>Llargada (m)<input id="sa-a" type="number" value="7.5" step="any"></label>
        <label>Amplada (m)<input id="sa-b" type="number" value="4.2" step="any"></label>
        <label>Preu del paviment (€/m²)<input id="sa-c" type="number" value="18" step="any"></label>
        <label>Escala: 1 cm representa... (m)<input id="sa-d" type="number" value="0.5" step="any"></label>`
    },
    tariffs: {
      title: "Comparem tarifes",
      math: ["funcions lineals", "equacions", "gràfiques", "punt de tall"],
      template: `
        <label>Quota fixa A (€)<input id="sa-a" type="number" value="8" step="any"></label>
        <label>Preu variable A (€/unitat)<input id="sa-b" type="number" value="0.12" step="any"></label>
        <label>Quota fixa B (€)<input id="sa-c" type="number" value="3" step="any"></label>
        <label>Preu variable B (€/unitat)<input id="sa-d" type="number" value="0.2" step="any"></label>
        <label>Consum previst<input id="sa-e" type="number" value="80" step="any"></label>`
    },
    survey: {
      title: "Analitzem una enquesta",
      math: ["estadística", "freqüències", "gràfics", "conclusions"],
      template: `<label>Dades separades per comes<input id="sa-list" value="4,5,7,7,8,9,9,10,6,7"></label>`
    },
    energy: {
      title: "Consum energètic i sostenibilitat",
      math: ["unitats", "percentatges", "funcions", "sostenibilitat"],
      template: `
        <label>Consum mensual (kWh)<input id="sa-a" type="number" value="250" step="any"></label>
        <label>Preu energia (€/kWh)<input id="sa-b" type="number" value="0.18" step="any"></label>
        <label>Cost fix mensual (€)<input id="sa-c" type="number" value="12" step="any"></label>
        <label>Reducció proposada (%)<input id="sa-d" type="number" value="15" step="any"></label>`
    },
    games: {
      title: "Probabilitat i jocs",
      math: ["probabilitat", "Laplace", "freqüència esperada"],
      template: `
        <label>Casos favorables<input id="sa-a" type="number" value="2" step="1"></label>
        <label>Casos possibles<input id="sa-b" type="number" value="6" step="1"></label>
        <label>Nombre de partides simulades<input id="sa-c" type="number" value="120" step="1"></label>`
    }
  };

  const TOOL_TEMPLATES = {
    linear: `<label>a<input type="number" id="t-a" value="2" step="any"></label><label>b<input type="number" id="t-b" value="-6" step="any"></label>`,
    quadratic: `<label>a<input type="number" id="t-a" value="1" step="any"></label><label>b<input type="number" id="t-b" value="-5" step="any"></label><label>c<input type="number" id="t-c" value="6" step="any"></label>`,
    proportion: `<label>x₁<input type="number" id="t-a" value="3" step="any"></label><label>y₁<input type="number" id="t-b" value="12" step="any"></label><label>x₂<input type="number" id="t-c" value="5" step="any"></label>`,
    percentage: `<label>Quantitat inicial<input type="number" id="t-a" value="80" step="any"></label><label>Percentatge<input type="number" id="t-b" value="15" step="any"></label>`,
    geometry: `<label>Figura<select id="t-shape"><option value="rectangle">Rectangle</option><option value="triangle">Triangle</option><option value="circle">Cercle</option><option value="cylinder">Cilindre</option></select></label><label>Mesura A<input type="number" id="t-a" value="8" step="any"></label><label>Mesura B<input type="number" id="t-b" value="3" step="any"></label>`,
    statistics: `<label>Dades separades per comes<input id="t-list" value="4,5,7,7,9,10"></label>`,
    graph: `<label>Funció<select id="t-fn"><option value="linear">f(x)=mx+n</option><option value="quadratic">f(x)=ax²+bx+c</option></select></label><label>a o m<input type="number" id="t-a" value="1" step="any"></label><label>b o n<input type="number" id="t-b" value="0" step="any"></label><label>c<input type="number" id="t-c" value="-4" step="any"></label>`
  };

  const FORMULAS = {
    numeric: { label: "Sentit numèric", items: [
      ["Percentatge", "p% de A = A·p/100", "Descomptes, increments i repartiments."],
      ["Proporcionalitat directa", "y = kx", "Si x es multiplica, y també ho fa pel mateix factor."],
      ["Proporcionalitat inversa", "xy = k", "El producte es manté constant."]
    ]},
    measure: { label: "Mesura i geometria", items: [
      ["Rectangle", "A=b·h; P=2(b+h)", "Àrea i perímetre."],
      ["Triangle", "A=(b·h)/2", "Meitat del rectangle equivalent."],
      ["Cercle", "A=πr²; L=2πr", "Àrea i longitud."],
      ["Prisma", "V=A_base·h", "Volum general d’un prisma."],
      ["Cilindre", "V=πr²h", "Volum del cilindre."]
    ]},
    algebra: { label: "Àlgebra i funcions", items: [
      ["Equació lineal", "ax+b=0 → x=-b/a", "Aïllament de la incògnita."],
      ["Equació quadràtica", "x=(-b±√(b²-4ac))/(2a)", "Fórmula general."],
      ["Funció lineal", "f(x)=mx+n", "Recta de pendent m."],
      ["Vèrtex paràbola", "x_v=-b/(2a)", "Màxim o mínim d’una quadràtica."]
    ]},
    stochastic: { label: "Estadística i probabilitat", items: [
      ["Mitjana", "x̄=Σxᵢ/n", "Suma dividida pel nombre de dades."],
      ["Rang", "R=max-min", "Diferència màxim-mínim."],
      ["Laplace", "P(A)=favorables/possibles", "Casos equiprobables."],
      ["Unió", "P(A∪B)=P(A)+P(B)-P(A∩B)", "Evita doble recompte."]
    ]},
    trig: { label: "Trigonometria", items: [
      ["Raons", "sin α=op/hip; cos α=adj/hip; tan α=op/adj", "Triangle rectangle."],
      ["Identitat", "sin²α+cos²α=1", "Relació fonamental."],
      ["Radians", "180°=π rad", "Conversió d’angles."]
    ]}
  };

  function initSelects() {
    const course = $("course-select");
    const sa = $("sa-select");
    const formulaArea = $("formula-area");
    if (course) course.innerHTML = Object.entries(COURSES).map(([key, c]) => `<option value="${key}">${c.title}</option>`).join("");
    if (sa) sa.innerHTML = Object.entries(SITUATIONS).map(([key, s]) => `<option value="${key}">${s.title}</option>`).join("");
    if (formulaArea) formulaArea.innerHTML = Object.entries(FORMULAS).map(([key, f]) => `<option value="${key}">${f.label}</option>`).join("");
    updateSAInputs();
    updateToolInputs();
    updateFormulaItems();
  }

  function updateSAInputs() {
    const sel = $("sa-select");
    const box = $("sa-inputs");
    if (!sel || !box) return;
    const item = SITUATIONS[sel.value];
    box.innerHTML = item ? item.template : "";
  }

  function updateToolInputs() {
    const sel = $("tool-select");
    const box = $("tool-inputs");
    if (!sel || !box) return;
    box.innerHTML = TOOL_TEMPLATES[sel.value] || "";
  }

  function updateFormulaItems() {
    const areaSel = $("formula-area");
    const itemSel = $("formula-item");
    if (!areaSel || !itemSel) return;
    const area = FORMULAS[areaSel.value] || FORMULAS.numeric;
    itemSel.innerHTML = area.items.map((item, index) => `<option value="${index}">${item[0]}</option>`).join("");
    itemSel.value = "0";
  }

  function calculateCourse() {
    const key = $("course-select").value;
    const course = COURSES[key];
    render({
      title: course.title,
      summary: "Itinerari recomanat per treballar matemàtiques de manera gradual.",
      extra: `${badges(course.focus)}<h3>Eines recomanades</h3><ul>${course.tools.map((x) => `<li>${x}</li>`).join("")}</ul><h3>Situacions apropiades</h3><ul>${course.situations.map((x) => `<li>${x}</li>`).join("")}</ul>`,
      steps: ["Comença per una situació propera.", "Identifica les eines matemàtiques necessàries.", "Calcula, representa i comprova.", "Escriu una conclusió."]
    });
  }

  function calculateSA() {
    const key = $("sa-select").value;
    if (key === "excursion") return calcExcursion();
    if (key === "room") return calcRoom();
    if (key === "tariffs") return calcTariffs();
    if (key === "survey") return calcSurvey();
    if (key === "energy") return calcEnergy();
    if (key === "games") return calcGames();
    throw new Error("Aquesta situació encara no té càlcul directe.");
  }

  function calcExcursion() {
    const students = readNumber("sa-a");
    const bus = readNumber("sa-b");
    const ticket = readNumber("sa-c");
    const food = readNumber("sa-d");
    const discount = readNumber("sa-e");
    const budget = readNumber("sa-f");
    positive(students, "El nombre d’alumnes");
    const raw = bus + students * (ticket + food);
    const discountAmount = raw * discount / 100;
    const total = raw - discountAmount;
    const perStudent = total / students;
    const diff = budget - total;
    render({
      title: "SA: Organitzem una excursió",
      summary: diff >= 0 ? `El pressupost és suficient. Sobren <strong>${fmt(diff)} €</strong>.` : `El pressupost no arriba. Falten <strong>${fmt(Math.abs(diff))} €</strong>.`,
      extra: kpis([["Cost total", `${fmt(total)} €`], ["Cost per alumne", `${fmt(perStudent)} €`], ["Diferència amb pressupost", `${fmt(diff)} €`]]) +
        table([["Bus", `${fmt(bus)} €`], ["Entrades", `${fmt(students * ticket)} €`], ["Menjar", `${fmt(students * food)} €`], ["Descompte", `-${fmt(discountAmount)} €`]]),
      steps: ["Calculem entrada + menjar per alumne.", "Multipliquem pel nombre d’alumnes.", "Sumem el cost del bus.", "Apliquem el descompte.", "Compareu el total amb el pressupost."]
    });
  }

  function calcRoom() {
    const length = readNumber("sa-a");
    const width = readNumber("sa-b");
    const price = readNumber("sa-c");
    const scale = readNumber("sa-d");
    positive(length, "La llargada"); positive(width, "L’amplada"); positive(price, "El preu"); positive(scale, "L’escala");
    const area = length * width;
    const perimeter = 2 * (length + width);
    const cost = area * price;
    render({
      title: "SA: Dissenyem una aula o habitació",
      summary: `Àrea = <strong>${fmt(area)} m²</strong>, cost estimat = <strong>${fmt(cost)} €</strong>.`,
      extra: kpis([["Àrea", `${fmt(area)} m²`], ["Perímetre", `${fmt(perimeter)} m`], ["Cost paviment", `${fmt(cost)} €`], ["Plànol", `${fmt(length / scale)} cm × ${fmt(width / scale)} cm`]]),
      steps: ["Àrea = llargada·amplada.", "Perímetre = 2(llargada+amplada).", "Cost = àrea·preu per m².", "Al plànol, dividim cada mesura pel valor de l’escala."]
    });
  }

  function calcTariffs() {
    const fa = readNumber("sa-a");
    const va = readNumber("sa-b");
    const fb = readNumber("sa-c");
    const vb = readNumber("sa-d");
    const x = readNumber("sa-e");
    const costA = fa + va * x;
    const costB = fb + vb * x;
    const denom = va - vb;
    const cut = Math.abs(denom) > 1e-12 ? (fb - fa) / denom : null;
    const better = costA < costB ? "A" : costB < costA ? "B" : "iguals";
    const canvasId = `tariff-${Math.random().toString(36).slice(2)}`;
    render({
      title: "SA: Comparem tarifes",
      summary: `Per un consum de ${fmt(x)}, la millor opció és: <strong>${better}</strong>.`,
      extra: kpis([["Cost tarifa A", `${fmt(costA)} €`], ["Cost tarifa B", `${fmt(costB)} €`], ["Millor opció", better], ["Punt d’igualtat", cut !== null && cut >= 0 ? `${fmt(cut)} unitats` : "no aplicable"]]) +
        `<div class="canvas-wrap"><canvas id="${canvasId}"></canvas></div>`,
      steps: ["Cada tarifa és una funció lineal.", "Cost = quota fixa + preu variable·consum.", "Compareu costos per al consum indicat.", "Resolem la igualtat per trobar el punt de tall."]
    });
    requestAnimationFrame(() => drawTwoLines(canvasId, (t) => fa + va * t, (t) => fb + vb * t, Math.max(100, x * 1.3)));
  }

  function calcSurvey() {
    const arr = readList("sa-list");
    const sorted = [...arr].sort((a, b) => a - b);
    const mean = arr.reduce((s, x) => s + x, 0) / arr.length;
    const median = sorted.length % 2 ? sorted[(sorted.length - 1) / 2] : (sorted[sorted.length / 2 - 1] + sorted[sorted.length / 2]) / 2;
    const range = sorted[sorted.length - 1] - sorted[0];
    const freq = {};
    arr.forEach((x) => { freq[x] = (freq[x] || 0) + 1; });
    const maxFreq = Math.max(...Object.values(freq));
    const modes = Object.entries(freq).filter(([, v]) => v === maxFreq).map(([k]) => k);
    render({
      title: "SA: Analitzem una enquesta",
      summary: `Mitjana = <strong>${fmt(mean)}</strong>, mediana = <strong>${fmt(median)}</strong>, moda = <strong>${modes.join(", ")}</strong>.`,
      extra: kpis([["N dades", arr.length], ["Rang", fmt(range)], ["Màxim", fmt(sorted.at(-1))], ["Mínim", fmt(sorted[0])]]) + freqTable(freq),
      steps: ["Ordenem les dades.", "Mitjana = suma/n.", "Mediana = valor central.", "Moda = valor amb més freqüència.", "Rang = màxim - mínim."]
    });
  }

  function calcEnergy() {
    const kwh = readNumber("sa-a");
    const price = readNumber("sa-b");
    const fixed = readNumber("sa-c");
    const reduction = readNumber("sa-d");
    positive(kwh, "El consum"); positive(price, "El preu");
    const cost = kwh * price + fixed;
    const reducedKwh = kwh * (1 - reduction / 100);
    const reducedCost = reducedKwh * price + fixed;
    const saving = cost - reducedCost;
    render({
      title: "SA: Consum energètic i sostenibilitat",
      summary: `Cost actual = <strong>${fmt(cost)} €</strong>. Amb reducció: <strong>${fmt(reducedCost)} €</strong>.`,
      extra: kpis([["Consum actual", `${fmt(kwh)} kWh`], ["Consum reduït", `${fmt(reducedKwh)} kWh`], ["Estalvi mensual", `${fmt(saving)} €`], ["Estalvi anual", `${fmt(saving * 12)} €`]]),
      steps: ["Cost variable = consum·preu.", "Afegim el cost fix.", "Apliquem la reducció al consum.", "Compareu cost inicial i reduït."]
    });
  }

  function calcGames() {
    const fav = readNumber("sa-a");
    const poss = readNumber("sa-b");
    const trials = readNumber("sa-c");
    positive(poss, "Els casos possibles"); positive(trials, "El nombre de partides");
    if (fav < 0 || fav > poss) throw new Error("Els casos favorables han d’estar entre 0 i els casos possibles.");
    const p = fav / poss;
    const expected = p * trials;
    render({
      title: "SA: Probabilitat i jocs",
      summary: `Probabilitat = <strong>${fmt(p * 100)}%</strong>. En ${fmt(trials)} partides, s’esperen <strong>${fmt(expected)}</strong> èxits.`,
      extra: kpis([["Probabilitat", fmt(p)], ["Percentatge", `${fmt(p * 100)}%`], ["Freqüència esperada", fmt(expected)]]),
      steps: ["Apliquem Laplace: favorables/possibles.", "Convertim a percentatge.", "Multipliquem per partides per obtenir freqüència esperada."]
    });
  }

  function calculateTool() {
    const key = $("tool-select").value;
    if (key === "linear") return toolLinear();
    if (key === "quadratic") return toolQuadratic();
    if (key === "proportion") return toolProportion();
    if (key === "percentage") return toolPercentage();
    if (key === "geometry") return toolGeometry();
    if (key === "statistics") return toolStatistics();
    if (key === "graph") return toolGraph();
    throw new Error("Eina no disponible.");
  }

  function toolLinear() {
    const a = readNumber("t-a"), b = readNumber("t-b");
    nonZero(a, "a");
    const x = -b / a;
    render({ title: "Equació lineal", summary: `<span class="math">${fmt(a)}x + ${fmt(b)} = 0</span> → <strong>x = ${fmt(x)}</strong>`, steps: ["Partim de ax+b=0.", "Passem b a l’altre costat.", "Dividim per a.", `x=${fmt(-b)}/${fmt(a)}=${fmt(x)}.`] });
  }

  function toolQuadratic() {
    const a = readNumber("t-a"), b = readNumber("t-b"), c = readNumber("t-c");
    nonZero(a, "a");
    const d = b * b - 4 * a * c;
    if (d < 0) {
      render({ title: "Equació quadràtica", summary: `<span class="math">Δ=${fmt(d)}</span>. No hi ha solucions reals.`, steps: ["Calculem Δ=b²-4ac.", "Com que Δ és negatiu, no hi ha arrels reals."] });
      return;
    }
    const x1 = (-b + Math.sqrt(d)) / (2 * a);
    const x2 = (-b - Math.sqrt(d)) / (2 * a);
    render({ title: "Equació quadràtica", summary: `<strong>x₁=${fmt(x1)}</strong>, <strong>x₂=${fmt(x2)}</strong>`, steps: [`Δ=${fmt(d)}.`, "Apliquem la fórmula general.", `x₁=${fmt(x1)}, x₂=${fmt(x2)}.`] });
  }

  function toolProportion() {
    const x1 = readNumber("t-a"), y1 = readNumber("t-b"), x2 = readNumber("t-c");
    nonZero(x1, "x₁");
    const k = y1 / x1;
    const y2 = k * x2;
    render({ title: "Proporcionalitat directa", summary: `<strong>y₂=${fmt(y2)}</strong>`, steps: ["En proporcionalitat directa, y=kx.", `k=${fmt(k)}.`, `y₂=${fmt(k)}·${fmt(x2)}=${fmt(y2)}.`] });
  }

  function toolPercentage() {
    const base = readNumber("t-a"), pct = readNumber("t-b");
    const amount = base * pct / 100;
    render({ title: "Percentatges", summary: `${fmt(pct)}% de ${fmt(base)} = <strong>${fmt(amount)}</strong>`, steps: ["Dividim el percentatge per 100.", `Quantitat=${fmt(base)}·${fmt(pct)}/100=${fmt(amount)}.`, `Increment: ${fmt(base + amount)}. Descompte: ${fmt(base - amount)}.`] });
  }

  function toolGeometry() {
    const sh = $("t-shape").value;
    const a = readNumber("t-a"), b = readNumber("t-b");
    positive(a, "Mesura A");
    let summary = "", steps = [];
    if (sh === "rectangle") { positive(b, "Mesura B"); summary = `Àrea=<strong>${fmt(a * b)}</strong>, perímetre=<strong>${fmt(2 * (a + b))}</strong>`; steps = ["A=base·altura.", "P=2(base+altura)."]; }
    if (sh === "triangle") { positive(b, "Mesura B"); summary = `Àrea=<strong>${fmt(a * b / 2)}</strong>`; steps = ["A=base·altura/2."]; }
    if (sh === "circle") { summary = `Àrea=<strong>${fmt(Math.PI * a * a)}</strong>, longitud=<strong>${fmt(2 * Math.PI * a)}</strong>`; steps = ["A=πr².", "L=2πr."]; }
    if (sh === "cylinder") { positive(b, "Mesura B"); summary = `Volum=<strong>${fmt(Math.PI * a * a * b)}</strong>`; steps = ["V=πr²h."]; }
    render({ title: "Geometria", summary, steps });
  }

  function toolStatistics() {
    const values = readList("t-list");
    const sorted = [...values].sort((a, b) => a - b);
    const mean = values.reduce((s, x) => s + x, 0) / values.length;
    const med = sorted.length % 2 ? sorted[(sorted.length - 1) / 2] : (sorted[sorted.length / 2 - 1] + sorted[sorted.length / 2]) / 2;
    const range = sorted.at(-1) - sorted[0];
    render({ title: "Estadística bàsica", summary: `Mitjana=<strong>${fmt(mean)}</strong>, mediana=<strong>${fmt(med)}</strong>, rang=<strong>${fmt(range)}</strong>`, steps: ["Ordenem les dades.", "Mitjana: suma/n.", "Mediana: valor central.", "Rang: màxim-mínim."] });
  }

  function toolGraph() {
    const kind = $("t-fn").value, a = readNumber("t-a"), b = readNumber("t-b"), c = readNumber("t-c");
    const id = `graph-${Math.random().toString(36).slice(2)}`;
    const label = kind === "linear" ? `f(x)=${fmt(a)}x+${fmt(b)}` : `f(x)=${fmt(a)}x²+${fmt(b)}x+${fmt(c)}`;
    render({
      title: "Gràfica de funció",
      summary: `<span class="math">${label}</span>`,
      extra: `<div class="canvas-wrap"><canvas id="${id}" aria-label="Gràfica de funció"></canvas></div>`,
      steps: ["Generem punts entre -10 i 10.", "Calculem f(x).", "Dibuixem el canvas després de renderitzar-lo."]
    });
    requestAnimationFrame(() => drawFunction(id, (x) => kind === "linear" ? a * x + b : a * x * x + b * x + c));
  }

  function drawFunction(id, fn) {
    drawSeries(id, [{ color: "#1d4ed8", fn }], 10, 10);
  }

  function drawTwoLines(id, fnA, fnB, xmax) {
    const yMax = Math.max(10, fnA(xmax), fnB(xmax));
    drawSeries(id, [{ color: "#1d4ed8", fn: fnA }, { color: "#b91c1c", fn: fnB }], xmax, yMax * 1.1, true);
  }

  function drawSeries(id, series, xmax = 10, ymax = 10, positiveAxes = false) {
    const canvas = $(id);
    if (!canvas) return;
    const rect = canvas.getBoundingClientRect();
    const size = Math.max(320, Math.round(rect.width || 720));
    const dpr = window.devicePixelRatio || 1;
    canvas.width = size * dpr;
    canvas.height = size * dpr;
    canvas.style.height = `${size}px`;
    const ctx = canvas.getContext("2d");
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

    const W = size, H = size, pad = 42;
    const xMin = positiveAxes ? 0 : -xmax;
    const xMax = xmax;
    const yMin = positiveAxes ? 0 : -ymax;
    const yMax = ymax;
    const X = (x) => pad + (x - xMin) / (xMax - xMin) * (W - 2 * pad);
    const Y = (y) => H - pad - (y - yMin) / (yMax - yMin) * (H - 2 * pad);

    ctx.fillStyle = "#fff";
    ctx.fillRect(0, 0, W, H);
    ctx.strokeStyle = "#e2e8f0";
    ctx.lineWidth = 1;
    for (let i = 0; i <= 10; i++) {
      const x = xMin + (xMax - xMin) * i / 10;
      const y = yMin + (yMax - yMin) * i / 10;
      ctx.beginPath(); ctx.moveTo(X(x), pad); ctx.lineTo(X(x), H - pad); ctx.stroke();
      ctx.beginPath(); ctx.moveTo(pad, Y(y)); ctx.lineTo(W - pad, Y(y)); ctx.stroke();
    }

    ctx.strokeStyle = "#334155";
    ctx.lineWidth = 2;
    if (xMin <= 0 && xMax >= 0) {
      ctx.beginPath(); ctx.moveTo(X(0), pad); ctx.lineTo(X(0), H - pad); ctx.stroke();
    }
    if (yMin <= 0 && yMax >= 0) {
      ctx.beginPath(); ctx.moveTo(pad, Y(0)); ctx.lineTo(W - pad, Y(0)); ctx.stroke();
    }

    series.forEach((s) => {
      ctx.strokeStyle = s.color;
      ctx.lineWidth = 3;
      ctx.beginPath();
      let started = false;
      for (let i = 0; i <= 900; i++) {
        const x = xMin + (xMax - xMin) * i / 900;
        const y = s.fn(x);
        if (!Number.isFinite(y) || y < yMin * 4 || y > yMax * 4) {
          started = false;
          continue;
        }
        const cx = X(x);
        const cy = Y(Math.max(yMin, Math.min(yMax, y)));
        if (!started) { ctx.moveTo(cx, cy); started = true; }
        else ctx.lineTo(cx, cy);
      }
      ctx.stroke();
    });
  }

  function showFormula() {
    const area = FORMULAS[$("formula-area").value] || FORMULAS.numeric;
    let idx = Number($("formula-item").value || 0);
    if (!Number.isInteger(idx) || idx < 0 || idx >= area.items.length) idx = 0;
    const item = area.items[idx];
    render({
      title: `${area.label}: ${item[0]}`,
      summary: `<span class="math">${item[1]}</span>`,
      steps: [item[2], "Identifica cada símbol.", "Substitueix dades amb unitats coherents.", "Comprova si el resultat té sentit."]
    });
  }

  function assess() {
    const total = $$('input[name="a"]').length;
    const checked = $$('input[name="a"]:checked').length;
    const pct = total ? Math.round(checked / total * 100) : 0;
    const message = pct >= 85 ? "Procés molt complet." : pct >= 60 ? "Procés força bé, però encara es pot revisar." : "Cal reforçar el procés abans de validar la resposta.";
    render({
      title: "Autoavaluació del procés",
      summary: `<strong>${checked}/${total}</strong> punts · <strong>${pct}%</strong>. ${message}`,
      steps: ["Una bona resposta no és només un resultat.", "Cal entendre, representar, calcular, comprovar i comunicar.", "Revisa els punts no marcats."]
    });
  }

  function bind() {
    $$(".tab").forEach((button) => button.addEventListener("click", () => showView(button.dataset.view)));
    $$("[data-jump]").forEach((button) => button.addEventListener("click", () => showView(button.dataset.jump)));

    const courseForm = $("course-form");
    const saForm = $("sa-form");
    const toolForm = $("tool-form");
    const formulaForm = $("formula-form");
    const assessmentForm = $("assessment-form");

    $("sa-select")?.addEventListener("change", updateSAInputs);
    $("tool-select")?.addEventListener("change", updateToolInputs);
    $("formula-area")?.addEventListener("change", updateFormulaItems);

    courseForm?.addEventListener("submit", (event) => { event.preventDefault(); try { calculateCourse(); } catch (e) { renderError("No s'ha pogut mostrar el curs.", e.message); } });
    saForm?.addEventListener("submit", (event) => { event.preventDefault(); try { calculateSA(); } catch (e) { renderError("No s'ha pogut calcular la situació.", e.message); } });
    toolForm?.addEventListener("submit", (event) => { event.preventDefault(); try { calculateTool(); } catch (e) { renderError("No s'ha pogut calcular.", e.message); } });
    formulaForm?.addEventListener("submit", (event) => { event.preventDefault(); try { showFormula(); } catch (e) { renderError("No s'ha pogut mostrar la fórmula.", e.message); } });
    assessmentForm?.addEventListener("submit", (event) => { event.preventDefault(); try { assess(); } catch (e) { renderError("No s'ha pogut fer l'autoavaluació.", e.message); } });
  }

  function start() {
    initSelects();
    bind();
    window.MATES_ESO_READY = true;
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", start);
  } else {
    start();
  }

  if ("serviceWorker" in navigator) {
    window.addEventListener("load", () => navigator.serviceWorker.register("./sw.js?v=4").catch(console.warn));
  }
})();
