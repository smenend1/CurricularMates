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

  function getSALevel() {
    const level = Number($("sa-level")?.value || 1);
    return [1, 2, 3, 4].includes(level) ? level : 1;
  }

  function levelTitle(level) {
    return {
      1: "Nivell 1 · entendre i calcular",
      2: "Nivell 2 · representar i comparar",
      3: "Nivell 3 · modelitzar i justificar",
      4: "Nivell 4 · crear proposta pròpia"
    }[level] || "Nivell 1";
  }

  function calculateSA() {
    const key = $("sa-select").value;
    const level = getSALevel();
    if (key === "excursion") return calcExcursion(level);
    if (key === "room") return calcRoom(level);
    if (key === "tariffs") return calcTariffs(level);
    if (key === "survey") return calcSurvey(level);
    if (key === "energy") return calcEnergy(level);
    if (key === "games") return calcGames(level);
    throw new Error("Aquesta situació encara no té càlcul directe.");
  }

  function calcExcursion(level) {
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

    let title = `SA: Organitzem una excursió · ${levelTitle(level)}`;
    let summary = "";
    let extra = "";
    let steps = [];

    if (level === 1) {
      summary = diff >= 0 ? `El pressupost és suficient. Sobren <strong>${fmt(diff)} €</strong>.` : `El pressupost no arriba. Falten <strong>${fmt(Math.abs(diff))} €</strong>.`;
      extra = kpis([["Cost total", `${fmt(total)} €`], ["Cost per alumne", `${fmt(perStudent)} €`], ["Diferència amb pressupost", `${fmt(diff)} €`]]) +
        table([["Bus", `${fmt(bus)} €`], ["Entrades", `${fmt(students * ticket)} €`], ["Menjar", `${fmt(students * food)} €`], ["Descompte", `-${fmt(discountAmount)} €`]]);
      steps = ["Calculem entrada + menjar per alumne.", "Multipliquem pel nombre d’alumnes.", "Sumem el bus.", "Apliquem el descompte.", "Compareu amb el pressupost."];
    }

    if (level === 2) {
      const busPct = bus / raw * 100;
      const ticketsPct = students * ticket / raw * 100;
      const foodPct = students * food / raw * 100;
      summary = `El cost més important representa el percentatge més alt del total abans de descompte.`;
      extra = kpis([["Bus", `${fmt(busPct)}%`], ["Entrades", `${fmt(ticketsPct)}%`], ["Menjar", `${fmt(foodPct)}%`], ["Total sense descompte", `${fmt(raw)} €`]]) +
        table([["Cost per alumne sense descompte", `${fmt(raw / students)} €`], ["Cost per alumne amb descompte", `${fmt(perStudent)} €`], ["Estalvi per alumne", `${fmt(discountAmount / students)} €`]]);
      steps = ["Separem el cost en bus, entrades i menjar.", "Calculem quin percentatge representa cada part.", "Compareu cost per alumne abans i després del descompte.", "Això ajuda a representar la situació amb gràfics de sectors o barres."];
    }

    if (level === 3) {
      const variable = ticket + food;
      const fixedAfterDiscount = bus * (1 - discount / 100);
      const variableAfterDiscount = variable * (1 - discount / 100);
      const maxStudentsForBudget = Math.floor((budget / (1 - discount / 100) - bus) / variable);
      summary = `Model: <span class="math">C(n)=(${fmt(bus)} + ${fmt(variable)}·n)·(1-${fmt(discount)}/100)</span>.`;
      extra = kpis([["Cost fix amb descompte", `${fmt(fixedAfterDiscount)} €`], ["Cost variable/alumne amb descompte", `${fmt(variableAfterDiscount)} €`], ["Alumnes màxims amb pressupost", `${fmt(maxStudentsForBudget)}`], ["Alumnes actuals", `${fmt(students)}`]]);
      steps = ["Construïm una funció del cost segons el nombre d’alumnes.", "La part fixa és el bus.", "La part variable és entrada + menjar per alumne.", "Apliquem el descompte a tota l’expressió.", "Aïllem n per estimar quants alumnes admet el pressupost."];
    }

    if (level === 4) {
      const targetPerStudent = budget / students;
      const neededDiscount = raw > 0 ? Math.max(0, (1 - budget / raw) * 100) : 0;
      summary = diff >= 0
        ? `La proposta és viable. Es pot justificar amb un cost per alumne de <strong>${fmt(perStudent)} €</strong>.`
        : `Cal modificar la proposta. Per ajustar-la al pressupost caldria un descompte aproximat del <strong>${fmt(neededDiscount)}%</strong>.`;
      extra = kpis([["Límit per alumne", `${fmt(targetPerStudent)} €`], ["Cost actual per alumne", `${fmt(perStudent)} €`], ["Descompte necessari", `${fmt(neededDiscount)}%`]]) +
        `<div class="debug-note">Conclusió suggerida: justifica si convé buscar transport més barat, reduir el cost del menjar o negociar descompte.</div>`;
      steps = ["Convertim el pressupost en límit per alumne.", "Compareu el cost real amb aquest límit.", "Si no és viable, calculem quin descompte faria falta.", "La resposta final ha d’incloure decisió i justificació."];
    }

    render({ title, summary, extra, steps });
  }

  function calcRoom(level) {
    const length = readNumber("sa-a");
    const width = readNumber("sa-b");
    const price = readNumber("sa-c");
    const scale = readNumber("sa-d");
    positive(length, "La llargada"); positive(width, "L’amplada"); positive(price, "El preu"); positive(scale, "L’escala");

    const area = length * width;
    const perimeter = 2 * (length + width);
    const cost = area * price;
    const planL = length / scale;
    const planW = width / scale;

    let title = `SA: Dissenyem una aula o habitació · ${levelTitle(level)}`;
    let summary = "";
    let extra = "";
    let steps = [];

    if (level === 1) {
      summary = `Àrea = <strong>${fmt(area)} m²</strong>, perímetre = <strong>${fmt(perimeter)} m</strong>.`;
      extra = kpis([["Àrea", `${fmt(area)} m²`], ["Perímetre", `${fmt(perimeter)} m`], ["Cost paviment", `${fmt(cost)} €`]]);
      steps = ["Àrea = llargada·amplada.", "Perímetre = 2(llargada+amplada).", "Cost = àrea·preu per m²."];
    }

    if (level === 2) {
      summary = `Al plànol, l’espai faria <strong>${fmt(planL)} cm × ${fmt(planW)} cm</strong>.`;
      extra = kpis([["Llargada al plànol", `${fmt(planL)} cm`], ["Amplada al plànol", `${fmt(planW)} cm`], ["Escala usada", `1 cm → ${fmt(scale)} m`]]);
      steps = ["Interpretem l’escala.", "Dividim cada mesura real pel valor que representa 1 cm.", "El resultat són dimensions del plànol en centímetres."];
    }

    if (level === 3) {
      const optionCheap = area * (price * 0.85);
      const optionPremium = area * (price * 1.25);
      summary = `Comparació de materials: econòmic <strong>${fmt(optionCheap)} €</strong>, estàndard <strong>${fmt(cost)} €</strong>, premium <strong>${fmt(optionPremium)} €</strong>.`;
      extra = table([["Material econòmic (-15%)", `${fmt(optionCheap)} €`], ["Material estàndard", `${fmt(cost)} €`], ["Material premium (+25%)", `${fmt(optionPremium)} €`]]);
      steps = ["Mantenim la mateixa àrea.", "Compareu diferents preus per metre quadrat.", "La decisió no depèn només del preu: també cal justificar qualitat, ús i durabilitat."];
    }

    if (level === 4) {
      const usable = area * 0.75;
      const people = Math.floor(usable / 1.5);
      summary = `Proposta: si només el 75% és espai útil, hi ha <strong>${fmt(usable)} m²</strong> útils i cabrien aproximadament <strong>${people}</strong> persones.`;
      extra = kpis([["Espai útil estimat", `${fmt(usable)} m²`], ["Persones estimades", people], ["Cost total", `${fmt(cost)} €`]]);
      steps = ["No tota la superfície és útil: deixem zones de pas.", "Estimem el 75% com a superfície utilitzable.", "Suposem 1,5 m² per persona.", "La proposta final ha d’incloure criteris de comoditat i seguretat."];
    }

    render({ title, summary, extra, steps });
  }

  function calcTariffs(level) {
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

    let title = `SA: Comparem tarifes · ${levelTitle(level)}`;
    let summary = "";
    let extra = "";
    let steps = [];

    if (level === 1) {
      summary = `Per un consum de ${fmt(x)}, la millor opció és: <strong>${better}</strong>.`;
      extra = kpis([["Cost tarifa A", `${fmt(costA)} €`], ["Cost tarifa B", `${fmt(costB)} €`], ["Diferència", `${fmt(Math.abs(costA - costB))} €`]]);
      steps = ["Calculem cada tarifa substituint el consum.", "Compareu els dos costos.", "Triem el cost més baix."];
    }

    if (level === 2) {
      const canvasId = `tariff-${Math.random().toString(36).slice(2)}`;
      summary = `Representem les dues tarifes com a rectes.`;
      extra = kpis([["Punt d’igualtat", cut !== null && cut >= 0 ? `${fmt(cut)} unitats` : "no aplicable"], ["Tarifa A", `C=${fmt(fa)}+${fmt(va)}x`], ["Tarifa B", `C=${fmt(fb)}+${fmt(vb)}x`]]) +
        `<div class="canvas-wrap"><canvas id="${canvasId}"></canvas></div>`;
      steps = ["Cada tarifa és una funció lineal.", "El tall amb l’eix vertical és la quota fixa.", "La pendent és el preu variable.", "El punt de tall indica quan costen igual."];
      render({ title, summary, extra, steps });
      requestAnimationFrame(() => drawTwoLines(canvasId, (t) => fa + va * t, (t) => fb + vb * t, Math.max(100, x * 1.3)));
      return;
    }

    if (level === 3) {
      summary = cut !== null ? `Modelització: les tarifes són iguals quan <strong>x=${fmt(cut)}</strong>.` : "Les tarifes tenen la mateixa pendent; no hi ha un únic punt de tall.";
      extra = table([["Tarifa A", `C_A(x)=${fmt(fa)}+${fmt(va)}x`], ["Tarifa B", `C_B(x)=${fmt(fb)}+${fmt(vb)}x`], ["Equació", `${fmt(fa)}+${fmt(va)}x = ${fmt(fb)}+${fmt(vb)}x`]]);
      steps = ["Escrivim les dues funcions.", "Igualem les expressions.", "Aïllem x.", "Interpretem el resultat com a consum de canvi de tarifa."];
    }

    if (level === 4) {
      const profiles = [25, 75, 150];
      const rows = profiles.map((p) => {
        const a = fa + va * p;
        const b = fb + vb * p;
        return [`Consum ${p}`, `A=${fmt(a)} €, B=${fmt(b)} €, millor: ${a < b ? "A" : b < a ? "B" : "iguals"}`];
      });
      summary = "Decisió per perfils de consum.";
      extra = table(rows) + `<div class="debug-note">Conclusió suggerida: no hi ha una tarifa universalment millor si les rectes es tallen; depèn del consum.</div>`;
      steps = ["Triem perfils de consum baix, mitjà i alt.", "Calculem el cost de cada tarifa.", "Justifiquem per a quin perfil convé cada opció."];
    }

    render({ title, summary, extra, steps });
  }

  function calcSurvey(level) {
    const arr = readList("sa-list");
    const sorted = [...arr].sort((a, b) => a - b);
    const mean = arr.reduce((s, x) => s + x, 0) / arr.length;
    const median = sorted.length % 2 ? sorted[(sorted.length - 1) / 2] : (sorted[sorted.length / 2 - 1] + sorted[sorted.length / 2]) / 2;
    const range = sorted[sorted.length - 1] - sorted[0];
    const freq = {};
    arr.forEach((x) => { freq[x] = (freq[x] || 0) + 1; });
    const maxFreq = Math.max(...Object.values(freq));
    const modes = Object.entries(freq).filter(([, v]) => v === maxFreq).map(([k]) => k);

    let title = `SA: Analitzem una enquesta · ${levelTitle(level)}`;
    let summary = "";
    let extra = "";
    let steps = [];

    if (level === 1) {
      summary = `Mitjana = <strong>${fmt(mean)}</strong>, mediana = <strong>${fmt(median)}</strong>, moda = <strong>${modes.join(", ")}</strong>.`;
      extra = kpis([["N dades", arr.length], ["Rang", fmt(range)], ["Màxim", fmt(sorted.at(-1))], ["Mínim", fmt(sorted[0])]]);
      steps = ["Ordenem les dades.", "Calculem mitjana, mediana i moda.", "Calculem el rang."];
    }

    if (level === 2) {
      summary = "Taula de freqüències per representar amb gràfic de barres.";
      extra = freqTable(freq);
      steps = ["Comptem quantes vegades apareix cada valor.", "Això crea una taula de freqüències.", "A partir d’aquesta taula es pot fer un gràfic de barres."];
    }

    if (level === 3) {
      const below = arr.filter((x) => x < mean).length;
      const above = arr.filter((x) => x > mean).length;
      summary = `Hi ha <strong>${below}</strong> valors per sota de la mitjana i <strong>${above}</strong> per sobre.`;
      extra = kpis([["Mitjana", fmt(mean)], ["Per sota", below], ["Per sobre", above], ["Iguals a mitjana", arr.length - below - above]]);
      steps = ["Fem servir la mitjana com a referència.", "Classifiquem dades per sota, per sobre o iguals.", "Això ajuda a interpretar la distribució."];
    }

    if (level === 4) {
      const outlierLimit = mean + range * 0.5;
      const possibleOutliers = arr.filter((x) => x > outlierLimit);
      summary = possibleOutliers.length ? `Hi ha possibles valors extrems: <strong>${possibleOutliers.join(", ")}</strong>.` : "No es detecten valors extrems evidents amb aquest criteri simple.";
      extra = `<div class="debug-note">Conclusió suggerida: explica si la mostra és prou gran, si pot haver-hi biaix i si la mitjana representa bé el grup.</div>`;
      steps = ["Analitzem si hi ha valors que poden distorsionar la mitjana.", "Valorem si la mostra és representativa.", "La conclusió ha d’incloure una interpretació, no només càlculs."];
    }

    render({ title, summary, extra, steps });
  }

  function calcEnergy(level) {
    const kwh = readNumber("sa-a");
    const price = readNumber("sa-b");
    const fixed = readNumber("sa-c");
    const reduction = readNumber("sa-d");
    positive(kwh, "El consum"); positive(price, "El preu");

    const cost = kwh * price + fixed;
    const reducedKwh = kwh * (1 - reduction / 100);
    const reducedCost = reducedKwh * price + fixed;
    const saving = cost - reducedCost;

    let title = `SA: Consum energètic i sostenibilitat · ${levelTitle(level)}`;
    let summary = "";
    let extra = "";
    let steps = [];

    if (level === 1) {
      summary = `Cost actual = <strong>${fmt(cost)} €</strong>.`;
      extra = kpis([["Consum", `${fmt(kwh)} kWh`], ["Cost variable", `${fmt(kwh * price)} €`], ["Cost fix", `${fmt(fixed)} €`], ["Cost total", `${fmt(cost)} €`]]);
      steps = ["Multipliquem kWh pel preu.", "Afegim el cost fix.", "Obtenim el cost mensual."];
    }

    if (level === 2) {
      summary = `Amb una reducció del ${fmt(reduction)}%, el cost seria <strong>${fmt(reducedCost)} €</strong>.`;
      extra = kpis([["Consum reduït", `${fmt(reducedKwh)} kWh`], ["Estalvi mensual", `${fmt(saving)} €`], ["Estalvi anual", `${fmt(saving * 12)} €`]]);
      steps = ["Apliquem el percentatge de reducció al consum.", "Calculem el nou cost.", "Compareu cost inicial i reduït."];
    }

    if (level === 3) {
      const model = `C(x)=${fmt(fixed)}+${fmt(price)}x`;
      summary = `Model de cost: <span class="math">${model}</span>.`;
      extra = table([["Consum actual", `${fmt(kwh)} kWh`], ["Funció", model], ["Cost per 100 kWh", `${fmt(fixed + price * 100)} €`], ["Cost per 300 kWh", `${fmt(fixed + price * 300)} €`]]);
      steps = ["Modelitzem el cost com a funció lineal del consum.", "La quota fixa és el terme independent.", "El preu per kWh és la pendent.", "Això permet fer prediccions."];
    }

    if (level === 4) {
      const targetSaving = cost * 0.2;
      const neededReduction = (targetSaving / (kwh * price)) * 100;
      summary = `Per reduir la factura un 20%, caldria reduir aproximadament el consum un <strong>${fmt(neededReduction)}%</strong>.`;
      extra = kpis([["Objectiu estalvi", `${fmt(targetSaving)} €`], ["Reducció necessària", `${fmt(neededReduction)}%`], ["Estalvi amb proposta actual", `${fmt(saving)} €`]]);
      steps = ["Definim un objectiu d’estalvi.", "Com que el cost fix no es redueix, l’estalvi surt del consum variable.", "Calculem quin percentatge de consum caldria reduir.", "La proposta final ha d’incloure accions concretes."];
    }

    render({ title, summary, extra, steps });
  }

  function calcGames(level) {
    const fav = readNumber("sa-a");
    const poss = readNumber("sa-b");
    const trials = readNumber("sa-c");
    positive(poss, "Els casos possibles"); positive(trials, "El nombre de partides");
    if (fav < 0 || fav > poss) throw new Error("Els casos favorables han d’estar entre 0 i els casos possibles.");

    const p = fav / poss;
    const expected = p * trials;

    let title = `SA: Probabilitat i jocs · ${levelTitle(level)}`;
    let summary = "";
    let extra = "";
    let steps = [];

    if (level === 1) {
      summary = `Probabilitat = <strong>${fmt(p * 100)}%</strong>.`;
      extra = kpis([["Probabilitat", fmt(p)], ["Percentatge", `${fmt(p * 100)}%`]]);
      steps = ["Apliquem Laplace: favorables/possibles.", "Convertim a percentatge multiplicant per 100."];
    }

    if (level === 2) {
      summary = `En ${fmt(trials)} partides, s’esperen aproximadament <strong>${fmt(expected)}</strong> èxits.`;
      extra = kpis([["Partides", fmt(trials)], ["Freqüència esperada", fmt(expected)], ["No èxits esperats", fmt(trials - expected)]]);
      steps = ["Multipliquem probabilitat per nombre de partides.", "El resultat és una esperança, no una garantia.", "Compareu freqüència teòrica i resultats reals si feu una simulació."];
    }

    if (level === 3) {
      const fairPrize = p > 0 ? 1 / p : Infinity;
      summary = `Si jugar costa 1 punt, el premi just aproximat seria <strong>${fmt(fairPrize)} punts</strong>.`;
      extra = kpis([["Probabilitat d’èxit", fmt(p)], ["Premi just", fmt(fairPrize)], ["Risc", `${fmt((1 - p) * 100)}% de no èxit`]]);
      steps = ["Un joc just equilibra cost i esperança de guany.", "Si el cost és 1, el premi just és aproximadament 1/p.", "Això ajuda a decidir si un joc és favorable o desfavorable."];
    }

    if (level === 4) {
      const targetP = 0.5;
      const neededFav = Math.round(poss * targetP);
      summary = `Per fer un joc aproximadament equilibrat al 50%, caldrien <strong>${neededFav}</strong> casos favorables de ${fmt(poss)}.`;
      extra = `<div class="debug-note">Conclusió suggerida: modifica regles, casos favorables o premis perquè el joc sigui just.</div>`;
      steps = ["Definim una probabilitat objectiu.", "Calculem casos favorables necessaris.", "La proposta final ha d’explicar com canvien les regles i per què el joc és més just."];
    }

    render({ title, summary, extra, steps });
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
    window.addEventListener("load", () => navigator.serviceWorker.register("./sw.js?v=8").catch(console.warn));
  }
})();


