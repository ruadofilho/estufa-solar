'use strict';
const test=require('node:test'),assert=require('node:assert/strict'),M=require('./model.js');
const b={id:'test',name:'Batch teste',species:'pinus_elliottii',length:1000,width:200,thickness:22,quantity:16,initial:60,target:18,start:'2026-10-25T09:00'};
const e={epoch:Date.parse('2026-10-25T12:00:00-03:00'),day:'2026-10-25',lat:-23.5,lon:-47.46,direction:'N',tilt:28,dni:650,dhi:90,g:.82,useful:.25,manualH:true,h:4.5,airT:40,ambient:25,vent:10,sensorOnline:true};
test('carga desenhada e excesso de uma peça',()=>{
 const c=M.capacity(b);assert.ok(Math.abs(c.volume-.0704)<1e-10);assert.equal(c.max,16);assert.equal(c.fits,true);assert.equal(M.capacity({...b,quantity:17}).fits,false);assert.equal(M.capacity({...b,length:1500}).fits,false);
});
test('balanco de massa e energia, umidade em base seca',()=>{
 const r=M.estimate(b,e);assert.ok(Math.abs(r.water-14.784)<1e-9);assert.ok(Math.abs(r.latent-9.856)<1e-9);assert.ok(r.low>0&&r.high>r.low);
 assert.ok(Math.abs(M.estimate({...b,initial:100},e).water-28.864)<1e-9);
});
test('zero sol não produz prazo finito',()=>{const r=M.estimate(b,{...e,h:0});assert.equal(r.low,null);assert.equal(r.high,null);});
test('dias passados nao equivalem a madeira seca sem medicao',()=>{
 const r=M.estimate(b,{...e,epoch:e.epoch+30*86400000});assert.equal(r.current,null);assert.equal(r.water,14.784);assert.equal(r.status,'estimativa');
});
test('leitura fora de faixa ou sensor em falha nao libera meta',()=>{
 const o={epoch:e.epoch,valid:true,mc:12};
 assert.equal(M.estimate(b,e,[o]).status,'meta');
 assert.equal(M.estimate(b,{...e,sensorOnline:false},[o]).status,'estimativa');
 assert.equal(M.estimate(b,e,[{...o,mc:60}]).current,null);
 assert.equal(M.estimate(b,e,[{...o,valid:false}]).current,null);
 assert.equal(M.estimate(b,{...e,epoch:e.epoch+16*60000},[o]).current,null);
});
test('energia admitida depende da chapa e carga',()=>{
 const a=M.estimate(b,e),opal=M.estimate(b,{...e,g:.24}),double=M.estimate({...b,quantity:32},e);
 assert.ok(opal.low>a.low);assert.ok(Math.abs(double.low/a.low-2)<1e-9);
});
test('geometria solar sazonal no hemisferio sul',()=>{
 const n=M.solar('2026-06-21',-23.5,-47.46,'N',28,650,90),s=M.solar('2026-06-21',-23.5,-47.46,'S',28,650,90);
 assert.ok(n>s);assert.ok(n>0&&n<15);
 assert.ok(Math.abs(M.solar('2026-06-21',-23.5,-47.46,'N',0,650,90)-M.solar('2026-06-21',-23.5,-47.46,'S',0,650,90))<1e-9);
 assert.equal(M.solar('2026-06-21',-23.5,-47.46,'N',28,0,0),0);
});
test('cadastro invalido bloqueia calculos',()=>{
 assert.ok(M.validate({...b,target:60}).length);assert.ok(M.validate({...b,quantity:1.5}).length);assert.ok(M.validate({...b,species:'eucalyptus_saligna'}).length);assert.throws(()=>M.estimate({...b,thickness:NaN},e));
});
