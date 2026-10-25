'use strict';
const test=require('node:test'),assert=require('node:assert/strict'),fs=require('node:fs');
const M=require('./model.js'),P=require('./planner.js');
const c=JSON.parse(fs.readFileSync('climate-seed.js','utf8').replace(/^window.EstufaClimateSeed=/,'').replace(/;\s*$/,''));
const b={id:'test',name:'Teste Pinus',species:'pinus_elliottii',length:1000,width:200,thickness:22,quantity:16,separator:15,initial:60,target:18,start:'2026-10-25T09:00',direction:'N',location:{id:c.id}};
const now=Date.parse('2026-10-25T12:00:00-03:00');
test('separadores maiores reduzem capacidade, sem alterar volume das peças',()=>{
 const a=M.capacity(b),big=M.capacity({...b,separator:20});
 assert.equal(a.max,16);assert.equal(big.max,14);assert.equal(big.fits,false);assert.equal(big.volume,a.volume);
 assert.equal(M.capacity({...b,separator:20,quantity:14}).fits,true);
 assert.ok(M.validate({...b,separator:0}).length);
});
test('clima real tem 12 meses; dado ausente não vira zero',()=>{
 assert.equal(P.climateValid(c),true);
 const bad=structuredClone(c);bad.parameter.ALLSKY_SFC_SW_DWN.JAN=-999;
 assert.equal(P.climateValid(bad),false);assert.equal(P.forecast(b,bad,[],now).status,'climate');
});
test('sem entradas técnicas manuais, o clima gera uma janela',()=>{
 const r=P.forecast(b,c,[],now);assert.equal(r.status,'forecast');assert.ok(r.low>0&&r.high>=r.low);
 assert.ok(Math.abs(r.water-14.784)<1e-9);assert.ok(r.earliest<r.latest);
});
test('capacidade excedida impede exibir um prazo como válido',()=>{
 assert.equal(P.forecast({...b,separator:20},c,[],now).status,'capacity');
});
test('amostra de simulação não se torna medição real nem libera a carga',()=>{
 const o={batch:b.id,mc:12,valid:true,epoch:now,source:'simulation'};
 assert.equal(P.forecast(b,c,[o],now).status,'forecast');
 assert.equal(P.forecast(b,c,[{...o,source:'device'}],now).status,'target');
 assert.equal(P.forecast(b,c,[{...o,source:'device',epoch:now-16*60000}],now).status,'stale');
});
test('tempo vencido não significa madeira pronta',()=>{
 const r=P.forecast(b,c,[],now+180*86400000);assert.equal(r.status,'overdue');
});
test('clima transposto preserva a horizontal e respeita orientação no inverno',()=>{
 const t=Date.parse('2026-06-21T12:00:00Z');
 assert.ok(P.irradiation(c,t,'N')>P.irradiation(c,t,'S'));
});
