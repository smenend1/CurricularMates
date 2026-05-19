"use strict";

document.addEventListener("DOMContentLoaded", () => {
  const $ = (id) => document.getElementById(id);

  const fmt = (n, digits = 6) =>
    Number.isFinite(Number(n))
      ? Number(n).toLocaleString("ca-ES", { maximumFractionDigits: digits })
      : String(n);

  function num(id) {
    const el = $(id);
    if (!el) throw new Error(`Falta el camp ${id}.`);
    const value = Number(String(el.value).replace(",", "."));
    if (!Number.isFinite(value)) throw new Error(`El camp ${id} ha de ser numèric.`);
    return value;
  }

  function positive(value, name) {
    if (!(Number.isFinite(value) && value > 0)) throw new Error(`${name} ha de ser positiu.`);
  }

  function nonZero(value, name) {
    if (Math.abs(value) < 1e-12) throw new Error(`${name} no pot ser 0.`);
  }

  function render({ title, summary, extra = "", steps = [] }) {
    const box = $("result");
    box.innerHTML = `
      <h2>${title}</h2>
      <p>${summary}</p>
      ${extra}
      ${steps.length ? `<div class="proc"><strong>Procediment</strong><ol>${steps.map(s => `<li>${s}</li>`).join("")}</ol></div>` : ""}
    `;
    box.scrollIntoView({ behavior: "smooth", block: "nearest" });
  }

  function renderError(title, message) {
    render({
      title,
      summary: `<span class="error">${message}</span>`,
      steps: ["Revisa les dades introduïdes.", "Comprova unitats, valors positius i denominadors zero."]
    });
  }

  function badges(items) {
    return `<div class="badge-row">${items.map(x => `<span class="badge">${x}</span>`).join("")}</div>`;
  }

  function kpis(items) {
    return `<div class="kpi-grid">${items.map(([label, value]) => `<div class="kpi"><span>${label}</span><strong>${value}</strong></div>`).join("")}</div>`;
  }

  function table(rows) {
    return `<table class="result-table"><tbody>${rows.map(([a, b]) => `<tr><th>${a}</th><td>${b}</td></tr>`).join("")}</tbody></table>`;
  }

  // Navegació: ara només canvia de pestanya i no "fa submit" accidental.
  function showView(id) {
    document.querySelectorAll(".view").forEach(view => view.classList.toggle("active", view.id === id));
    document.querySelectorAll(".tab").forEach(tab => tab.classList.toggle("active", tab.dataset.view === id));
  }

  document.querySelectorAll(".tab").forEach(button => {
    button.type = "button";
    button.addEventListener("click", () => showView(button.dataset.view));
  });

  document.querySelectorAll("[data-jump]").forEach(button => {
    button.type = "button";
    button.addEventListener("click", () => showView(button.dataset.jump));
  });

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
      context: "Planificació d’una sortida amb bus, entrades, menjar, descompte i pressupost.",
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
      context: "Càlcul d’àrea, perímetre, cost de paviment i escala de plànol.",
      math: ["àrees", "perímetres", "escales", "unitats"],
      template: `
        <label>Llargada (m)<input id="sa-a" type="number" value="7.5" step="any"></label>
        <label>Amplada (m)<input id="sa-b" type="number" value="4.2" step="any"></label>
        <label>Preu del paviment (€/m²)<input id="sa-c" type="number" value="18" step="any"></label>
        <label>Escala: 1 cm representa... (m)<input id="sa-d" type="number" value="0.5" step="any"></label>`
    },
    tariffs: {
      title: "Comparem tarifes",
      context: "Comparació de dues tarifes amb quota fixa i cost variable.",
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
      context: "Tractament de dades: mitjana, mediana, moda, rang i freqüències.",
      math: ["estadística", "freqüències", "gràfics", "conclusions"],
      template: `<label>Dades separades per comes<input id="sa-list" value="4,5,7,7,8,9,9,10,6,7"></label>`
    },
    energy: {
      title: "Consum energètic i sostenibilitat",
      context: "Estimació del cost energètic i de l’estalvi amb una reducció de consum.",
      math: ["unitats", "percentatges", "funcions", "sostenibilitat"],
      template: `
        <label>Consum mensual (kWh)<input id="sa-a" type="number" value="250" step="any"></label>
        <label>Preu energia (€/kWh)<input id="sa-b" type="number" value="0.18" step="any"></label>
        <label>Cost fix mensual (€)<input id="sa-c" type="number" value="12" step="any"></label>
        <label>Reducció proposada (%)<input id="sa-d" type="number" value="15" step="any"></label>`
    },
    games: {
      title: "Probabilitat i jocs",
      context: "Càlcul de probabilitat teòrica i freqüència esperada.",
      math: ["probabilitat", "Laplace", "freqüència esperada"],
      template: `
        <label>Casos favorables<input id="sa-a" type="number" value="2" step="1"></label>
        <label>Casos possibles<input id="sa-b" type="number" value="6" step="1"></label>
        <label>Nombre de partides simulades<input id="sa-c" type="number" value="120" step="1"></label>`
    }
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

  const TOOL_TEMPLATES = {
    linear: `<label>a<input type="number" id="t-a" value="2" step="any"></label><label>b<input type="number" id="t-b" value="-6" step="any"></label>`,
    quadratic: `<label>a<input type="number" id="t-a" value="1" step="any"></label><label>b<input type="number" id="t-b" value="-5" step="any"></label><label>c<input type="number" id="t-c" value="6" step="any"></label>`,
    proportion: `<label>x₁<input type="number" id="t-a" value="3" step="any"></label><label>y₁<input type="number" id="t-b" value="12" step="any"></label><label>x₂<input type="number" id="t-c" value="5" step="any"></label>`,
    percentage: `<label>Quantitat inicial<input type="number" id="t-a" value="80" step="any"></label><label>Percentatge<input type="number" id="t-b" value="15" step="any"></label>`,
    geometry: `<label>Figura<select id="t-shape"><option value="rectangle">Rectangle</option><option value="triangle">Triangle</option><option value="circle">Cercle</option><option value="cylinder">Cilindre</option></select></label><label>Mesura A<input type="number" id="t-a" value="8" step="any"></label><label>Mesura B<input type="number" id="t-b" value="3" step="any"></label>`,
    statistics: `<label>Dades separades per comes<input id="t-list" value="4,5,7,7,9,10"></label>`,
    graph: `<label>Funció<select id="t-fn"><option value="linear">f(x)=mx+n</option><option value="quadratic">f(x)=ax²+bx+c</option></select></label><label>a o m<input type="number" id="t-a" value="1" step="any"></label><label>b o n<input type="number" id="t-b" value="0" step="any"></label><label>c<input type="number" id="t-c" value="-4" step="any"></label>`
  };

  function init() {
    $("course-select").innerHTML = Object.entries(COURSES).map(([key, course]) => `<option value="${key}">${course.title}</option>`).join("");
    $("sa-select").innerHTML = Object.entries(SITUATIONS).map(([key, sa]) => `<option value="${key}">${sa.title}</option>`).join("");
    $("formula-area").innerHTML = Object.entries(FORMULAS).map(([key, area]) => `<option value="${key}">${area.label}</option>`).join("");
    updateSAInputs();
    updateFormulaItems();
    updateToolInputs();
  }

  function updateSAInputs() {
    const key = $("sa-select").value;
    $("sa-inputs").innerHTML = SITUATIONS[key].template;
  }

  function updateToolInputs() {
    $("tool-inputs").innerHTML = TOOL_TEMPLATES[$("tool-select").value] || "";
  }

  function updateFormulaItems() {
    const area = FORMULAS[$("formula-area").value];
    $("formula-item").innerHTML = area.items.map((item, index) => `<option value="${index}">${item[0]}</option>`).join("");
  }

  $("course-form").addEventListener("submit", (event) => {
    event.preventDefault();
    const course = COURSES[$("course-select").value];
    render({
      title: course.title,
      summary: "Itinerari recomanat per treballar matemàtiques de manera gradual.",
      extra: `${badges(course.focus)}<h3>Eines recomanades</h3><ul>${course.tools.map(x => `<li>${x}</li>`).join("")}</ul><h3>Situacions apropiades</h3><ul>${course.situations.map(x => `<li>${x}</li>`).join("")}</ul>`,
      steps: ["Comença per una situació propera.", "Identifica les eines matemàtiques necessàries.", "Calcula, representa i comprova.", "Escriu una conclusió."]
    });
  });

  $("sa-select").addEventListener("change", updateSAInputs);

  $("sa-form").addEventListener("submit", (event) => {
    event.preventDefault();
    try { calculateSA($("sa-select").value); }
    catch (error) { renderError("No s'ha pogut calcular la situació.", error.message); }
  });

  $("tool-select").addEventListener("change", updateToolInputs);

  $("tool-form").addEventListener("submit", (event) => {
    event.preventDefault();
    try { calculateTool($("tool-select").value); }
    catch (error) { renderError("No s'ha pogut calcular.", error.message); }
  });

  $("formula-area").addEventListener("change", updateFormulaItems);

  $("formula-form").addEventListener("submit", (event) => {
    event.preventDefault();
    const area = FORMULAS[$("formula-area").value];
    const item = area.items[Number($("formula-item").value || 0)];
    render({
      title: `${area.label}: ${item[0]}`,
      summary: `<span class="math">${item[1]}</span>`,
      steps: [item[2], "Identifica cada símbol.", "Substitueix dades amb unitats coherents.", "Comprova si el resultat té sentit."]
    });
  });

  $("assessment-form").addEventListener("submit", (event) => {
    event.preventDefault();
    const checked = [...document.querySelectorAll('input[name="a"]:checked')].length;
    const total = document.querySelectorAll('input[name="a"]').length;
    const pct = Math.round(checked / total * 100);
    const message = pct >= 85 ? "Procés molt complet." : pct >= 60 ? "Procés força bé, però encara es pot revisar." : "Cal reforçar el procés abans de validar la resposta.";
    render({
      title: "Autoavaluació del procés",
      summary: `<strong>${checked}/${total}</strong> punts · <strong>${pct}%</strong>. ${message}`,
      steps: ["Una bona resposta no és només un resultat.", "Cal entendre, representar, calcular, comprovar i comunicar.", "Revisa els punts no marcats."]
    });
  });

  function calculateSA(key) {
    if (key === "excursion") {
      const students = num("sa-a"), bus = num("sa-b"), ticket = num("sa-c"), food = num("sa-d"), discount = num("sa-e"), budget = num("sa-f");
      positive(students, "El nombre d’alumnes");
      const raw = bus + students * (ticket + food);
      const discountAmount = raw * discount / 100;
      const total = raw - discountAmount;
      const perStudent = total / students;
      const diff = budget - total;
      render({
        title: "SA: Organitzem una excursió",
        summary: diff >= 0 ? `El pressupost és suficient. Sobren <strong>${fmt(diff)} €</strong>.` : `El pressupost no arriba. Falten <strong>${fmt(Math.abs(diff))} €</strong>.`,
        extra: kpis([["Cost total", `${fmt(total)} €`], ["Cost per alumne", `${fmt(perStudent)} €`], ["Diferència", `${fmt(diff)} €`]]) +
          table([["Bus", `${fmt(bus)} €`], ["Entrades", `${fmt(students * ticket)} €`], ["Menjar", `${fmt(students * food)} €`], ["Descompte", `-${fmt(discountAmount)} €`]]),
        steps: ["Calculem entrada + menjar per alumne.", "Multipliquem pel nombre d’alumnes.", "Sumem el bus.", "Apliquem el descompte.", "Compareu amb el pressupost."]
      });
    }

    if (key === "room") {
      const length = num("sa-a"), width = num("sa-b"), price = num("sa-c"), scale = num("sa-d");
      positive(length, "La llargada"); positive(width, "L’amplada"); positive(price, "El preu"); positive(scale, "L’escala");
      const area = length * width, perimeter = 2 * (length + width), cost = area * price, planL = length / scale, planW = width / scale;
      render({
        title: "SA: Dissenyem una aula o habitació",
        summary: `Àrea = <strong>${fmt(area)} m²</strong>, cost estimat = <strong>${fmt(cost)} €</strong>.`,
        extra: kpis([["Àrea", `${fmt(area)} m²`], ["Perímetre", `${fmt(perimeter)} m`], ["Cost", `${fmt(cost)} €`], ["Plànol", `${fmt(planL)} cm × ${fmt(planW)} cm`]]),
        steps: ["Àrea = llargada·amplada.", "Perímetre = 2(llargada + amplada).", "Cost = àrea·preu.", "Plànol = mesures reals / escala."]
      });
    }

    if (key === "tariffs") {
      const fa = num("sa-a"), va = num("sa-b"), fb = num("sa-c"), vb = num("sa-d"), x = num("sa-e");
      const costA = fa + va * x, costB = fb + vb * x;
      const cut = Math.abs(va - vb) > 1e-12 ? (fb - fa) / (va - vb) : null;
      const better = costA < costB ? "A" : costB < costA ? "B" : "iguals";
      const canvasId = "tariff-" + Math.random().toString(36).slice(2);
      render({
        title: "SA: Comparem tarifes",
        summary: `Per un consum de ${fmt(x)}, la millor opció és: <strong>${better}</strong>.`,
        extra: kpis([["Cost A", `${fmt(costA)} €`], ["Cost B", `${fmt(costB)} €`], ["Millor opció", better], ["Punt d’igualtat", cut !== null && cut >= 0 ? `${fmt(cut)} unitats` : "no aplicable"]]) +
          `<div class="canvas-wrap"><canvas id="${canvasId}"></canvas></div>`,
        steps: ["Modelitzem cada tarifa: cost = quota fixa + preu variable·consum.", "Calculem el cost amb el consum previst.", "Resolem el punt d’igualtat.", "Dibuixem les dues rectes."]
      });
      requestAnimationFrame(() => drawTwoLines(canvasId, (t) => fa + va * t, (t) => fb + vb * t, Math.max(100, x * 1.3)));
    }

    if (key === "survey") {
      const values = $("sa-list").value.split(",").map(x => Number(x.trim().replace(",", "."))).filter(Number.isFinite);
      if (!values.length) throw new Error("Escriu dades separades per comes.");
      const sorted = [...values].sort((a, b) => a - b);
      const mean = values.reduce((s, x) => s + x, 0) / values.length;
      const median = sorted.length % 2 ? sorted[(sorted.length - 1) / 2] : (sorted[sorted.length / 2 - 1] + sorted[sorted.length / 2]) / 2;
      const range = sorted[sorted.length - 1] - sorted[0];
      const freq = {};
      values.forEach(v => freq[v] = (freq[v] || 0) + 1);
      const maxF = Math.max(...Object.values(freq));
      const modes = Object.entries(freq).filter(([, v]) => v === maxF).map(([k]) => k);
      const freqTable = `<table class="result-table"><tr><th>Valor</th><th>Freqüència</th></tr>${Object.entries(freq).sort((a, b) => Number(a[0]) - Number(b[0])).map(([k, v]) => `<tr><td>${k}</td><td>${v}</td></tr>`).join("")}</table>`;
      render({
        title: "SA: Analitzem una enquesta",
        summary: `Mitjana = <strong>${fmt(mean)}</strong>, mediana = <strong>${fmt(median)}</strong>, moda = <strong>${modes.join(", ")}</strong>.`,
        extra: kpis([["N dades", values.length], ["Rang", fmt(range)], ["Mínim", fmt(sorted[0])], ["Màxim", fmt(sorted[sorted.length - 1])]]) + freqTable,
        steps: ["Ordenem les dades.", "Mitjana = suma/n.", "Mediana = valor central.", "Moda = valor amb més freqüència.", "Rang = màxim - mínim."]
      });
    }

    if (key === "energy") {
      const kwh = num("sa-a"), price = num("sa-b"), fixed = num("sa-c"), reduction = num("sa-d");
      positive(kwh, "El consum"); positive(price, "El preu");
      const cost = kwh * price + fixed;
      const newKwh = kwh * (1 - reduction / 100);
      const newCost = newKwh * price + fixed;
      const saving = cost - newCost;
      render({
        title: "SA: Consum energètic i sostenibilitat",
        summary: `Cost actual = <strong>${fmt(cost)} €</strong>. Amb la reducció: <strong>${fmt(newCost)} €</strong>.`,
        extra: kpis([["Consum actual", `${fmt(kwh)} kWh`], ["Consum reduït", `${fmt(newKwh)} kWh`], ["Estalvi mensual", `${fmt(saving)} €`], ["Estalvi anual", `${fmt(saving * 12)} €`]]),
        steps: ["Cost variable = consum·preu.", "Afegim el cost fix.", "Apliquem la reducció al consum.", "Compareu cost inicial i reduït."]
      });
    }

    if (key === "games") {
      const fav = num("sa-a"), poss = num("sa-b"), trials = num("sa-c");
      positive(poss, "Els casos possibles"); positive(trials, "El nombre de partides");
      if (fav < 0 || fav > poss) throw new Error("Els casos favorables han d’estar entre 0 i els possibles.");
      const p = fav / poss, expected = p * trials;
      render({
        title: "SA: Probabilitat i jocs",
        summary: `Probabilitat = <strong>${fmt(p * 100)}%</strong>. En ${fmt(trials)} partides, s’esperen <strong>${fmt(expected)}</strong> èxits.`,
        extra: kpis([["Probabilitat", fmt(p)], ["Percentatge", `${fmt(p * 100)}%`], ["Freqüència esperada", fmt(expected)]]),
        steps: ["Regla de Laplace: favorables / possibles.", "Convertim a percentatge.", "Multipliquem per les partides per obtenir la freqüència esperada."]
      });
    }
  }

  function calculateTool(type) {
    if (type === "linear") return solveLinear();
    if (type === "quadratic") return solveQuadratic();
    if (type === "proportion") return solveProportion();
    if (type === "percentage") return solvePercentage();
    if (type === "geometry") return solveGeometry();
    if (type === "statistics") return solveStatistics();
    if (type === "graph") return solveGraph();
  }

  function solveLinear() {
    const a = num("t-a"), b = num("t-b");
    nonZero(a, "a");
    const x = -b / a;
    render({ title: "Equació lineal", summary: `<span class="math">${fmt(a)}x + ${fmt(b)} = 0</span> → <strong>x = ${fmt(x)}</strong>`, steps: ["Partim de ax+b=0.", "Passem b a l’altre costat.", "Dividim per a.", `x=${fmt(-b)}/${fmt(a)}=${fmt(x)}.`] });
  }

  function solveQuadratic() {
    const a = num("t-a"), b = num("t-b"), c = num("t-c");
    nonZero(a, "a");
    const d = b * b - 4 * a * c;
    if (d < 0) {
      render({ title: "Equació quadràtica", summary: `<span class="math">Δ=${fmt(d)}</span>. No hi ha solucions reals.`, steps: ["Calculem Δ=b²-4ac.", "Com que Δ és negatiu, no hi ha arrels reals."] });
      return;
    }
    const x1 = (-b + Math.sqrt(d)) / (2 * a), x2 = (-b - Math.sqrt(d)) / (2 * a);
    render({ title: "Equació quadràtica", summary: `<strong>x₁=${fmt(x1)}</strong>, <strong>x₂=${fmt(x2)}</strong>`, steps: [`Δ=${fmt(d)}.`, "Apliquem la fórmula general.", `x₁=${fmt(x1)}, x₂=${fmt(x2)}.`] });
  }

  function solveProportion() {
    const x1 = num("t-a"), y1 = num("t-b"), x2 = num("t-c");
    nonZero(x1, "x₁");
    const k = y1 / x1, y2 = k * x2;
    render({ title: "Proporcionalitat directa", summary: `<strong>y₂=${fmt(y2)}</strong>`, steps: ["En proporcionalitat directa, y=kx.", `k=${fmt(k)}.`, `y₂=${fmt(k)}·${fmt(x2)}=${fmt(y2)}.`] });
  }

  function solvePercentage() {
    const base = num("t-a"), pct = num("t-b"), amount = base * pct / 100;
    render({ title: "Percentatges", summary: `${fmt(pct)}% de ${fmt(base)} = <strong>${fmt(amount)}</strong>`, steps: ["Dividim el percentatge per 100.", `Quantitat=${fmt(base)}·${fmt(pct)}/100=${fmt(amount)}.`, `Increment: ${fmt(base + amount)}. Descompte: ${fmt(base - amount)}.`] });
  }

  function solveGeometry() {
    const shape = $("t-shape").value, a = num("t-a"), b = num("t-b");
    positive(a, "Mesura A");
    let summary = "", steps = [];
    if (shape === "rectangle") { positive(b, "Mesura B"); summary = `Àrea=<strong>${fmt(a * b)}</strong>, perímetre=<strong>${fmt(2 * (a + b))}</strong>`; steps = ["A=base·altura.", "P=2(base+altura)."]; }
    if (shape === "triangle") { positive(b, "Mesura B"); summary = `Àrea=<strong>${fmt(a * b / 2)}</strong>`; steps = ["A=base·altura/2."]; }
    if (shape === "circle") { summary = `Àrea=<strong>${fmt(Math.PI * a * a)}</strong>, longitud=<strong>${fmt(2 * Math.PI * a)}</strong>`; steps = ["A=πr².", "L=2πr."]; }
    if (shape === "cylinder") { positive(b, "Mesura B"); summary = `Volum=<strong>${fmt(Math.PI * a * a * b)}</strong>`; steps = ["V=πr²h."]; }
    render({ title: "Geometria", summary, steps });
  }

  function solveStatistics() {
    const values = $("t-list").value.split(",").map(x => Number(x.trim().replace(",", "."))).filter(Number.isFinite);
    if (!values.length) throw new Error("Escriu dades separades per comes.");
    const sorted = [...values].sort((a, b) => a - b);
    const mean = values.reduce((s, x) => s + x, 0) / values.length;
    const median = sorted.length % 2 ? sorted[(sorted.length - 1) / 2] : (sorted[sorted.length / 2 - 1] + sorted[sorted.length / 2]) / 2;
    const range = sorted[sorted.length - 1] - sorted[0];
    render({ title: "Estadística bàsica", summary: `Mitjana=<strong>${fmt(mean)}</strong>, mediana=<strong>${fmt(median)}</strong>, rang=<strong>${fmt(range)}</strong>`, steps: ["Ordenem les dades.", "Mitjana: suma/n.", "Mediana: valor central.", "Rang: màxim-mínim."] });
  }

  function solveGraph() {
    const kind = $("t-fn").value, a = num("t-a"), b = num("t-b"), c = num("t-c");
    const id = "graph-" + Math.random().toString(36).slice(2);
    const label = kind === "linear" ? `f(x)=${fmt(a)}x+${fmt(b)}` : `f(x)=${fmt(a)}x²+${fmt(b)}x+${fmt(c)}`;
    render({ title: "Gràfica de funció", summary: `<span class="math">${label}</span>`, extra: `<div class="canvas-wrap"><canvas id="${id}"></canvas></div>`, steps: ["Generem punts entre -10 i 10.", "Calculem f(x).", "Dibuixem el canvas després de renderitzar-lo."] });
    requestAnimationFrame(() => drawFunction(id, (x) => kind === "linear" ? a * x + b : a * x * x + b * x + c));
  }

  function drawFunction(id, fn) {
    const canvas = $(id);
    if (!canvas) return;
    const rect = canvas.getBoundingClientRect(), size = Math.max(320, Math.round(rect.width || 720)), dpr = window.devicePixelRatio || 1;
    canvas.width = size * dpr; canvas.height = size * dpr; canvas.style.height = size + "px";
    const ctx = canvas.getContext("2d");
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    const W = size, H = size, pad = Math.max(34, Math.round(size * .07)), min = -10, max = 10;
    const X = x => pad + (x - min) / (max - min) * (W - 2 * pad);
    const Y = y => H - pad - (y - min) / (max - min) * (H - 2 * pad);
    ctx.fillStyle = "#fff"; ctx.fillRect(0, 0, W, H);
    ctx.strokeStyle = "#e2e8f0"; ctx.lineWidth = 1;
    for (let i = -10; i <= 10; i++) {
      ctx.beginPath(); ctx.moveTo(X(i), pad); ctx.lineTo(X(i), H - pad); ctx.stroke();
      ctx.beginPath(); ctx.moveTo(pad, Y(i)); ctx.lineTo(W - pad, Y(i)); ctx.stroke();
    }
    ctx.strokeStyle = "#334155"; ctx.lineWidth = 2;
    ctx.beginPath(); ctx.moveTo(X(0), pad); ctx.lineTo(X(0), H - pad); ctx.stroke();
    ctx.beginPath(); ctx.moveTo(pad, Y(0)); ctx.lineTo(W - pad, Y(0)); ctx.stroke();
    ctx.strokeStyle = "#1d4ed8"; ctx.lineWidth = 3; ctx.beginPath();
    let started = false;
    for (let i = 0; i <= 800; i++) {
      const x = min + (max - min) * i / 800, y = fn(x);
      if (!Number.isFinite(y) || y < min * 4 || y > max * 4) { started = false; continue; }
      const cx = X(x), cy = Y(Math.max(min, Math.min(max, y)));
      if (!started) { ctx.moveTo(cx, cy); started = true; } else ctx.lineTo(cx, cy);
    }
    ctx.stroke();
  }

  function drawTwoLines(id, fA, fB, xmax) {
    const canvas = $(id);
    if (!canvas) return;
    const rect = canvas.getBoundingClientRect(), size = Math.max(320, Math.round(rect.width || 720)), dpr = window.devicePixelRatio || 1;
    canvas.width = size * dpr; canvas.height = size * dpr; canvas.style.height = size + "px";
    const ctx = canvas.getContext("2d");
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    const W = size, H = size, pad = 42;
    const xs = Array.from({ length: 301 }, (_, i) => xmax * i / 300);
    const ys = xs.flatMap(x => [fA(x), fB(x)]).filter(Number.isFinite);
    const ymax = Math.max(10, ...ys) * 1.1;
    const X = x => pad + x / xmax * (W - 2 * pad);
    const Y = y => H - pad - y / ymax * (H - 2 * pad);
    ctx.fillStyle = "#fff"; ctx.fillRect(0, 0, W, H);
    ctx.strokeStyle = "#e2e8f0"; ctx.lineWidth = 1;
    for (let i = 0; i <= 5; i++) {
      const x = xmax * i / 5, y = ymax * i / 5;
      ctx.beginPath(); ctx.moveTo(X(x), pad); ctx.lineTo(X(x), H - pad); ctx.stroke();
      ctx.beginPath(); ctx.moveTo(pad, Y(y)); ctx.lineTo(W - pad, Y(y)); ctx.stroke();
    }
    ctx.strokeStyle = "#334155"; ctx.lineWidth = 2;
    ctx.beginPath(); ctx.moveTo(pad, H - pad); ctx.lineTo(W - pad, H - pad); ctx.stroke();
    ctx.beginPath(); ctx.moveTo(pad, pad); ctx.lineTo(pad, H - pad); ctx.stroke();
    function line(fn, color) {
      ctx.strokeStyle = color; ctx.lineWidth = 3; ctx.beginPath();
      xs.forEach((x, i) => {
        const px = X(x), py = Y(fn(x));
        if (i === 0) ctx.moveTo(px, py); else ctx.lineTo(px, py);
      });
      ctx.stroke();
    }
    line(fA, "#1d4ed8");
    line(fB, "#b91c1c");
  }

  init();

  if ("serviceWorker" in navigator) {
    window.addEventListener("load", () => navigator.serviceWorker.register("./sw.js").catch(console.warn));
  }
});
