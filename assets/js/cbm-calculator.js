(()=>{
"use strict";
const $=id=>document.getElementById(id);
const body=$("cartonBody");
let nextId=1;

const unitFactor={cm:.01,m:1,mm:.001,in:.0254,ft:.3048};
const weightToKg={kg:1,lb:.45359237};

const dp=()=>Number($("decimals").value||4);
const fmt=(v,places=dp())=>Number(v).toLocaleString(undefined,{minimumFractionDigits:places,maximumFractionDigits:places});
const val=(el)=>{const n=Number(el.value.trim());return el.value.trim()!==""&&Number.isFinite(n)?n:null};

function rowTemplate(id){
 return `<tr data-id="${id}">
 <td class="row-number">${id}</td>
 <td data-label="Carton / Reference"><input class="ref" type="text" placeholder="Carton ${id}"></td>
 <td data-label="Length"><input class="length" type="number" min="0" step="any" inputmode="decimal" placeholder="60"></td>
 <td data-label="Width"><input class="width" type="number" min="0" step="any" inputmode="decimal" placeholder="40"></td>
 <td data-label="Height"><input class="height" type="number" min="0" step="any" inputmode="decimal" placeholder="35"></td>
 <td data-label="Quantity"><input class="qty" type="number" min="1" step="1" inputmode="numeric" placeholder="20"></td>
 <td data-label="Gross Weight / Carton"><input class="weight" type="number" min="0" step="any" inputmode="decimal" placeholder="Optional"></td>
 <td data-label="CBM / Carton" class="calc-cell cbmEach">—</td>
 <td data-label="Total CBM" class="calc-cell cbmTotal">—</td>
 <td data-label="Action"><button type="button" class="remove" aria-label="Remove carton">Remove</button></td>
 </tr>`;
}

function addRow(values={}){
 const id=nextId++;
 body.insertAdjacentHTML("beforeend",rowTemplate(id));
 const row=body.lastElementChild;
 if(values.ref) row.querySelector(".ref").value=values.ref;
 ["length","width","height","qty","weight"].forEach(k=>{
   if(values[k]!==undefined && values[k]!==null) row.querySelector("."+k).value=values[k];
 });
 row.querySelectorAll("input").forEach(input=>input.setAttribute("aria-label", input.closest("td").dataset.label+" — carton "+id));
 bindRow(row);
 renumber();
 updateEmpty();
 calculate(false);
}

function bindRow(row){
 row.querySelectorAll("input").forEach(input=>input.addEventListener("input",()=>calculate(false)));
 row.querySelector(".remove").addEventListener("click",()=>{
   row.remove(); renumber(); updateEmpty(); calculate(false);
 });
}

function renumber(){
 [...body.rows].forEach((r,i)=>r.querySelector(".row-number").textContent=i+1);
}
function updateEmpty(){ $("empty").hidden=body.rows.length>0; }

function calculate(showWarning=false){
 const rows=[...body.rows];
 let totalCartons=0,totalCbm=0,totalWeightKg=0,validRows=0,missingWeight=false;
 const errors=[];
 const factor=unitFactor[$("dimensionUnit").value];
 const weightFactor=weightToKg[$("weightUnit").value];

 rows.forEach((row,index)=>{
   const inputs=["length","width","height","qty","weight"].map(k=>row.querySelector("."+k));
   inputs.forEach(input=>input.removeAttribute("aria-invalid"));
   row.querySelector(".cbmEach").textContent="—";
   row.querySelector(".cbmTotal").textContent="—";
   const active=inputs.some(input=>input.value!==""||input.validity.badInput)||row.querySelector(".ref").value.trim()!=="";
   if(!active)return;
   const [l,w,h,q,wt]=inputs.map(val);
   const bad=inputs.filter((input,i)=>i<3 ? val(input)===null||val(input)<=0 :
     i===3 ? !Number.isSafeInteger(q)||q<=0 :
     input.validity.badInput||(input.value!==""&&(wt===null||wt<0)));
   if(bad.length){
     bad.forEach(input=>input.setAttribute("aria-invalid","true"));
     errors.push("Row "+(index+1)+": enter positive dimensions, a whole-number quantity and, if supplied, a non-negative weight.");
     return;
   }
   const cbm=(l*factor)*(w*factor)*(h*factor), total=cbm*q;
   const rowWeight=wt===null?0:wt*weightFactor*q;
   if(!Number.isFinite(total)||total<=0||!Number.isFinite(rowWeight)||
      !Number.isFinite(totalCbm+total)||!Number.isFinite((totalCbm+total)/(.3048**3))||
      !Number.isFinite((totalWeightKg+rowWeight)/weightFactor)||!Number.isSafeInteger(totalCartons+q)){
     errors.push("Row "+(index+1)+": values exceed the supported calculation range.");
     return;
   }
   row.querySelector(".cbmEach").textContent=fmt(cbm)+" m³";
   row.querySelector(".cbmTotal").textContent=fmt(total)+" m³";
   totalCartons+=q;totalCbm+=total;totalWeightKg+=rowWeight;validRows++;
   if(wt===null)missingWeight=true;
 });

 const blocked=errors.length>0;
 $("totalCartons").textContent=blocked?"—":fmt(totalCartons,0);
 $("totalCbm").textContent=blocked?"—":fmt(totalCbm)+" m³";
 $("totalCft").textContent=blocked?"—":fmt(totalCbm/(.3048**3))+" ft³";
 $("averageCbm").textContent=blocked?"—":fmt(totalCartons?totalCbm/totalCartons:0)+" m³";
 $("totalWeight").textContent=blocked||!validRows||missingWeight?"—":fmt(totalWeightKg/weightFactor)+" "+$("weightUnit").value;
 $("weightNote").textContent=missingWeight&&!blocked?"Enter gross weight for every carton type to calculate total shipment weight.":"";
 [["bar20","pct20",33],["bar40","pct40",67],["bar40hc","pct40hc",76]].forEach(([bar,pct,capacity])=>{
   updateContainer(bar,pct,blocked?0:totalCbm,capacity);
   if(blocked)$(pct).textContent="—";
 });
 const message=blocked?errors.join(" ")+" Shipment totals are withheld until these rows are corrected or removed.":
   showWarning&&!validRows?"Add a carton row and enter positive dimensions and a whole-number quantity.":"";
 $("warning").textContent=message;
 $("warning").hidden=!message;
}

function updateContainer(barId,pctId,total,capacity){
 const pct=capacity?total/capacity*100:0;
 $(pctId).textContent=fmt(pct,1)+"%";
 $(barId).style.width=Math.min(pct,100)+"%";
}

function clearAll(){
 body.innerHTML=""; nextId=1;
 $("dimensionUnit").value="cm"; $("weightUnit").value="kg"; $("decimals").value="4";
 $("warning").hidden=true;
 addRow();
 const first=body.querySelector(".length"); if(first) first.focus();
}

function loadSample(){
 body.innerHTML=""; nextId=1;
 $("dimensionUnit").value="cm"; $("weightUnit").value="kg"; $("decimals").value="4";
 addRow({ref:"Carton A",length:60,width:40,height:35,qty:20,weight:12});
 calculate(true);
}

$("addBtn").addEventListener("click",()=>addRow());
$("calculateBtn").addEventListener("click",()=>calculate(true));
$("clearBtn").addEventListener("click",clearAll);
$("sampleBtn").addEventListener("click",loadSample);
["dimensionUnit","weightUnit","decimals"].forEach(id=>$(id).addEventListener("change",()=>calculate(false)));

addRow();
})();