/* V6 overlay: mode docent, fitxes curriculars, conclusions i informe copiable */
(function(){
  "use strict";
  const $=id=>document.getElementById(id);
  const $$=sel=>Array.from(document.querySelectorAll(sel));
  const fmt=(n,d=6)=>Number.isFinite(Number(n))?Number(n).toLocaleString("ca-ES",{maximumFractionDigits:d}):String(n);
  const num=id=>{const el=$(id); if(!el) throw new Error("Falta el camp "+id); const v=Number(String(el.value).replace(",",".")); if(!Number.isFinite(v)) throw new Error("El camp "+id+" ha de ser numèric."); return v;};
  const positive=(v,n)=>{if(!(Number.isFinite(v)&&v>0)) throw new Error(n+" ha de ser positiu.");};
  const list=id=>{const el=$(id); if(!el) throw new Error("Falta el camp "+id); const arr=el.value.split(",").map(x=>Number(x.trim().replace(",","."))).filter(Number.isFinite); if(!arr.length) throw new Error("Escriu dades separades per comes."); return arr;};
  const badges=items=>`<div class="badge-row">${items.map(x=>`<span class="badge">${x}</span>`).join("")}</div>`;
  const kpis=items=>`<div class="kpi-grid">${items.map(([a,b])=>`<div class="kpi"><span>${a}</span><strong>${b}</strong></div>`).join("")}</div>`;
  const table=rows=>`<table class="result-table"><tbody>${rows.map(([a,b])=>`<tr><th>${a}</th><td>${b}</td></tr>`).join("")}</tbody></table>`;
  const freqTable=f=>`<table class="result-table"><thead><tr><th>Valor</th><th>Freqüència</th></tr></thead><tbody>${Object.entries(f).sort((a,b)=>Number(a[0])-Number(b[0])).map(([a,b])=>`<tr><td>${a}</td><td>${b}</td></tr>`).join("")}</tbody></table>`;
  function render({title,summary,extra="",steps=[]}){const box=$("result"); if(!box) return; box.innerHTML=`<h2>${title}</h2><p>${summary}</p>${extra}${steps.length?`<div class="proc"><strong>Procediment</strong><ol>${steps.map(s=>`<li>${s}</li>`).join("")}</ol></div>`:""}`; box.scrollIntoView({behavior:"smooth",block:"nearest"});}
  function err(t,m){render({title:t,summary:`<span class="error">${m}</span>`,steps:["Revisa les dades introduïdes.","Comprova camps buits, denominadors zero o valors impossibles."]});}
  const META={
    excursion:{title:"Organitzem una excursió",recommended:"1r-2n ESO, ampliable a 3r amb modelització",senses:["Sentit numèric","Sentit de la mesura","Sentit algebraic","Sentit socioemocional"],sabers:["Decimals i operacions","Percentatges","Proporcionalitat","Pressupost","Estimació"],competencies:["Resolució de problemes","Raonament i prova","Comunicació i representació","Connexions"],product:"Pressupost justificat d’una sortida i decisió sobre viabilitat.",questions:["Quines despeses són fixes?","Quines depenen del nombre d’alumnes?","El cost per alumne és raonable?","Com justificaríeu la proposta?"],evidence:["Taula de costos","Cost per alumne","Comparació amb pressupost","Conclusió escrita"],criteria:["Identifica dades rellevants","Aplica percentatges","Justifica la viabilitat","Comunica la decisió"]},
    room:{title:"Dissenyem una aula o habitació",recommended:"1r-2n ESO, ampliable a 4t amb optimització",senses:["Sentit de la mesura","Sentit espacial","Sentit numèric","Sentit socioemocional"],sabers:["Àrees","Perímetres","Escales","Unitats","Cost per superfície"],competencies:["Resolució de problemes","Comunicació i representació","Connexions"],product:"Proposta de distribució d’un espai amb càlculs i justificació.",questions:["Quina superfície real tenim?","Com es representa en un plànol?","El pressupost és suficient?","Quins criteris també influeixen?"],evidence:["Càlcul d’àrea i perímetre","Plànol a escala","Cost estimat","Justificació"],criteria:["Usa unitats correctes","Aplica l’escala","Interpreta el cost","Argumenta la proposta"]},
    tariffs:{title:"Comparem tarifes",recommended:"2n-4t ESO",senses:["Sentit algebraic","Sentit numèric","Sentit estocàstic","Sentit socioemocional"],sabers:["Funcions lineals","Equacions","Taules","Gràfiques","Punt d’intersecció"],competencies:["Resolució de problemes","Raonament i prova","Comunicació i representació","Connexions"],product:"Recomanació raonada de tarifa segons perfils de consum.",questions:["Què representa la quota fixa?","Què representa la pendent?","Quan canvia la millor opció?","És la mateixa per a tothom?"],evidence:["Funcions de cost","Gràfica comparativa","Punt d’igualtat","Conclusió per perfils"],criteria:["Modelitza amb funcions","Interpreta la gràfica","Resol el punt d’igualtat","Justifica la decisió"]},
    survey:{title:"Analitzem una enquesta",recommended:"1r-4t ESO",senses:["Sentit estocàstic","Sentit numèric","Sentit socioemocional"],sabers:["Taules de freqüències","Mitjana","Mediana","Moda","Rang","Biaix"],competencies:["Comunicació i representació","Raonament i prova","Connexions"],product:"Informe breu d’anàlisi de dades amb conclusió.",questions:["Les dades són representatives?","La mitjana descriu bé el grup?","Hi ha valors extrems?","Quina conclusió podem defensar?"],evidence:["Taula de freqüències","Mesures de centralització","Interpretació","Conclusió"],criteria:["Organitza dades","Calcula mesures","Interpreta amb prudència","Detecta biaixos"]},
    energy:{title:"Consum energètic i sostenibilitat",recommended:"2n-4t ESO",senses:["Sentit numèric","Sentit algebraic","Sentit de la mesura","Sentit socioemocional"],sabers:["Unitats","Percentatges","Funcions lineals","Estimació","Sostenibilitat"],competencies:["Resolució de problemes","Connexions","Comunicació i representació"],product:"Pla d’estalvi energètic justificat amb càlculs.",questions:["Quina part del cost és fixa?","Quina depèn del consum?","Quin objectiu és realista?","Quines accions són efectives?"],evidence:["Model de cost","Càlcul d’estalvi","Comparació d’escenaris","Pla d’acció"],criteria:["Interpreta unitats","Modelitza el cost","Calcula estalvis","Proposa accions"]},
    games:{title:"Probabilitat i jocs",recommended:"2n-4t ESO",senses:["Sentit estocàstic","Sentit numèric","Sentit socioemocional"],sabers:["Regla de Laplace","Freqüència esperada","Simulació","Joc just"],competencies:["Raonament i prova","Resolució de problemes","Comunicació i representació"],product:"Disseny o anàlisi d’un joc amb probabilitat justificada.",questions:["Quins són els casos possibles?","Són equiprobables?","Què vol dir joc just?","Com modificaríeu les regles?"],evidence:["Càlcul de probabilitat","Estimació de freqüència","Anàlisi de justícia","Proposta"],criteria:["Compta casos","Calcula probabilitat","Interpreta freqüència","Justifica si és just"]}
  };
  const RUBRIC=[["Comprensió","Identifica context, dades i pregunta.","Entén parcialment la situació.","No identifica clarament què es demana."],["Estratègia","Tria eines matemàtiques adequades.","Tria estratègia amb ajuda.","No sap quina eina utilitzar."],["Càlcul","Calcula correctament i revisa errors.","Té petits errors.","Els càlculs no són coherents."],["Representació","Usa taules, gràfiques, esquemes o fórmules.","Representa parcialment.","No representa o és confús."],["Justificació","Explica el perquè i pren decisions.","Justifica de manera incompleta.","Només dona un resultat."],["Conclusió","Redacta conclusió clara i contextualitzada.","Conclusió breu però comprensible.","No respon al problema."]];
  let LAST_REPORT="";
  const levelName=l=>({1:"Nivell 1 · entendre i calcular",2:"Nivell 2 · representar i comparar",3:"Nivell 3 · modelitzar i justificar",4:"Nivell 4 · crear proposta pròpia"}[l]||"Nivell 1");
  const meta=(k=$("sa-select")?.value||"excursion")=>META[k]||META.excursion;
  const curriculumBox=(k=$("sa-select")?.value||"excursion")=>{const m=meta(k); return `<div class="curriculum-box"><h3>Connexió curricular</h3>${badges(m.senses)}<p><strong>Sabers mobilitzats:</strong> ${m.sabers.join(", ")}.</p><p><strong>Competències treballades:</strong> ${m.competencies.join(", ")}.</p><p><strong>Producte final:</strong> ${m.product}</p></div>`;};
  const rubricHTML=()=>`<h3>Rúbrica breu</h3><table class="rubric-table"><thead><tr><th>Criteri</th><th>Assolit</th><th>En procés</th><th>Cal reforç</th></tr></thead><tbody>${RUBRIC.map(r=>`<tr>${r.map(c=>`<td>${c}</td>`).join("")}</tr>`).join("")}</tbody></table>`;
  const actions=()=>`<div class="report-actions"><button type="button" id="copy-report">Copiar informe</button><button type="button" id="show-rubric">Mostrar rúbrica</button></div><div id="copy-status" class="copy-ok" aria-live="polite"></div>`;
  function setReport(data,result,steps){const m=meta(); const conclusion=$("student-conclusion")?.value?.trim()||""; LAST_REPORT=["Matemàtiques ESO · Informe de situació","",`Situació: ${m.title}`,`Curs recomanat: ${m.recommended}`,`Sentits: ${m.senses.join(", ")}`,`Sabers: ${m.sabers.join(", ")}`,`Competències: ${m.competencies.join(", ")}`,"","Dades:",...data.map(x=>`- ${x}`),"","Resultats:",...result.map(x=>`- ${x}`),"","Procediment:",...steps.map(x=>`- ${x}`),"","Conclusió de l’alumne:",conclusion||"(pendent d’escriure)","","Criteris d’avaluació:",...m.criteria.map(x=>`- ${x}`)].join("\n");}
  function showSA(title,summary,extra,steps,data,result){setReport(data,result,steps); render({title,summary,extra:curriculumBox()+extra+actions(),steps});}
  function drawTwo(id,fA,fB,xmax){const canvas=$(id); if(!canvas)return; const rect=canvas.getBoundingClientRect(); const size=Math.max(320,Math.round(rect.width||720)); const dpr=window.devicePixelRatio||1; canvas.width=size*dpr; canvas.height=size*dpr; canvas.style.height=size+"px"; const ctx=canvas.getContext("2d"); ctx.setTransform(dpr,0,0,dpr,0,0); const W=size,H=size,pad=42; const ys=[]; for(let i=0;i<=300;i++){let x=xmax*i/300; ys.push(fA(x),fB(x));} const ymax=Math.max(10,...ys)*1.1; const X=x=>pad+x/xmax*(W-2*pad), Y=y=>H-pad-y/ymax*(H-2*pad); ctx.fillStyle="#fff";ctx.fillRect(0,0,W,H);ctx.strokeStyle="#e2e8f0";ctx.lineWidth=1; for(let i=0;i<=5;i++){let x=xmax*i/5,y=ymax*i/5;ctx.beginPath();ctx.moveTo(X(x),pad);ctx.lineTo(X(x),H-pad);ctx.stroke();ctx.beginPath();ctx.moveTo(pad,Y(y));ctx.lineTo(W-pad,Y(y));ctx.stroke();} ctx.strokeStyle="#334155";ctx.lineWidth=2;ctx.beginPath();ctx.moveTo(pad,H-pad);ctx.lineTo(W-pad,H-pad);ctx.stroke();ctx.beginPath();ctx.moveTo(pad,pad);ctx.lineTo(pad,H-pad);ctx.stroke(); function line(fn,color){ctx.strokeStyle=color;ctx.lineWidth=3;ctx.beginPath();for(let i=0;i<=300;i++){let x=xmax*i/300,px=X(x),py=Y(fn(x)); if(i===0)ctx.moveTo(px,py); else ctx.lineTo(px,py);}ctx.stroke();} line(fA,"#1d4ed8"); line(fB,"#b91c1c");}
  function calcSA(){const key=$("sa-select")?.value||"excursion", level=Number($("sa-level")?.value||1); if(key==="excursion")return excursion(level); if(key==="room")return room(level); if(key==="tariffs")return tariffs(level); if(key==="survey")return survey(level); if(key==="energy")return energy(level); if(key==="games")return games(level);}
  function excursion(level){const students=num("sa-a"),bus=num("sa-b"),ticket=num("sa-c"),food=num("sa-d"),discount=num("sa-e"),budget=num("sa-f"); positive(students,"El nombre d’alumnes"); const raw=bus+students*(ticket+food), disc=raw*discount/100,total=raw-disc,per=total/students,diff=budget-total, variable=ticket+food; let title=`SA: Organitzem una excursió · ${levelName(level)}`, summary="", extra="", steps=[]; if(level===1){summary=diff>=0?`El pressupost és suficient. Sobren <strong>${fmt(diff)} €</strong>.`:`El pressupost no arriba. Falten <strong>${fmt(Math.abs(diff))} €</strong>.`; extra=kpis([["Cost total",`${fmt(total)} €`],["Cost per alumne",`${fmt(per)} €`],["Diferència",`${fmt(diff)} €`]])+table([["Bus",`${fmt(bus)} €`],["Entrades",`${fmt(students*ticket)} €`],["Menjar",`${fmt(students*food)} €`],["Descompte",`-${fmt(disc)} €`]]); steps=["Calculem entrada + menjar per alumne.","Multipliquem pel nombre d’alumnes.","Sumem el bus.","Apliquem el descompte.","Compareu amb el pressupost."];} else if(level===2){summary="Analitzem el pes de cada despesa abans del descompte."; extra=kpis([["Bus",`${fmt(bus/raw*100)}%`],["Entrades",`${fmt(students*ticket/raw*100)}%`],["Menjar",`${fmt(students*food/raw*100)}%`],["Estalvi/alumne",`${fmt(disc/students)} €`]]); steps=["Separem costos per conceptes.","Calculem percentatges sobre el total.","Compareu cost abans i després del descompte.","Això permet representar amb barres o sectors."];} else if(level===3){const max=Math.floor((budget/(1-discount/100)-bus)/variable); summary=`Model: <span class="math">C(n)=(${fmt(bus)}+${fmt(variable)}·n)·(1-${fmt(discount)}/100)</span>.`; extra=kpis([["Cost fix",`${fmt(bus*(1-discount/100))} €`],["Cost variable/alumne",`${fmt(variable*(1-discount/100))} €`],["Alumnes màxims",fmt(max)],["Alumnes actuals",fmt(students)]]); steps=["Construïm una funció del cost segons alumnes.","El bus és part fixa.","Entrada + menjar és part variable.","Apliquem el descompte.","Aïllem n per estimar alumnes màxims."];} else {const target=budget/students, need=raw>0?Math.max(0,(1-budget/raw)*100):0; summary=diff>=0?`La proposta és viable amb <strong>${fmt(per)} €</strong> per alumne.`:`Cal ajustar-la: descompte necessari aproximat <strong>${fmt(need)}%</strong>.`; extra=kpis([["Límit/alumne",`${fmt(target)} €`],["Cost actual/alumne",`${fmt(per)} €`],["Descompte necessari",`${fmt(need)}%`]]); steps=["Convertim el pressupost en límit per alumne.","Compareu amb el cost real.","Si no és viable, calculem el descompte necessari.","La conclusió ha de proposar una decisió."];} showSA(title,summary,extra,steps,[`Alumnes: ${fmt(students)}`,`Bus: ${fmt(bus)} €`,`Entrada: ${fmt(ticket)} €`,`Menjar: ${fmt(food)} €`,`Descompte: ${fmt(discount)}%`,`Pressupost: ${fmt(budget)} €`],[`Cost total: ${fmt(total)} €`,`Cost/alumne: ${fmt(per)} €`,`Diferència: ${fmt(diff)} €`]);}
  function room(level){const length=num("sa-a"),width=num("sa-b"),price=num("sa-c"),scale=num("sa-d"); positive(length,"La llargada");positive(width,"L’amplada");positive(price,"El preu");positive(scale,"L’escala"); const area=length*width,per=2*(length+width),cost=area*price,planL=length/scale,planW=width/scale; let title=`SA: Dissenyem una aula o habitació · ${levelName(level)}`,summary="",extra="",steps=[]; if(level===1){summary=`Àrea = <strong>${fmt(area)} m²</strong>, perímetre = <strong>${fmt(per)} m</strong>.`;extra=kpis([["Àrea",`${fmt(area)} m²`],["Perímetre",`${fmt(per)} m`],["Cost",`${fmt(cost)} €`]]);steps=["Àrea = llargada·amplada.","Perímetre = 2(llargada+amplada).","Cost = àrea·preu."];} else if(level===2){summary=`Al plànol faria <strong>${fmt(planL)} cm × ${fmt(planW)} cm</strong>.`;extra=kpis([["Llargada plànol",`${fmt(planL)} cm`],["Amplada plànol",`${fmt(planW)} cm`],["Escala",`1 cm → ${fmt(scale)} m`]]);steps=["Interpretem l’escala.","Dividim cada mesura real pel valor que representa 1 cm.","El resultat són centímetres al plànol."];} else if(level===3){summary="Compareu tres qualitats de material.";extra=table([["Econòmic (-15%)",`${fmt(cost*.85)} €`],["Estàndard",`${fmt(cost)} €`],["Premium (+25%)",`${fmt(cost*1.25)} €`]]);steps=["Mantenim la mateixa àrea.","Canviem el preu per m².","Compareu cost i qualitat."];} else {const usable=area*.75, people=Math.floor(usable/1.5);summary=`Amb el 75% d’espai útil, cabrien aproximadament <strong>${people}</strong> persones.`;extra=kpis([["Espai útil",`${fmt(usable)} m²`],["Persones",people],["Cost total",`${fmt(cost)} €`]]);steps=["Reservem zones de pas.","Estimem superfície útil.","Suposem 1,5 m² per persona.","Justifiquem seguretat i comoditat."];} showSA(title,summary,extra,steps,[`Llargada: ${fmt(length)} m`,`Amplada: ${fmt(width)} m`,`Preu: ${fmt(price)} €/m²`,`Escala: ${fmt(scale)}`],[`Àrea: ${fmt(area)} m²`,`Perímetre: ${fmt(per)} m`,`Cost: ${fmt(cost)} €`]);}
  function tariffs(level){const fa=num("sa-a"),va=num("sa-b"),fb=num("sa-c"),vb=num("sa-d"),x=num("sa-e"); const costA=fa+va*x,costB=fb+vb*x,den=va-vb,cut=Math.abs(den)>1e-12?(fb-fa)/den:null,better=costA<costB?"A":costB<costA?"B":"iguals"; let title=`SA: Comparem tarifes · ${levelName(level)}`,summary="",extra="",steps=[]; if(level===1){summary=`Per consum ${fmt(x)}, la millor opció és <strong>${better}</strong>.`;extra=kpis([["Cost A",`${fmt(costA)} €`],["Cost B",`${fmt(costB)} €`],["Diferència",`${fmt(Math.abs(costA-costB))} €`]]);steps=["Substituïm el consum.","Calculem cada tarifa.","Compareu costos."];} else if(level===2){const id="tariff-v6-"+Math.random().toString(36).slice(2);summary="Representem les dues tarifes com a rectes.";extra=kpis([["Punt d’igualtat",cut!==null&&cut>=0?`${fmt(cut)} unitats`:"no aplicable"],["Tarifa A",`C=${fmt(fa)}+${fmt(va)}x`],["Tarifa B",`C=${fmt(fb)}+${fmt(vb)}x`]])+`<div class="canvas-wrap"><canvas id="${id}"></canvas></div>`;steps=["Cada tarifa és una funció lineal.","La quota fixa és el tall vertical.","El preu variable és la pendent.","El punt de tall indica quan costen igual."]; showSA(title,summary,extra,steps,[`Quota A: ${fmt(fa)}`,`Variable A: ${fmt(va)}`,`Quota B: ${fmt(fb)}`,`Variable B: ${fmt(vb)}`,`Consum: ${fmt(x)}`],[`Cost A: ${fmt(costA)} €`,`Cost B: ${fmt(costB)} €`,`Punt d’igualtat: ${cut!==null?fmt(cut):"no aplicable"}`]); requestAnimationFrame(()=>drawTwo(id,t=>fa+va*t,t=>fb+vb*t,Math.max(100,x*1.3))); return;} else if(level===3){summary=cut!==null?`Les tarifes són iguals quan <strong>x=${fmt(cut)}</strong>.`:"Les tarifes tenen la mateixa pendent.";extra=table([["Tarifa A",`C_A(x)=${fmt(fa)}+${fmt(va)}x`],["Tarifa B",`C_B(x)=${fmt(fb)}+${fmt(vb)}x`],["Equació",`${fmt(fa)}+${fmt(va)}x=${fmt(fb)}+${fmt(vb)}x`]]);steps=["Escrivim les dues funcions.","Les igualem.","Aïllem x.","Interpretem el consum de canvi."];} else {const rows=[25,75,150].map(p=>{const a=fa+va*p,b=fb+vb*p;return[`Consum ${p}`,`A=${fmt(a)} €, B=${fmt(b)} €, millor: ${a<b?"A":b<a?"B":"iguals"}`]});summary="Decisió per perfils de consum.";extra=table(rows)+`<div class="debug-note">Conclusió: pot dependre del consum.</div>`;steps=["Triem perfils baix, mitjà i alt.","Calculem cada tarifa.","Justifiquem quina convé per perfil."];} showSA(title,summary,extra,steps,[`Quota A: ${fmt(fa)}`,`Variable A: ${fmt(va)}`,`Quota B: ${fmt(fb)}`,`Variable B: ${fmt(vb)}`,`Consum: ${fmt(x)}`],[`Cost A: ${fmt(costA)} €`,`Cost B: ${fmt(costB)} €`,`Millor opció: ${better}`]);}
  function survey(level){const arr=list("sa-list"), sorted=[...arr].sort((a,b)=>a-b), mean=arr.reduce((s,x)=>s+x,0)/arr.length, median=sorted.length%2?sorted[(sorted.length-1)/2]:(sorted[sorted.length/2-1]+sorted[sorted.length/2])/2, range=sorted.at(-1)-sorted[0], freq={}; arr.forEach(x=>freq[x]=(freq[x]||0)+1); const maxF=Math.max(...Object.values(freq)),modes=Object.entries(freq).filter(([,v])=>v===maxF).map(([k])=>k); let title=`SA: Analitzem una enquesta · ${levelName(level)}`,summary="",extra="",steps=[]; if(level===1){summary=`Mitjana = <strong>${fmt(mean)}</strong>, mediana = <strong>${fmt(median)}</strong>, moda = <strong>${modes.join(", ")}</strong>.`;extra=kpis([["N dades",arr.length],["Rang",fmt(range)],["Màxim",fmt(sorted.at(-1))],["Mínim",fmt(sorted[0])]]);steps=["Ordenem les dades.","Calculem mitjana, mediana i moda.","Calculem el rang."];} else if(level===2){summary="Taula de freqüències per representar amb barres.";extra=freqTable(freq);steps=["Comptem aparicions.","Fem taula de freqüències.","Aquesta taula permet fer un gràfic."];} else if(level===3){const below=arr.filter(x=>x<mean).length,above=arr.filter(x=>x>mean).length;summary=`Hi ha <strong>${below}</strong> valors sota la mitjana i <strong>${above}</strong> per sobre.`;extra=kpis([["Mitjana",fmt(mean)],["Per sota",below],["Per sobre",above],["Iguals",arr.length-below-above]]);steps=["Usem la mitjana com a referència.","Classifiquem dades.","Interpretem la distribució."];} else {summary="Interpretem si la mostra i les dades poden tenir biaixos o valors extrems.";extra=`<div class="debug-note">Conclusió suggerida: explica si la mostra és prou gran i si la mitjana representa bé el grup.</div>`;steps=["Analitzem valors extrems.","Valorem representativitat.","La conclusió ha d’incloure interpretació."];} showSA(title,summary,extra,steps,[`Dades: ${arr.join(", ")}`],[`Mitjana: ${fmt(mean)}`,`Mediana: ${fmt(median)}`,`Rang: ${fmt(range)}`,`Moda: ${modes.join(", ")}`]);}
  function energy(level){const kwh=num("sa-a"),price=num("sa-b"),fixed=num("sa-c"),red=num("sa-d"); positive(kwh,"El consum"); positive(price,"El preu"); const cost=kwh*price+fixed, reducedKwh=kwh*(1-red/100), reducedCost=reducedKwh*price+fixed, saving=cost-reducedCost; let title=`SA: Consum energètic i sostenibilitat · ${levelName(level)}`,summary="",extra="",steps=[]; if(level===1){summary=`Cost actual = <strong>${fmt(cost)} €</strong>.`;extra=kpis([["Consum",`${fmt(kwh)} kWh`],["Cost variable",`${fmt(kwh*price)} €`],["Cost fix",`${fmt(fixed)} €`],["Cost total",`${fmt(cost)} €`]]);steps=["Multipliquem kWh pel preu.","Afegim cost fix.","Obtenim cost mensual."];} else if(level===2){summary=`Amb reducció del ${fmt(red)}%, el cost seria <strong>${fmt(reducedCost)} €</strong>.`;extra=kpis([["Consum reduït",`${fmt(reducedKwh)} kWh`],["Estalvi mensual",`${fmt(saving)} €`],["Estalvi anual",`${fmt(saving*12)} €`]]);steps=["Apliquem reducció al consum.","Calculem nou cost.","Compareu costos."];} else if(level===3){summary=`Model de cost: <span class="math">C(x)=${fmt(fixed)}+${fmt(price)}x</span>.`;extra=table([["Funció",`C(x)=${fmt(fixed)}+${fmt(price)}x`],["Cost 100 kWh",`${fmt(fixed+price*100)} €`],["Cost 300 kWh",`${fmt(fixed+price*300)} €`]]);steps=["Modelitzem amb funció lineal.","Cost fix és terme independent.","Preu per kWh és pendent.","Permet fer prediccions."];} else {const target=cost*.2, needed=target/(kwh*price)*100;summary=`Per reduir factura un 20%, caldria reduir consum un <strong>${fmt(needed)}%</strong>.`;extra=kpis([["Objectiu estalvi",`${fmt(target)} €`],["Reducció necessària",`${fmt(needed)}%`],["Estalvi actual",`${fmt(saving)} €`]]);steps=["Definim objectiu.","L’estalvi surt del consum variable.","Calculem percentatge necessari.","Proposem accions concretes."];} showSA(title,summary,extra,steps,[`Consum: ${fmt(kwh)} kWh`,`Preu: ${fmt(price)} €/kWh`,`Cost fix: ${fmt(fixed)} €`,`Reducció: ${fmt(red)}%`],[`Cost actual: ${fmt(cost)} €`,`Cost reduït: ${fmt(reducedCost)} €`,`Estalvi mensual: ${fmt(saving)} €`]);}
  function games(level){const fav=num("sa-a"),poss=num("sa-b"),trials=num("sa-c"); positive(poss,"Els casos possibles"); positive(trials,"El nombre de partides"); if(fav<0||fav>poss) throw new Error("Els casos favorables han d’estar entre 0 i els casos possibles."); const p=fav/poss, expected=p*trials; let title=`SA: Probabilitat i jocs · ${levelName(level)}`,summary="",extra="",steps=[]; if(level===1){summary=`Probabilitat = <strong>${fmt(p*100)}%</strong>.`;extra=kpis([["Probabilitat",fmt(p)],["Percentatge",`${fmt(p*100)}%`]]);steps=["Apliquem Laplace.","Convertim a percentatge."];} else if(level===2){summary=`En ${fmt(trials)} partides, s’esperen <strong>${fmt(expected)}</strong> èxits.`;extra=kpis([["Partides",fmt(trials)],["Èxits esperats",fmt(expected)],["No èxits",fmt(trials-expected)]]);steps=["Multipliquem probabilitat per partides.","És una esperança, no una garantia.","Compareu amb simulació real."];} else if(level===3){const fair=p>0?1/p:Infinity;summary=`Si jugar costa 1 punt, premi just aproximat: <strong>${fmt(fair)} punts</strong>.`;extra=kpis([["Probabilitat",fmt(p)],["Premi just",fmt(fair)],["Risc",`${fmt((1-p)*100)}%`]]);steps=["Un joc just equilibra cost i esperança.","Si el cost és 1, premi just ≈1/p.","Decidim si és favorable."];} else {const need=Math.round(poss*.5);summary=`Per un joc al 50%, caldrien <strong>${need}</strong> casos favorables de ${fmt(poss)}.`;extra=`<div class="debug-note">Conclusió: modifica regles, casos favorables o premis perquè el joc sigui just.</div>`;steps=["Definim probabilitat objectiu.","Calculem casos favorables necessaris.","Expliquem com canvien les regles."];} showSA(title,summary,extra,steps,[`Favorables: ${fmt(fav)}`,`Possibles: ${fmt(poss)}`,`Partides: ${fmt(trials)}`],[`Probabilitat: ${fmt(p)}`,`Percentatge: ${fmt(p*100)}%`,`Freqüència esperada: ${fmt(expected)}`]);}
  function initTeacher(){const sel=$("teacher-sa"); if(sel) sel.innerHTML=Object.entries(META).map(([k,m])=>`<option value="${k}">${m.title}</option>`).join("");}
  function teacherSheet(){const key=$("teacher-sa")?.value||"excursion",course=$("teacher-course")?.value||"multi",m=meta(key),courseLabel={"1eso":"1r ESO","2eso":"2n ESO","3eso":"3r ESO","4eso":"4t ESO","multi":"Multinivell"}[course]||"Multinivell"; LAST_REPORT=["Matemàtiques ESO · Fitxa docent","",`Situació: ${m.title}`,`Curs seleccionat: ${courseLabel}`,`Curs recomanat: ${m.recommended}`,`Producte final: ${m.product}`,"",`Sentits: ${m.senses.join(", ")}`,`Sabers: ${m.sabers.join(", ")}`,`Competències: ${m.competencies.join(", ")}`,"","Preguntes guia:",...m.questions.map(x=>`- ${x}`),"","Evidències:",...m.evidence.map(x=>`- ${x}`),"","Criteris:",...m.criteria.map(x=>`- ${x}`)].join("\n"); render({title:`Fitxa docent: ${m.title}`,summary:`Guia curricular per treballar aquesta situació a ${courseLabel}.`,extra:`<div class="curriculum-box"><h3>Fitxa docent</h3><p><strong>Curs seleccionat:</strong> ${courseLabel}</p><p><strong>Curs recomanat:</strong> ${m.recommended}</p><p><strong>Producte final:</strong> ${m.product}</p></div><h3>Sentits matemàtics</h3>${badges(m.senses)}<h3>Sabers mobilitzats</h3><ul>${m.sabers.map(x=>`<li>${x}</li>`).join("")}</ul><h3>Competències i processos</h3><ul>${m.competencies.map(x=>`<li>${x}</li>`).join("")}</ul><h3>Preguntes guia</h3><ul>${m.questions.map(x=>`<li>${x}</li>`).join("")}</ul><h3>Evidències</h3><ul>${m.evidence.map(x=>`<li>${x}</li>`).join("")}</ul><h3>Criteris</h3><ul>${m.criteria.map(x=>`<li>${x}</li>`).join("")}</ul>${rubricHTML()}${actions()}`,steps:["Presenta el context abans de calcular.","Assigna nivells segons el grup.","Demana conclusió escrita.","Usa la rúbrica per valorar procés i comunicació."]});}
  function copyReport(){const st=$("copy-status"); if(!LAST_REPORT){if(st)st.textContent="Encara no hi ha cap informe generat.";return;} if(navigator.clipboard?.writeText){navigator.clipboard.writeText(LAST_REPORT).then(()=>{if(st)st.textContent="Informe copiat al porta-retalls."}).catch(()=>fallback(st));} else fallback(st);}
  function fallback(st){const a=document.createElement("textarea"); a.value=LAST_REPORT; document.body.appendChild(a); a.select(); try{document.execCommand("copy"); if(st)st.textContent="Informe copiat al porta-retalls.";}catch{if(st)st.textContent="No s'ha pogut copiar automàticament.";} document.body.removeChild(a);}
  function showRubric(){render({title:"Rúbrica breu de situació d’aprenentatge",summary:"Aquesta rúbrica valora el procés, no només el resultat.",extra:rubricHTML(),steps:["Es pot usar com a autoavaluació, coavaluació o guia docent.","La conclusió i la justificació són tan importants com el càlcul."]});}
  function bindV6(){initTeacher(); const saForm=$("sa-form"); if(saForm) saForm.addEventListener("submit",e=>{e.preventDefault(); e.stopImmediatePropagation(); try{calcSA();}catch(ex){err("No s'ha pogut calcular la situació.",ex.message);}},true); const tf=$("teacher-form"); if(tf) tf.addEventListener("submit",e=>{e.preventDefault(); try{teacherSheet();}catch(ex){err("No s'ha pogut generar la fitxa docent.",ex.message);}}); document.addEventListener("click",e=>{if(e.target?.id==="copy-report")copyReport(); if(e.target?.id==="show-rubric")showRubric();});}
  if(document.readyState==="loading")document.addEventListener("DOMContentLoaded",bindV6); else bindV6();
})();


