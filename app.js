
'use strict';
(()=>{
const $=id=>document.getElementById(id), $$=sel=>Array.from(document.querySelectorAll(sel));
const fmt=n=>Number.isFinite(Number(n))?Number(n).toLocaleString('ca-ES',{maximumFractionDigits:6}):String(n);
function n(id){const e=$(id); if(!e) throw Error('Falta el camp '+id); const v=Number(String(e.value).replace(',','.')); if(!Number.isFinite(v)) throw Error('El camp '+id+' ha de ser numèric.'); return v}
function pos(v,s){if(!(Number.isFinite(v)&&v>0)) throw Error(s+' ha de ser positiu.')}
function render({title,summary,extra='',steps=[]}){const b=$('result'); b.innerHTML=`<h2>${title}</h2><p>${summary}</p>${extra}${steps.length?`<div class="proc"><strong>Procediment</strong><ol>${steps.map(s=>`<li>${s}</li>`).join('')}</ol></div>`:''}`; b.scrollIntoView({behavior:'smooth',block:'nearest'})}
function kpis(a){return `<div class="kpi-grid">${a.map(([x,y])=>`<div class="kpi"><span>${x}</span><strong>${y}</strong></div>`).join('')}</div>`}
function table(a){return `<table class="result-table"><tbody>${a.map(([x,y])=>`<tr><th>${x}</th><td>${y}</td></tr>`).join('')}</tbody></table>`}
function badges(a){return `<div class="badge-row">${a.map(x=>`<span class="badge">${x}</span>`).join('')}</div>`}
$$('.tab').forEach(b=>b.addEventListener('click',()=>{$$('.view').forEach(v=>v.classList.toggle('active',v.id===b.dataset.view));$$('.tab').forEach(t=>t.classList.toggle('active',t===b))}));
const CE={CE1:'Interpretar, modelitzar i resoldre situacions.',CE2:'Argumentar la idoneïtat de les solucions.',CE3:'Formular preguntes o conjectures.',CE4:'Pensament computacional.',CE5:'Connectar elements matemàtics.',CE6:'Vincular amb altres àrees i la realitat.',CE7:'Comunicar i representar resultats.',CE8:'Autoregulació i aprenentatge de l’error.',CE9:'Cooperar i construir coneixement.'};
const SA={
'1eso':{label:'1r ESO',items:{market:{t:'Comprem per a un esmorzar saludable',tags:['decimals','pressupost','percentatges'],tpl:`<label>Nombre d’alumnes<input id="a" type="number" value="24"></label><label>Cost fruita (€)<input id="b" type="number" value="18" step="any"></label><label>Cost begudes (€)<input id="c" type="number" value="14.5" step="any"></label><label>Cost pa/cereals (€)<input id="d" type="number" value="11.2" step="any"></label><label>Descompte (%)<input id="e" type="number" value="8" step="any"></label><label>Pressupost (€)<input id="f" type="number" value="50" step="any"></label>`,cur:{ce:['CE1','CE2','CE7','CE8'],ca:['CA1.1','CA1.3','CA2.1'],sab:['SN-OPE Operacions amb decimals i percentatges','SM-MAG Diners i unitats','SSO-DEC Presa de decisions']}},classroom:{t:'Organitzem l’aula',tags:['àrea','perímetre','escala'],tpl:`<label>Llargada aula (m)<input id="a" type="number" value="8" step="any"></label><label>Amplada aula (m)<input id="b" type="number" value="5.5" step="any"></label><label>Taules<input id="c" type="number" value="18"></label><label>Espai per taula (m²)<input id="d" type="number" value="1.4" step="any"></label><label>Escala: 1 cm representa (m)<input id="e" type="number" value="0.5" step="any"></label>`,cur:{ce:['CE1','CE5','CE7'],ca:['CA1.2','CA5.1','CA7.1'],sab:['SM-MES Mesura i unitats','SE-ESC Escales i plànols','SE-FIG Figures i espai']}},survey1:{t:'Enquesta ràpida del grup',tags:['dades','freqüències','mitjana'],tpl:`<label>Dades separades per comes<input id="list" value="3,4,4,5,5,5,6,7,7,8,9"></label>`,cur:{ce:['CE1','CE2','CE7','CE9'],ca:['CA1.1','CA2.1','CA7.1'],sab:['SET-DAD Recollida i organització','SET-MES Mesures de centralització','SSO-EQ Cooperació']}}}},
'2eso':{label:'2n ESO',items:{recipe:{t:'Adaptem una recepta',tags:['proporcionalitat','fraccions','unitats'],tpl:`<label>Persones recepta original<input id="a" type="number" value="4"></label><label>Persones finals<input id="b" type="number" value="10"></label><label>Farina original (g)<input id="c" type="number" value="300"></label><label>Llet original (ml)<input id="d" type="number" value="500"></label><label>Sucre original (g)<input id="e" type="number" value="80"></label>`,cur:{ce:['CE1','CE5','CE6'],ca:['CA1.3','CA5.2'],sab:['SN-PRO Proporcionalitat','SN-OPE Operacions','SM-MAG Unitats']}},map:{t:'Planifiquem una ruta amb mapa',tags:['escala','distància','velocitat'],tpl:`<label>Distància al mapa (cm)<input id="a" type="number" value="12" step="any"></label><label>Escala: 1 cm representa (km)<input id="b" type="number" value="0.75" step="any"></label><label>Velocitat mitjana (km/h)<input id="c" type="number" value="4.5" step="any"></label><label>Descans (min)<input id="d" type="number" value="20" step="any"></label>`,cur:{ce:['CE1','CE6','CE7'],ca:['CA1.2','CA6.1','CA7.1'],sab:['SE-ESC Escales','SM-MAG Distància i temps','SN-OPE Operacions']}},budget:{t:'Repartim el pressupost d’un projecte',tags:['percentatges','pressupost','proporcions'],tpl:`<label>Pressupost total (€)<input id="a" type="number" value="600"></label><label>Materials (%)<input id="b" type="number" value="45"></label><label>Transport (%)<input id="c" type="number" value="25"></label><label>Difusió (%)<input id="d" type="number" value="15"></label>`,cur:{ce:['CE1','CE2','CE7'],ca:['CA1.4','CA2.1'],sab:['SN-OPE Percentatges','SM-MAG Diners','SSO-DEC Decisions']}}}},
'3eso':{label:'3r ESO',items:{tariffs:{t:'Comparem tarifes amb funcions',tags:['funció lineal','equacions','punt de tall'],tpl:`<label>Quota A (€)<input id="a" type="number" value="8" step="any"></label><label>Variable A (€/unitat)<input id="b" type="number" value="0.12" step="any"></label><label>Quota B (€)<input id="c" type="number" value="3" step="any"></label><label>Variable B (€/unitat)<input id="d" type="number" value="0.2" step="any"></label><label>Consum<input id="e" type="number" value="80"></label>`,cur:{ce:['CE1','CE2','CE5','CE7'],ca:['CA1.2','CA2.1','CA7.1'],sab:['SA-FUN Funcions lineals','SA-EQU Equacions','SN-OPE Diners']}},sport:{t:'Planifiquem una competició esportiva',tags:['combinatòria','temps','proporcionalitat'],tpl:`<label>Nombre d’equips<input id="a" type="number" value="8"></label><label>Durada partit (min)<input id="b" type="number" value="12"></label><label>Pistes disponibles<input id="c" type="number" value="2"></label><label>Descans entre partits (min)<input id="d" type="number" value="3"></label>`,cur:{ce:['CE1','CE3','CE7','CE9'],ca:['CA1.1','CA3.2'],sab:['SN-COM Comptatge','SM-MAG Temps','SSO-EQ Cooperació']}},news:{t:'Analitzem una notícia amb dades',tags:['percentatges','variació','interpretació crítica'],tpl:`<label>Valor inicial<input id="a" type="number" value="120"></label><label>Valor final<input id="b" type="number" value="156"></label><label>Període (mesos)<input id="c" type="number" value="6"></label><label>Mostra<input id="d" type="number" value="450"></label>`,cur:{ce:['CE1','CE2','CE7'],ca:['CA1.1','CA2.1','CA7.2'],sab:['SET-CRI Interpretació crítica','SN-OPE Percentatges','SET-DAD Mostres']}}}},
'4eso':{label:'4t ESO',items:{garden:{t:'Dissenyem un jardí rectangular',tags:['funció quadràtica','optimització','àrea'],tpl:`<label>Perímetre disponible (m)<input id="a" type="number" value="40"></label><label>Amplada proposada (m)<input id="b" type="number" value="8"></label><label>Cost gespa (€/m²)<input id="c" type="number" value="6.5" step="any"></label>`,cur:{ce:['CE1','CE2','CE5'],ca:['CA1.3','CA2.1'],sab:['SA-FUN Funció quadràtica','SM-MES Àrea','SA-MOD Modelització']}},loan:{t:'Comparem un pagament ajornat',tags:['interès compost','exponencial','decisió'],tpl:`<label>Preu inicial (€)<input id="a" type="number" value="850"></label><label>Interès mensual (%)<input id="b" type="number" value="1.5" step="any"></label><label>Mesos<input id="c" type="number" value="12"></label><label>Descompte immediat (%)<input id="d" type="number" value="6"></label>`,cur:{ce:['CE1','CE2','CE6'],ca:['CA1.4','CA2.1','CA6.1'],sab:['SA-FUN Funció exponencial','SN-OPE Percentatges','SSO-DEC Consum responsable']}},trig:{t:'Mesurem una altura amb trigonometria',tags:['trigonometria','tangent','estimació'],tpl:`<label>Distància (m)<input id="a" type="number" value="18"></label><label>Angle elevació (graus)<input id="b" type="number" value="35"></label><label>Altura dels ulls (m)<input id="c" type="number" value="1.6"></label>`,cur:{ce:['CE1','CE5','CE7'],ca:['CA1.2','CA5.1','CA7.1'],sab:['SE-TRI Trigonometria','SM-MAG Mesura','SE-ESP Representació espacial']}}}}
};
function curItem(){return SA[$('sa-course').value].items[$('sa-select').value]}
function fillSA(){const c=$('sa-course').value,s=$('sa-select');s.innerHTML=Object.entries(SA[c].items).map(([k,v])=>`<option value="${k}">${v.t}</option>`).join(''); fillInputs()}
function fillInputs(){const it=curItem();$('sa-inputs').innerHTML=`<div class="curriculum-box"><strong>${SA[$('sa-course').value].label}</strong> · ${it.tags.join(' · ')}</div>`+it.tpl}
function curBox(it){const ce=it.cur.ce.map(x=>[x,CE[x]]), ca=it.cur.ca.map(x=>[x,x]), sab=it.cur.s.map(x=>{const i=x.indexOf(' ');return [x.slice(0,i),x.slice(i+1)]}); const list=(a,cl='')=>`<div class="numbered-list">${a.map(([c,t])=>`<div class="numbered-item"><span class="code-pill ${cl}">${c}</span><span>${t}</span></div>`).join('')}</div>`; return `<div class="curriculum-box"><h3>Connexió curricular</h3><h3>Competències</h3>${list(ce)}<h3>Criteris vinculats</h3>${list(ca,'criteri')}<h3>Sabers</h3>${list(sab,'saber')}</div>`}
function actions(){return `<div class="report-actions"><button type="button" id="print-rubric">Imprimir rúbrica</button><button type="button" id="export-pdf">Exportar PDF visual complet</button></div>`}
function calc(){const key=$('sa-select').value,l=Number($('sa-level').value),it=curItem();let title='SA '+SA[$('sa-course').value].label+': '+it.t,summary='',extra='',steps=[]; try{
 if(key==='market'){let st=n('a'),raw=n('b')+n('c')+n('d'),disc=raw*n('e')/100,total=raw-disc,diff=n('f')-total;pos(st,'Alumnes');summary=`Cost total: <strong>${fmt(total)} €</strong>.`;extra=kpis([['Total',fmt(total)+' €'],['Per alumne',fmt(total/st)+' €'],['Diferència pressupost',fmt(diff)+' €']]); if(l>=2)extra+=table([['Descompte',fmt(disc)+' €'],['Total sense descompte',fmt(raw)+' €']]); if(l>=3)extra+=`<div class="curriculum-box">Model: C=(fruita+begudes+pa)·(1-d/100).</div>`; if(l>=4)extra+=`<div class="curriculum-box">Decisió: ${diff>=0?'viable':'cal ajustar costos'}.</div>`; steps=['Sumem costos','Apliquem descompte','Dividim per alumnes','Compareu amb pressupost']}
 if(key==='classroom'){let L=n('a'),W=n('b'),ta=n('c'),ep=n('d'),sc=n('e'),A=L*W,free=A-ta*ep;summary=`Espai lliure aproximat: <strong>${fmt(free)} m²</strong>.`;extra=kpis([['Àrea',fmt(A)+' m²'],['Perímetre',fmt(2*(L+W))+' m'],['Plànol',fmt(L/sc)+' cm × '+fmt(W/sc)+' cm']]); if(l>=3)extra+=`<div class="curriculum-box">Model: espai lliure=A−taules·espai per taula.</div>`;steps=['Calculem àrea','Estimem espai ocupat','Apliquem escala','Justifiquem distribució']}
 if(key==='survey1'){let a=$('list').value.split(',').map(x=>Number(x.trim().replace(',','.'))).filter(Number.isFinite),s=[...a].sort((x,y)=>x-y),mean=a.reduce((p,q)=>p+q,0)/a.length,med=s.length%2?s[(s.length-1)/2]:(s[s.length/2-1]+s[s.length/2])/2;summary=`Mitjana: <strong>${fmt(mean)}</strong>.`;extra=kpis([['Mitjana',fmt(mean)],['Mediana',fmt(med)],['Rang',fmt(s.at(-1)-s[0])],['Dades',a.length]]);steps=['Ordenem dades','Calculem mesures','Fem freqüències','Interpretem']}
 if(key==='recipe'){let k=n('b')/n('a');summary=`Factor: <strong>${fmt(k)}</strong>.`;extra=kpis([['Farina',fmt(n('c')*k)+' g'],['Llet',fmt(n('d')*k)+' ml'],['Sucre',fmt(n('e')*k)+' g']]); if(l>=3)extra+=`<div class="curriculum-box">Model: quantitat nova=quantitat original·persones finals/persones originals.</div>`;steps=['Calculem factor','Multipliquem ingredients','Comprovem unitats','Justifiquem arrodoniments']}
 if(key==='map'){let km=n('a')*n('b'),min=km/n('c')*60+n('d');summary=`Distància real: <strong>${fmt(km)} km</strong>.`;extra=kpis([['Distància',fmt(km)+' km'],['Temps total',fmt(min)+' min']]);steps=['Convertim amb escala','Calculem temps','Afegim descans','Valorem viabilitat']}
 if(key==='budget'){let T=n('a'),m=n('b'),tr=n('c'),di=n('d'),o=100-m-tr-di;summary=`Pressupost total: <strong>${fmt(T)} €</strong>.`;extra=kpis([['Materials',fmt(T*m/100)+' €'],['Transport',fmt(T*tr/100)+' €'],['Difusió',fmt(T*di/100)+' €'],['Altres',fmt(T*o/100)+' €']]);steps=['Convertim percentatges','Comprovem suma','Compareu partides','Proposem canvis']}
 if(key==='tariffs'){let fa=n('a'),va=n('b'),fb=n('c'),vb=n('d'),x=n('e'),ca=fa+va*x,cb=fb+vb*x,cut=Math.abs(va-vb)>1e-12?(fb-fa)/(va-vb):null;summary=`Millor opció: <strong>${ca<cb?'A':cb<ca?'B':'iguals'}</strong>.`;extra=kpis([['Cost A',fmt(ca)+' €'],['Cost B',fmt(cb)+' €'],['Punt igualtat',cut!==null?fmt(cut):'no aplicable']]); if(l>=3)extra+=`<div class="curriculum-box">A(x)=${fmt(fa)}+${fmt(va)}x; B(x)=${fmt(fb)}+${fmt(vb)}x.</div>`;steps=['Modelitzem','Substituïm consum','Trobem punt de tall','Decidim per perfils']}
 if(key==='sport'){let eq=n('a'),part=eq*(eq-1)/2,turns=Math.ceil(part/n('c')),min=turns*(n('b')+n('d'));summary=`Partits totals: <strong>${fmt(part)}</strong>.`;extra=kpis([['Partits',fmt(part)],['Torns',fmt(turns)],['Temps',fmt(min)+' min']]);steps=['Comptem partits','Distribuïm pistes','Afegim descansos','Ajustem calendari']}
 if(key==='news'){let ini=n('a'),fin=n('b'),pct=(fin-ini)/ini*100;summary=`Variació: <strong>${fmt(pct)}%</strong>.`;extra=kpis([['Canvi absolut',fmt(fin-ini)],['Canvi percentual',fmt(pct)+'%'],['Mostra',fmt(n('d'))]]);steps=['Canvi absolut','Dividim pel valor inicial','Convertim a percentatge','Interpretem críticament']}
 if(key==='garden'){let P=n('a'),w=n('b'),L=P/2-w,A=L*w,best=(P/4)**2;summary=`Àrea proposada: <strong>${fmt(A)} m²</strong>.`;extra=kpis([['Llargada',fmt(L)+' m'],['Àrea',fmt(A)+' m²'],['Àrea màxima',fmt(best)+' m²'],['Cost',fmt(A*n('c'))+' €']]);steps=['Aïllem llargada','Calculem àrea','Compareu amb màxim','Justifiquem òptim']}
 if(key==='loan'){let p=n('a'),r=n('b')/100,m=n('c'),fin=p*Math.pow(1+r,m),now=p*(1-n('d')/100);summary=`Diferència: <strong>${fmt(fin-now)} €</strong>.`;extra=kpis([['Ajornat',fmt(fin)+' €'],['Immediat',fmt(now)+' €'],['Diferència',fmt(fin-now)+' €']]);steps=['Apliquem interès compost','Calculem descompte','Compareu opcions','Justifiquem decisió']}
 if(key==='trig'){let h=n('a')*Math.tan(n('b')*Math.PI/180)+n('c');summary=`Altura estimada: <strong>${fmt(h)} m</strong>.`;extra=kpis([['Altura',fmt(h)+' m'],['Angle',fmt(n('b'))+'°'],['Distància',fmt(n('a'))+' m']]);steps=['Usem tangent','Multipliquem per distància','Afegim altura ulls','Valorem error']}
 render({title,summary,extra:curBox(it)+extra+actions(),steps}); }catch(e){render({title:'Error',summary:`<span class="error">${e.message}</span>`,steps:['Revisa les dades','Comprova valors positius i unitats']})}}
function rubric(){return `<section class="result-card"><h2>Rúbrica de situació d’aprenentatge</h2><table class="rubric-table"><tr><th>Criteri</th><th>Assolit</th><th>En procés</th><th>Cal reforç</th></tr><tr><td>Comprensió</td><td>Identifica dades i pregunta.</td><td>Entén parcialment.</td><td>No identifica què es demana.</td></tr><tr><td>Estratègia</td><td>Tria eines adequades.</td><td>Necessita ajuda.</td><td>No sap quina eina usar.</td></tr><tr><td>Càlcul</td><td>Calcula i revisa.</td><td>Hi ha petits errors.</td><td>Càlculs incoherents.</td></tr><tr><td>Representació</td><td>Usa taules/gràfics/fórmules.</td><td>Representa parcialment.</td><td>No representa clarament.</td></tr><tr><td>Justificació</td><td>Explica i decideix.</td><td>Justifica poc.</td><td>Només dona resultat.</td></tr><tr><td>Conclusió</td><td>Clara i contextualitzada.</td><td>Breu però comprensible.</td><td>No respon al problema.</td></tr></table></section>`}
function printHTML(html,title){const doc=`<!doctype html><html lang="ca"><head><meta charset="utf-8"><title>${title}</title><style>@page{size:A4;margin:10mm}*{-webkit-print-color-adjust:exact!important;print-color-adjust:exact!important;box-sizing:border-box}body{font-family:system-ui,-apple-system,"Segoe UI",sans-serif;color:#1f2937;line-height:1.38;margin:0}.print-header{padding:10px 14px;border-radius:12px;background:#1e40af;color:white;margin-bottom:10px;break-inside:avoid}.print-header h1{color:white;font-size:22px;margin:0}.result-card{border-left:5px solid #1d4ed8;border-radius:14px;padding:12px;background:white}.kpi-grid{display:grid;grid-template-columns:repeat(2,1fr);gap:8px;margin:10px 0}.kpi,.proc,.curriculum-box{background:#f8fafc;border:1px solid #e2e8f0;border-radius:12px;padding:10px;break-inside:avoid}.kpi strong{display:block;color:#1e3a8a;font-size:17px}.result-table,.rubric-table{width:100%;border-collapse:collapse;margin:8px 0;break-inside:avoid}th,td{border:1px solid #cbd5e1;padding:6px;text-align:left;vertical-align:top}th{background:#eff6ff;color:#1e3a8a}.code-pill{display:inline-flex;min-width:55px;justify-content:center;border-radius:999px;background:#1e40af;color:white;padding:2px 6px;font-size:12px;font-weight:800}.code-pill.saber{background:#047857}.code-pill.criteri{background:#b45309}.numbered-item{display:flex;gap:7px;margin:4px 0;break-inside:avoid}.report-actions,button{display:none!important}</style></head><body><header class="print-header"><h1>${title}</h1><div>Matemàtiques ESO · Situacions i eines</div></header>${html}<script>window.addEventListener('load',()=>setTimeout(()=>window.print(),350));<\/script></body></html>`; const w=window.open('','_blank'); if(!w){alert('El navegador ha bloquejat la finestra.');return} w.document.open();w.document.write(doc);w.document.close()}
document.addEventListener('click',e=>{if(e.target?.id==='print-rubric')printHTML(rubric(),'Rúbrica imprimible'); if(e.target?.id==='export-pdf'){const r=$('result').cloneNode(true);r.querySelectorAll('.report-actions,button').forEach(x=>x.remove());printHTML(`<section class="result-card">${r.innerHTML}</section>`,'Informe visual complet')}});
function fillTools(){const v=$('tool-select').value,box=$('tool-inputs');box.innerHTML=v==='linear'?`<label>a<input id="ta" type="number" value="2"></label><label>b<input id="tb" type="number" value="-6"></label>`:v==='quadratic'?`<label>a<input id="ta" type="number" value="1"></label><label>b<input id="tb" type="number" value="-5"></label><label>c<input id="tc" type="number" value="6"></label>`:`<label>Quantitat<input id="ta" type="number" value="80"></label><label>Percentatge<input id="tb" type="number" value="15"></label>`}
function calcTool(){let v=$('tool-select').value;if(v==='linear'){let a=n('ta'),b=n('tb');render({title:'Equació lineal',summary:`x=<strong>${fmt(-b/a)}</strong>`,steps:['ax+b=0','x=-b/a']})} if(v==='quadratic'){let a=n('ta'),b=n('tb'),c=n('tc'),D=b*b-4*a*c;if(D<0)render({title:'Quadràtica',summary:'No hi ha solucions reals.',steps:['Δ<0']});else render({title:'Quadràtica',summary:`x1=<strong>${fmt((-b+Math.sqrt(D))/(2*a))}</strong>, x2=<strong>${fmt((-b-Math.sqrt(D))/(2*a))}</strong>`,steps:['Calculem discriminant','Apliquem fórmula']})} if(v==='percent'){let q=n('ta'),p=n('tb');render({title:'Percentatge',summary:`${fmt(p)}% de ${fmt(q)} = <strong>${fmt(q*p/100)}</strong>`,steps:['Multipliquem per p/100']})}}
function fillTeacher(){const c=$('teacher-course').value,s=$('teacher-sa');s.innerHTML=Object.entries(SA[c].items).map(([k,v])=>`<option value="${k}">${v.t}</option>`).join('')}
function teacherSheet(){const c=$('teacher-course').value,it=SA[c].items[$('teacher-sa').value];render({title:'Fitxa docent: '+it.t,summary:'Curs recomanat: '+SA[c].label,extra:curBox(it)+actions()+rubric(),steps:['Presenta el context','Assigna nivell','Demana conclusió escrita','Avalua amb rúbrica']})}
function assess(){const t=$$('input[name="a"]').length,c=$$('input[name="a"]:checked').length;render({title:'Autoavaluació',summary:`${c}/${t} punts · <strong>${Math.round(c/t*100)}%</strong>`,steps:['Revisa els punts no marcats','Millora justificació i conclusió']})}
$('sa-course').addEventListener('change',fillSA);$('sa-select').addEventListener('change',fillInputs);$('sa-form').addEventListener('submit',e=>{e.preventDefault();calc()});$('tool-select').addEventListener('change',fillTools);$('tool-form').addEventListener('submit',e=>{e.preventDefault();calcTool()});$('teacher-course').addEventListener('change',fillTeacher);$('teacher-form').addEventListener('submit',e=>{e.preventDefault();teacherSheet()});$('assessment-form').addEventListener('submit',e=>{e.preventDefault();assess()});fillSA();fillTools();fillTeacher();
if('serviceWorker' in navigator) window.addEventListener('load',()=>navigator.serviceWorker.register('./sw.js?v=10').catch(console.warn));
})();


