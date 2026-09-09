(() => {
  'use strict';

  const $ = (id) => document.getElementById(id);
  const fields = ['sku','description','location','systemQty','physicalQty','unitCost','annualUsage','lastCountDate','criticality','previousVariances'];
  const sample = [
    {sku:'A-1001',description:'Industrial bearing 6205',location:'A-01-02',systemQty:120,physicalQty:108,unitCost:38.5,annualUsage:2400,lastCountDate:'2026-01-15',criticality:'High',previousVariances:3},
    {sku:'A-2040',description:'Hydraulic seal kit',location:'A-03-01',systemQty:46,physicalQty:46,unitCost:96,annualUsage:620,lastCountDate:'2026-05-20',criticality:'High',previousVariances:1},
    {sku:'B-1108',description:'Packing tape 48 mm',location:'B-08-04',systemQty:850,physicalQty:902,unitCost:1.8,annualUsage:12400,lastCountDate:'2025-12-10',criticality:'Low',previousVariances:4},
    {sku:'C-4012',description:'Control module',location:'C-02-05',systemQty:18,physicalQty:16,unitCost:785,annualUsage:95,lastCountDate:'2026-03-01',criticality:'High',previousVariances:2},
    {sku:'B-3105',description:'Safety gloves - box',location:'B-05-02',systemQty:310,physicalQty:305,unitCost:14.25,annualUsage:4800,lastCountDate:'2026-07-12',criticality:'Medium',previousVariances:0},
    {sku:'D-0092',description:'Stainless fastener M8',location:'D-10-06',systemQty:4200,physicalQty:4195,unitCost:.22,annualUsage:35000,lastCountDate:'2026-06-18',criticality:'Low',previousVariances:1},
    {sku:'A-7100',description:'Emergency pump assembly',location:'A-01-06',systemQty:5,physicalQty:5,unitCost:2100,annualUsage:12,lastCountDate:'2025-11-01',criticality:'High',previousVariances:0},
    {sku:'B-2214',description:'Barcode label roll',location:'B-09-03',systemQty:175,physicalQty:149,unitCost:6.5,annualUsage:3200,lastCountDate:'2026-02-07',criticality:'Medium',previousVariances:5}
  ];
  let rows = [];
  let analyzed = [];

  const aliases = {
    sku:['sku','item code','itemcode','code','item','product code'], description:['description','item description','name','product'], location:['location','bin','bin location','warehouse location'],
    systemQty:['system qty','system quantity','book qty','book quantity','recorded qty','recorded quantity'], physicalQty:['physical qty','physical quantity','counted qty','count qty','actual qty','actual quantity'],
    unitCost:['unit cost','cost','item cost','unit price'], annualUsage:['annual usage','annual demand','yearly usage','annual picks','annual transactions','velocity'], lastCountDate:['last count date','last count','count date'],
    criticality:['criticality','item criticality','operational criticality'], previousVariances:['previous variances','prior variances','variance history','previous variance count']
  };

  function emptyRow(){ return {sku:'',description:'',location:'',systemQty:0,physicalQty:0,unitCost:0,annualUsage:0,lastCountDate:'',criticality:'Medium',previousVariances:0}; }
  function escCsv(v){ const s=String(v??''); return /[",\n]/.test(s)?`"${s.replace(/"/g,'""')}"`:s; }
  function num(v){ const n=Number(String(v??'').replace(/,/g,'').trim()); return Number.isFinite(n)?n:0; }
  function money(v){ return new Intl.NumberFormat(undefined,{style:'currency',currency:$('currency')?.value||'USD',maximumFractionDigits:2}).format(v); }
  function formatNum(v,max=2){ return new Intl.NumberFormat(undefined,{maximumFractionDigits:max}).format(v); }
  function daysSince(date){ if(!date) return 365; const d=new Date(`${date}T00:00:00`); return Number.isNaN(d.getTime())?365:Math.max(0,Math.round((Date.now()-d.getTime())/86400000)); }
  function normalizeHeader(s){ return String(s).trim().toLowerCase().replace(/[_-]+/g,' ').replace(/\s+/g,' '); }

  function parseDelimited(text){
    const first=(text.split(/\r?\n/,1)[0]||''); const delimiter=(first.match(/\t/g)||[]).length>(first.match(/,/g)||[]).length?'\t':',';
    const out=[]; let row=[], cell='', quoted=false;
    for(let i=0;i<text.length;i++){ const c=text[i]; if(c==='"'){ if(quoted&&text[i+1]==='"'){cell+='"';i++;}else quoted=!quoted; } else if(c===delimiter&&!quoted){row.push(cell);cell='';} else if((c==='\n'||c==='\r')&&!quoted){ if(c==='\r'&&text[i+1]==='\n')i++; row.push(cell); if(row.some(x=>x.trim()))out.push(row); row=[];cell=''; } else cell+=c; }
    row.push(cell); if(row.some(x=>x.trim()))out.push(row); return out;
  }

  function importText(text){
    const matrix=parseDelimited(text.trim()); if(matrix.length<2) throw new Error('Include a header row and at least one inventory item.');
    const headers=matrix[0].map(normalizeHeader); const map={};
    for(const [key,names] of Object.entries(aliases)){ const idx=headers.findIndex(h=>names.includes(h)); if(idx>=0)map[key]=idx; }
    const missing=['sku','systemQty','physicalQty'].filter(k=>map[k]===undefined);
    if(missing.length) throw new Error(`Missing required columns: ${missing.map(k=>k==='systemQty'?'System Qty':k==='physicalQty'?'Physical Qty':'SKU').join(', ')}.`);
    const imported=matrix.slice(1).filter(r=>r.some(c=>c.trim())).map(r=>{ const item=emptyRow(); fields.forEach(k=>{if(map[k]!==undefined)item[k]=(r[map[k]]||'').trim();}); ['systemQty','physicalQty','unitCost','annualUsage','previousVariances'].forEach(k=>item[k]=num(item[k])); item.criticality=/^(high|medium|low)$/i.test(item.criticality)?item.criticality[0].toUpperCase()+item.criticality.slice(1).toLowerCase():'Medium'; return item; });
    if(!imported.length)throw new Error('No usable inventory rows were found.'); rows=imported; renderInputs(); showMessage(`${rows.length} inventory items imported successfully.`,'success');
  }

  function showMessage(text,type){ const el=$('message'); el.textContent=text; el.className=`message show ${type}`; }
  function input(type,value,field,index,options){
    let el;if(options){el=document.createElement('select');options.forEach(o=>{const op=document.createElement('option');op.value=o;op.textContent=o;op.selected=o===value;el.append(op);});}else{el=document.createElement('input');el.type=type;el.value=value??'';if(type==='number'){el.step='any';el.min='0';}}
    el.dataset.field=field;el.dataset.index=index;el.setAttribute('aria-label',`${field} row ${index+1}`);return el;
  }
  function renderInputs(){
    const body=$('inputBody');body.textContent='';const query=$('searchRows').value.trim().toLowerCase();let visible=0;
    rows.forEach((r,i)=>{if(query&&!`${r.sku} ${r.description} ${r.location}`.toLowerCase().includes(query))return;visible++;const tr=document.createElement('tr');
      [['text','sku'],['text','description'],['text','location'],['number','systemQty'],['number','physicalQty'],['number','unitCost'],['number','annualUsage'],['date','lastCountDate']].forEach(([t,f])=>{const td=document.createElement('td');td.append(input(t,r[f],f,i));tr.append(td);});
      let td=document.createElement('td');td.append(input('text',r.criticality,'criticality',i,['Low','Medium','High']));tr.append(td);td=document.createElement('td');td.append(input('number',r.previousVariances,'previousVariances',i));tr.append(td);
      td=document.createElement('td');const b=document.createElement('button');b.type='button';b.className='remove-row';b.textContent='×';b.title='Remove item';b.dataset.remove=i;td.append(b);tr.append(td);body.append(tr);
    }); $('rowCount').textContent=`${visible} of ${rows.length} item${rows.length===1?'':'s'}`;
  }
  function syncInput(e){ const el=e.target;if(!el.dataset.field)return;const i=Number(el.dataset.index),f=el.dataset.field; rows[i][f]=el.type==='number'?num(el.value):el.value; }

  function percentile(values,value){ const sorted=[...values].sort((a,b)=>a-b);if(value<=0)return 0;if(sorted.length<=1)return 1;if(sorted[0]===sorted[sorted.length-1])return .5;let below=0;sorted.forEach(v=>{if(v<value)below++;});return below/(sorted.length-1); }
  function analyze(){
    if(!rows.length){showMessage('Add at least one inventory item before analyzing.','error');return;}
    const valid=rows.filter(r=>String(r.sku).trim()); if(!valid.length){showMessage('Each analyzed item needs an SKU or item code.','error');return;}
    const base=valid.map(r=>{const variance=num(r.physicalQty)-num(r.systemQty);const varianceValue=variance*num(r.unitCost);return {...r,variance,varianceValue,absExposure:Math.abs(varianceValue),annualValue:num(r.annualUsage)*num(r.unitCost),age:daysSince(r.lastCountDate)};});
    const exposureVals=base.map(r=>r.absExposure),velocityVals=base.map(r=>num(r.annualUsage)),valueVals=base.map(r=>num(r.unitCost)),ageVals=base.map(r=>r.age);
    const byAnnual=[...base].sort((a,b)=>b.annualValue-a.annualValue);const totalAnnual=byAnnual.reduce((s,r)=>s+r.annualValue,0);let cumulative=0;const abc=new Map();byAnnual.forEach(r=>{const shareBefore=totalAnnual?cumulative/totalAnnual:1;abc.set(r,shareBefore<.8?'A':shareBefore<.95?'B':'C');cumulative+=r.annualValue;});
    analyzed=base.map(r=>{
      const parts={exposure:30*percentile(exposureVals,r.absExposure),velocity:20*percentile(velocityVals,num(r.annualUsage)),value:20*percentile(valueVals,num(r.unitCost)),age:15*percentile(ageVals,r.age),history:10*Math.min(num(r.previousVariances)/5,1),criticality:{Low:0,Medium:2.5,High:5}[r.criticality]??2.5};
      const score=Math.round(Object.values(parts).reduce((a,b)=>a+b,0));const risk=score>=75?'Critical':score>=55?'High':score>=30?'Medium':'Low';
      const ranked=[['Financial exposure',parts.exposure],['Fast moving',parts.velocity],['High unit value',parts.value],[r.lastCountDate?'Count overdue':'Count date missing',parts.age],['Repeat variance',parts.history],['Operationally critical',parts.criticality]].filter(x=>x[1]>0).sort((a,b)=>b[1]-a[1]).slice(0,3).map(x=>x[0]);
      let action='Monitor through the normal count program.';if(r.variance!==0)action=risk==='Critical'||risk==='High'?'Independent recount; hold adjustment; review receipts, issues and transfers.':'Recount and check recent transactions before adjustment.';else if(risk==='Critical'||risk==='High')action='Schedule a preventive cycle count and verify location controls.';
      return {...r,abc:abc.get(r),score,risk,reasons:ranked,action};
    }).sort((a,b)=>b.score-a.score||b.absExposure-a.absExposure).map((r,i)=>({...r,rank:i+1}));
    renderResults();$('results').hidden=false;$('results').scrollIntoView({behavior:'smooth',block:'start'});
  }

  function renderResults(){
    const total=analyzed.length,matched=analyzed.filter(r=>r.variance===0).length,abs=analyzed.reduce((s,r)=>s+r.absExposure,0),shortage=analyzed.filter(r=>r.varianceValue<0).reduce((s,r)=>s+Math.abs(r.varianceValue),0),units=analyzed.reduce((s,r)=>s+Math.abs(r.variance),0),priority=analyzed.filter(r=>['Critical','High'].includes(r.risk)).length;
    $('accuracyKpi').textContent=`${formatNum(total?matched/total*100:0,1)}%`;$('exposureKpi').textContent=money(abs);$('shortageKpi').textContent=money(shortage);$('priorityKpi').textContent=priority;$('unitsKpi').textContent=formatNum(units);
    $('analysisSummary').textContent=`${total} items analyzed · ${total-matched} mismatches found · results ranked by combined risk.`;
    renderRiskChart();renderExposureChart();renderSignals({total,matched,abs,shortage,priority});renderResultTable();
  }
  function chartRow(label,value,max,kind,display){const row=document.createElement('div');row.className='chart-row';const l=document.createElement('span');l.className='chart-label';l.textContent=label;const track=document.createElement('div');track.className='chart-track';const fill=document.createElement('div');fill.className=`chart-fill ${kind||''}`;fill.style.width=`${max?Math.max(2,value/max*100):0}%`;track.append(fill);const val=document.createElement('span');val.className='chart-value';val.textContent=display??value;row.append(l,track,val);return row;}
  function renderRiskChart(){const el=$('riskChart');el.textContent='';const counts={Critical:0,High:0,Medium:0,Low:0};analyzed.forEach(r=>counts[r.risk]++);const max=Math.max(...Object.values(counts),1);Object.entries(counts).forEach(([k,v])=>el.append(chartRow(k,v,max,k.toLowerCase())));}
  function renderExposureChart(){const el=$('exposureChart');el.textContent='';const top=[...analyzed].sort((a,b)=>b.absExposure-a.absExposure).slice(0,5),max=top[0]?.absExposure||1;top.forEach(r=>el.append(chartRow(r.sku,r.absExposure,max,'',money(r.absExposure))));}
  function renderSignals(stats){const ul=$('managementSignals');ul.textContent='';const signals=[];const top=[...analyzed].sort((a,b)=>b.absExposure-a.absExposure)[0];if(top&&stats.abs)signals.push(`${top.sku} contributes ${formatNum(top.absExposure/stats.abs*100,1)}% of total variance exposure.`);signals.push(`${formatNum(stats.matched/stats.total*100,1)}% of items exactly match the system record.`);if(stats.shortage)signals.push(`${money(stats.shortage)} of the exposure is shortage-related.`);const overdue=analyzed.filter(r=>r.age>365).length;if(overdue)signals.push(`${overdue} item${overdue===1?' is':'s are'} more than one year from the recorded last count.`);if(stats.priority)signals.push(`${stats.priority} high-priority item${stats.priority===1?'':'s'} should be reviewed before routine discrepancies.`);signals.slice(0,5).forEach(s=>{const li=document.createElement('li');li.textContent=s;ul.append(li);});}
  function renderResultTable(){const body=$('resultsBody');body.textContent='';const rf=$('riskFilter').value,af=$('abcFilter').value;const filtered=analyzed.filter(r=>(rf==='all'||r.risk===rf)&&(af==='all'||r.abc===af));filtered.forEach(r=>{const tr=document.createElement('tr');
    const values=[r.rank,null,`${r.variance>0?'+':''}${formatNum(r.variance)}`,money(r.absExposure),null,null,null,r.action];values.forEach((v,i)=>{const td=document.createElement('td');if(i===0)td.className='rank';if(i===1){td.className='item-name';const strong=document.createElement('strong');strong.textContent=r.sku;const span=document.createElement('span');span.textContent=`${r.description||'No description'} · ${r.location||'No location'}`;td.append(strong,span);}else if(i===4){const p=document.createElement('span');p.className='abc-pill';p.textContent=r.abc;td.append(p);}else if(i===5){const p=document.createElement('span');p.className=`risk-pill risk-${r.risk.toLowerCase()}`;p.textContent=`${r.risk} · ${r.score}`;td.append(p);}else if(i===6){td.className='reason-list';r.reasons.forEach(reason=>{const p=document.createElement('span');p.textContent=reason;td.append(p);});}else{td.textContent=v;if(i===7)td.className='action-text';}tr.append(td);});body.append(tr);});$('noResults').hidden=filtered.length>0;
  }
  function download(name,text,type='text/csv;charset=utf-8'){const blob=new Blob([text],{type});const url=URL.createObjectURL(blob);const a=document.createElement('a');a.href=url;a.download=name;document.body.append(a);a.click();a.remove();URL.revokeObjectURL(url);}
  function templateCsv(){const head='SKU,Description,Location,System Qty,Physical Qty,Unit Cost,Annual Usage,Last Count Date,Criticality,Previous Variances';const example='ITEM-001,Example item,A-01-01,100,98,12.50,1200,2026-06-30,Medium,1';download('dixani-inventory-accuracy-template.csv',`${head}\n${example}\n`);}
  function exportResults(){if(!analyzed.length)return;const head=['Rank','SKU','Description','Location','System Qty','Physical Qty','Variance','Unit Cost','Absolute Exposure','Annual Usage','Annual Value','ABC Class','Last Count Date','Criticality','Previous Variances','Risk Score','Risk Level','Priority Reasons','Recommended Action'];const data=analyzed.map(r=>[r.rank,r.sku,r.description,r.location,r.systemQty,r.physicalQty,r.variance,r.unitCost,r.absExposure,r.annualUsage,r.annualValue,r.abc,r.lastCountDate,r.criticality,r.previousVariances,r.score,r.risk,r.reasons.join('; '),r.action]);download('dixani-inventory-accuracy-analysis.csv',[head,...data].map(row=>row.map(escCsv).join(',')).join('\n'));}

  $('inputBody').addEventListener('input',syncInput);$('inputBody').addEventListener('change',syncInput);$('inputBody').addEventListener('click',e=>{const i=e.target.dataset.remove;if(i!==undefined){rows.splice(Number(i),1);renderInputs();}});$('searchRows').addEventListener('input',renderInputs);
  $('addRow').addEventListener('click',()=>{rows.push(emptyRow());renderInputs();const wrap=document.querySelector('.editable-table-wrap');wrap.scrollTop=wrap.scrollHeight;});$('loadSample').addEventListener('click',()=>{rows=sample.map(r=>({...r}));renderInputs();showMessage('Sample data loaded. Select Analyze inventory to see the risk priorities.','success');});$('clearData').addEventListener('click',()=>{rows=[];analyzed=[];renderInputs();$('results').hidden=true;showMessage('Working data cleared.','success');});
  $('csvFile').addEventListener('change',async e=>{const f=e.target.files[0];if(!f)return;try{importText(await f.text());}catch(err){showMessage(err.message,'error');}e.target.value='';});$('importPaste').addEventListener('click',()=>{try{importText($('pasteData').value);$('pasteData').value='';}catch(err){showMessage(err.message,'error');}});
  const drop=$('dropZone');['dragenter','dragover'].forEach(n=>drop.addEventListener(n,e=>{e.preventDefault();drop.classList.add('drag');}));['dragleave','drop'].forEach(n=>drop.addEventListener(n,e=>{e.preventDefault();drop.classList.remove('drag');}));drop.addEventListener('drop',async e=>{const f=e.dataTransfer.files[0];if(!f)return;try{importText(await f.text());}catch(err){showMessage(err.message,'error');}});
  $('downloadTemplate').addEventListener('click',templateCsv);$('analyzeButton').addEventListener('click',analyze);$('riskFilter').addEventListener('change',renderResultTable);$('abcFilter').addEventListener('change',renderResultTable);$('currency').addEventListener('change',()=>{if(analyzed.length)renderResults();});$('exportCsv').addEventListener('click',exportResults);$('printReport').addEventListener('click',()=>window.print());
  rows=sample.map(r=>({...r}));renderInputs();
})();
