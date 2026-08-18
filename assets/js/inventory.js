(() => {
"use strict";
const $=id=>document.getElementById(id);
const state={items:[]};
$("reportDate").value=new Date().toISOString().slice(0,10);

const n=v=>{const x=parseFloat(String(v??"").replace(/,/g,""));return Number.isFinite(x)?x:0};
const decimals=()=>Number($("decimalPlaces").value||2);
const fmt=v=>n(v).toLocaleString(undefined,{minimumFractionDigits:decimals(),maximumFractionDigits:decimals()});
const money=v=>`${$("currency").value} ${fmt(Math.abs(v))}`;
const status=i=>{const v=n(i.physical)-n(i.system);return v<0?"shortage":v>0?"excess":"matched"};
const pct=i=>n(i.system)===0?null:(n(i.physical)-n(i.system))/n(i.system)*100;
const val=i=>(n(i.physical)-n(i.system))*n(i.cost);
const esc=v=>String(v??"").replace(/[&<>"']/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#039;"}[c]));

function add(item={}){
 state.items.push({sku:item.sku??"",description:item.description??"",system:item.system??"",physical:item.physical??"",cost:item.cost??""});
 render();
}

function render(){
 const q=$("itemSearch").value.trim().toLowerCase(), f=$("statusFilter").value, body=$("inventoryBody");
 body.innerHTML="";
 state.items.map((item,i)=>({item,i}))
 .filter(({item})=>(!q||`${item.sku} ${item.description}`.toLowerCase().includes(q))&&(f==="all"||status(item)===f))
 .forEach(({item,i},r)=>{
  const v=n(item.physical)-n(item.system),p=pct(item),value=val(item),s=status(item);
  const tr=document.createElement("tr");
  tr.innerHTML=`<td class="row-number">${r+1}</td>
  <td><input data-i="${i}" data-f="sku" value="${esc(item.sku)}" placeholder="SKU"></td>
  <td><input data-i="${i}" data-f="description" value="${esc(item.description)}" placeholder="Description"></td>
  <td><input type="number" step="any" min="0" data-i="${i}" data-f="system" value="${esc(item.system)}"></td>
  <td><input type="number" step="any" min="0" data-i="${i}" data-f="physical" value="${esc(item.physical)}"></td>
  <td class="readonly-cell ${v<0?"variance-negative":v>0?"variance-positive":""}">${fmt(v)}</td>
  <td class="readonly-cell">${p===null?"N/A":fmt(p)+"%"}</td>
  <td><input type="number" step="any" min="0" data-i="${i}" data-f="cost" value="${esc(item.cost)}"></td>
  <td class="readonly-cell ${value<0?"variance-negative":value>0?"variance-positive":""}">${value<0?"-":""}${money(value)}</td>
  <td><span class="status-badge status-${s}">${s[0].toUpperCase()+s.slice(1)}</span></td>
  <td><button type="button" class="delete-button" data-del="${i}">✕</button></td>`;
  body.appendChild(tr);
 });
 $("emptyMessage").style.display=body.children.length?"none":"block";
 $("visibleCount").textContent=`${body.children.length} of ${state.items.length} item${state.items.length===1?"":"s"}`;
 summary();
}

function updateRow(i){
 const item=state.items[i];
 const rows=[...$("inventoryBody").querySelectorAll("tr")];
 const row=rows.find(tr=>tr.querySelector(`[data-i="${i}"]`));
 if(!row)return;
 const v=n(item.physical)-n(item.system),p=pct(item),value=val(item),s=status(item),cells=row.children;
 cells[5].textContent=fmt(v);
 cells[5].className="readonly-cell "+(v<0?"variance-negative":v>0?"variance-positive":"");
 cells[6].textContent=p===null?"N/A":fmt(p)+"%";
 cells[8].textContent=(value<0?"-":"")+money(value);
 cells[8].className="readonly-cell "+(value<0?"variance-negative":value>0?"variance-positive":"");
 cells[9].innerHTML=`<span class="status-badge status-${s}">${s[0].toUpperCase()+s.slice(1)}</span>`;
}

function summary(){
 let matched=0,shortage=0,excess=0,sq=0,eq=0,sv=0,ev=0;
 state.items.forEach(i=>{
  const v=n(i.physical)-n(i.system),x=val(i);
  if(v<0){shortage++;sq+=-v;sv+=-x}else if(v>0){excess++;eq+=v;ev+=x}else matched++;
 });
 $("totalItems").textContent=state.items.length;
 $("matchedItems").textContent=matched;
 $("shortageItems").textContent=shortage;
 $("excessItems").textContent=excess;
 $("shortageQty").textContent=fmt(sq);
 $("excessQty").textContent=fmt(eq);
 $("shortageValue").textContent=money(sv);
 $("excessValue").textContent=money(ev);
 const net=ev-sv;
 $("netVariance").textContent=(net<0?"-":"")+money(net);
}

$("inventoryBody").addEventListener("input",e=>{
 if(!e.target.dataset.i)return;
 const i=+e.target.dataset.i;
 state.items[i][e.target.dataset.f]=e.target.value;
 updateRow(i);
 summary();
});

$("inventoryBody").addEventListener("click",e=>{
 if(e.target.dataset.del!==undefined){state.items.splice(+e.target.dataset.del,1);render();}
});

$("addItemButton").onclick=()=>add();

$("loadSampleButton").onclick=()=>{
 state.items=[
  {sku:"SKU-1001",description:"Basmati Rice 5kg",system:100,physical:96,cost:24.5},
  {sku:"SKU-1002",description:"Cooking Oil 1L",system:80,physical:82,cost:8.75},
  {sku:"SKU-1003",description:"Sugar 1kg",system:50,physical:50,cost:3.2},
  {sku:"SKU-1004",description:"Flour 2kg",system:60,physical:55,cost:5.9},
  {sku:"SKU-1005",description:"Tea 500g",system:35,physical:37,cost:12.5}
 ];
 render();
};

$("calculateButton").onclick=()=>render();
$("itemSearch").oninput=render;
$("statusFilter").onchange=render;
$("currency").onchange=render;
$("decimalPlaces").onchange=render;

$("clearButton").onclick=()=>{
 if(confirm("Clear all inventory items and report information?")){
  state.items=[];$("companyName").value="";$("warehouseName").value="";$("preparedBy").value="";render();
 }
};

function parseCSV(t){
 const a=[];let r=[],c="",q=false;
 for(let i=0;i<t.length;i++){
  let ch=t[i],nx=t[i+1];
  if(ch=='"'&&q&&nx=='"'){c+='"';i++;continue}
  if(ch=='"'){q=!q;continue}
  if(ch==","&&!q){r.push(c);c="";continue}
  if((ch=="\n"||ch=="\r")&&!q){if(ch=="\r"&&nx=="\n")i++;r.push(c);c="";if(r.some(x=>x.trim()))a.push(r);r=[];continue}
  c+=ch;
 }
 r.push(c);if(r.some(x=>x.trim()))a.push(r);return a;
}

$("csvFile").onchange=e=>{
 const file=e.target.files[0];if(!file)return;
 const rd=new FileReader();
 rd.onload=()=>{
  try{
   const rows=parseCSV(rd.result);
   const h=rows[0].map(x=>x.trim().toLowerCase().replace(/[_-]/g," ").replace(/\s+/g," "));
   const idx=names=>h.findIndex(x=>names.includes(x));
   const m={
    sku:idx(["sku","item code","item sku","code"]),
    description:idx(["description","item description","item name","product"]),
    system:idx(["system qty","system quantity","system stock","system"]),
    physical:idx(["physical qty","physical quantity","physical stock","physical","counted qty"]),
    cost:idx(["unit cost","cost","unit price","price"])
   };
   if(Object.values(m).every(x=>x<0))throw Error("No recognised inventory columns found.");
   state.items=rows.slice(1).map(r=>({
    sku:m.sku>=0?r[m.sku]:"",
    description:m.description>=0?r[m.description]:"",
    system:m.system>=0?r[m.system]:"",
    physical:m.physical>=0?r[m.physical]:"",
    cost:m.cost>=0?r[m.cost]:""
   })).filter(x=>Object.values(x).some(v=>String(v).trim()));
   render();alert(`${state.items.length} inventory items imported.`);
  }catch(err){alert(err.message)}
  e.target.value="";
 };
 rd.readAsText(file);
};

$("exportCsvButton").onclick=()=>{
 const h=["SKU","Description","System Qty","Physical Qty","Variance","Variance %","Unit Cost","Variance Value","Status"];
 const q=x=>`"${String(x??"").replace(/"/g,'""')}"`;
 const rows=state.items.map(i=>[i.sku,i.description,n(i.system),n(i.physical),n(i.physical)-n(i.system),pct(i)??"",n(i.cost),val(i),status(i)].map(q).join(","));
 const blob=new Blob([[h.map(q).join(","),...rows].join("\n")],{type:"text/csv;charset=utf-8"});
 const u=URL.createObjectURL(blob),a=document.createElement("a");
 a.href=u;a.download=`dixani-inventory-variance-${$("reportDate").value||"report"}.csv`;a.click();URL.revokeObjectURL(u);
};

$("printButton").onclick=()=>{
 summary();
 const company=esc($("companyName").value||"Inventory Report");
 const warehouse=esc($("warehouseName").value||"");
 const reportDate=esc($("reportDate").value||"");
 const prepared=esc($("preparedBy").value||"");
 const currency=esc($("currency").value||"QAR");
 let matched=0,shortage=0,excess=0,sv=0,ev=0;
 state.items.forEach(i=>{
  const v=n(i.physical)-n(i.system),x=val(i);
  if(v<0){shortage++;sv+=-x}else if(v>0){excess++;ev+=x}else matched++;
 });
 const rows=state.items.map((i,idx)=>{
  const v=n(i.physical)-n(i.system),p=pct(i),x=val(i),s=status(i);
  return `<tr><td>${idx+1}</td><td>${esc(i.sku)}</td><td>${esc(i.description)}</td><td>${fmt(i.system)}</td><td>${fmt(i.physical)}</td><td class="${v<0?"neg":v>0?"pos":""}">${fmt(v)}</td><td>${p===null?"N/A":fmt(p)+"%"}</td><td>${money(i.cost)}</td><td class="${x<0?"neg":x>0?"pos":""}">${x<0?"-":""}${money(x)}</td><td>${s.toUpperCase()}</td></tr>`;
 }).join("");
 const win=window.open("","_blank");
 if(!win){alert("The print window was blocked. Please allow pop-ups for DIXANI and try again.");return;}
 win.document.open();
 win.document.write(`<!doctype html><html><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>DIXANI Inventory Variance Report</title>
 <style>*{box-sizing:border-box}body{font-family:Arial,sans-serif;color:#111827;margin:0;padding:24px;font-size:11px}h1{font-size:24px;margin:0 0 14px}h2{font-size:14px;margin:20px 0 8px}.meta{display:grid;grid-template-columns:repeat(2,1fr);gap:7px 24px;border:1px solid #ddd;padding:12px;border-radius:8px}.summary{display:grid;grid-template-columns:repeat(5,1fr);gap:7px}.card{border:1px solid #ddd;padding:9px;border-radius:7px}.card small{display:block;color:#64748b}.card b{font-size:14px}table{width:100%;border-collapse:collapse;margin-top:8px}th,td{border:1px solid #d1d5db;padding:5px;text-align:left}th{background:#f3f4f6;font-size:9px}td:nth-child(1),td:nth-child(n+4){text-align:right}.pos{color:#15803d}.neg{color:#dc2626}.footer{margin-top:20px;color:#64748b;font-size:9px}@page{size:A4 landscape;margin:10mm}@media print{body{padding:0}}@media(max-width:700px){body{padding:12px;font-size:10px}.summary{grid-template-columns:repeat(2,1fr)}.meta{grid-template-columns:1fr}table{font-size:8px}th,td{padding:3px}}</style></head>
 <body><h1>DIXANI — Inventory Variance Report</h1><div class="meta"><div><b>Company / Business:</b> ${company}</div><div><b>Warehouse / Location:</b> ${warehouse}</div><div><b>Report Date:</b> ${reportDate}</div><div><b>Prepared By:</b> ${prepared}</div></div>
 <h2>Variance Summary</h2><div class="summary"><div class="card"><small>Total Items</small><b>${state.items.length}</b></div><div class="card"><small>Matched</small><b>${matched}</b></div><div class="card"><small>Shortage Items</small><b>${shortage}</b></div><div class="card"><small>Excess Items</small><b>${excess}</b></div><div class="card"><small>Net Variance</small><b>${(ev-sv)<0?"-":""}${currency} ${fmt(ev-sv)}</b></div></div>
 <h2>Inventory Details</h2><table><thead><tr><th>#</th><th>SKU</th><th>Description</th><th>System Qty</th><th>Physical Qty</th><th>Variance</th><th>Variance %</th><th>Unit Cost</th><th>Variance Value</th><th>Status</th></tr></thead><tbody>${rows||'<tr><td colspan="10">No inventory items.</td></tr>'}</tbody></table>
 <div class="footer">Generated by DIXANI Inventory Variance Report Generator · Data processed locally in your browser.</div>
 <script>window.onload=function(){setTimeout(function(){window.print()},400)};<\/script></body></html>`);
 win.document.close();
};

add();
})();