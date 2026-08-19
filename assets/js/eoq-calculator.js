(()=>{
"use strict";

const $=id=>document.getElementById(id);
let mode="direct";

const parseValue=id=>{
  const value=Number.parseFloat($(id).value);
  return Number.isFinite(value)?value:null;
};

const decimals=()=>Number($("decimalPlaces").value||2);

const formatNumber=value=>Number(value).toLocaleString(undefined,{
  minimumFractionDigits:decimals(),
  maximumFractionDigits:decimals()
});

const formatMoney=value=>`${$("currency").value} ${formatNumber(value)}`;

function getInputs(){
  const demand=parseValue("annualDemand");
  const orderingCost=parseValue("orderingCost");
  const workingDays=parseValue("workingDays");

  if(demand===null || demand<=0){
    return {ok:false,message:"Annual demand must be greater than zero."};
  }

  if(orderingCost===null || orderingCost<=0){
    return {ok:false,message:"Ordering cost per order must be greater than zero."};
  }

  if(workingDays===null || workingDays<=0){
    return {ok:false,message:"Working days per year must be greater than zero."};
  }

  let holdingCostPerUnit;

  if(mode==="direct"){
    holdingCostPerUnit=parseValue("holdingCost");

    if(holdingCostPerUnit===null || holdingCostPerUnit<=0){
      return {ok:false,message:"Annual holding cost per unit must be greater than zero."};
    }
  }else{
    const unitCost=parseValue("unitCost");
    const holdingRate=parseValue("holdingRate");

    if(unitCost===null || unitCost<=0){
      return {ok:false,message:"Unit cost must be greater than zero."};
    }

    if(holdingRate===null || holdingRate<=0){
      return {ok:false,message:"Annual holding rate must be greater than zero."};
    }

    holdingCostPerUnit=unitCost*(holdingRate/100);
  }

  const currentOrderQty=parseValue("currentOrderQty");

  if(currentOrderQty!==null && currentOrderQty<=0){
    return {ok:false,message:"Current order quantity must be greater than zero when entered."};
  }

  return {
    ok:true,
    demand,
    orderingCost,
    holdingCostPerUnit,
    workingDays,
    currentOrderQty
  };
}

function resetResults(){
  [
    "eoqResult",
    "ordersPerYear",
    "averageInventory",
    "timeBetweenOrders",
    "annualOrderingCost",
    "annualHoldingCost",
    "totalRelevantCost",
    "currentQtyResult",
    "currentRelevantCost",
    "eoqRelevantCost",
    "costDifference"
  ].forEach(id=>$(id).textContent="—");

  $("costDifferenceLabel").textContent="Estimated Cost Difference";
}

function calculate(showValidation=false){
  const data=getInputs();

  if(!data.ok){
    resetResults();

    if(showValidation){
      $("validationMessage").textContent=data.message;
      $("validationMessage").hidden=false;
    }else{
      $("validationMessage").hidden=true;
    }

    return;
  }

  $("validationMessage").hidden=true;

  const eoq=Math.sqrt(
    (2*data.demand*data.orderingCost)/data.holdingCostPerUnit
  );

  const ordersPerYear=data.demand/eoq;
  const averageCycleInventory=eoq/2;
  const timeBetweenOrders=data.workingDays/ordersPerYear;
  const annualOrderingCost=ordersPerYear*data.orderingCost;
  const annualHoldingCost=averageCycleInventory*data.holdingCostPerUnit;
  const totalRelevantCost=annualOrderingCost+annualHoldingCost;

  $("eoqResult").textContent=`${formatNumber(eoq)} units`;
  $("ordersPerYear").textContent=formatNumber(ordersPerYear);
  $("averageInventory").textContent=`${formatNumber(averageCycleInventory)} units`;
  $("timeBetweenOrders").textContent=`${formatNumber(timeBetweenOrders)} days`;
  $("annualOrderingCost").textContent=formatMoney(annualOrderingCost);
  $("annualHoldingCost").textContent=formatMoney(annualHoldingCost);
  $("totalRelevantCost").textContent=`${formatMoney(totalRelevantCost)}/year`;
  $("eoqRelevantCost").textContent=formatMoney(totalRelevantCost);

  if(data.currentOrderQty===null){
    $("currentQtyResult").textContent="—";
    $("currentRelevantCost").textContent="—";
    $("costDifference").textContent="—";
    $("costDifferenceLabel").textContent="Estimated Cost Difference";
    return;
  }

  const currentAnnualOrderingCost=
    (data.demand/data.currentOrderQty)*data.orderingCost;

  const currentAnnualHoldingCost=
    (data.currentOrderQty/2)*data.holdingCostPerUnit;

  const currentRelevantCost=
    currentAnnualOrderingCost+currentAnnualHoldingCost;

  const difference=currentRelevantCost-totalRelevantCost;

  $("currentQtyResult").textContent=`${formatNumber(data.currentOrderQty)} units`;
  $("currentRelevantCost").textContent=formatMoney(currentRelevantCost);
  $("costDifference").textContent=formatMoney(Math.abs(difference));

  if(difference>0){
    $("costDifferenceLabel").textContent="Estimated Cost Reduction";
  }else if(difference<0){
    $("costDifferenceLabel").textContent="Current Quantity Cost Advantage";
  }else{
    $("costDifferenceLabel").textContent="Estimated Cost Difference";
  }
}

function setMode(nextMode){
  mode=nextMode;
  const rateMode=mode==="rate";

  $("holdingCostGroup").hidden=rateMode;
  $("unitCostGroup").hidden=!rateMode;
  $("holdingRateGroup").hidden=!rateMode;

  $("directTab").classList.toggle("active",!rateMode);
  $("rateTab").classList.toggle("active",rateMode);

  $("modePill").textContent=
    rateMode ? "HOLDING RATE %" : "HOLDING COST / UNIT";

  $("formulaBox").innerHTML=rateMode
    ? "<strong>EOQ Formula:</strong> √((2 × Annual Demand × Ordering Cost) ÷ (Unit Cost × Holding Rate))"
    : "<strong>EOQ Formula:</strong> √((2 × Annual Demand × Ordering Cost) ÷ Holding Cost per Unit)";

  $("validationMessage").hidden=true;
  calculate(false);
}

function clearAll(){
  [
    "annualDemand",
    "orderingCost",
    "holdingCost",
    "unitCost",
    "holdingRate",
    "currentOrderQty"
  ].forEach(id=>$(id).value="");

  $("workingDays").value="365";
  $("currency").value="QAR";
  $("decimalPlaces").value="2";
  $("validationMessage").hidden=true;

  resetResults();
  $("annualDemand").focus();
}

function loadExample(){
  $("annualDemand").value="10000";
  $("orderingCost").value="100";
  $("workingDays").value="365";
  $("currentOrderQty").value="1000";

  if(mode==="direct"){
    $("holdingCost").value="0.50";
  }else{
    $("unitCost").value="2.50";
    $("holdingRate").value="20";
  }

  calculate(true);
}

$("directTab").addEventListener("click",()=>setMode("direct"));
$("rateTab").addEventListener("click",()=>setMode("rate"));
$("calculateButton").addEventListener("click",()=>calculate(true));
$("clearButton").addEventListener("click",clearAll);
$("loadExample").addEventListener("click",loadExample);

[
  "annualDemand",
  "orderingCost",
  "holdingCost",
  "unitCost",
  "holdingRate",
  "workingDays",
  "currentOrderQty"
].forEach(id=>{
  $(id).addEventListener("input",()=>calculate(false));
});

["currency","decimalPlaces"].forEach(id=>{
  $(id).addEventListener("change",()=>calculate(false));
});

setMode("direct");
})();