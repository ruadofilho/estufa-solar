/* Modelo de laboratório v0.1. Hipóteses explícitas; não é curva validada de Pinus. */
(function(root){
'use strict';
const C={area:0.66442*1.220,depth:0.585,length:1.220,boardLength:1.000,pileTop:0.342,base:0.058,sticker:0.015,sideGap:0.070,gap:0.045,ua:5.8059166,latent:2400/3600,density:500};
const finite=(x,a,b)=>Number.isFinite(Number(x))&&Number(x)>=a&&Number(x)<=b;
function validate(b){
 const e=[];
 if(!b||b.species!=='pinus_elliottii')return ['Este protótipo aceita somente Pinus elliottii.'];
 for(const [key,min,max,label] of [['length',1,10000,'comprimento'],['width',1,2000,'largura'],['thickness',1,500,'espessura'],['quantity',1,10000,'quantidade'],['initial',1,200,'umidade inicial'],['target',7,30,'umidade final']])if(!finite(b[key],min,max))e.push('Confira '+label+'.');
 if(b.separator!==undefined&&!finite(b.separator,5,100))e.push('Use separadores de 5 a 100 mm.');
 if(!Number.isInteger(Number(b.quantity)))e.push('A quantidade deve ser inteira.');
 if(Number(b.initial)<=Number(b.target))e.push('A umidade inicial precisa superar a meta.');
 if(!b.name||b.name.trim().length>80)e.push('Use um nome com até 80 caracteres.');
 if(!Number.isFinite(Date.parse(b.start+'-03:00')))e.push('Informe uma data de início válida no horário de Brasília.');
 return e;
}
function capacity(b){
 const l=Number(b.length)/1000,w=Number(b.width)/1000,t=Number(b.thickness)/1000,n=Number(b.quantity);
 const perLayer=Math.max(0,Math.floor((C.depth-2*C.sideGap+C.gap+1e-9)/(w+C.gap)));
 const sticker=Number(b.separator??15)/1000;
 const layers=Math.max(0,Math.floor((C.pileTop-C.base+sticker+1e-9)/(t+sticker)));
 const max=perLayer*layers;
 return {volume:l*w*t*n,perLayer,layers,max,fits:l<=C.boardLength+1e-9&&n<=max&&max>0,lengthFits:l<=C.boardLength+1e-9};
}
function solar(day,lat,lon,direction,tilt,dni,dhi){
 const date=new Date(day+'T12:00:00Z');if(!Number.isFinite(date.getTime()))throw Error('Data solar inválida');
 const year=date.getUTCFullYear(),doy=(date-Date.UTC(year,0,0))/86400000;
 const yrDays=(Date.UTC(year+1,0,1)-Date.UTC(year,0,1))/86400000;
 const r=Math.PI/180,L=lat*r,B=tilt*r,az=({N:0,L:90,S:180,O:270})[direction]*r;
 const gamma=2*Math.PI/yrDays*(Math.floor(doy)-1);
 const decl=.006918-.399912*Math.cos(gamma)+.070257*Math.sin(gamma)-.006758*Math.cos(2*gamma)+.000907*Math.sin(2*gamma)-.002697*Math.cos(3*gamma)+.00148*Math.sin(3*gamma);
 const eot=229.18*(.000075+.001868*Math.cos(gamma)-.032077*Math.sin(gamma)-.014615*Math.cos(2*gamma)-.040849*Math.sin(2*gamma));
 let h=0;
 for(let m=5;m<1440;m+=10){
  const hour=((m+eot+4*lon+180)/4-180)*r;
  const up=Math.sin(L)*Math.sin(decl)+Math.cos(L)*Math.cos(decl)*Math.cos(hour);
  if(up<=0)continue;
  const north=Math.cos(L)*Math.sin(decl)-Math.sin(L)*Math.cos(decl)*Math.cos(hour);
  const east=-Math.cos(decl)*Math.sin(hour);
  const cosInc=Math.max(0,up*Math.cos(B)+(north*Math.cos(az)+east*Math.sin(az))*Math.sin(B));
  const ghi=dni*up+dhi;
  h+=(dni*cosInc+dhi*(1+Math.cos(B))/2+.2*ghi*(1-Math.cos(B))/2)/6/1000;
 }
 return h;
}
function estimate(b,env,observations=[]){
 const errors=validate(b);if(errors.length)throw Error(errors.join(' '));
 const cap=capacity(b);
 const m0=cap.volume*C.density;
 const start=Date.parse(b.start+'-03:00'),now=Number(env.epoch)||Date.now(),elapsed=Math.max(0,(now-start)/86400000);
 const valid=observations.filter(x=>x.valid===true&&Number.isFinite(x.mc)&&x.mc>=7&&x.mc<=18&&Number.isFinite(x.epoch)&&x.epoch>=start&&x.epoch<=now).sort((a,b)=>a.epoch-b.epoch);
 const latest=valid.at(-1),current=latest?latest.mc:Number(b.initial);
 const stale=latest&&(now-latest.epoch)>15*60000;
 const usable=!!latest&&!stale&&env.sensorOnline!==false;
 const assumed=usable?current:Number(b.initial);
 const water=Math.max(0,m0*(assumed-Number(b.target))/100);
 const h=env.manualH?Number(env.h):solar(env.day,Number(env.lat),Number(env.lon),env.direction,Number(env.tilt),Number(env.dni),Number(env.dhi));
 if(!Number.isFinite(h)||h<0)throw Error('Confira os parâmetros solares.');
 const gain=Number(env.g),frac=Number(env.useful);
 const useful=A=>A*h*gain*frac;
 const daily=useful(C.area),latent=water*C.latent;
 const status=usable&&latest.mc<=Number(b.target)?'meta':'estimativa';
 const low=daily>0?latent/(daily*1.5):null;
 const high=daily>0?latent/(daily*.5):null;
 const rate=valid.length>1?(valid[0].mc-latest.mc)/((latest.epoch-valid[0].epoch)/86400000):null;
 const room=Number(env.airT),vent=Number(env.vent),ambient=Number(env.ambient);
 const losses=(C.ua+1.1*1005*vent/3600)*Math.max(0,room-ambient);
 return {cap,m0,water,h,daily,latent,low,high,elapsed,current:usable?latest.mc:null,status,rate,hasFresh:usable,stale:!!stale,source:usable?'sensor simulado válido':'entrada inicial; progresso não confirmado',losses,
 warnings:[!cap.fits?'A carga ultrapassa o arranjo do memorial.':null,Number(b.initial)>30?'Umidade inicial acima de 30% exige uma fonte adequada; medidores de pinos fornecem apenas indicação aproximada nessa região.':null,'Janela energética experimental: não inclui um modelo cinético validado por espessura nem prevê defeitos.'].filter(Boolean)};
}
const api={C,validate,capacity,solar,estimate};
if(typeof module!=='undefined'&&module.exports)module.exports=api;
else root.EstufaModel=api;
})(typeof window!=='undefined'?window:globalThis);