/* V7: numeració curricular */
(function(){
"use strict";
const D={
 excursion:{t:"Organitzem una excursió",r:"1r-2n ESO, ampliable a 3r",ce:[["CE1","Interpretar, modelitzar i resoldre situacions."],["CE2","Argumentar la idoneïtat de les solucions."],["CE6","Vincular amb altres àrees i la realitat."],["CE7","Comunicar i representar resultats."],["CE8","Autoregulació i aprenentatge de l’error."]],ca:[["CA1.1","Interpretar el problema organitzant la informació."],["CA1.3","Seleccionar eines i estratègies."],["CA1.4","Obtenir solucions matemàtiques."],["CA2.1","Justificar processos i conclusions."],["CA7.2","Explicar idees matemàtiques amb claredat."]],s:[["SN-QUA","Quantitat: decimals i estimacions en context."],["SN-OPE","Operacions amb decimals i percentatges."],["SM-MAG","Magnituds: diners, unitats i comparació."],["SA-MOD","Modelització del cost segons variables."],["SSO-DEC","Presa de decisions i perseverança."]]},
 room:{t:"Dissenyem una aula o habitació",r:"1r-2n ESO, ampliable a 4t",ce:[["CE1","Interpretar, modelitzar i resoldre situacions."],["CE5","Connectar elements matemàtics."],["CE6","Vincular amb altres àrees i la realitat."],["CE7","Comunicar i representar resultats."]],ca:[["CA1.2","Elaborar representacions matemàtiques."],["CA5.1","Connectar representacions."],["CA6.1","Reconèixer matemàtiques en situacions reals."],["CA7.1","Representar conceptes i procediments."]],s:[["SM-MES","Mesura: magnituds, unitats i instruments."],["SE-FIG","Espacial: formes, figures i propietats."],["SE-ESC","Escales, plànols i representacions."],["SN-OPE","Operacions amb mesures i diners."]]},
 tariffs:{t:"Comparem tarifes",r:"2n-4t ESO",ce:[["CE1","Interpretar, modelitzar i resoldre situacions."],["CE2","Argumentar la idoneïtat de les solucions."],["CE5","Connectar elements matemàtics."],["CE6","Vincular amb altres àrees i la realitat."],["CE7","Comunicar i representar resultats."]],ca:[["CA1.2","Representar situacions amb gràfics o expressions."],["CA1.3","Seleccionar estratègies i eines."],["CA2.1","Justificar la decisió."],["CA5.2","Relacionar conceptes en situacions quotidianes."],["CA7.1","Representar funcions i resultats."]],s:[["SA-PAT","Patrons i relacions de dependència."],["SA-FUN","Funcions lineals, taules i gràfiques."],["SA-EQU","Equacions i punt d’intersecció."],["SN-OPE","Operacions amb decimals i diners."]]},
 survey:{t:"Analitzem una enquesta",r:"1r-4t ESO",ce:[["CE1","Interpretar, modelitzar i resoldre situacions."],["CE2","Argumentar conclusions."],["CE3","Formular preguntes o conjectures."],["CE7","Comunicar i representar resultats."],["CE9","Cooperar i construir coneixement."]],ca:[["CA1.1","Interpretar situació i dades."],["CA2.1","Justificar conclusions."],["CA3.1","Plantejar preguntes."],["CA7.1","Representar dades."],["CA9.1","Cooperar en equip."]],s:[["SET-DAD","Dades: recollida, organització i taules."],["SET-GRA","Gràfics i freqüències."],["SET-MES","Mitjana, mediana, moda i rang."],["SET-CRI","Interpretació crítica i biaixos."]]},
 energy:{t:"Consum energètic i sostenibilitat",r:"2n-4t ESO",ce:[["CE1","Interpretar, modelitzar i resoldre situacions."],["CE2","Argumentar la idoneïtat de solucions."],["CE4","Pensament computacional."],["CE6","Vincular amb realitat i altres àrees."],["CE7","Comunicar i representar resultats."]],ca:[["CA1.3","Seleccionar eines i estratègies."],["CA2.1","Justificar des de la sostenibilitat."],["CA4.1","Organitzar dades i patrons."],["CA6.1","Connectar matemàtiques amb altres àrees."],["CA7.2","Comunicar resultats."]],s:[["SM-MAG","Magnituds: energia, cost i temps."],["SN-OPE","Percentatges i decimals."],["SA-FUN","Funció lineal de cost."],["SA-MOD","Modelització d’escenaris."],["SSO-DEC","Presa de decisions responsable."]]},
 games:{t:"Probabilitat i jocs",r:"2n-4t ESO",ce:[["CE1","Interpretar, modelitzar i resoldre situacions."],["CE2","Argumentar si el joc és just."],["CE3","Formular conjectures."],["CE7","Comunicar i representar resultats."],["CE9","Cooperar i construir coneixement."]],ca:[["CA1.1","Interpretar el problema."],["CA2.1","Justificar conclusions."],["CA3.2","Fer conjectures matemàtiques."],["CA7.1","Representar probabilitats."],["CA9.2","Col·laborar per objectius de grup."]],s:[["SET-ALE","Fenòmens aleatoris i probabilitat."],["SET-LAP","Regla de Laplace."],["SET-SIM","Simulació i freqüència esperada."],["SN-COM","Comptatge de casos possibles."]]}
};
let LAST="";
function key(){return document.getElementById("teacher-sa")?.value||document.getElementById("sa-select")?.value||"excursion"}
function info(k=key()){return D[k]||D.excursion}
function list(a,cls=""){return `<div class="numbered-list">${a.map(([c,t])=>`<div class="numbered-item"><span class="code-pill ${cls}">${c}</span><span>${t}</span></div>`).join("")}</div>`}
function box(k=key()){const x=info(k);return `<div class="curriculum-box"><h3>Connexió curricular numerada</h3><p class="small-note">CE i CA segueixen la numeració curricular. Els codis de sabers són codificació pràctica de l’app.</p><h3>Competències específiques</h3>${list(x.ce)}<h3>Criteris d’avaluació</h3>${list(x.ca,"criteri")}<h3>Sabers mobilitzats</h3>${list(x.s,"saber")}</div>`}
function actions(){return `<div class="report-actions"><button type="button" id="v7-copy-report">Copiar informe numerat</button><button type="button" id="v7-show-numbering">Veure codis</button></div><div id="v7-copy-status" class="copy-ok" aria-live="polite"></div>`}
function buildReport(k){const x=info(k);const conc=document.getElementById("student-conclusion")?.value?.trim()||"(pendent d’escriure)";return ["Matemàtiques ESO · Informe numerat","",`Situació: ${x.t}`,`Curs recomanat: ${x.r}`,"","Competències:",...x.ce.map(v=>`- ${v[0]}: ${v[1]}`),"","Criteris:",...x.ca.map(v=>`- ${v[0]}: ${v[1]}`),"","Sabers:",...x.s.map(v=>`- ${v[0]}: ${v[1]}`),"","Conclusió de l’alumne:",conc].join("\n")}
function show(k=key()){const x=info(k);LAST=buildReport(k); if(typeof render==="function") render({title:`Fitxa docent numerada: ${x.t}`,summary:`Curs recomanat: ${x.r}`,extra:box(k)+actions(),steps:["Tria els codis que vols prioritzar.","Assigna el nivell de SA.","Demana conclusió escrita.","Copia l’informe per a la programació o evidència."]})}
function initTeacher(){const sel=document.getElementById("teacher-sa"); if(sel) sel.innerHTML=Object.entries(D).map(([k,v])=>`<option value="${k}">${v.t}</option>`).join(""); const form=document.getElementById("teacher-form"); if(form) form.addEventListener("submit",e=>{e.preventDefault();show(sel?.value||"excursion")},true)}
document.addEventListener("click",e=>{if(e.target?.id==="v7-copy-report"){const st=document.getElementById("v7-copy-status"); if(navigator.clipboard&&LAST) navigator.clipboard.writeText(LAST).then(()=>{if(st)st.textContent="Informe numerat copiat."});} if(e.target?.id==="v7-show-numbering") show()});
document.addEventListener("submit",e=>{if(e.target?.id!=="sa-form")return; setTimeout(()=>{const r=document.getElementById("result"); if(!r||r.dataset.v7==="1")return; const k=document.getElementById("sa-select")?.value||"excursion"; LAST=buildReport(k); const div=document.createElement("div"); div.innerHTML=box(k)+actions(); r.appendChild(div); r.dataset.v7="1";},100)},true);
if(document.readyState==="loading")document.addEventListener("DOMContentLoaded",initTeacher); else initTeacher();
})();