/* V11: correcció SA per curs i connexió curricular segura */
(function(){
  "use strict";

  const $ = id => document.getElementById(id);

  const GENERIC_BY_COURSE = {
    "1eso": {
      ce: [["CE1","Interpretar, modelitzar i resoldre situacions."],["CE7","Comunicar i representar resultats."],["CE8","Autoregulació i revisió del procés."]],
      ca: [["CA1.1","Interpretar la situació i organitzar dades."],["CA1.4","Obtenir solucions matemàtiques."],["CA7.2","Explicar procediments i resultats."]],
      s: [["SN-OPE","Operacions amb nombres i mesures."],["SM-MES","Mesura, magnituds i unitats."],["SSO-REV","Revisió del procés i perseverança."]]
    },
    "2eso": {
      ce: [["CE1","Interpretar, modelitzar i resoldre situacions."],["CE2","Argumentar la idoneïtat de les solucions."],["CE6","Connectar matemàtiques amb la realitat."]],
      ca: [["CA1.3","Seleccionar eines i estratègies."],["CA2.1","Justificar processos i conclusions."],["CA6.1","Reconèixer matemàtiques en contextos reals."]],
      s: [["SN-PRO","Proporcionalitat, percentatges i fraccions."],["SM-ESC","Escales, unitats i magnituds."],["SSO-DEC","Presa de decisions raonada."]]
    },
    "3eso": {
      ce: [["CE1","Interpretar, modelitzar i resoldre situacions."],["CE5","Connectar representacions matemàtiques."],["CE7","Comunicar i representar resultats."]],
      ca: [["CA1.2","Representar situacions amb expressions, taules o gràfics."],["CA5.2","Relacionar conceptes en situacions contextualitzades."],["CA7.1","Representar funcions, dades o resultats."]],
      s: [["SA-FUN","Funcions, relacions i models."],["SET-DAD","Dades, variació i interpretació crítica."],["SN-OPE","Operacions i comparació de quantitats."]]
    },
    "4eso": {
      ce: [["CE1","Interpretar, modelitzar i resoldre situacions."],["CE2","Argumentar la idoneïtat de les solucions."],["CE6","Vincular matemàtiques amb decisions reals."]],
      ca: [["CA1.3","Triar estratègies de modelització."],["CA2.1","Justificar la validesa de la solució."],["CA6.1","Aplicar matemàtiques a contextos reals."]],
      s: [["SA-MOD","Modelització algebraica i funcional."],["SM-MES","Mesura i estimació."],["SSO-DEC","Presa de decisions i valoració d’errors."]]
    }
  };

  const SPECIFIC = {
    classroom: {
      title: "Organitzem l’aula",
      ce: [["CE1","Interpretar i resoldre una situació espacial."],["CE7","Representar mesures i resultats."],["CE8","Revisar si la distribució és viable."]],
      ca: [["CA1.1","Identificar dades i magnituds."],["CA1.4","Calcular àrea, perímetre i espai disponible."],["CA7.1","Representar l’espai amb mesures i escala."]],
      s: [["SM-MES","Àrea, perímetre, unitats i magnituds."],["SE-ESC","Escales i representació de l’espai."],["SN-OPE","Operacions amb decimals i mesures."]]
    },
    market: {
      title: "Comprem per a un esmorzar saludable",
      ce: [["CE1","Resoldre una situació de pressupost."],["CE2","Justificar la viabilitat de la compra."],["CE7","Comunicar el resultat." ]],
      ca: [["CA1.1","Organitzar costos i dades."],["CA1.4","Calcular totals, descomptes i cost per alumne."],["CA2.1","Justificar si el pressupost és suficient."]],
      s: [["SN-OPE","Decimals, diners i percentatges."],["SM-MAG","Magnitud diner i comparació de quantitats."],["SSO-DEC","Presa de decisions responsable."]]
    },
    survey1: {
      title: "Enquesta ràpida del grup",
      ce: [["CE1","Interpretar dades d’una situació."],["CE7","Representar i comunicar dades."],["CE9","Treballar dades de manera cooperativa."]],
      ca: [["CA1.1","Interpretar dades."],["CA7.1","Organitzar dades en taules."],["CA9.1","Cooperar en la interpretació."]],
      s: [["SET-DAD","Recollida i organització de dades."],["SET-MES","Mitjana, mediana i rang."],["SET-GRA","Taules de freqüències."]]
    },
    recipe: {
      title: "Adaptem una recepta",
      ce: [["CE1","Aplicar proporcionalitat a una situació real."],["CE2","Justificar arrodoniments."],["CE6","Connectar matemàtiques i vida quotidiana."]],
      ca: [["CA1.3","Seleccionar proporcionalitat com a estratègia."],["CA1.4","Obtenir quantitats ajustades."],["CA2.1","Justificar resultats i unitats."]],
      s: [["SN-PRO","Proporcionalitat directa."],["SN-OPE","Operacions amb fraccions i decimals."],["SM-MES","Unitats de massa i capacitat."]]
    },
    map: {
      title: "Planifiquem una ruta amb mapa",
      ce: [["CE1","Resoldre una situació de distància i temps."],["CE6","Connectar matemàtiques amb orientació i mobilitat."],["CE7","Comunicar resultats amb unitats."]],
      ca: [["CA1.2","Representar la situació amb escala."],["CA1.4","Calcular distància i temps."],["CA6.1","Reconèixer matemàtiques en mapes."]],
      s: [["SM-ESC","Escales i distàncies."],["SM-MAG","Temps, velocitat i unitats."],["SN-PRO","Relacions proporcionals."]]
    },
    budget: {
      title: "Repartim el pressupost d’un projecte",
      ce: [["CE1","Resoldre un repartiment percentual."],["CE2","Justificar si el repartiment és coherent."],["CE7","Comunicar imports i percentatges."]],
      ca: [["CA1.1","Organitzar dades del pressupost."],["CA1.4","Calcular percentatges i imports."],["CA2.1","Justificar decisions de repartiment."]],
      s: [["SN-PER","Percentatges."],["SN-OPE","Operacions amb diners."],["SSO-DEC","Decisions i criteris de priorització."]]
    },
    tariffs3: {
      title: "Comparem tarifes amb funcions",
      ce: [["CE1","Modelitzar una situació amb funcions."],["CE2","Justificar la millor opció."],["CE7","Representar i comunicar funcions."]],
      ca: [["CA1.2","Representar amb expressions i gràfics."],["CA1.4","Calcular costos i punt d’igualtat."],["CA2.1","Argumentar la decisió."]],
      s: [["SA-FUN","Funcions lineals."],["SA-EQU","Equacions i punt de tall."],["SN-OPE","Operacions amb decimals i diners."]]
    },
    sport: {
      title: "Planifiquem una competició esportiva",
      ce: [["CE1","Resoldre un problema d’organització."],["CE3","Formular estratègies de planificació."],["CE9","Cooperar en una proposta col·lectiva."]],
      ca: [["CA1.3","Seleccionar estratègia de recompte."],["CA3.2","Fer conjectures sobre calendari."],["CA9.1","Participar en la presa de decisions."]],
      s: [["SN-COM","Comptatge de partits."],["SM-TEM","Temps i durada."],["SSO-EQ","Cooperació i organització."]]
    },
    dataNews: {
      title: "Analitzem una notícia amb dades",
      ce: [["CE1","Interpretar dades contextualitzades."],["CE2","Argumentar conclusions."],["CE7","Comunicar resultats críticament."]],
      ca: [["CA1.1","Interpretar dades i context."],["CA2.1","Justificar conclusions."],["CA7.2","Comunicar amb rigor."]],
      s: [["SET-CRI","Interpretació crítica de dades."],["SN-PER","Variació percentual."],["SET-DAD","Mostra i context."]]
    },
    optimization: {
      title: "Dissenyem un jardí rectangular",
      ce: [["CE1","Modelitzar una situació geomètrica."],["CE2","Justificar l’òptim."],["CE5","Connectar àlgebra i geometria."]],
      ca: [["CA1.3","Seleccionar model quadràtic."],["CA2.1","Justificar l’àrea màxima."],["CA5.1","Connectar representacions."]],
      s: [["SA-MOD","Funció quadràtica i modelització."],["SM-MES","Perímetre i àrea."],["SE-FIG","Figures planes."]]
    },
    loan: {
      title: "Comparem un pagament ajornat",
      ce: [["CE1","Modelitzar una situació financera."],["CE2","Argumentar la decisió."],["CE6","Connectar amb economia quotidiana."]],
      ca: [["CA1.3","Aplicar percentatges compostos."],["CA2.1","Justificar la millor opció."],["CA6.1","Aplicar matemàtiques a finances."]],
      s: [["SA-EXP","Creixement exponencial."],["SN-PER","Percentatges i interessos."],["SSO-DEC","Presa de decisions responsable."]]
    },
    trig: {
      title: "Mesurem una altura amb trigonometria",
      ce: [["CE1","Modelitzar una mesura indirecta."],["CE2","Valorar l’error de mesura."],["CE7","Comunicar procés i resultat."]],
      ca: [["CA1.2","Representar el triangle."],["CA1.4","Calcular amb raons trigonomètriques."],["CA2.1","Justificar resultat i errors."]],
      s: [["SM-MES","Mesura indirecta."],["SE-TRI","Triangle rectangle."],["SA-TRIG","Raons trigonomètriques."]]
    }
  };

  function list(items, cls){
    const safe = Array.isArray(items) ? items : [];
    return `<div class="numbered-list">${safe.map(([c,t]) => `<div class="numbered-item"><span class="code-pill ${cls||""}">${c}</span><span>${t}</span></div>`).join("")}</div>`;
  }

  function getKey(){
    return $("sa-select")?.value || "classroom";
  }

  function getCourse(){
    return $("sa-course")?.value || "1eso";
  }

  function getInfo(){
    const key = getKey();
    const base = GENERIC_BY_COURSE[getCourse()] || GENERIC_BY_COURSE["1eso"];
    const specific = SPECIFIC[key] || {};
    return {
      title: specific.title || key,
      ce: specific.ce || base.ce,
      ca: specific.ca || base.ca,
      s: specific.s || base.s
    };
  }

  function curriculumBoxSafe(){
    const info = getInfo();
    return `
      <div class="curriculum-box v11-curricular">
        <h3>Connexió curricular numerada</h3>
        <p class="small-note">Codis CE/CA vinculats a la situació. Els codis de sabers són codificació pràctica de l’app.</p>
        <h3>Competències específiques</h3>${list(info.ce)}
        <h3>Criteris d’avaluació</h3>${list(info.ca, "criteri")}
        <h3>Sabers mobilitzats</h3>${list(info.s, "saber")}
      </div>
    `;
  }

  function addSafeCurriculum(){
    const result = $("result");
    if(!result) return;
    if(result.querySelector(".v11-curricular")) return;
    if(result.querySelector(".error")) return;
    const wrapper = document.createElement("div");
    wrapper.innerHTML = curriculumBoxSafe();
    result.appendChild(wrapper);
  }

  function ensureButtons(){
    const result = $("result");
    if(!result || result.querySelector(".v11-actions")) return;
    if(result.querySelector(".error")) return;
    const actions = document.createElement("div");
    actions.className = "report-actions v11-actions";
    actions.innerHTML = `
      <button type="button" id="v11-print-rubric">Imprimir rúbrica</button>
      <button type="button" id="v11-export-visual">Exportar PDF visual complet</button>
    `;
    result.appendChild(actions);
  }

  function printDoc(title, html){
    const doc = `<!doctype html><html lang="ca"><head><meta charset="utf-8"><title>${title}</title><style>
      @page{size:A4;margin:10mm}
      *{-webkit-print-color-adjust:exact!important;print-color-adjust:exact!important;box-sizing:border-box}
      body{font-family:system-ui,-apple-system,"Segoe UI",sans-serif;color:#1f2937;line-height:1.38;margin:0}
      .print-header{padding:10px 14px;border-radius:12px;background:#1e40af;color:white;margin-bottom:10px;break-inside:avoid}
      .print-header h1{color:white;font-size:22px;margin:0}
      h2,h3{color:#1e3a8a}
      .result-card{border-left:5px solid #1d4ed8;border-radius:14px;padding:12px;background:white}
      .kpi-grid{display:grid;grid-template-columns:repeat(2,1fr);gap:8px;margin:10px 0}
      .kpi,.proc,.curriculum-box{background:#f8fafc;border:1px solid #e2e8f0;border-radius:12px;padding:10px;break-inside:avoid}
      .kpi strong{display:block;color:#1e3a8a;font-size:17px}
      table{width:100%;border-collapse:collapse;margin:8px 0;break-inside:avoid}
      th,td{border:1px solid #cbd5e1;padding:6px;text-align:left;vertical-align:top}
      th{background:#eff6ff;color:#1e3a8a}
      .code-pill{display:inline-flex;min-width:55px;justify-content:center;border-radius:999px;background:#1e40af;color:white;padding:2px 6px;font-size:12px;font-weight:800}
      .code-pill.saber{background:#047857}.code-pill.criteri{background:#b45309}
      .numbered-item{display:flex;gap:7px;margin:4px 0;break-inside:avoid}
      .report-actions,button{display:none!important}
    </style></head><body><header class="print-header"><h1>${title}</h1><div>Matemàtiques ESO · Situacions i eines</div></header>${html}<script>window.addEventListener("load",()=>setTimeout(()=>window.print(),350));<\/script></body></html>`;
    const w = window.open("", "_blank");
    if(!w){ alert("El navegador ha bloquejat la finestra d’impressió."); return; }
    w.document.open(); w.document.write(doc); w.document.close();
  }

  function rubricHTML(){
    return `<section class="result-card"><h2>Rúbrica de situació d’aprenentatge</h2><table class="rubric-table">
      <thead><tr><th>Criteri</th><th>Assolit</th><th>En procés</th><th>Cal reforç</th></tr></thead>
      <tbody>
        <tr><td>Comprensió</td><td>Identifica dades i pregunta.</td><td>Entén parcialment.</td><td>No identifica què es demana.</td></tr>
        <tr><td>Estratègia</td><td>Tria eines adequades.</td><td>Necessita ajuda.</td><td>No sap quina eina usar.</td></tr>
        <tr><td>Càlcul</td><td>Calcula i revisa.</td><td>Hi ha petits errors.</td><td>Càlculs incoherents.</td></tr>
        <tr><td>Representació</td><td>Usa taules, gràfics o fórmules.</td><td>Representa parcialment.</td><td>No representa clarament.</td></tr>
        <tr><td>Justificació</td><td>Explica i decideix.</td><td>Justifica poc.</td><td>Només dona resultat.</td></tr>
        <tr><td>Conclusió</td><td>Clara i contextualitzada.</td><td>Breu però comprensible.</td><td>No respon al problema.</td></tr>
      </tbody>
    </table></section>`;
  }

  function cloneResult(){
    const result = $("result");
    if(!result) return "<p>No hi ha cap resultat.</p>";
    const clone = result.cloneNode(true);
    clone.querySelectorAll(".report-actions, button").forEach(el => el.remove());
    return `<section class="result-card">${clone.innerHTML}</section>`;
  }

  document.addEventListener("submit", ev => {
    if(ev.target?.id !== "sa-form") return;
    setTimeout(() => {
      addSafeCurriculum();
      ensureButtons();
    }, 120);
  }, true);

  document.addEventListener("click", ev => {
    if(ev.target?.id === "v11-print-rubric"){
      printDoc("Rúbrica de situació d’aprenentatge", rubricHTML());
    }
    if(ev.target?.id === "v11-export-visual"){
      addSafeCurriculum();
      printDoc("Informe visual complet", cloneResult());
    }
  });

})();
