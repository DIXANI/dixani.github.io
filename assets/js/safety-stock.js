(()=>{
"use strict";
const $=id=>document.getElementById(id);
const value=id=>{const v=parseFloat($(id).value);return Number.isFinite(v)?v:0};
const fmt=n=>Number(n).toLocaleString(undefined,{minimumFractionDigits:2,maximumFractionDigits:2});
let method="simple";

function setMode(next){
  method=next;
  $("simple").hidden=next!=="simple";
  $("advanced").hidden=next!=="advanced";
  $("simpleTab").classList.toggle("active",next==="simple");
  $("advancedTab").classList.toggle("active",next==="advanced");
  $("mode").textContent=next==="simple"?"SIMPLE METHOD":"ADVANCED METHOD";
  calculate();
}

function calculate(){
  let safety=0, avgUsage=0, metric1=0, metric2=0;
  let hasInput=false;

  if(method==="simple"){
    const maxDaily=value("maxDaily");
    const maxLead=value("maxLead");
    const avgDaily=value("avgDaily");
    const avgLead=value("avgLead");
    hasInput=[maxDaily,maxLead,avgDaily,avgLead].some(v=>v>0);
    metric1=maxDaily*maxLead;
    metric2=avgDaily*avgLead;
    safety=Math.max(0,metric1-metric2);
    avgUsage=avgDaily;
    $("m1label").textContent="Maximum Lead-Time Demand";
    $("m2label").textContent="Average Lead-Time Demand";
  } else {
    const z=value("service");
    const std=value("std");
    const lead=value("advLead");
    const avg=value("advAvg");
    hasInput=[std,lead,avg].some(v=>v>0);
    safety=z*std*Math.sqrt(Math.max(0,lead));
    avgUsage=avg;
    metric1=z;
    metric2=std;
    $("m1label").textContent="Selected Z-Score";
    $("m2label").textContent="Daily Demand Std. Deviation";
  }

  $("result").textContent=fmt(safety);
  $("coverage").textContent=avgUsage>0?fmt(safety/avgUsage)+" days":"—";
  $("m1").textContent=fmt(metric1);
  $("m2").textContent=fmt(metric2);

  if(hasInput){
    $("noteTitle").textContent="Estimated safety stock: "+fmt(safety)+" units";
    $("noteText").textContent=avgUsage>0
      ?"This buffer represents about "+fmt(safety/avgUsage)+" days of average usage. Review it against holding cost, item criticality and supplier reliability."
      :"Review this estimate against holding cost, item criticality and supplier reliability.";
  } else {
    $("noteTitle").textContent="Enter your inventory data";
    $("noteText").textContent="DIXANI will estimate the safety-stock buffer.";
  }
}

function clearFields(){
  const ids=method==="simple"
    ?["maxDaily","maxLead","avgDaily","avgLead"]
    :["std","advLead","advAvg"];
  ids.forEach(id=>$(id).value="");
  calculate();
  const first=method==="simple"?$("maxDaily"):$("std");
  first.focus();
}

function loadExample(){
  if(method==="simple"){
    $("maxDaily").value=25;
    $("maxLead").value=10;
    $("avgDaily").value=15;
    $("avgLead").value=7;
  } else {
    $("service").value="1.96";
    $("std").value=6;
    $("advLead").value=7;
    $("advAvg").value=15;
  }
  calculate();
}

$("simpleTab").addEventListener("click",()=>setMode("simple"));
$("advancedTab").addEventListener("click",()=>setMode("advanced"));
$("calculate").addEventListener("click",calculate);
$("clear").addEventListener("click",clearFields);
$("example").addEventListener("click",loadExample);

["maxDaily","maxLead","avgDaily","avgLead","service","std","advLead","advAvg"].forEach(id=>{
  $(id).addEventListener("input",calculate);
  $(id).addEventListener("change",calculate);
});

setMode("simple");
})();