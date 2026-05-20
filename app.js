"use strict";

(function(){
  const $ = id => document.getElementById(id);
  const $$ = sel => Array.from(document.querySelectorAll(sel));

  function fmt(n, digits=6){
    const v = Number(n);
    return Number.isFinite(v) ? v.toLocaleString("ca-ES", {maximumFractionDigits: digits}) : String(n);
  }

  function num(id){
    const el = $(id);
    if(!el) throw new Error("Falta el camp " + id + ".");
    const v = Number(String(el.value).replace(",", "."));
    if(!Number.isFinite(v)) throw new Error("El camp " + id + " ha de ser numèric.");
    return v;
  }

  function positive(v, name){
    if(!(Number.isFinite(v) && v > 0)) throw new Error(name + " ha de ser positiu.");
  }

  function render({title, summary, extra="", steps=[]}){
    const box = $("result");
    if(!box) return;
    box.innerHTML = `
      <h2>${title}</h2>
      <p>${summary}</p>
      ${extra}
      ${steps.length ? `<div class="proc"><strong>Procediment</strong><ol>${steps.map(s=>`<li>${s}</li>`).join("")}</ol></div>` : ""}
    `;
    box.scrollIntoView({behavior:"smooth", block:"nearest"});
  }

  function error(message){
    render({
      title:"Error",
      summary:`<span class="error">${message}</span>`,
      steps:["Revisa les dades.", "Comprova valors positius, unitats i camps buits."]
    });
  }

  function kpis(items){
    return `<div class="kpi-grid">${items.map(([a,b])=>`<div class="kpi"><span>${a}</span><strong>${b}</strong></div>`).join("")}</div>`;
  }

  function table(rows){
    return `<table class="result-table"><tbody>${rows.map(([a,b])=>`<tr><th>${a}</th><td>${b}</td></tr>`).join("")}</tbody></table>`;
  }

  function list(items, cls=""){
    const safe = Array.isArray(items) ? items : [];
    return `<div class="numbered-list">${safe.map(([c,t])=>`<div class="numbered-item"><span class="code-pill ${cls}">${c}</span><span>${t}</span></div>`).join("")}</div>`;
  }

  function showView(id){
    $$(".view").forEach(v => v.classList.toggle("active", v.id === id));
    $$(".tab").forEach(t => t.classList.toggle("active", t.dataset.view === id));
  }

  const SA = {
    "1eso": {
      label:"1r ESO",
      generic:{
        ce:[["CE1","Interpretar, modelitzar i resoldre situacions."],["CE7","Comunicar i representar resultats."],["CE8","Autoregulació i revisió del procés."]],
        ca:[["CA1.1","Interpretar la situació i organitzar dades."],["CA1.4","Obtenir solucions matemàtiques."],["CA7.2","Explicar procediments i resultats."]],
        sabers:[["SN-OPE","Operacions amb nombres i mesures."],["SM-MES","Mesura, magnituds i unitats."],["SSO-REV","Revisió del procés i perseverança."]]
      },
      items:{
        market:{
          title:"Comprem per a un esmorzar saludable",
          tags:["decimals","pressupost","percentatges"],
          template:`
            <label>Nombre d’alumnes<input id="v-a" type="number" value="24" step="1"></label>
            <label>Cost fruita (€)<input id="v-b" type="number" value="18" step="any"></label>
            <label>Cost begudes (€)<input id="v-c" type="number" value="14.5" step="any"></label>
            <label>Cost pa/cereals (€)<input id="v-d" type="number" value="11.2" step="any"></label>
            <label>Descompte (%)<input id="v-e" type="number" value="8" step="any"></label>
            <label>Pressupost (€)<input id="v-f" type="number" value="50" step="any"></label>`,
          cur:{
            ce:[["CE1","Resoldre una situació de pressupost."],["CE2","Justificar la viabilitat de la compra."],["CE7","Comunicar el resultat."]],
            ca:[["CA1.1","Organitzar costos i dades."],["CA1.4","Calcular totals, descomptes i cost per alumne."],["CA2.1","Justificar si el pressupost és suficient."]],
            sabers:[["SN-OPE","Decimals, diners i percentatges."],["SM-MAG","Magnitud diner i comparació de quantitats."],["SSO-DEC","Presa de decisions responsable."]]
          },
          calc(level){
            const students=num("v-a"), fruit=num("v-b"), drinks=num("v-c"), bread=num("v-d"), discount=num("v-e"), budget=num("v-f");
            positive(students,"El nombre d’alumnes");
            const raw=fruit+drinks+bread, disc=raw*discount/100, total=raw-disc, per=total/students, diff=budget-total;
            let extra=kpis([["Total",fmt(total)+" €"],["Per alumne",fmt(per)+" €"],["Diferència pressupost",fmt(diff)+" €"]]);
            if(level>=2) extra += table([["Fruita",fmt(fruit/raw*100)+"%"],["Begudes",fmt(drinks/raw*100)+"%"],["Pa/cereals",fmt(bread/raw*100)+"%"]]);
            if(level>=3) extra += `<div class="curriculum-box"><strong>Model:</strong> cost per alumne = (fruita + begudes + pa − descompte) / alumnes.</div>`;
            if(level>=4) extra += `<div class="curriculum-box"><strong>Decisió:</strong> ${diff>=0?"La proposta és viable.":"Cal reduir costos o augmentar pressupost."}</div>`;
            return {title:"SA 1r ESO: Comprem per a un esmorzar saludable", summary:`Cost total: <strong>${fmt(total)} €</strong>.`, extra, steps:["Sumem els costos.", "Apliquem el descompte.", "Dividim pel nombre d’alumnes.", "Compareu amb el pressupost."]};
          }
        },
        classroom:{
          title:"Organitzem l’aula",
          tags:["àrea","perímetre","escala"],
          template:`
            <label>Llargada aula (m)<input id="v-a" type="number" value="8" step="any"></label>
            <label>Amplada aula (m)<input id="v-b" type="number" value="5.5" step="any"></label>
            <label>Taules<input id="v-c" type="number" value="18" step="1"></label>
            <label>Espai per taula (m²)<input id="v-d" type="number" value="1.4" step="any"></label>
            <label>Escala: 1 cm representa (m)<input id="v-e" type="number" value="0.5" step="any"></label>`,
          cur:{
            ce:[["CE1","Interpretar i resoldre una situació espacial."],["CE7","Representar mesures i resultats."],["CE8","Revisar si la distribució és viable."]],
            ca:[["CA1.1","Identificar dades i magnituds."],["CA1.4","Calcular àrea, perímetre i espai disponible."],["CA7.1","Representar l’espai amb mesures i escala."]],
            sabers:[["SM-MES","Àrea, perímetre, unitats i magnituds."],["SE-ESC","Escales i representació de l’espai."],["SN-OPE","Operacions amb decimals i mesures."]]
          },
          calc(level){
            const L=num("v-a"), W=num("v-b"), tables=num("v-c"), perTable=num("v-d"), scale=num("v-e");
            positive(L,"La llargada"); positive(W,"L’amplada"); positive(scale,"L’escala");
            const area=L*W, perimeter=2*(L+W), needed=tables*perTable, free=area-needed;
            let extra=kpis([["Àrea",fmt(area)+" m²"],["Perímetre",fmt(perimeter)+" m"],["Espai lliure estimat",fmt(free)+" m²"]]);
            if(level>=2) extra += kpis([["Plànol",fmt(L/scale)+" cm × "+fmt(W/scale)+" cm"]]);
            if(level>=3) extra += `<div class="curriculum-box"><strong>Model:</strong> espai lliure = llargada·amplada − nombre de taules·espai per taula.</div>`;
            if(level>=4) extra += `<div class="curriculum-box"><strong>Conclusió:</strong> ${free>0?"La distribució pot ser viable si es deixen passadissos suficients.":"La distribució és massa densa."}</div>`;
            return {title:"SA 1r ESO: Organitzem l’aula", summary:`Espai lliure aproximat: <strong>${fmt(free)} m²</strong>.`, extra, steps:["Calculem l’àrea.", "Estimem l’espai ocupat per taules.", "Compareu espai disponible i ocupat.", "Representem el plànol amb escala."]};
          }
        },
        survey1:{
          title:"Enquesta ràpida del grup",
          tags:["dades","freqüències","mitjana"],
          template:`<label>Dades separades per comes<input id="v-list" value="3,4,4,5,5,5,6,7,7,8,9"></label>`,
          cur:{
            ce:[["CE1","Interpretar dades d’una situació."],["CE7","Representar i comunicar dades."],["CE9","Treballar dades de manera cooperativa."]],
            ca:[["CA1.1","Interpretar dades."],["CA7.1","Organitzar dades en taules."],["CA9.1","Cooperar en la interpretació."]],
            sabers:[["SET-DAD","Recollida i organització de dades."],["SET-MES","Mitjana, mediana i rang."],["SET-GRA","Taules de freqüències."]]
          },
          calc(level){
            const arr = parseList("v-list");
            return calcSurveyCommon("SA 1r ESO: Enquesta ràpida del grup", arr, level);
          }
        }
      }
    },
    "2eso": {
      label:"2n ESO",
      generic:{
        ce:[["CE1","Interpretar, modelitzar i resoldre situacions."],["CE2","Argumentar la idoneïtat de les solucions."],["CE6","Connectar matemàtiques amb la realitat."]],
        ca:[["CA1.3","Seleccionar eines i estratègies."],["CA2.1","Justificar processos i conclusions."],["CA6.1","Reconèixer matemàtiques en contextos reals."]],
        sabers:[["SN-PRO","Proporcionalitat, percentatges i fraccions."],["SM-ESC","Escales, unitats i magnituds."],["SSO-DEC","Presa de decisions raonada."]]
      },
      items:{
        recipe:{
          title:"Adaptem una recepta",
          tags:["proporcionalitat","unitats"],
          template:`
            <label>Persones recepta original<input id="v-a" type="number" value="4" step="1"></label>
            <label>Persones que volem servir<input id="v-b" type="number" value="10" step="1"></label>
            <label>Farina original (g)<input id="v-c" type="number" value="300" step="any"></label>
            <label>Llet original (ml)<input id="v-d" type="number" value="500" step="any"></label>
            <label>Sucre original (g)<input id="v-e" type="number" value="80" step="any"></label>`,
          calc(level){
            const p0=num("v-a"), p1=num("v-b"), flour=num("v-c"), milk=num("v-d"), sugar=num("v-e");
            positive(p0,"Persones original"); positive(p1,"Persones finals");
            const k=p1/p0;
            let extra=kpis([["Factor",fmt(k)],["Farina",fmt(flour*k)+" g"],["Llet",fmt(milk*k)+" ml"],["Sucre",fmt(sugar*k)+" g"]]);
            if(level>=2) extra += table([["Augment percentual",fmt((k-1)*100)+"%"]]);
            if(level>=3) extra += `<div class="curriculum-box"><strong>Model:</strong> quantitat nova = quantitat original · persones finals / persones originals.</div>`;
            if(level>=4) extra += `<div class="curriculum-box">Proposta: ajusta les quantitats a paquets comercials i justifica l’arrodoniment.</div>`;
            return {title:"SA 2n ESO: Adaptem una recepta", summary:`Factor de proporcionalitat: <strong>${fmt(k)}</strong>.`, extra, steps:["Calculem factor de canvi.", "Multipliquem cada ingredient.", "Comprovem unitats.", "Justifiquem arrodoniments."]};
          }
        },
        map:{
          title:"Planifiquem una ruta amb mapa",
          tags:["escala","distància","temps"],
          template:`
            <label>Distància al mapa (cm)<input id="v-a" type="number" value="12" step="any"></label>
            <label>Escala: 1 cm representa (km)<input id="v-b" type="number" value="0.75" step="any"></label>
            <label>Velocitat mitjana (km/h)<input id="v-c" type="number" value="4.5" step="any"></label>
            <label>Temps de descans (min)<input id="v-d" type="number" value="20" step="any"></label>`,
          calc(level){
            const cm=num("v-a"), scale=num("v-b"), speed=num("v-c"), rest=num("v-d");
            positive(cm,"Distància al mapa"); positive(scale,"Escala"); positive(speed,"Velocitat");
            const km=cm*scale, hours=km/speed, minutes=hours*60+rest;
            let extra=kpis([["Distància real",fmt(km)+" km"],["Temps caminant",fmt(hours*60)+" min"],["Temps total",fmt(minutes)+" min"]]);
            if(level>=3) extra += `<div class="curriculum-box"><strong>Model:</strong> temps = distància / velocitat + descans.</div>`;
            if(level>=4) extra += `<div class="curriculum-box">Decisió: proposa hora de sortida i marge de seguretat.</div>`;
            return {title:"SA 2n ESO: Planifiquem una ruta amb mapa", summary:`La ruta fa <strong>${fmt(km)} km</strong>.`, extra, steps:["Convertim amb l’escala.", "Calculem temps amb velocitat mitjana.", "Afegim descans.", "Valorem si és viable."]};
          }
        },
        budget:{
          title:"Repartim el pressupost d’un projecte",
          tags:["percentatges","pressupost"],
          template:`
            <label>Pressupost total (€)<input id="v-a" type="number" value="600" step="any"></label>
            <label>Materials (%)<input id="v-b" type="number" value="45" step="any"></label>
            <label>Transport (%)<input id="v-c" type="number" value="25" step="any"></label>
            <label>Difusió (%)<input id="v-d" type="number" value="15" step="any"></label>`,
          calc(level){
            const total=num("v-a"), mat=num("v-b"), trans=num("v-c"), diff=num("v-d");
            positive(total,"Pressupost");
            const other=100-mat-trans-diff;
            let extra=kpis([["Materials",fmt(total*mat/100)+" €"],["Transport",fmt(total*trans/100)+" €"],["Difusió",fmt(total*diff/100)+" €"],["Altres",fmt(total*other/100)+" €"]]);
            if(level>=2) extra += table([["Suma percentatges",fmt(mat+trans+diff+other)+"%"]]);
            if(level>=3) extra += `<div class="curriculum-box"><strong>Model:</strong> import = pressupost · percentatge / 100.</div>`;
            if(level>=4) extra += `<div class="curriculum-box">Decisió: revisa si el repartiment és equilibrat i proposa una redistribució.</div>`;
            return {title:"SA 2n ESO: Repartim el pressupost d’un projecte", summary:`Pressupost total: <strong>${fmt(total)} €</strong>.`, extra, steps:["Convertim percentatges a imports.", "Comprovem que sumen 100%.", "Compareu partides.", "Justifiquem canvis."]};
          }
        }
      }
    },
    "3eso": {
      label:"3r ESO",
      generic:{
        ce:[["CE1","Interpretar, modelitzar i resoldre situacions."],["CE5","Connectar representacions matemàtiques."],["CE7","Comunicar i representar resultats."]],
        ca:[["CA1.2","Representar situacions amb expressions, taules o gràfics."],["CA5.2","Relacionar conceptes en situacions contextualitzades."],["CA7.1","Representar funcions, dades o resultats."]],
        sabers:[["SA-FUN","Funcions, relacions i models."],["SET-DAD","Dades, variació i interpretació crítica."],["SN-OPE","Operacions i comparació de quantitats."]]
      },
      items:{
        tariffs3:{
          title:"Comparem tarifes amb funcions",
          tags:["funció lineal","equacions"],
          template:`
            <label>Quota fixa A (€)<input id="v-a" type="number" value="8" step="any"></label>
            <label>Cost variable A (€/unitat)<input id="v-b" type="number" value="0.12" step="any"></label>
            <label>Quota fixa B (€)<input id="v-c" type="number" value="3" step="any"></label>
            <label>Cost variable B (€/unitat)<input id="v-d" type="number" value="0.2" step="any"></label>
            <label>Consum previst<input id="v-e" type="number" value="80" step="any"></label>`,
          calc(level){
            const fa=num("v-a"), va=num("v-b"), fb=num("v-c"), vb=num("v-d"), x=num("v-e");
            const ca=fa+va*x, cb=fb+vb*x, cut=Math.abs(va-vb)>1e-12?(fb-fa)/(va-vb):null;
            let extra=kpis([["Cost A",fmt(ca)+" €"],["Cost B",fmt(cb)+" €"],["Punt d’igualtat",cut!==null?fmt(cut):"no aplicable"]]);
            if(level>=3) extra += `<div class="curriculum-box"><strong>Funcions:</strong> A(x)=${fmt(fa)}+${fmt(va)}x; B(x)=${fmt(fb)}+${fmt(vb)}x.</div>`;
            if(level>=4) extra += `<div class="curriculum-box">Conclusió: la millor tarifa depèn del consum i del punt de tall.</div>`;
            return {title:"SA 3r ESO: Comparem tarifes amb funcions", summary:`Millor opció per ${fmt(x)} unitats: <strong>${ca<cb?"A":cb<ca?"B":"iguals"}</strong>.`, extra, steps:["Modelitzem cada tarifa.", "Substituïm el consum.", "Trobem el punt d’igualtat.", "Justifiquem la decisió."]};
          }
        },
        sport:{
          title:"Planifiquem una competició esportiva",
          tags:["combinatòria","temps"],
          template:`
            <label>Nombre d’equips<input id="v-a" type="number" value="8" step="1"></label>
            <label>Durada partit (min)<input id="v-b" type="number" value="12" step="any"></label>
            <label>Pistes disponibles<input id="v-c" type="number" value="2" step="1"></label>
            <label>Descans entre partits (min)<input id="v-d" type="number" value="3" step="any"></label>`,
          calc(level){
            const teams=num("v-a"), dur=num("v-b"), courts=num("v-c"), rest=num("v-d");
            positive(teams,"Equips"); positive(courts,"Pistes");
            const matches=teams*(teams-1)/2, blocks=Math.ceil(matches/courts), total=blocks*(dur+rest);
            let extra=kpis([["Partits totals",fmt(matches)],["Torns necessaris",fmt(blocks)],["Temps total",fmt(total)+" min"]]);
            if(level>=3) extra += `<div class="curriculum-box"><strong>Model:</strong> partits = n(n−1)/2 en una lliga tots contra tots.</div>`;
            if(level>=4) extra += `<div class="curriculum-box">Proposta: ajusta equips, pistes o durada per acabar en menys temps.</div>`;
            return {title:"SA 3r ESO: Planifiquem una competició esportiva", summary:`Calen <strong>${fmt(matches)}</strong> partits.`, extra, steps:["Comptem partits possibles.", "Distribuïm per pistes.", "Afegim descansos.", "Valorem el calendari."]};
          }
        },
        dataNews:{
          title:"Analitzem una notícia amb dades",
          tags:["percentatges","interpretació crítica"],
          template:`
            <label>Valor inicial<input id="v-a" type="number" value="120" step="any"></label>
            <label>Valor final<input id="v-b" type="number" value="156" step="any"></label>
            <label>Període (mesos)<input id="v-c" type="number" value="6" step="any"></label>
            <label>Mostra o població<input id="v-d" type="number" value="450" step="any"></label>`,
          calc(level){
            const initial=num("v-a"), final=num("v-b"), months=num("v-c"), sample=num("v-d");
            positive(initial,"Valor inicial"); positive(months,"Període");
            const change=final-initial, pct=change/initial*100, monthly=pct/months;
            let extra=kpis([["Canvi absolut",fmt(change)],["Canvi percentual",fmt(pct)+"%"],["Mitjana mensual",fmt(monthly)+"%"],["Mostra",fmt(sample)]]);
            if(level>=3) extra += `<div class="curriculum-box">Interpretació crítica: una variació percentual no diu tota la història; cal mirar mostra, context i període.</div>`;
            if(level>=4) extra += `<div class="curriculum-box">Repte: escriu un titular rigorós que no exageri les dades.</div>`;
            return {title:"SA 3r ESO: Analitzem una notícia amb dades", summary:`Variació: <strong>${fmt(pct)}%</strong>.`, extra, steps:["Calculem canvi absolut.", "Dividim pel valor inicial.", "Convertim a percentatge.", "Interpretem el resultat críticament."]};
          }
        }
      }
    },
    "4eso": {
      label:"4t ESO",
      generic:{
        ce:[["CE1","Interpretar, modelitzar i resoldre situacions."],["CE2","Argumentar la idoneïtat de les solucions."],["CE6","Vincular matemàtiques amb decisions reals."]],
        ca:[["CA1.3","Triar estratègies de modelització."],["CA2.1","Justificar la validesa de la solució."],["CA6.1","Aplicar matemàtiques a contextos reals."]],
        sabers:[["SA-MOD","Modelització algebraica i funcional."],["SM-MES","Mesura i estimació."],["SSO-DEC","Presa de decisions i valoració d’errors."]]
      },
      items:{
        optimization:{
          title:"Dissenyem un jardí rectangular",
          tags:["funció quadràtica","optimització"],
          template:`
            <label>Perímetre disponible (m)<input id="v-a" type="number" value="40" step="any"></label>
            <label>Amplada proposada (m)<input id="v-b" type="number" value="8" step="any"></label>
            <label>Cost gespa (€/m²)<input id="v-c" type="number" value="6.5" step="any"></label>`,
          calc(level){
            const P=num("v-a"), width=num("v-b"), price=num("v-c");
            positive(P,"Perímetre"); positive(width,"Amplada");
            const length=P/2-width, area=length*width, bestSide=P/4, bestArea=bestSide*bestSide;
            let extra=kpis([["Llargada",fmt(length)+" m"],["Àrea proposada",fmt(area)+" m²"],["Cost gespa",fmt(area*price)+" €"],["Àrea màxima",fmt(bestArea)+" m²"]]);
            if(level>=3) extra += `<div class="curriculum-box"><strong>Model:</strong> A(x)=x·(P/2−x), una funció quadràtica.</div>`;
            if(level>=4) extra += `<div class="curriculum-box">Òptim: amb perímetre fix, el rectangle d’àrea màxima és el quadrat.</div>`;
            return {title:"SA 4t ESO: Dissenyem un jardí rectangular", summary:`Àrea proposada: <strong>${fmt(area)} m²</strong>.`, extra, steps:["Aïllem la llargada a partir del perímetre.", "Calculem àrea.", "Compareu amb el màxim.", "Justifiquem l’òptim."]};
          }
        },
        loan:{
          title:"Comparem un pagament ajornat",
          tags:["interès compost","decisió"],
          template:`
            <label>Preu inicial (€)<input id="v-a" type="number" value="850" step="any"></label>
            <label>Interès mensual (%)<input id="v-b" type="number" value="1.5" step="any"></label>
            <label>Mesos<input id="v-c" type="number" value="12" step="1"></label>
            <label>Descompte pagament immediat (%)<input id="v-d" type="number" value="6" step="any"></label>`,
          calc(level){
            const price=num("v-a"), rate=num("v-b")/100, months=num("v-c"), discount=num("v-d");
            positive(price,"Preu"); positive(months,"Mesos");
            const financed=price*Math.pow(1+rate,months), now=price*(1-discount/100), diff=financed-now;
            let extra=kpis([["Pagament ajornat",fmt(financed)+" €"],["Pagament immediat",fmt(now)+" €"],["Diferència",fmt(diff)+" €"]]);
            if(level>=3) extra += `<div class="curriculum-box"><strong>Model:</strong> C=${fmt(price)}·(1+${fmt(rate)})^${fmt(months)}.</div>`;
            if(level>=4) extra += `<div class="curriculum-box">Decisió: compara cost econòmic, necessitat i risc abans d’escollir.</div>`;
            return {title:"SA 4t ESO: Comparem un pagament ajornat", summary:`Diferència entre opcions: <strong>${fmt(diff)} €</strong>.`, extra, steps:["Apliquem interès compost.", "Calculem preu amb descompte.", "Compareu imports finals.", "Justifiquem la decisió."]};
          }
        },
        trig:{
          title:"Mesurem una altura amb trigonometria",
          tags:["trigonometria","tangent"],
          template:`
            <label>Distància a l’objecte (m)<input id="v-a" type="number" value="18" step="any"></label>
            <label>Angle d’elevació (graus)<input id="v-b" type="number" value="35" step="any"></label>
            <label>Altura dels ulls (m)<input id="v-c" type="number" value="1.6" step="any"></label>`,
          calc(level){
            const dist=num("v-a"), angle=num("v-b"), eye=num("v-c");
            positive(dist,"Distància");
            const rad=angle*Math.PI/180, height=dist*Math.tan(rad)+eye;
            let extra=kpis([["Altura estimada",fmt(height)+" m"],["Angle",fmt(angle)+"°"],["Distància",fmt(dist)+" m"]]);
            if(level>=3) extra += `<div class="curriculum-box"><strong>Model:</strong> altura = distància · tan(angle) + altura dels ulls.</div>`;
            if(level>=4) extra += `<div class="curriculum-box">Discussió: l’error pot venir de mesurar malament angle o distància.</div>`;
            return {title:"SA 4t ESO: Mesurem una altura amb trigonometria", summary:`Altura estimada: <strong>${fmt(height)} m</strong>.`, extra, steps:["Convertim l’angle a radians internament.", "Apliquem tangent.", "Afegim l’altura dels ulls.", "Valorem possibles errors."]};
          }
        }
      }
    }
  };

  function parseList(id){
    const el=$(id);
    if(!el) throw new Error("Falta la llista de dades.");
    const arr=el.value.split(",").map(x=>Number(x.trim().replace(",","."))).filter(Number.isFinite);
    if(!arr.length) throw new Error("Escriu dades separades per comes.");
    return arr;
  }

  function calcSurveyCommon(title, arr, level){
    const sorted=[...arr].sort((a,b)=>a-b);
    const mean=arr.reduce((s,x)=>s+x,0)/arr.length;
    const median=sorted.length%2?sorted[(sorted.length-1)/2]:(sorted[sorted.length/2-1]+sorted[sorted.length/2])/2;
    const range=sorted.at(-1)-sorted[0];
    const freq={}; arr.forEach(x=>freq[x]=(freq[x]||0)+1);
    let extra=kpis([["Mitjana",fmt(mean)],["Mediana",fmt(median)],["Rang",fmt(range)],["Dades",arr.length]]);
    if(level>=2) extra += `<table class="result-table"><tr><th>Valor</th><th>Freqüència</th></tr>${Object.entries(freq).sort((a,b)=>Number(a[0])-Number(b[0])).map(([k,v])=>`<tr><td>${k}</td><td>${v}</td></tr>`).join("")}</table>`;
    if(level>=3) extra += `<div class="curriculum-box">Interpretació: compara mitjana i mediana per veure si hi ha dades extremes.</div>`;
    if(level>=4) extra += `<div class="curriculum-box">Repte: escriu una conclusió sobre el grup i explica si la mostra és representativa.</div>`;
    return {title, summary:`Mitjana: <strong>${fmt(mean)}</strong>.`, extra, steps:["Ordenem les dades.", "Calculem mesures de centre.", "Fem freqüències.", "Interpretem amb prudència."]};
  }

  function currentCourse(){ return $("sa-course")?.value || "1eso"; }
  function currentSAKey(){ return $("sa-select")?.value || Object.keys(SA[currentCourse()].items)[0]; }
  function currentItem(){ return SA[currentCourse()].items[currentSAKey()]; }
  function currentLevel(){ return Number($("sa-level")?.value || 1); }

  function getCurriculum(){
    const course = SA[currentCourse()];
    const item = currentItem();
    return {
      ce: item.cur?.ce || course.generic.ce,
      ca: item.cur?.ca || course.generic.ca,
      sabers: item.cur?.sabers || course.generic.sabers
    };
  }

  function curriculumHTML(){
    const cur = getCurriculum();
    return `
      <div class="curriculum-box">
        <h3>Connexió curricular numerada</h3>
        <p class="small-note">CE i CA vinculats a la situació. Els codis de sabers són codificació pràctica de l’app.</p>
        <h3>Competències específiques</h3>${list(cur.ce)}
        <h3>Criteris d’avaluació</h3>${list(cur.ca, "criteri")}
        <h3>Sabers mobilitzats</h3>${list(cur.sabers, "saber")}
      </div>`;
  }


  function currentRubricKey(){
    return currentSAKey ? currentSAKey() : "market";
  }

  const RUBRICS = {
    market:[
      ["Gestió del pressupost", "No identifica correctament costos o pressupost.", "Calcula parcialment el total amb alguna ajuda.", "Calcula total, descompte i cost per alumne amb correcció.", "Justifica la viabilitat i proposa millores de pressupost."],
      ["Ús de decimals i percentatges", "Té errors importants amb decimals o percentatges.", "Aplica alguns càlculs però amb imprecisions.", "Aplica decimals i percentatges correctament.", "Explica el significat de cada percentatge en el context."],
      ["Interpretació del resultat", "Dona un resultat sense relacionar-lo amb el problema.", "Interpreta si el pressupost arriba o no.", "Explica diferència, cost per alumne i conseqüències.", "Formula una decisió raonada i alternativa si cal."],
      ["Comunicació matemàtica", "La resposta és incompleta o poc clara.", "Comunica el resultat amb unitats bàsiques.", "Presenta dades, procés i conclusió ordenadament.", "Fa una justificació clara, completa i contextualitzada."]
    ],
    classroom:[
      ["Mesura de l’espai", "No calcula correctament àrea o perímetre.", "Calcula alguna magnitud amb ajuda.", "Calcula àrea, perímetre i espai lliure correctament.", "Relaciona les magnituds amb una distribució viable de l’aula."],
      ["Ús d’unitats i escala", "Confón unitats o no interpreta l’escala.", "Usa unitats parcialment correctes.", "Aplica unitats i escala amb coherència.", "Justifica el plànol i possibles errors de mesura."],
      ["Raonament espacial", "No relaciona mesures amb ocupació real.", "Fa una estimació simple de l’espai.", "Compara espai disponible i ocupat.", "Proposa una organització funcional i ben argumentada."],
      ["Conclusió i justificació", "No formula una conclusió útil.", "Diu si és viable però amb poca justificació.", "Justifica la viabilitat amb càlculs.", "Inclou criteris de seguretat, comoditat i ús de l’espai."]
    ],
    survey1:[
      ["Organització de dades", "No ordena ni estructura les dades.", "Organitza dades de manera parcial.", "Construeix taula o resum de dades correctament.", "Presenta dades i freqüències de manera clara i verificable."],
      ["Càlcul estadístic", "Té errors greus en mitjana, mediana o rang.", "Calcula alguna mesura correctament.", "Calcula mesures principals amb correcció.", "Interpreta diferències entre mesures i possibles valors extrems."],
      ["Interpretació crítica", "No interpreta els resultats.", "Fa una interpretació molt bàsica.", "Relaciona resultats amb el grup o context.", "Valora representativitat, biaix i limitacions de la mostra."],
      ["Comunicació de conclusions", "No escriu una conclusió comprensible.", "Escriu una conclusió breu.", "Comunica resultats i conclusió amb claredat.", "Redacta un informe breu, complet i crític."]
    ],
    recipe:[
      ["Proporcionalitat", "No identifica la relació proporcional.", "Aplica el factor amb ajuda.", "Calcula el factor de proporcionalitat correctament.", "Justifica el model proporcional i les seves limitacions."],
      ["Càlcul d’ingredients", "Té errors importants en les quantitats.", "Calcula alguns ingredients correctament.", "Ajusta totes les quantitats amb unitats.", "Arrodoneix de manera realista i ho justifica."],
      ["Unitats i conversions", "Confón grams, ml o persones.", "Usa unitats amb alguna imprecisió.", "Manté unitats coherents.", "Explica com afecten les unitats a la recepta real."],
      ["Justificació final", "No justifica la recepta adaptada.", "Dona una resposta bàsica.", "Explica l’adaptació i comprova coherència.", "Proposa una versió final aplicable i ben argumentada."]
    ],
    map:[
      ["Interpretació de l’escala", "No aplica correctament l’escala.", "Calcula la distància amb ajuda.", "Converteix distància de mapa a real correctament.", "Explica l’escala i comprova si la distància és raonable."],
      ["Càlcul de temps", "No relaciona distància, velocitat i temps.", "Fa un càlcul parcial.", "Calcula temps caminant i temps total.", "Ajusta el temps amb descansos i marge de seguretat."],
      ["Ús d’unitats", "Barreja km, hores o minuts incorrectament.", "Usa algunes unitats correctament.", "Conserva unitats coherents.", "Transforma unitats i les explica amb precisió."],
      ["Planificació", "No pren cap decisió pràctica.", "Fa una proposta simple.", "Proposa una ruta viable.", "Justifica horari, ritme, descansos i possibles imprevistos."]
    ],
    budget:[
      ["Repartiment percentual", "No calcula correctament els percentatges.", "Calcula alguna partida amb ajuda.", "Calcula totes les partides del pressupost.", "Comprova suma i ajusta el repartiment si cal."],
      ["Control del pressupost", "No detecta incoherències.", "Detecta alguna diferència.", "Comprova que el repartiment sigui coherent.", "Proposa una redistribució justificada."],
      ["Interpretació econòmica", "No relaciona imports amb decisions.", "Interpreta algunes partides.", "Explica la importància de cada partida.", "Argumenta prioritats segons objectius del projecte."],
      ["Comunicació", "Presenta resultats desordenats.", "Comunica imports bàsics.", "Presenta una taula clara i conclusió.", "Redacta una justificació formal del pressupost."]
    ],
    tariffs3:[
      ["Modelització funcional", "No escriu correctament les funcions.", "Identifica algunes parts de la funció.", "Modelitza les dues tarifes com a funcions lineals.", "Interpreta pendent, quota fixa i punt de tall."],
      ["Resolució i comparació", "No calcula correctament els costos.", "Compara amb algun error.", "Calcula costos i millor opció.", "Analitza diversos consums i canvis de decisió."],
      ["Punt d’igualtat", "No entén el punt de tall.", "L’identifica amb ajuda.", "Calcula o interpreta el punt d’igualtat.", "Justifica la decisió segons perfils de consum."],
      ["Representació i comunicació", "No representa ni explica el procés.", "Explica parcialment.", "Comunica gràfica, càlculs i conclusió.", "Presenta una recomanació clara i contextualitzada."]
    ],
    sport:[
      ["Recompte de partits", "No aplica cap estratègia de recompte.", "Compta parcialment els partits.", "Calcula correctament el nombre de partits.", "Justifica la fórmula o estratègia de recompte."],
      ["Organització temporal", "No calcula la durada total.", "Fa una estimació simple.", "Calcula torns, pistes i durada.", "Optimitza calendari segons recursos disponibles."],
      ["Modelització", "No relaciona equips i partits.", "Identifica relacions bàsiques.", "Expressa el model n(n−1)/2.", "Analitza com canvia el temps si varien equips o pistes."],
      ["Proposta final", "No presenta calendari viable.", "Presenta una proposta incompleta.", "Proposa una organització coherent.", "Justifica una proposta realista i adaptable."]
    ],
    dataNews:[
      ["Càlcul de variació", "No calcula variació absoluta o percentual.", "Calcula una variació parcial.", "Calcula variació absoluta i percentual.", "Interpreta la variació segons període i context."],
      ["Lectura crítica", "Accepta el titular sense qüestionar-lo.", "Detecta alguna dada rellevant.", "Valora mostra, període i context.", "Identifica possibles biaixos o exageracions."],
      ["Comunicació de dades", "Presenta resultats sense ordre.", "Comunica un resultat bàsic.", "Presenta dades i conclusió de manera clara.", "Redacta un titular rigorós i matemàticament justificat."],
      ["Argumentació", "No justifica la interpretació.", "Justifica amb poca evidència.", "Argumenta a partir dels càlculs.", "Contrasta resultats i limita l’abast de la conclusió."]
    ],
    optimization:[
      ["Modelització geomètrica", "No relaciona perímetre i dimensions.", "Fa càlculs parcials.", "Expressa llargada i àrea correctament.", "Formula el model quadràtic de l’àrea."],
      ["Optimització", "No identifica el màxim.", "Intueix una millor opció.", "Compara àrea proposada i àrea màxima.", "Justifica per què el quadrat dona l’àrea màxima."],
      ["Càlcul i unitats", "Té errors greus de càlcul o unitats.", "Calcula amb alguna imprecisió.", "Calcula dimensions, àrea i cost.", "Comprova resultats i interpreta unitats."],
      ["Decisió de disseny", "No proposa cap decisió.", "Fa una proposta simple.", "Justifica el disseny amb càlculs.", "Inclou cost, ús de l’espai i limitacions."]
    ],
    loan:[
      ["Interès compost", "No aplica el model d’interès.", "Aplica parcialment el càlcul.", "Calcula el pagament ajornat correctament.", "Explica el creixement compost i el seu efecte."],
      ["Comparació d’opcions", "No compara les dues opcions.", "Compara només imports bàsics.", "Compara pagament ajornat i immediat.", "Justifica la decisió considerant cost i risc."],
      ["Percentatges", "Té errors en interès o descompte.", "Aplica algun percentatge correctament.", "Aplica interès i descompte amb correcció.", "Interpreta com canvien els resultats si varien mesos o tipus."],
      ["Educació financera", "No extreu cap conclusió responsable.", "Dona una conclusió simple.", "Relaciona càlculs amb una decisió econòmica.", "Argumenta una decisió responsable i contextualitzada."]
    ],
    trig:[
      ["Model trigonomètric", "No identifica el triangle rectangle.", "Identifica alguns elements.", "Aplica la tangent correctament.", "Representa i justifica el model de mesura indirecta."],
      ["Càlcul de l’altura", "No calcula correctament l’altura.", "Calcula amb alguna ajuda.", "Calcula altura amb distància, angle i ulls.", "Comprova el resultat i el compara amb una estimació."],
      ["Ús d’unitats i angle", "Confón graus, metres o components.", "Usa unitats parcialment.", "Manté unitats coherents.", "Explica possibles errors de mesura d’angle o distància."],
      ["Conclusió", "No comunica el resultat.", "Dona l’altura sense justificar.", "Comunica resultat i procediment.", "Inclou marge d’error i interpretació realista."]
    ]
  };

  function formalRubricHTML(key){
    const item = currentItem ? currentItem() : null;
    const title = item?.title || "Situació d’aprenentatge";
    const rows = RUBRICS[key] || [
      ["Comprensió del problema", "No identifica dades ni pregunta.", "Identifica parcialment la situació.", "Comprèn el problema i les dades principals.", "Interpreta el context i anticipa estratègies."],
      ["Estratègia matemàtica", "No tria una estratègia adequada.", "Tria una estratègia amb ajuda.", "Aplica una estratègia coherent.", "Selecciona i justifica l’estratègia més eficient."],
      ["Càlcul i representació", "Els càlculs no són coherents.", "Hi ha càlculs parcials.", "Calcula i representa amb correcció.", "Comprova i relaciona diferents representacions."],
      ["Justificació i conclusió", "No justifica la resposta.", "Dona una conclusió bàsica.", "Justifica resultat i conclusió.", "Argumenta de forma completa i contextualitzada."]
    ];
    return `
      <section class="formal-rubric">
        <h3>Rúbrica d’avaluació de la situació: ${title}</h3>
        <p class="small-note">Nivells d’assoliment: NA, AS, AN i AE. La valoració ha de tenir en compte el procés, la justificació i la comunicació matemàtica, no només el resultat numèric.</p>
        <div class="rubric-levels">
          <span><span class="rubric-tag na">NA</span>&nbsp; No assolit</span>
          <span><span class="rubric-tag as">AS</span>&nbsp; Assoliment satisfactori</span>
          <span><span class="rubric-tag an">AN</span>&nbsp; Assoliment notable</span>
          <span><span class="rubric-tag ae">AE</span>&nbsp; Assoliment excel·lent</span>
        </div>
        <table class="rubric-table formal">
          <thead>
            <tr>
              <th>Criteri</th>
              <th><span class="rubric-tag na">NA</span></th>
              <th><span class="rubric-tag as">AS</span></th>
              <th><span class="rubric-tag an">AN</span></th>
              <th><span class="rubric-tag ae">AE</span></th>
            </tr>
          </thead>
          <tbody>
            ${rows.map(r => `<tr><td><strong>${r[0]}</strong></td><td>${r[1]}</td><td>${r[2]}</td><td>${r[3]}</td><td>${r[4]}</td></tr>`).join("")}
          </tbody>
        </table>
      </section>
    `;
  }


  function transversalCompetenciesHTML(){
    return `
      <ul>
        <li><strong>Competència digital:</strong> ús d’una eina digital per calcular, representar, revisar i documentar el procés.</li>
        <li><strong>Competència personal, social i d’aprendre a aprendre:</strong> revisió del procediment, detecció d’errors i millora de la resposta.</li>
        <li><strong>Competència ciutadana:</strong> presa de decisions raonada en contextos propers i compartits.</li>
        <li><strong>Competència emprenedora:</strong> proposta d’alternatives, justificació i valoració de la viabilitat.</li>
      </ul>
    `;
  }

  function learningObjectivesForCurrentSA(){
    const item = currentItem ? currentItem() : {title:"situació"};
    const key = currentSAKey ? currentSAKey() : "";
    const base = {
      market:[
        "Calcular costos, descomptes i cost per alumne per decidir si una compra col·lectiva és viable.",
        "Interpretar percentatges i imports en euros per justificar una decisió de pressupost.",
        "Comunicar una conclusió clara sobre la proposta d’esmorzar saludable."
      ],
      classroom:[
        "Calcular àrea, perímetre i espai disponible per valorar una distribució d’aula.",
        "Aplicar l’escala i les unitats de mesura per representar l’espai de manera coherent.",
        "Justificar una proposta d’organització de l’aula amb criteris de comoditat i seguretat."
      ],
      survey1:[
        "Organitzar dades d’una enquesta per obtenir-ne mesures estadístiques bàsiques.",
        "Interpretar mitjana, mediana, rang i freqüències per descriure el grup.",
        "Elaborar una conclusió crítica sobre les dades i la seva representativitat."
      ],
      recipe:[
        "Aplicar proporcionalitat directa per adaptar quantitats d’una recepta a un nombre diferent de persones.",
        "Utilitzar unitats de massa i capacitat per comunicar les quantitats ajustades.",
        "Justificar arrodoniments i decisions pràctiques en el context de la recepta."
      ],
      map:[
        "Aplicar l’escala d’un mapa per calcular distàncies reals.",
        "Relacionar distància, velocitat i temps per planificar una ruta.",
        "Valorar la viabilitat de la ruta incorporant descansos i marge de seguretat."
      ],
      budget:[
        "Calcular imports a partir de percentatges per repartir un pressupost.",
        "Comprovar la coherència del repartiment i detectar possibles desajustos.",
        "Justificar una proposta de distribució del pressupost segons prioritats."
      ],
      tariffs3:[
        "Modelitzar dues tarifes mitjançant funcions lineals per comparar costos.",
        "Calcular i interpretar el punt d’igualtat entre dues opcions.",
        "Justificar quina tarifa és més adequada segons perfils de consum."
      ],
      sport:[
        "Comptar partits i organitzar torns per planificar una competició.",
        "Relacionar equips, pistes i temps per construir un calendari viable.",
        "Proposar ajustos per millorar l’organització temporal."
      ],
      dataNews:[
        "Calcular variacions absolutes i percentuals per interpretar una notícia amb dades.",
        "Analitzar críticament mostra, període i context abans d’acceptar una conclusió.",
        "Redactar una interpretació rigorosa i no exagerada de les dades."
      ],
      optimization:[
        "Modelitzar l’àrea d’un rectangle amb perímetre fix per estudiar-ne el màxim.",
        "Relacionar geometria i funcions per justificar una decisió de disseny.",
        "Calcular dimensions, àrea i cost amb unitats coherents."
      ],
      loan:[
        "Aplicar percentatges i interès compost per comparar formes de pagament.",
        "Valorar el cost final de cada opció i la diferència econòmica.",
        "Justificar una decisió financera responsable a partir dels càlculs."
      ],
      trig:[
        "Aplicar la tangent en un triangle rectangle per estimar una altura inaccessible.",
        "Interpretar distància, angle i altura dels ulls en una mesura indirecta.",
        "Valorar possibles errors de mesura i comunicar una conclusió realista."
      ]
    };
    return base[key] || [
      `Analitzar la situació "${item.title}" per identificar dades, relacions i objectiu.`,
      "Aplicar procediments matemàtics adequats per obtenir una resposta justificada.",
      "Comunicar el procés i la conclusió amb claredat."
    ];
  }

  function contextDescriptionForCurrentSA(){
    const item = currentItem ? currentItem() : {title:"situació"};
    const key = currentSAKey ? currentSAKey() : "";
    const desc = {
      market:"El grup ha d’organitzar un esmorzar saludable amb un pressupost limitat. El repte és calcular el cost total, el cost per alumne i decidir si la proposta és viable.",
      classroom:"El grup vol reorganitzar l’aula. El repte és calcular l’espai disponible, interpretar l’escala i valorar si la distribució proposada és adequada.",
      survey1:"L’alumnat recull dades del grup i les analitza. El repte és organitzar-les, calcular mesures estadístiques i formular una conclusió raonada.",
      recipe:"Cal adaptar una recepta a un nombre diferent de persones. El repte és aplicar proporcionalitat i justificar les quantitats finals.",
      map:"S’ha de planificar una ruta a partir d’un mapa. El repte és convertir distàncies, estimar temps i decidir si la ruta és viable.",
      budget:"El grup reparteix un pressupost entre diferents partides. El repte és calcular percentatges, comprovar coherència i justificar prioritats.",
      tariffs3:"Es comparen dues tarifes amb quota fixa i cost variable. El repte és modelitzar-les, comparar-les i decidir quina convé segons el consum.",
      sport:"S’ha d’organitzar una competició esportiva. El repte és comptar partits, distribuir pistes i estimar el temps total.",
      dataNews:"Es parteix d’una notícia amb dades numèriques. El repte és calcular variacions i interpretar críticament el missatge.",
      optimization:"Es vol dissenyar un jardí rectangular amb perímetre fix. El repte és estudiar l’àrea i justificar una proposta òptima.",
      loan:"Es comparen dues formes de pagament. El repte és calcular el cost final i prendre una decisió econòmica responsable.",
      trig:"Es vol estimar una altura amb una mesura indirecta. El repte és aplicar trigonometria i valorar l’error de mesura."
    };
    return desc[key] || `La situació "${item.title}" planteja un context proper que requereix comprendre dades, aplicar procediments matemàtics i justificar una resposta.`;
  }

  function vectorsHTML(){
    return `
      <ul>
        <li><strong>Aprenentatges competencials:</strong> la situació demana aplicar sabers matemàtics en un context funcional.</li>
        <li><strong>Perspectiva de gènere:</strong> els rols i exemples es poden distribuir de manera equitativa i no estereotipada.</li>
        <li><strong>Universalitat del currículum:</strong> els nivells i suports permeten diferents graus d’accés i aprofundiment.</li>
        <li><strong>Qualitat de les llengües:</strong> l’alumnat ha d’explicar el procés i redactar una conclusió matemàtica clara.</li>
        <li><strong>Ciutadania democràtica i consciència global:</strong> es promou la presa de decisions argumentada i responsable.</li>
        <li><strong>Benestar emocional:</strong> es fomenta la revisió, l’error com a aprenentatge i el treball cooperatiu respectuós.</li>
      </ul>
    `;
  }

  function saTemplateHTML(){
    const item = currentItem ? currentItem() : {title:"Situació"};
    const courseLabel = SA && currentCourse ? SA[currentCourse()].label : "ESO";
    const cur = getCurriculum ? getCurriculum() : {ce:[], ca:[], sabers:[]};
    const objectives = learningObjectivesForCurrentSA();
    const criteria = Array.isArray(cur.ca) ? cur.ca.map(([code,text]) => `${code}: ${text}`) : [];
    return `
      <section class="sa-template">
        <h3>Programació de la situació d’aprenentatge</h3>
        <div class="sa-template-grid">
          <div class="sa-template-card"><strong>Títol</strong>${item.title}</div>
          <div class="sa-template-card"><strong>Curs</strong>${courseLabel}</div>
          <div class="sa-template-card"><strong>Matèria</strong>Matemàtiques</div>
          <div class="sa-template-card"><strong>Nivell de treball</strong>N${currentLevel ? currentLevel() : 1}</div>
        </div>

        <div class="sa-template-section">
          <h4>Descripció i repte</h4>
          <p>${contextDescriptionForCurrentSA()}</p>
        </div>

        <div class="sa-template-section">
          <h4>Competències específiques treballades</h4>
          ${list(cur.ce)}
        </div>

        <div class="sa-template-section">
          <h4>Tractament de les competències transversals</h4>
          ${transversalCompetenciesHTML()}
        </div>

        <div class="sa-template-section">
          <h4>Objectius d’aprenentatge</h4>
          <p class="small-note">Formulats amb capacitat, saber i finalitat.</p>
          <ul>${objectives.map(o => `<li>${o}</li>`).join("")}</ul>
        </div>

        <div class="sa-template-section">
          <h4>Criteris d’avaluació de la situació</h4>
          <p class="small-note">Formulats amb acció, saber i context.</p>
          <ul>${criteria.map(c => `<li>${c}</li>`).join("")}</ul>
        </div>

        <div class="sa-template-section">
          <h4>Sabers</h4>
          ${list(cur.sabers, "saber")}
        </div>

        <div class="sa-template-section">
          <h4>Desenvolupament, recursos i metodologia</h4>
          <ul>
            <li><strong>Estructura:</strong> comprensió del context, introducció de dades, càlcul, anàlisi, justificació i conclusió.</li>
            <li><strong>Recursos:</strong> dispositiu amb l’eina, llibreta o dossier de treball, calculadora si cal i debat oral.</li>
            <li><strong>Metodologia:</strong> treball individual, per parelles o en petit grup, amb posada en comú final.</li>
            <li><strong>Atenció a la diversitat:</strong> ús dels nivells N1-N4 per graduar complexitat, representació i autonomia.</li>
          </ul>
        </div>

        <div class="sa-template-section">
          <h4>Activitats d’aprenentatge i d’avaluació</h4>
          <div class="activity-flow">
            <article><strong>Inicials: què en sabem?</strong><br>Activar coneixements previs, interpretar el context i anticipar quines dades seran necessàries.</article>
            <article><strong>Desenvolupament: aprenem nous continguts</strong><br>Introduir estratègies, càlculs, representacions i relacions matemàtiques implicades.</article>
            <article><strong>Estructuració: què hem après?</strong><br>Ordenar el procediment, revisar errors, comparar estratègies i sintetitzar el model utilitzat.</article>
            <article><strong>Aplicació: apliquem el que hem après</strong><br>Justificar una decisió, formular una conclusió i aplicar el raonament a una situació semblant.</article>
          </div>
        </div>

        <div class="sa-template-section">
          <h4>Vectors educatius</h4>
          ${vectorsHTML()}
        </div>
      </section>
    `;
  }

  function actionsHTML(){
    return `<div class="report-actions">
      <button type="button" id="print-rubric">Imprimir rúbrica</button>
      <button type="button" id="export-pdf">Exportar PDF visual complet</button>
    </div>`;
  }

  function populateSA(){
    const courseKey = currentCourse();
    const select = $("sa-select");
    const box = $("sa-inputs");
    if(!select || !box) return;
    const old = select.value;
    select.innerHTML = Object.entries(SA[courseKey].items).map(([key,item])=>`<option value="${key}">${item.title}</option>`).join("");
    if(SA[courseKey].items[old]) select.value = old;
    updateInputs();
  }

  function updateInputs(){
    const box = $("sa-inputs");
    const item = currentItem();
    if(!box || !item) return;
    box.innerHTML = `<div class="sa-course-note"><strong>${SA[currentCourse()].label}</strong> · ${item.tags.join(" · ")}</div>` + item.template;
  }

  function calculateSA(event){
    event.preventDefault();
    event.stopImmediatePropagation();
    try{
      const item = currentItem();
      const res = item.calc(currentLevel());
      res.extra = res.extra + curriculumHTML() + saTemplateHTML() + formalRubricHTML(currentSAKey()) + actionsHTML();
      render(res);
    }catch(err){
      error(err.message);
    }
  }

  // Tools
  function updateToolInputs(){
    const box = $("tool-inputs"), sel=$("tool-select");
    if(!box || !sel) return;
    const templates = {
      linear:`<label>a<input type="number" id="t-a" value="2" step="any"></label><label>b<input type="number" id="t-b" value="-6" step="any"></label>`,
      quadratic:`<label>a<input type="number" id="t-a" value="1" step="any"></label><label>b<input type="number" id="t-b" value="-5" step="any"></label><label>c<input type="number" id="t-c" value="6" step="any"></label>`,
      percentage:`<label>Quantitat inicial<input type="number" id="t-a" value="80" step="any"></label><label>Percentatge<input type="number" id="t-b" value="15" step="any"></label>`,
      statistics:`<label>Dades separades per comes<input id="t-list" value="4,5,7,7,9,10"></label>`,
      graph:`<label>Funció<select id="t-fn"><option value="linear">f(x)=mx+n</option><option value="quadratic">f(x)=ax²+bx+c</option></select></label><label>a o m<input type="number" id="t-a" value="1" step="any"></label><label>b o n<input type="number" id="t-b" value="0" step="any"></label><label>c<input type="number" id="t-c" value="-4" step="any"></label>`
    };
    box.innerHTML = templates[sel.value] || templates.linear;
  }

  function calculateTool(event){
    event.preventDefault();
    try{
      const key=$("tool-select").value;
      if(key==="linear"){
        const a=num("t-a"), b=num("t-b"); if(Math.abs(a)<1e-12) throw new Error("a no pot ser 0.");
        const x=-b/a;
        render({title:"Equació lineal", summary:`x = <strong>${fmt(x)}</strong>`, steps:["Partim de ax+b=0.", "Passem b a l’altre costat.", "Dividim per a."]});
      } else if(key==="quadratic"){
        const a=num("t-a"), b=num("t-b"), c=num("t-c"); if(Math.abs(a)<1e-12) throw new Error("a no pot ser 0.");
        const d=b*b-4*a*c;
        if(d<0){ render({title:"Equació quadràtica", summary:`Δ=${fmt(d)}. No hi ha solucions reals.`, steps:["Calculem el discriminant.", "Com que és negatiu, no hi ha arrels reals."]}); return; }
        const x1=(-b+Math.sqrt(d))/(2*a), x2=(-b-Math.sqrt(d))/(2*a);
        render({title:"Equació quadràtica", summary:`x₁=${fmt(x1)}, x₂=${fmt(x2)}`, steps:["Calculem Δ.", "Apliquem la fórmula general."]});
      } else if(key==="percentage"){
        const base=num("t-a"), pct=num("t-b"), amount=base*pct/100;
        render({title:"Percentatges", summary:`${fmt(pct)}% de ${fmt(base)} = <strong>${fmt(amount)}</strong>`, steps:["Dividim per 100.", "Multipliquem per la quantitat."]});
      } else if(key==="statistics"){
        const arr=parseList("t-list");
        const res=calcSurveyCommon("Estadística bàsica", arr, 2);
        render(res);
      } else if(key==="graph"){
        const kind=$("t-fn").value, a=num("t-a"), b=num("t-b"), c=num("t-c");
        const id="graph-"+Math.random().toString(36).slice(2);
        render({title:"Gràfica de funció", summary: kind==="linear" ? `f(x)=${fmt(a)}x+${fmt(b)}` : `f(x)=${fmt(a)}x²+${fmt(b)}x+${fmt(c)}`, extra:`<div class="canvas-wrap"><canvas id="${id}"></canvas></div>`, steps:["Generem punts.", "Dibuixem la funció."]});
        requestAnimationFrame(()=>drawFunction(id, x=>kind==="linear"?a*x+b:a*x*x+b*x+c));
      }
    }catch(err){ error(err.message); }
  }

  function drawFunction(id, fn){
    const canvas=$(id); if(!canvas) return;
    const rect=canvas.getBoundingClientRect(), size=Math.max(320, Math.round(rect.width||720)), dpr=window.devicePixelRatio||1;
    canvas.width=size*dpr; canvas.height=size*dpr; canvas.style.height=size+"px";
    const ctx=canvas.getContext("2d"); ctx.setTransform(dpr,0,0,dpr,0,0);
    const W=size,H=size,pad=42,min=-10,max=10,X=x=>pad+(x-min)/(max-min)*(W-2*pad),Y=y=>H-pad-(y-min)/(max-min)*(H-2*pad);
    ctx.fillStyle="#fff"; ctx.fillRect(0,0,W,H);
    ctx.strokeStyle="#e2e8f0"; ctx.lineWidth=1;
    for(let i=-10;i<=10;i++){ctx.beginPath();ctx.moveTo(X(i),pad);ctx.lineTo(X(i),H-pad);ctx.stroke();ctx.beginPath();ctx.moveTo(pad,Y(i));ctx.lineTo(W-pad,Y(i));ctx.stroke();}
    ctx.strokeStyle="#334155"; ctx.lineWidth=2; ctx.beginPath(); ctx.moveTo(X(0),pad);ctx.lineTo(X(0),H-pad);ctx.stroke(); ctx.beginPath();ctx.moveTo(pad,Y(0));ctx.lineTo(W-pad,Y(0));ctx.stroke();
    ctx.strokeStyle="#1d4ed8"; ctx.lineWidth=3; ctx.beginPath(); let started=false;
    for(let i=0;i<=800;i++){const x=min+(max-min)*i/800,y=fn(x); if(!Number.isFinite(y)){started=false;continue;} const cx=X(x), cy=Y(Math.max(min,Math.min(max,y))); if(!started){ctx.moveTo(cx,cy);started=true}else ctx.lineTo(cx,cy);}
    ctx.stroke();
  }

  // Courses
  function populateCourses(){
    const sel=$("course-select");
    if(sel) sel.innerHTML = Object.entries(SA).map(([k,v])=>`<option value="${k}">${v.label}</option>`).join("");
  }

  function showCourse(event){
    event.preventDefault();
    const k=$("course-select").value, course=SA[k];
    render({title:course.label, summary:"Itinerari de situacions d’aprenentatge disponibles.", extra:`<ul>${Object.values(course.items).map(i=>`<li>${i.title}</li>`).join("")}</ul>`, steps:["Tria una situació.", "Selecciona nivell.", "Calcula i justifica la conclusió."]});
  }

  // Teacher
  function populateTeacher(){
    const course=$("teacher-course"), sel=$("teacher-sa");
    if(!course || !sel) return;
    const items=SA[course.value]?.items || SA["1eso"].items;
    sel.innerHTML=Object.entries(items).map(([k,v])=>`<option value="${k}">${v.title}</option>`).join("");
  }

  function showTeacher(event){
    event.preventDefault();
    const courseKey=$("teacher-course").value, key=$("teacher-sa").value;
    const course=SA[courseKey], item=course.items[key], cur={ce:item.cur?.ce||course.generic.ce, ca:item.cur?.ca||course.generic.ca, sabers:item.cur?.sabers||course.generic.sabers};
    render({title:`Fitxa docent: ${item.title}`, summary:`${course.label}. Situació d’aprenentatge amb connexió curricular numerada.`, extra:`<div class="curriculum-box"><h3>Competències específiques</h3>${list(cur.ce)}<h3>Criteris d’avaluació</h3>${list(cur.ca,"criteri")}<h3>Sabers mobilitzats</h3>${list(cur.sabers,"saber")}</div>${rubricHTML()}${actionsHTML()}`, steps:["Presenta el context.", "Assigna nivell.", "Demana conclusió escrita.", "Valora amb la rúbrica."]});
  }

  function rubricHTML(){
    return formalRubricHTML(currentSAKey());
  }

  function assess(event){
    event.preventDefault();
    const total=$$('input[name="a"]').length, checked=$$('input[name="a"]:checked').length, pct=total?Math.round(checked/total*100):0;
    render({title:"Autoavaluació", summary:`${checked}/${total} punts · <strong>${pct}%</strong>`, steps:["Revisa els punts no marcats.", "Millora la conclusió i la justificació."]});
  }

  function printDoc(title, html){
    const doc=`<!doctype html><html lang="ca"><head><meta charset="utf-8"><title>${title}</title><style>
      @page{size:A4;margin:10mm}*{-webkit-print-color-adjust:exact!important;print-color-adjust:exact!important;box-sizing:border-box}
      body{font-family:system-ui,-apple-system,"Segoe UI",sans-serif;color:#1f2937;line-height:1.38;margin:0}
      .print-header{padding:10px 14px;border-radius:12px;background:#1e40af;color:white;margin-bottom:10px;break-inside:avoid}
      .print-header h1{color:white;font-size:22px;margin:0}h2,h3{color:#1e3a8a}.result-card{border-left:5px solid #1d4ed8;border-radius:14px;padding:12px;background:white}
      .kpi-grid{display:grid;grid-template-columns:repeat(2,1fr);gap:8px;margin:10px 0}.kpi,.proc,.curriculum-box{background:#f8fafc;border:1px solid #e2e8f0;border-radius:12px;padding:10px;break-inside:avoid}
      .kpi strong{display:block;color:#1e3a8a;font-size:17px}table{width:100%;border-collapse:collapse;margin:8px 0;break-inside:avoid}th,td{border:1px solid #cbd5e1;padding:6px;text-align:left;vertical-align:top}th{background:#eff6ff;color:#1e3a8a}
      .code-pill{display:inline-flex;min-width:55px;justify-content:center;border-radius:999px;background:#1e40af;color:white;padding:2px 6px;font-size:12px;font-weight:800}.code-pill.saber{background:#047857}.code-pill.criteri{background:#b45309}.numbered-item{display:flex;gap:7px;margin:4px 0;break-inside:avoid}.formal-rubric{margin-top:12px;padding:10px;border:1px solid #bfdbfe;border-radius:12px;background:#f8fbff;break-inside:avoid}.rubric-tag{display:inline-flex;border-radius:999px;padding:1px 5px;color:white;font-weight:900;font-size:11px}.rubric-tag.na{background:#b91c1c}.rubric-tag.as{background:#b45309}.rubric-tag.an{background:#047857}.rubric-tag.ae{background:#1e40af}.rubric-table.formal td:nth-child(2){background:#fef2f2}.rubric-table.formal td:nth-child(3){background:#fff7ed}.rubric-table.formal td:nth-child(4){background:#f0fdf4}.rubric-table.formal td:nth-child(5){background:#ecfdf5}.report-actions,button{display:none!important}
    </style></head><body><header class="print-header"><h1>${title}</h1><div>Informe de situació d’aprenentatge</div></header>${html}<script>window.addEventListener("load",()=>setTimeout(()=>window.print(),350));<\/script></body></html>`;
    const w=window.open("","_blank"); if(!w){alert("El navegador ha bloquejat la finestra d’impressió.");return;} w.document.open(); w.document.write(doc); w.document.close();
  }

  function cloneResult(){
    const result=$("result"); if(!result) return "<p>No hi ha cap resultat.</p>";
    const clone=result.cloneNode(true); clone.querySelectorAll(".report-actions, button").forEach(e=>e.remove());
    return `<section class="result-card">${clone.innerHTML}</section>`;
  }

  function init(){
    $$(".tab").forEach(btn=>btn.addEventListener("click",()=>showView(btn.dataset.view)));
    $$("[data-jump]").forEach(btn=>btn.addEventListener("click",()=>showView(btn.dataset.jump)));

    populateSA();
    populateCourses();
    populateTeacher();

    $("sa-course")?.addEventListener("change", populateSA);
    $("sa-select")?.addEventListener("change", updateInputs);
    $("sa-form")?.addEventListener("submit", calculateSA, true);

    $("tool-select")?.addEventListener("change", updateToolInputs);
    updateToolInputs();
    $("tool-form")?.addEventListener("submit", calculateTool, true);

    $("course-form")?.addEventListener("submit", showCourse, true);
    $("teacher-course")?.addEventListener("change", populateTeacher);
    $("teacher-form")?.addEventListener("submit", showTeacher, true);
    $("assessment-form")?.addEventListener("submit", assess, true);

    document.addEventListener("click", ev=>{
      if(ev.target?.id==="print-rubric") printDoc("Rúbrica de situació d’aprenentatge", `<section class="result-card">${rubricHTML()}</section>`);
      if(ev.target?.id==="export-pdf") printDoc("Informe visual complet", cloneResult());
    });
  }

  if(document.readyState==="loading") document.addEventListener("DOMContentLoaded", init);
  else init();

  if("serviceWorker" in navigator){
    window.addEventListener("load",()=>navigator.serviceWorker.register("./sw.js?v=15").catch(console.warn));
  }
})();


