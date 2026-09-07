(function(){
  "use strict";
  const answers=[
    {terms:["damage","damaged","carton"],answer:"Segregate the affected cartons in the designated hold area. Record the visible damage, take photographs, compare the delivered quantity with the purchase order and delivery note, and notify the supervisor before accepting or rejecting the affected stock.",source:"Receiving SOP 2.3 — Damaged Deliveries"},
    {terms:["less","short","shortage","variance","physical","system"],answer:"Begin with an independent recount and confirm the SKU, unit of measure, batch and storage location. Then review recent receiving, dispatch, transfer, return and damage transactions. Do not adjust the system quantity until the investigation is documented and approved.",source:"Inventory Control SOP 4.2 — Stock Variance Investigation"},
    {terms:["fefo","expiry","expire"],answer:"Use FEFO for expiry-controlled products. Allocate the batch with the earliest valid expiry date first, provided it still meets the customer’s minimum shelf-life requirement. Record and escalate any expired or short-dated stock found during picking.",source:"Inventory Control SOP 3.1 — FEFO Allocation"},
    {terms:["adjust","adjustment","immediately","approval"],answer:"No. First complete a recount and transaction review, document the probable cause and attach supporting evidence. A system adjustment should only be posted after approval by the authorized inventory controller or manager.",source:"Inventory Control SOP 4.4 — Adjustment Approval"},
    {terms:["receive","receiving","delivery"],answer:"Verify the purchase order and delivery note, inspect vehicle and seal condition where applicable, count the delivered units, check SKU, batch and expiry information, record discrepancies, and complete the receipt only after the required checks pass.",source:"Receiving SOP 1.2 — Standard Receipt"}
  ];
  const moduleData={
    variance:{eyebrow:"WORKFLOW 02",title:"Investigate a Stock Variance",description:"Collect evidence before approving a stock adjustment.",icon:"📊",comingTitle:"Variance Investigation",text:"This guided workflow will collect the SKU, system quantity, physical quantity and completed checks before generating an investigation summary."},
    huddle:{eyebrow:"WORKFLOW 03",title:"Prepare a 10-Minute Shift Huddle",description:"Turn today’s workload and risks into a focused team briefing.",icon:"👥",comingTitle:"Shift Huddle Generator",text:"This workflow will organize inbound and outbound workload, staffing, urgent orders, limitations, inventory issues, safety changes and previous-shift lessons."},
    report:{eyebrow:"WORKFLOW 04",title:"Create a Daily Operations Report",description:"Convert raw shift updates into a clear management summary.",icon:"📋",comingTitle:"Daily Report Generator",text:"This workflow will structure inbound, outbound, pending work, discrepancies, damages, staffing, equipment issues and priority actions for management."}
  };
  const cards=document.querySelectorAll(".capability-card");
  const knowledge=document.getElementById("knowledgePanel");
  const variance=document.getElementById("variancePanel");
  const huddle=document.getElementById("huddlePanel");
  const dailyReport=document.getElementById("dailyReportPanel");
  const coming=document.getElementById("comingPanel");
  cards.forEach(card=>card.addEventListener("click",()=>{
    cards.forEach(item=>item.classList.remove("active"));card.classList.add("active");
    const key=card.dataset.module;
    knowledge.classList.remove("active");variance.classList.remove("active");huddle.classList.remove("active");dailyReport.classList.remove("active");coming.classList.remove("active");
    if(key==="knowledge"){
      knowledge.classList.add("active");
      document.getElementById("moduleEyebrow").textContent="WORKFLOW 01";
      document.getElementById("moduleTitle").textContent="Ask the Warehouse Assistant";
      document.getElementById("moduleDescription").textContent="Choose a common question or type your own warehouse question.";
    }else if(key==="variance"){
      const data=moduleData.variance;variance.classList.add("active");
      document.getElementById("moduleEyebrow").textContent=data.eyebrow;
      document.getElementById("moduleTitle").textContent=data.title;
      document.getElementById("moduleDescription").textContent=data.description;
    }else if(key==="huddle"){
      const data=moduleData.huddle;huddle.classList.add("active");
      document.getElementById("moduleEyebrow").textContent=data.eyebrow;
      document.getElementById("moduleTitle").textContent=data.title;
      document.getElementById("moduleDescription").textContent=data.description;
    }else if(key==="report"){
      const data=moduleData.report;dailyReport.classList.add("active");
      document.getElementById("moduleEyebrow").textContent=data.eyebrow;
      document.getElementById("moduleTitle").textContent=data.title;
      document.getElementById("moduleDescription").textContent=data.description;
    }else{
      const data=moduleData[key];knowledge.classList.remove("active");coming.classList.add("active");
      document.getElementById("moduleEyebrow").textContent=data.eyebrow;
      document.getElementById("moduleTitle").textContent=data.title;
      document.getElementById("moduleDescription").textContent=data.description;
      document.getElementById("comingIcon").textContent=data.icon;
      document.getElementById("comingTitle").textContent=data.comingTitle;
      document.getElementById("comingText").textContent=data.text;
    }
    document.getElementById("demo").scrollIntoView({behavior:"smooth",block:"start"});
  }));
  const form=document.getElementById("questionForm"),input=document.getElementById("questionInput"),conversation=document.getElementById("conversation");
  function escapeHtml(value){const div=document.createElement("div");div.textContent=value;return div.innerHTML;}
  function ask(question){
    const clean=question.trim();if(!clean)return;
    conversation.insertAdjacentHTML("beforeend",'<div class="chat-row user"><div class="chat-bubble">'+escapeHtml(clean)+"</div></div>");
    const lower=clean.toLowerCase();let best=null,score=0;
    answers.forEach(item=>{const hits=item.terms.filter(term=>lower.includes(term)).length;if(hits>score){best=item;score=hits;}});
    const response=best||{answer:"This demonstration currently answers questions about receiving, damaged deliveries, FEFO, stock variances and adjustment approval. A client version would search your approved company procedures.",source:"Demo assistant scope"};
    window.setTimeout(()=>{
      conversation.insertAdjacentHTML("beforeend",'<div class="chat-row"><span class="assistant-avatar">DX</span><div class="chat-bubble">'+response.answer+'<span class="answer-source">✓ '+response.source+"</span></div></div>");
      conversation.scrollTop=conversation.scrollHeight;
    },350);
    input.value="";conversation.scrollTop=conversation.scrollHeight;
  }
  form.addEventListener("submit",event=>{event.preventDefault();ask(input.value);});
  document.querySelectorAll("#suggestedQuestions button").forEach(button=>button.addEventListener("click",()=>ask(button.textContent)));

  const varianceForm=document.getElementById("varianceForm"),varianceReport=document.getElementById("varianceReport");
  const systemInput=document.getElementById("varianceSystem"),physicalInput=document.getElementById("variancePhysical"),costInput=document.getElementById("varianceCost");
  function varianceNumbers(){const system=Number(systemInput.value),physical=Number(physicalInput.value),cost=Number(costInput.value||0);return{system,physical,cost,difference:physical-system,value:(physical-system)*cost};}
  function updateVariance(){
    const box=document.getElementById("liveVariance");
    if(systemInput.value===""||physicalInput.value===""){box.className="live-variance neutral";document.getElementById("liveVarianceQty").textContent="—";document.getElementById("liveVarianceValue").textContent="Enter both quantities to calculate the impact.";return;}
    const data=varianceNumbers(),type=data.difference<0?"shortage":data.difference>0?"overage":"matched";
    box.className="live-variance "+(type==="matched"?"neutral":type);
    document.getElementById("liveVarianceQty").textContent=(data.difference>0?"+":"")+data.difference+" units · "+type.toUpperCase();
    document.getElementById("liveVarianceValue").textContent="Financial impact: QAR "+Math.abs(data.value).toLocaleString(undefined,{minimumFractionDigits:2,maximumFractionDigits:2});
  }
  [systemInput,physicalInput,costInput].forEach(field=>field.addEventListener("input",updateVariance));
  document.getElementById("loadVarianceExample").addEventListener("click",()=>{
    document.getElementById("varianceSku").value="SKU-1048";document.getElementById("varianceProduct").value="Industrial Storage Bin 45L";document.getElementById("varianceLocation").value="A-02-04";costInput.value="18.50";systemInput.value="1250";physicalInput.value="1215";
    document.querySelectorAll('#investigationChecks input').forEach((item,index)=>item.checked=index<5);document.getElementById("varianceCause").value="Unrecorded damage";document.getElementById("varianceStatus").value="Pending supervisor review";document.getElementById("varianceAction").value="Verify the damaged-stock holding area and outstanding damage records. Post an adjustment only after supervisor approval, then brief the receiving team on immediate damage recording.";updateVariance();
  });
  varianceForm.addEventListener("reset",()=>window.setTimeout(()=>{updateVariance();varianceReport.classList.remove("visible");varianceForm.style.display="flex";},0));
  varianceForm.addEventListener("submit",event=>{
    event.preventDefault();const data=varianceNumbers(),checks=[...document.querySelectorAll('#investigationChecks input:checked')].map(item=>item.value);
    if(!checks.length){window.alert("Please complete and select at least one investigation check.");return;}
    const type=data.difference<0?"Shortage":data.difference>0?"Overage":"Matched";
    document.getElementById("reportDate").textContent=new Date().toLocaleDateString(undefined,{year:"numeric",month:"short",day:"numeric"});
    document.getElementById("reportReference").textContent="Reference: DX-VAR-"+new Date().getFullYear()+"-DEMO";
    document.getElementById("reportSystem").textContent=data.system.toLocaleString();document.getElementById("reportPhysical").textContent=data.physical.toLocaleString();
    document.getElementById("reportVariance").textContent=(data.difference>0?"+":"")+data.difference.toLocaleString()+" · "+type;
    document.getElementById("reportValue").textContent="QAR "+Math.abs(data.value).toLocaleString(undefined,{minimumFractionDigits:2,maximumFractionDigits:2});
    document.getElementById("reportVarianceCard").className=data.difference<0?"negative":data.difference>0?"positive":"";
    document.getElementById("reportItem").textContent=document.getElementById("varianceSku").value+" — "+document.getElementById("varianceProduct").value+" · Location "+document.getElementById("varianceLocation").value+" · Unit cost QAR "+data.cost.toFixed(2);
    document.getElementById("reportCause").textContent=document.getElementById("varianceCause").value;document.getElementById("reportAction").textContent=document.getElementById("varianceAction").value;document.getElementById("reportStatus").textContent=document.getElementById("varianceStatus").value;
    document.getElementById("reportChecks").innerHTML=checks.map(item=>"<li>"+escapeHtml(item)+"</li>").join("");
    varianceForm.style.display="none";varianceReport.classList.add("visible");varianceReport.scrollIntoView({behavior:"smooth",block:"start"});
  });
  document.getElementById("editVariance").addEventListener("click",()=>{varianceReport.classList.remove("visible");varianceForm.style.display="flex";});
  document.getElementById("printVariance").addEventListener("click",()=>window.print());

  const huddleForm=document.getElementById("huddleForm"),huddleReport=document.getElementById("huddleReport");
  const huddleDate=document.getElementById("huddleDate");
  huddleDate.value=new Date().toISOString().slice(0,10);
  document.getElementById("loadHuddleExample").addEventListener("click",()=>{
    huddleDate.value=new Date().toISOString().slice(0,10);document.getElementById("huddleShift").value="Morning Shift";document.getElementById("huddleTeam").value="14";document.getElementById("huddleLeader").value="Warehouse Supervisor";
    document.getElementById("huddleInbound").value="Two supplier vehicles expected by 09:30 — approximately 18 pallets. Priority receipt contains fast-moving SKU-1048.";
    document.getElementById("huddleOutbound").value="42 customer orders; 12 must leave before 11:00. Route QTR-03 loading cut-off is 10:15.";
    document.getElementById("huddleStaffing").value="14 team members available. Allocate 4 receiving, 6 picking, 2 checking and 2 loading.";
    document.getElementById("huddleUrgent").value="Complete the 12 priority orders and release route QTR-03 before the cut-off.";
    document.getElementById("huddleLimitations").value="Forklift FL-02 is under maintenance; use FL-01 and keep the charging lane clear.";
    document.getElementById("huddleInventory").value="SKU-1048 has an open 35-unit shortage investigation. Do not adjust or relocate stock without supervisor approval.";
    document.getElementById("huddleSafety").value="Watch pedestrian crossings during simultaneous receiving and loading. High-visibility vests are mandatory.";
    document.getElementById("huddleLessons").value="Yesterday’s final dispatch was delayed because completed pallets were not moved to staging promptly. Move and label each pallet immediately after checking.";
  });
  function huddleValue(id,fallback){return document.getElementById(id).value.trim()||fallback;}
  huddleForm.addEventListener("reset",()=>window.setTimeout(()=>{huddleDate.value=new Date().toISOString().slice(0,10);huddleReport.classList.remove("visible");huddleForm.style.display="flex";},0));
  huddleForm.addEventListener("submit",event=>{
    event.preventDefault();
    const date=new Date(huddleDate.value+"T00:00:00"),shift=huddleValue("huddleShift","Shift"),team=huddleValue("huddleTeam","—"),leader=huddleValue("huddleLeader","Supervisor");
    const urgent=huddleValue("huddleUrgent","Complete planned inbound and outbound work safely and on time.");
    const items=[
      ["0–1 min","Open & align","Welcome the team. Confirm "+shift+", "+team+" team members and today’s main focus: "+urgent],
      ["1–3 min","Workload & deadlines","INBOUND: "+huddleValue("huddleInbound","No exceptional inbound workload reported.")+"\nOUTBOUND: "+huddleValue("huddleOutbound","No exceptional outbound workload reported.")],
      ["3–4 min","Staffing & allocation",huddleValue("huddleStaffing","Confirm work-area allocation before starting.")],
      ["4–6 min","Urgent priorities & limitations",urgent+"\nLIMITATIONS: "+huddleValue("huddleLimitations","No operational limitations reported.")],
      ["6–8 min","Inventory control",huddleValue("huddleInventory","No inventory issues reported. Escalate any variance before adjustment.")],
      ["8–9 min","Safety & previous lesson",huddleValue("huddleSafety","Follow site PPE and safe-working requirements.")+"\nLESSON: "+huddleValue("huddleLessons","Maintain clear communication and report delays early.")]
    ];
    document.getElementById("huddleReportDate").textContent=date.toLocaleDateString(undefined,{year:"numeric",month:"short",day:"numeric"});
    document.getElementById("huddleMeta").textContent=shift+" · Team: "+team+" · Led by: "+leader;
    document.getElementById("huddleFocus").textContent=urgent;
    document.getElementById("huddleTimeline").innerHTML=items.map(item=>'<div class="timeline-item"><span class="timeline-time">'+escapeHtml(item[0])+'</span><div class="timeline-content"><strong>'+escapeHtml(item[1])+'</strong><p>'+escapeHtml(item[2])+'</p></div></div>').join("");
    huddleForm.style.display="none";huddleReport.classList.add("visible");huddleReport.scrollIntoView({behavior:"smooth",block:"start"});
  });
  document.getElementById("editHuddle").addEventListener("click",()=>{huddleReport.classList.remove("visible");huddleForm.style.display="flex";});
  document.getElementById("printHuddle").addEventListener("click",()=>window.print());

  const dailyForm=document.getElementById("dailyReportForm"),dailyOutput=document.getElementById("dailyReportOutput"),dailyDate=document.getElementById("dailyDate");
  dailyDate.value=new Date().toISOString().slice(0,10);
  function numberValue(id){return Number(document.getElementById(id).value||0);}
  function rate(completed,planned){return planned>0?Math.min((completed/planned)*100,999):0;}
  function rateLabel(value){return value.toLocaleString(undefined,{maximumFractionDigits:1})+"%";}
  function updatePerformance(){
    const inbound=rate(numberValue("inboundCompleted"),numberValue("inboundPlanned")),outbound=rate(numberValue("outboundCompleted"),numberValue("outboundPlanned"));
    document.getElementById("inboundPreview").textContent=document.getElementById("inboundPlanned").value?rateLabel(inbound):"—";
    document.getElementById("outboundPreview").textContent=document.getElementById("outboundPlanned").value?rateLabel(outbound):"—";
  }
  ["inboundPlanned","inboundCompleted","outboundPlanned","outboundCompleted"].forEach(id=>document.getElementById(id).addEventListener("input",updatePerformance));
  document.getElementById("loadDailyExample").addEventListener("click",()=>{
    dailyDate.value=new Date().toISOString().slice(0,10);document.getElementById("dailyShift").value="Morning Shift";document.getElementById("dailyPreparedBy").value="Warehouse Supervisor";document.getElementById("dailyPresent").value="14";
    document.getElementById("inboundPlanned").value="18";document.getElementById("inboundCompleted").value="18";document.getElementById("outboundPlanned").value="42";document.getElementById("outboundCompleted").value="39";
    document.getElementById("dailyPending").value="3 orders remain pending because two customer items were placed on inventory hold. Carry forward to the afternoon shift after stock confirmation.";
    document.getElementById("dailyInventory").value="SKU-1048 remains under investigation for a 35-unit shortage. Recount and transaction review completed; damaged-stock records still being verified.";
    document.getElementById("dailyIncidents").value="Two damaged cartons identified during receiving and moved to quarantine. No personal injury or product leakage.";
    document.getElementById("dailyStaffing").value="14 employees present. One picker reassigned to checking between 09:30 and 11:00 to support the priority dispatch.";
    document.getElementById("dailyEquipment").value="Forklift FL-02 remained under maintenance. FL-01 supported receiving without causing a delivery delay.";
    document.getElementById("dailySafety").value="No incidents or near misses. Pedestrian crossing controls were reinforced during simultaneous loading and receiving.";
    document.getElementById("dailyAchievements").value="All 18 inbound pallets received on schedule. The 12 priority customer orders and route QTR-03 were dispatched before cut-off.";
    document.getElementById("dailyPriorities").value="Resolve the SKU-1048 variance, release or reschedule the 3 pending orders, and confirm the maintenance completion time for FL-02.";updatePerformance();
  });
  function dailyText(id,fallback){return document.getElementById(id).value.trim()||fallback;}
  function setMetricClass(id,value){document.getElementById(id).className=value>=100?"metric-good":"metric-warning";}
  dailyForm.addEventListener("reset",()=>window.setTimeout(()=>{dailyDate.value=new Date().toISOString().slice(0,10);updatePerformance();dailyOutput.classList.remove("visible");dailyForm.style.display="flex";},0));
  dailyForm.addEventListener("submit",event=>{
    event.preventDefault();
    const inboundPlanned=numberValue("inboundPlanned"),inboundDone=numberValue("inboundCompleted"),outboundPlanned=numberValue("outboundPlanned"),outboundDone=numberValue("outboundCompleted");
    const inboundRate=rate(inboundDone,inboundPlanned),outboundRate=rate(outboundDone,outboundPlanned),pending=Math.max(outboundPlanned-outboundDone,0),date=new Date(dailyDate.value+"T00:00:00");
    document.getElementById("dailyReportDate").textContent=date.toLocaleDateString(undefined,{year:"numeric",month:"short",day:"numeric"});
    document.getElementById("dailyReportMeta").textContent=dailyText("dailyShift","Shift")+" · Prepared by "+dailyText("dailyPreparedBy","Supervisor");
    document.getElementById("dailyMetricTeam").textContent=numberValue("dailyPresent");document.getElementById("dailyMetricInbound").textContent=inboundDone+" / "+inboundPlanned+" · "+rateLabel(inboundRate);document.getElementById("dailyMetricOutbound").textContent=outboundDone+" / "+outboundPlanned+" · "+rateLabel(outboundRate);document.getElementById("dailyMetricPending").textContent=pending;
    setMetricClass("inboundMetric",inboundRate);setMetricClass("outboundMetric",outboundRate);
    const performance=inboundRate>=100&&outboundRate>=100?"The shift completed the planned inbound and outbound workload.":"The shift completed "+rateLabel(inboundRate)+" of planned inbound work and "+rateLabel(outboundRate)+" of planned outbound orders. "+pending+" order"+(pending===1?" remains":"s remain")+" pending.";
    document.getElementById("dailySummary").textContent=performance+" Key achievement: "+dailyText("dailyAchievements","Normal operations maintained.")+" Next priority: "+dailyText("dailyPriorities","Complete all carried-forward work.");
    const mapping={dailyOutputPending:["dailyPending","No pending work reported."],dailyOutputInventory:["dailyInventory","No inventory discrepancies reported."],dailyOutputIncidents:["dailyIncidents","No damages or operational incidents reported."],dailyOutputStaffing:["dailyStaffing","No staffing exceptions reported."],dailyOutputEquipment:["dailyEquipment","No equipment or system issues reported."],dailyOutputSafety:["dailySafety","No safety exceptions reported."],dailyOutputAchievements:["dailyAchievements","Normal operations maintained."],dailyOutputPriorities:["dailyPriorities","Complete planned work safely."]};
    Object.keys(mapping).forEach(outputId=>document.getElementById(outputId).textContent=dailyText(mapping[outputId][0],mapping[outputId][1]));
    dailyForm.style.display="none";dailyOutput.classList.add("visible");dailyOutput.scrollIntoView({behavior:"smooth",block:"start"});
  });
  document.getElementById("editDailyReport").addEventListener("click",()=>{dailyOutput.classList.remove("visible");dailyForm.style.display="flex";});
  document.getElementById("printDailyReport").addEventListener("click",()=>window.print());
  document.getElementById("resetDemo").addEventListener("click",()=>{
    if(!window.confirm("Reset all demo entries and generated reports?"))return;
    varianceForm.reset();huddleForm.reset();dailyForm.reset();
    conversation.innerHTML='<div class="welcome-message"><span>DX</span><div><strong>Hello—how can I help with today’s warehouse operation?</strong><p>I’ll answer using the fictional procedures available in this demonstration.</p></div></div>';
    input.value="";cards[0].click();window.setTimeout(()=>document.getElementById("demo").scrollIntoView({behavior:"smooth",block:"start"}),100);
  });
  const email="contact@dixani.com";
  const emailSubject="Custom AI Operations Demo";
  const emailBody="Hello DIXANI,\n\nI would like to discuss a custom operations assistant for our business.\n\nCompany:\nIndustry:\nMain workflow or problem:";
  const chooser=document.getElementById("emailChooser"),requestButton=document.getElementById("requestDemoButton");
  document.getElementById("gmailDemoLink").href="https://mail.google.com/mail/?view=cm&fs=1&to="+encodeURIComponent(email)+"&su="+encodeURIComponent(emailSubject)+"&body="+encodeURIComponent(emailBody);
  document.getElementById("outlookDemoLink").href="https://outlook.office.com/mail/deeplink/compose?to="+encodeURIComponent(email)+"&subject="+encodeURIComponent(emailSubject)+"&body="+encodeURIComponent(emailBody);
  requestButton.addEventListener("click",()=>{const opening=chooser.hidden;chooser.hidden=!opening;requestButton.setAttribute("aria-expanded",String(opening));if(opening)chooser.scrollIntoView({behavior:"smooth",block:"center"});});
  document.getElementById("closeEmailChooser").addEventListener("click",()=>{chooser.hidden=true;requestButton.setAttribute("aria-expanded","false");});
  document.getElementById("copyDemoEmail").addEventListener("click",async()=>{
    const confirmation=document.getElementById("copyConfirmation");
    try{await navigator.clipboard.writeText(email);confirmation.textContent="Copied!";}
    catch(error){window.prompt("Copy this email address:",email);confirmation.textContent="";}
    window.setTimeout(()=>confirmation.textContent="",2500);
  });
})();
