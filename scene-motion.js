(()=>{
'use strict';
const art=document.querySelector('.mission-art'),svg=art?.querySelector('svg');if(!svg)return;
let allowed=true,frame=0,last=0;
function run(time){frame=0;if(!allowed||document.hidden)return;if(time-last>50){last=time;const phase=time/1000;
 svg.querySelectorAll('.cloud-drift,.sky-cloud-base').forEach((e,i)=>{e.style.animation='none';e.setAttribute('transform','translate('+(Math.sin(phase/4+i)*9).toFixed(2)+' 0)');});
 const online=svg.querySelector('#scene-esp')?.classList.contains('esp-online');
 svg.querySelectorAll('.esp-signal').forEach((e,i)=>{e.style.animation='none';e.style.opacity=online?String(.25+.75*(.5+.5*Math.sin(phase*4-i))):'.18';});
 svg.querySelectorAll('.wind-line').forEach((e,i)=>{e.style.animation='none';e.setAttribute('transform','translate('+(Math.sin(phase*3-i)*4).toFixed(2)+' 0)');e.style.opacity=String(.35+.65*(.5+.5*Math.sin(phase*3-i)));});
 }frame=requestAnimationFrame(run);}
function start(){if(allowed&&!document.hidden&&!frame)frame=requestAnimationFrame(run);}
document.addEventListener('visibilitychange',()=>{if(document.hidden){cancelAnimationFrame(frame);frame=0;}else start();});start();
})();