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
      res.extra = res.extra + curriculumHTML() + actionsHTML();
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
    return `<h3>Rúbrica breu</h3><table class="rubric-table"><thead><tr><th>Criteri</th><th>Assolit</th><th>En procés</th><th>Cal reforç</th></tr></thead><tbody>
      <tr><td>Comprensió</td><td>Identifica dades i pregunta.</td><td>Entén parcialment.</td><td>No identifica què es demana.</td></tr>
      <tr><td>Estratègia</td><td>Tria eines adequades.</td><td>Necessita ajuda.</td><td>No sap quina eina usar.</td></tr>
      <tr><td>Càlcul</td><td>Calcula i revisa.</td><td>Hi ha petits errors.</td><td>Càlculs incoherents.</td></tr>
      <tr><td>Representació</td><td>Usa taules, gràfics o fórmules.</td><td>Representa parcialment.</td><td>No representa clarament.</td></tr>
      <tr><td>Justificació</td><td>Explica i decideix.</td><td>Justifica poc.</td><td>Només dona resultat.</td></tr>
      <tr><td>Conclusió</td><td>Clara i contextualitzada.</td><td>Breu però comprensible.</td><td>No respon al problema.</td></tr>
    </tbody></table>`;
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
      .code-pill{display:inline-flex;min-width:55px;justify-content:center;border-radius:999px;background:#1e40af;color:white;padding:2px 6px;font-size:12px;font-weight:800}.code-pill.saber{background:#047857}.code-pill.criteri{background:#b45309}.numbered-item{display:flex;gap:7px;margin:4px 0;break-inside:avoid}.report-actions,button{display:none!important}
    </style></head><body><header class="print-header"><h1>${title}</h1><div>Matemàtiques ESO · Situacions i eines</div></header>${html}<script>window.addEventListener("load",()=>setTimeout(()=>window.print(),350));<\/script></body></html>`;
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
    window.addEventListener("load",()=>navigator.serviceWorker.register("./sw.js?v=12").catch(console.warn));
  }
})();
