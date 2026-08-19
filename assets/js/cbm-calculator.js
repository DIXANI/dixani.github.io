(()=>{
"use strict";
const $=id=>document.getElementById(id);
const body=$("cartonBody");
let nextId=1;

const unitFactor={cm:.01,m:1,mm:.001,in:.0254,ft:.3048};
const weightToKg={kg:1,lb:.45359237};

const dp=()=>Number($("decimals").value||4);
const fmt=(v,places=dp())=>Number(v).toLocaleString(undefined,{minimumFractionDigits:places,maximumFractionDigits:places});
const val=(el)=>{const n=parseFloat(el.value);return Number.isFinite(n)?n:null};

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
 bindRow(row);
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
 let totalCartons=0,totalCbm=0,totalWeightKg=0,weightEntered=false,validRows=0,invalid=false;
 const factor=unitFactor[$("dimensionUnit").value];

 rows.forEach(row=>{
   const l=val(row.querySelector(".length")),w=val(row.querySelector(".width")),h=val(row.querySelector(".height")),q=val(row.querySelector(".qty")),wt=val(row.querySelector(".weight"));
   const required=[l,w,h,q];
   const hasAny=required.some(x=>x!==null);
   const valid=required.every(x=>x!==null&&x>0);
   if(hasAny&&!valid) invalid=true;

   if(valid){
     const cbm=(l*factor)*(w*factor)*(h*factor);
     const total=cbm*q;
     row.querySelector(".cbmEach").textContent=fmt(cbm)+" m³";
     row.querySelector(".cbmTotal").textContent=fmt(total)+" m³";
     totalCartons+=q; totalCbm+=total; validRows++;
     if(wt!==null){
       if(wt<0) invalid=true;
       else{weightEntered=true; totalWeightKg+=(wt*weightToKg[$("weightUnit").value])*q;}
     }
   }else{
     row.querySelector(".cbmEach").textContent="—";
     row.querySelector(".cbmTotal").textContent="—";
   }
 });

 $("totalCartons").textContent=validRows?fmt(totalCartons,0):"0";
 $("totalCbm").textContent=fmt(totalCbm)+" m³";
 $("totalCft").textContent=fmt(totalCbm*35.3146667)+" ft³";
 $("averageCbm").textContent=totalCartons>0?fmt(totalCbm/totalCartons)+" m³":fmt(0)+" m³";

 if(weightEntered){
   const unit=$("weightUnit").value;
   const displayed=unit==="kg"?totalWeightKg:totalWeightKg/weightToKg.lb;
   $("totalWeight").textContent=fmt(displayed)+" "+unit;
 }else $("totalWeight").textContent="—";

 updateContainer("bar20","pct20",totalCbm,33);
 updateContainer("bar40","pct40",totalCbm,67);
 updateContainer("bar40hc","pct40hc",totalCbm,76);

 if(showWarning && rows.length===0){
   $("warning").textContent="Add at least one carton row before calculating.";
   $("warning").hidden=false;
 }else if(showWarning && validRows===0){
   $("warning").textContent="Enter positive length, width, height and quantity for at least one carton.";
   $("warning").hidden=false;
 }else if(showWarning && invalid){
   $("warning").textContent="Some rows are incomplete or contain invalid values. Only complete positive-value rows were included.";
   $("warning").hidden=false;
 }else $("warning").hidden=true;
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