(()=>{"use strict";const $=x=>document.getElementById(x),F={cm:.01,mm:.001,m:1,in:.0254,ft:.3048},dimsM={20:[5.898,2.352,2.393],40:[12.032,2.352,2.393],"40hc":[12.032,2.352,2.698]};
const n=x=>{let v=parseFloat($(x).value);return Number.isFinite(v)?v:null},fmt=(x,p=2)=>Number(x).toLocaleString(undefined,{maximumFractionDigits:p,minimumFractionDigits:p});
function conv(m,u){return m/F[u]}function preset(){let t=$("ctype").value,u=$("unit").value,custom=t==="custom";for(let id of["il","iw","ih"])$(id).readOnly=!custom;if(!custom){let a=dimsM[t];$("il").value=+conv(a[0],u).toFixed(3);$("iw").value=+conv(a[1],u).toFixed(3);$("ih").value=+conv(a[2],u).toFixed(3)}}
function blank(){for(let id of["cols","rows","layers","capacity","containers","last","containerCbm","cargoCbm","util"])$(id).textContent="—";$("orientation").textContent="—";for(let id of["topView","sideView"]){$(id).innerHTML=id==="topView"?"No layout yet":"No stack yet";$(id).classList.add("empty")}for(let id of["formation","perLayer","stack","usedHeight"])$(id).textContent="—"}
function get(){let a={total:n("total"),cl:n("cl"),cw:n("cw"),ch:n("ch"),il:n("il"),iw:n("iw"),ih:n("ih")};for(let[k,l]of[["total","Total cartons"],["cl","Carton length"],["cw","Carton width"],["ch","Carton height"],["il","Container length"],["iw","Container width"],["ih","Container height"]])if(a[k]===null||a[k]<=0)return{ok:false,msg:l+" must be greater than zero."};return{ok:true,...a}}
function orientations(a){let x=[[a.cl,a.cw,a.ch],[a.cl,a.ch,a.cw],[a.cw,a.cl,a.ch],[a.cw,a.ch,a.cl],[a.ch,a.cl,a.cw],[a.ch,a.cw,a.cl]];if(!$("rotate").checked)x=[x[0]];return x.map((q,i)=>{let c=Math.floor(a.il/q[0]),r=Math.floor(a.iw/q[1]),l=Math.floor(a.ih/q[2]);return{L:q[0],W:q[1],H:q[2],c,r,l,cap:c*r*l,i}}).sort((a,b)=>b.cap-a.cap)[0]}
function top(a,o){let vw=620,vh=350,p=45,s=Math.min((vw-2*p)/a.il,(vh-2*p)/a.iw),LW=a.il*s,WW=a.iw*s,x=(vw-LW)/2,y=(vh-WW)/2,z=`<svg viewBox="0 0 ${vw} ${vh}"><rect x="${x}" y="${y}" width="${LW}" height="${WW}" rx="7" fill="#f8fafc" stroke="#0f172a" stroke-width="3"/>`,maxDraw=250,i=0;for(let r=0;r<o.r;r++)for(let c=0;c<o.c;c++){i++;if(i>maxDraw)continue;let xx=x+c*o.L*s,yy=y+r*o.W*s,w=o.L*s,h=o.W*s;z+=`<rect x="${xx+1}" y="${yy+1}" width="${Math.max(1,w-2)}" height="${Math.max(1,h-2)}" fill="#dbeafe" stroke="#2563eb" stroke-width=".8"/>`}z+=`<text x="${vw/2}" y="${y-13}" text-anchor="middle" font-family="Arial" font-size="12" fill="#475569">Container floor ${fmt(a.il,1)} × ${fmt(a.iw,1)} ${$("unit").value}</text></svg>`;$("topView").innerHTML=z;$("topView").classList.remove("empty");$("formation").textContent=`${o.c} × ${o.r} grid`;$("perLayer").textContent=`${o.c*o.r} cartons / layer`}
function side(a,o){let vw=440,vh=350,p=45,s=Math.min((vw-2*p)/a.il,(vh-2*p)/a.ih),L=a.il*s,H=a.ih*s,x=(vw-L)/2,y=(vh-H)/2,z=`<svg viewBox="0 0 ${vw} ${vh}"><rect x="${x}" y="${y}" width="${L}" height="${H}" rx="5" fill="#f8fafc" stroke="#0f172a" stroke-width="3"/>`;for(let l=0;l<o.l;l++)for(let c=0;c<o.c;c++){if(o.l*o.c>250&&c%Math.ceil(o.c/80)!==0)continue;let xx=x+c*o.L*s,yy=y+H-(l+1)*o.H*s,w=o.L*s,h=o.H*s;z+=`<rect x="${xx+1}" y="${yy+1}" width="${Math.max(1,w-2)}" height="${Math.max(1,h-2)}" fill="#eff6ff" stroke="#2563eb" stroke-width=".7"/>`}z+="</svg>";$("sideView").innerHTML=z;$("sideView").classList.remove("empty");$("stack").textContent=`${o.l} layers`;$("usedHeight").textContent=`Used height: ${fmt(o.l*o.H)} ${$("unit").value}`}
function calc(show=false){let a=get();if(!a.ok){blank();$("warn").hidden=!show;if(show)$("warn").textContent=a.msg;return}let o=orientations(a);if(!o||o.cap<1){blank();$("warn").hidden=false;$("warn").textContent="The carton does not fit inside the container in the selected orientation mode.";return}let containers = Math.ceil(a.total / o.cap);
let last = a.total % o.cap;

if (last === 0) {
    last = o.cap;
}

let u = F[$("unit").value];

let v =
    a.il * u *
    a.iw * u *
    a.ih * u;

let cv =
    a.cl * u *
    a.cw * u *
    a.ch * u;

let cargo = o.cap * cv;

let util = (cargo / v) * 100;;$("cols").textContent=o.c;$("rows").textContent=o.r;$("layers").textContent=o.l;$("capacity").textContent=o.cap.toLocaleString();$("containers").textContent=containers;$("last").textContent=last.toLocaleString();$("containerCbm").textContent=fmt(v)+" m³";$("cargoCbm").textContent=fmt(cargo)+" m³";$("util").textContent=fmt(util)+"%";$("orientation").textContent=`${fmt(o.L,1)} × ${fmt(o.W,1)} × ${fmt(o.H,1)} ${$("unit").value}`;$("warn").hidden=true;top(a,o);side(a,o)}
function sample(){$("ctype").value="20";$("unit").value="cm";preset();$("total").value=1000;$("cl").value=50;$("cw").value=40;$("ch").value=30;$("rotate").checked=true;calc(true)}
function clearAll(){$("ctype").value="20";$("unit").value="cm";preset();for(let id of["total","cl","cw","ch"])$(id).value="";$("rotate").checked=true;$("warn").hidden=true;blank()}
$("ctype").onchange=()=>{preset();calc(false)};$("unit").onchange=()=>{preset();calc(false)};$("rotate").onchange=()=>calc(false);$("calc").onclick=()=>calc(true);$("sample").onclick=sample;$("clear").onclick=clearAll;for(let id of["total","cl","cw","ch","il","iw","ih"])$(id).addEventListener("input",()=>calc(false));preset();blank()})();