/* Format d'informe visual tipus situació d'aprenentatge */
(function(){
  "use strict";

  function $(id){ return document.getElementById(id); }
  function esc(text){
    return String(text ?? "").replace(/[&<>"']/g, ch => ({
      "&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"
    }[ch]));
  }

  function getCourseLabel(){
    try{
      const select = $("sa-course");
      return select?.selectedOptions?.[0]?.textContent?.trim() || "ESO";
    }catch{return "ESO";}
  }

  function getSituationTitle(){
    try{
      const select = $("sa-select");
      return select?.selectedOptions?.[0]?.textContent?.trim() || document.querySelector("#result h2")?.textContent?.trim() || "Situació d’aprenentatge";
    }catch{return "Situació d’aprenentatge";}
  }

  function getSubject(){
    return "Matemàtiques";
  }

  function getResultText(){
    const result = $("result");
    const summary = result?.querySelector(":scope > p")?.innerText?.trim() || "";
    const steps = Array.from(result?.querySelectorAll(".proc li") || []).map(li => li.innerText.trim());
    const kpis = Array.from(result?.querySelectorAll(".kpi") || []).map(k => k.innerText.trim().replace(/\n+/g, ": "));
    return {summary, steps, kpis};
  }

  function section(title, body){
    return `<section class="sa-card"><h2>${title}</h2>${body}</section>`;
  }

  function pill(text){
    return `<span class="pill">${esc(text)}</span>`;
  }

  function inferProduct(title){
    const t = title.toLowerCase();
    if(t.includes("esmorzar")) return "Proposta de compra justificada amb pressupost, cost per alumne i conclusió de viabilitat.";
    if(t.includes("aula")) return "Proposta d’organització de l’aula amb càlculs d’espai, escala i justificació.";
    if(t.includes("enquesta")) return "Informe breu d’anàlisi de dades amb mesures estadístiques i conclusió.";
    if(t.includes("recepta")) return "Recepta adaptada amb quantitats proporcionals i justificació d’unitats.";
    if(t.includes("ruta")) return "Planificació d’una ruta amb distància real, temps total i decisió de viabilitat.";
    if(t.includes("pressupost")) return "Repartiment justificat del pressupost amb percentatges i imports.";
    if(t.includes("tarifes")) return "Recomanació raonada de tarifa segons consum i modelització funcional.";
    if(t.includes("competició")) return "Proposta d’organització temporal d’una competició amb partits, torns i recursos.";
    if(t.includes("notícia")) return "Anàlisi crítica d’una notícia amb dades i redacció d’una conclusió rigorosa.";
    if(t.includes("jardí")) return "Disseny justificat d’un espai rectangular amb àrea, cost i model d’optimització.";
    if(t.includes("pagament")) return "Decisió financera raonada comparant pagament ajornat i immediat.";
    if(t.includes("altura")) return "Estimació d’una altura mitjançant trigonometria i valoració d’errors.";
    return "Informe amb càlculs, justificació i conclusió final.";
  }

  function inferDescription(title){
    const t = title.toLowerCase();
    if(t.includes("esmorzar")) return "El grup ha d’organitzar un esmorzar saludable amb un pressupost limitat. Cal calcular costos, aplicar descomptes i decidir si la proposta és assumible.";
    if(t.includes("aula")) return "Es planteja reorganitzar un espai de l’aula. Cal analitzar mesures, ocupació i escala per proposar una distribució viable.";
    if(t.includes("enquesta")) return "Es parteix d’un conjunt de dades proper al grup. Cal ordenar-les, calcular mesures estadístiques i interpretar-les.";
    if(t.includes("recepta")) return "S’ha d’adaptar una recepta a un nombre diferent de persones aplicant proporcionalitat i mantenint unitats coherents.";
    if(t.includes("ruta")) return "Cal planificar una ruta a partir d’un mapa, transformant distàncies i estimant el temps necessari.";
    if(t.includes("pressupost")) return "El grup reparteix un pressupost entre partides i ha de justificar si la distribució és coherent.";
    if(t.includes("tarifes")) return "Es comparen dues opcions amb quota fixa i cost variable. Cal modelitzar-les i decidir quina convé segons el consum.";
    if(t.includes("competició")) return "S’ha d’organitzar una competició tenint en compte equips, pistes, partits i temps disponible.";
    if(t.includes("notícia")) return "Es revisa una notícia amb dades numèriques per valorar-ne la interpretació i evitar conclusions enganyoses.";
    if(t.includes("jardí")) return "Es dissenya un espai rectangular amb condicions de perímetre i cost. Cal modelitzar i justificar la proposta.";
    if(t.includes("pagament")) return "Es comparen dues formes de pagament i cal valorar el cost final i la decisió més responsable.";
    if(t.includes("altura")) return "Es vol estimar una altura inaccessible amb distància, angle i trigonometria, valorant possibles errors.";
    return "La situació planteja un repte contextualitzat que requereix càlcul, representació, justificació i conclusió.";
  }

  function collectCurricularPills(){
    const codes = Array.from(document.querySelectorAll("#result .code-pill"))
      .map(x => x.textContent.trim())
      .filter(Boolean);
    const unique = [...new Set(codes)];
    return unique.length ? unique : ["1.1","1.2","2.1","3.1","6.1"];
  }

  function collectListFromResult(selector){
    return Array.from(document.querySelectorAll(selector)).map(x => x.innerText.trim()).filter(Boolean);
  }

  function rubricRows(){
    const rows = Array.from(document.querySelectorAll("#result .rubric-table.formal tbody tr"));
    if(rows.length){
      return rows.map(tr => Array.from(tr.children).map(td => td.innerText.trim()));
    }
    return [
      ["Anàlisi de la necessitat i definició del repte", "Mostra evidències molt parcials; necessita molta guia.", "Resol de manera bàsica amb alguna justificació.", "Analitza la situació amb coherència i evidència suficient.", "Integra anàlisi, autonomia i justificació aprofundida."],
      ["Ideació, planificació i gestió del procés", "Planificació poc clara o incompleta.", "Planifica amb suport i segueix una proposta bàsica.", "Organitza el procés amb fases i criteris.", "Gestiona el procés amb autonomia i capacitat de millora."],
      ["Proposta matemàtica, resultats i viabilitat", "La proposta és poc viable o amb errors importants.", "La proposta és parcialment viable.", "La proposta és viable i ben justificada.", "La proposta és completa, transferible i ben argumentada."],
      ["Comunicació, justificació i millora", "Comunica poc el procés i la conclusió.", "Comunica la solució de manera bàsica.", "Comunica i justifica amb claredat.", "Integra justificació, revisió i millora amb profunditat."]
    ];
  }

  function greenReportHTML(){
    const title = getSituationTitle();
    const course = getCourseLabel();
    const subject = getSubject();
    const result = getResultText();
    const product = inferProduct(title);
    const description = inferDescription(title);
    const conclusion = $("student-conclusion")?.value?.trim() || "[pendent de completar]";
    const criteriaCodes = collectCurricularPills();
    const objectiveItems = collectListFromResult("#result .sa-template-section:nth-of-type(4) li");
    const saberItems = collectListFromResult("#result .sa-template-section:nth-of-type(6) .numbered-item");
    const development = result.steps.length ? result.steps : ["Comprensió del repte.", "Càlcul i representació.", "Justificació.", "Conclusió final."];

    return `
      <article class="green-report">
        <section class="cover-block">
          <div class="vertical-label">PROGRAMACIÓ DE LA SITUACIÓ D’APRENENTATGE</div>
          <div class="cover-main">
            <h1>SA · ${esc(title)}</h1>
            <p class="driving-question">${esc(description)}</p>
            <div class="top-grid">
              <div class="info-card"><span>CURS</span><strong>${esc(course)}</strong></div>
              <div class="info-card"><span>MATÈRIA</span><strong>${esc(subject)}</strong></div>
            </div>
            <div class="soft-card"><h2>Descripció, context i repte</h2><p>${esc(description)}</p></div>
            <div class="soft-card"><h2>Producte final</h2><p>${esc(product)}</p></div>
          </div>
        </section>

        ${section("Competències específiques", `
          <ul>
            <li>CE1: Identificar, analitzar i resoldre problemes matemàtics contextualitzats.</li>
            <li>CE2: Argumentar i justificar procediments, resultats i decisions.</li>
            <li>CE6: Connectar els sabers matemàtics amb situacions reals i altres àmbits.</li>
            <li>CE7: Comunicar i representar idees matemàtiques amb llenguatge adequat.</li>
          </ul>`)}

        ${section("Tractament de les competències transversals", `
          <ul>
            <li>Competència digital: ús de recursos digitals per calcular, representar, documentar i revisar.</li>
            <li>Competència personal, social i d’aprendre a aprendre: planificació, revisió del procés i millora progressiva.</li>
            <li>Competència ciutadana: presa de decisions raonada en contextos propers.</li>
            <li>Competència emprenedora: proposta d’alternatives viables i justificades.</li>
          </ul>`)}

        ${section("Objectius d’aprenentatge", `
          <ul>${(objectiveItems.length ? objectiveItems : [
            "Analitzar una situació contextualitzada per identificar dades, relacions i finalitat.",
            "Aplicar sabers matemàtics per obtenir resultats útils i coherents.",
            "Justificar la resposta amb vocabulari matemàtic, evidències i proposta de millora."
          ]).map(x => `<li>${esc(x)}</li>`).join("")}</ul>`)}

        ${section("Criteris d’avaluació de la situació", `
          <ul>
            <li>Anàlisi de la necessitat o repte i definició de les dades rellevants.</li>
            <li>Ideació, planificació i gestió del procés de resolució.</li>
            <li>Proposta matemàtica, resultats i valoració de la viabilitat.</li>
            <li>Comunicació, justificació i millora a partir d’evidències.</li>
          </ul>`)}

        ${section("Criteris curriculars vinculats", `
          <div class="criteria-pills">${criteriaCodes.map(pill).join("")}</div>`)}

        ${section("Sabers", `
          <ul>${(saberItems.length ? saberItems : [
            "Càlcul, mesura, representació i interpretació segons el context.",
            "Ús de models, relacions, taules o gràfics quan siguin pertinents.",
            "Documentació del procés, justificació de decisions i conclusions."
          ]).map(x => `<li>${esc(x)}</li>`).join("")}</ul>`)}

        ${section("Desenvolupament de la situació d’aprenentatge", `
          <ul>${development.map(x => `<li>${esc(x)}</li>`).join("")}</ul>`)}

        <section class="activity-grid">
          <div class="activity-card"><h2>Activitats inicials</h2><p>Observació del context, detecció de necessitats, conversa inicial sobre què se sap i formulació del repte.</p></div>
          <div class="activity-card"><h2>Activitats de desenvolupament</h2><p>Cerca o introducció de dades, càlculs, representacions, simulacions o proves segons la situació.</p></div>
          <div class="activity-card"><h2>Activitats d’estructuració</h2><p>Organització del procés, justificació de decisions, revisió de criteris i preparació d’evidències.</p></div>
          <div class="activity-card"><h2>Activitats d’aplicació</h2><p>Presentació de la proposta, valoració de l’impacte, conclusió final i proposta de millora.</p></div>
        </section>

        ${section("Breu descripció de com s’aborden els vectors", `
          <ul>
            <li>Aprenentatges competencials: el repte demana aplicar sabers en una situació real o funcional.</li>
            <li>Perspectiva de gènere: ús de rols equilibrats i comunicació inclusiva.</li>
            <li>Universalitat del currículum: nivells i suports per facilitar l’accés i l’aprofundiment.</li>
            <li>Qualitat de l’educació de les llengües: argumentació, documentació i comunicació clara del procés.</li>
            <li>Ciutadania democràtica i consciència global: valoració de decisions i impacte social, econòmic o ambiental quan pertoqui.</li>
            <li>Benestar emocional: treball cooperatiu, revisió constructiva i millora progressiva.</li>
          </ul>`)}

        ${section("Resultat i procediment", `
          <p><strong>Resultat principal:</strong> ${esc(result.summary || "[pendent de completar]")}</p>
          ${result.kpis.length ? `<ul>${result.kpis.map(x => `<li>${esc(x)}</li>`).join("")}</ul>` : ""}
          <p><strong>Conclusió de l’alumnat:</strong> ${esc(conclusion)}</p>`)}

        <section class="evidence-section">
          <h2>Evidències del procés de l’alumnat</h2>
          ${["Detecto la necessitat","Defineixo requisits","Genero idees","Dissenyo la proposta","Construeixo o simulo","Provo i milloro","Valoro l’impacte","Comunico la conclusió","Matriu de decisió","Anàlisi de sostenibilitat"].map((x,i)=>`
            <div class="evidence-card"><span>${i+1}</span><strong>${esc(x)}</strong><em>[pendent de completar]</em></div>
          `).join("")}
        </section>

        <section class="rubric-print">
          <h2>Rúbrica de la situació d’aprenentatge</h2>
          <table>
            <thead><tr><th>Ítem</th><th>Criteris</th><th>NA</th><th>AS</th><th>AN</th><th>AE</th></tr></thead>
            <tbody>
              ${rubricRows().map((r, i) => `
                <tr>
                  <td>${i+1}</td>
                  <td>${esc(r[0] || "")}</td>
                  <td>${esc(r[1] || "")}</td>
                  <td>${esc(r[2] || "")}</td>
                  <td>${esc(r[3] || "")}</td>
                  <td>${esc(r[4] || "")}</td>
                </tr>
              `).join("")}
            </tbody>
          </table>
        </section>
      </article>
    `;
  }

  function greenPrintStyles(){
    return `
      @page{size:A4 landscape;margin:10mm}
      *{box-sizing:border-box;-webkit-print-color-adjust:exact!important;print-color-adjust:exact!important}
      body{margin:0;background:#f7fbf8;color:#17231c;font-family:system-ui,-apple-system,"Segoe UI",sans-serif;line-height:1.38}
      .green-report{max-width:100%;padding:0}
      .cover-block{display:grid;grid-template-columns:70px 1fr;gap:16px;min-height:175mm;padding:8px;background:linear-gradient(90deg,#ffffff 0%,#f1fbf5 100%);break-after:page}
      .vertical-label{writing-mode:vertical-rl;transform:rotate(180deg);font-weight:900;color:#12643d;letter-spacing:.08em;font-size:13px;text-align:center}
      .cover-main{display:grid;align-content:start;gap:12px}
      h1{font-size:30px;line-height:1.05;margin:0;color:#111827}
      h2{font-size:15px;margin:0 0 5px;color:#0f6b42}
      .driving-question{font-size:18px;margin:0;color:#27362f}
      .top-grid{display:grid;grid-template-columns:1fr 1fr;gap:14px}
      .info-card,.soft-card,.sa-card,.activity-card,.evidence-card{background:#fff;border:1px solid #d7e5dc;border-radius:18px;box-shadow:0 12px 30px rgba(15,80,50,.08);padding:14px;break-inside:avoid}
      .info-card span{display:block;color:#0f6b42;font-weight:900;font-size:12px}.info-card strong{font-size:18px}
      .soft-card{background:#edfbf2}
      .sa-card{margin:12px 0;padding:16px}
      ul{margin:0;padding-left:20px}.sa-card li{margin:5px 0}
      .criteria-pills{display:flex;gap:8px;flex-wrap:wrap}.pill{display:inline-flex;border:1px solid #f1d38a;background:#fff8db;color:#855d00;border-radius:999px;padding:5px 9px;font-weight:800}
      .activity-grid{display:grid;grid-template-columns:repeat(4,1fr);gap:12px;margin:12px 0}.activity-card{min-height:105px}
      .evidence-section{break-before:page;display:grid;grid-template-columns:repeat(5,1fr);gap:12px;background:#effaf3;padding:16px;border-radius:18px}
      .evidence-section h2{grid-column:1/-1}
      .evidence-card{min-height:118px;display:flex;flex-direction:column;gap:8px}
      .evidence-card span{display:inline-flex;width:28px;height:28px;border-radius:8px;background:#0f6b42;color:#fff;align-items:center;justify-content:center;font-weight:900}
      .evidence-card em{color:#66756c}
      .rubric-print{break-before:page;background:#fff;padding:12px;border-radius:16px}
      .rubric-print h2{font-size:24px;color:#111827;margin:0 0 12px}
      table{width:100%;border-collapse:collapse;font-size:12px}
      th,td{border:1px solid #bdd7c7;padding:7px;vertical-align:top}
      th{background:#dcf7e7;color:#0f6b42}
      td:nth-child(1){font-weight:900;color:#0f6b42;text-align:center}
      td:nth-child(3){background:#fff}
      td:nth-child(4){background:#fffdf2}
      td:nth-child(5){background:#f1fbf5}
      td:nth-child(6){background:#e7f8ef}
      .report-actions,button{display:none!important}
      @media print{.sa-card,.activity-card,.evidence-card,.soft-card,.info-card{break-inside:avoid}}
    `;
  }

  function exportGreenReport(){
    const doc = `<!doctype html><html lang="ca"><head><meta charset="utf-8"><title>Informe de situació d’aprenentatge</title><style>${greenPrintStyles()}</style></head><body>${greenReportHTML()}<script>window.addEventListener("load",()=>setTimeout(()=>window.print(),400));<\/script></body></html>`;
    const w = window.open("", "_blank");
    if(!w){ alert("El navegador ha bloquejat la finestra d’impressió."); return; }
    w.document.open();
    w.document.write(doc);
    w.document.close();
  }

  function ensureGreenButton(){
    const result = $("result");
    if(!result) return;
    const actions = result.querySelector(".report-actions");
    if(!actions || actions.querySelector("#export-green-report")) return;
    const btn = document.createElement("button");
    btn.type = "button";
    btn.id = "export-green-report";
    btn.textContent = "Exportar informe format SA";
    btn.addEventListener("click", exportGreenReport);
    actions.prepend(btn);
  }

  const observer = new MutationObserver(ensureGreenButton);
  window.addEventListener("DOMContentLoaded", () => {
    const result = $("result");
    if(result) observer.observe(result,{childList:true,subtree:true});
    ensureGreenButton();
  });

  document.addEventListener("click", ev => {
    if(ev.target?.id === "export-green-report") exportGreenReport();
  });
})();