/* V8: exportació d'informe a PDF amb finestra imprimible */
(function(){
  "use strict";

  function currentReportText(){
    // Preferim l'informe numerat generat per v7 si existeix al DOM com a text copiable.
    // Si no podem accedir a variables internes, construïm un informe a partir del resultat visible.
    const result = document.getElementById("result");
    if(!result) return "No hi ha cap resultat disponible.";

    const title = result.querySelector("h2")?.innerText || "Informe de matemàtiques";
    const summary = result.querySelector("p")?.innerText || "";
    const steps = Array.from(result.querySelectorAll(".proc li")).map((li, i) => `${i+1}. ${li.innerText}`);
    const codes = Array.from(result.querySelectorAll(".numbered-item")).map(item => "- " + item.innerText.replace(/\s+/g, " ").trim());
    const conclusion = document.getElementById("student-conclusion")?.value?.trim() || "(pendent d’escriure)";

    return [
      "Matemàtiques ESO · Informe",
      "",
      title,
      "",
      "Resum:",
      summary,
      "",
      codes.length ? "Connexió curricular:" : "",
      ...codes,
      "",
      steps.length ? "Procediment:" : "",
      ...steps,
      "",
      "Conclusió de l’alumne o grup:",
      conclusion
    ].filter(line => line !== "").join("\n");
  }

  function escapeHTML(text){
    return String(text).replace(/[&<>"']/g, ch => ({
      "&":"&amp;",
      "<":"&lt;",
      ">":"&gt;",
      '"':"&quot;",
      "'":"&#39;"
    }[ch]));
  }

  function exportPDF(){
    const text = currentReportText();
    const now = new Date().toLocaleString("ca-ES");
    const html = `<!doctype html>
<html lang="ca">
<head>
  <meta charset="utf-8">
  <title>Informe Matemàtiques ESO</title>
  <style>
    @page { size: A4; margin: 16mm; }
    body {
      font-family: system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif;
      color: #1f2937;
      line-height: 1.45;
      margin: 0;
    }
    h1 {
      color: #1e3a8a;
      border-bottom: 2px solid #bfdbfe;
      padding-bottom: 8px;
      margin: 0 0 12px;
    }
    .meta {
      color: #475569;
      font-size: 13px;
      margin-bottom: 18px;
    }
    pre {
      white-space: pre-wrap;
      font: inherit;
      background: #f8fafc;
      border: 1px solid #e2e8f0;
      border-radius: 10px;
      padding: 14px;
    }
    .hint {
      margin-top: 16px;
      color: #475569;
      font-size: 12px;
    }
    @media print {
      .hint { display: none; }
    }
  </style>
</head>
<body>
  <h1>Informe Matemàtiques ESO</h1>
  <div class="meta">Generat: ${escapeHTML(now)}</div>
  <pre>${escapeHTML(text)}</pre>
  <p class="hint">Per exportar: tria “Imprimeix” i selecciona “Desa com a PDF”.</p>
  <script>
    window.addEventListener("load", () => {
      setTimeout(() => window.print(), 250);
    });
  <\/script>
</body>
</html>`;

    const printWindow = window.open("", "_blank");
    if(!printWindow){
      alert("El navegador ha bloquejat la finestra d’exportació. Permet finestres emergents per aquesta pàgina.");
      return;
    }
    printWindow.document.open();
    printWindow.document.write(html);
    printWindow.document.close();
  }

  function addPDFButtons(){
    document.querySelectorAll(".report-actions").forEach(actions => {
      if(actions.querySelector("#v8-export-pdf")) return;
      const btn = document.createElement("button");
      btn.type = "button";
      btn.id = "v8-export-pdf";
      btn.textContent = "Exportar informe a PDF";
      btn.addEventListener("click", exportPDF);
      actions.appendChild(btn);
    });
  }

  document.addEventListener("click", event => {
    if(event.target?.id === "v8-export-pdf") exportPDF();
  });

  // Quan es genera un resultat o fitxa, afegim el botó PDF a les accions.
  const observer = new MutationObserver(() => addPDFButtons());
  window.addEventListener("DOMContentLoaded", () => {
    const result = document.getElementById("result");
    if(result) observer.observe(result, {childList:true, subtree:true});
    addPDFButtons();
  });
})();
