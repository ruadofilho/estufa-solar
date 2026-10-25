'use strict';
const test=require('node:test'),assert=require('node:assert/strict'),F=require('./fornadas-store.js');
function initial(){return {batches:[{id:'a',name:'A',status:'open'},{id:'b',name:'B',status:'closed'},{id:'c',name:'C',status:'open'}],selected:'c',observations:[{batch:'a',mc:18},{batch:'c',mc:12}],trash:[]};}
test('excluir retira somente a fornada e suas amostras, selecionando outra aberta',()=>{
 const s=initial();const removed=F.remove(s,'c');assert.equal(removed.name,'C');assert.equal(s.selected,'a');assert.deepEqual(s.batches.map(x=>x.id),['a','b']);assert.deepEqual(s.observations,[{batch:'a',mc:18}]);assert.equal(s.trash.length,1);
});
test('desfazer sobrevive a recarregamento e recupera ID, posição e amostras',()=>{
 let s=initial();F.remove(s,'c');s=JSON.parse(JSON.stringify(s));F.restore(s);assert.deepEqual(s.batches.map(x=>x.id),['a','b','c']);assert.equal(s.selected,'c');assert.deepEqual(s.observations,[{batch:'a',mc:18},{batch:'c',mc:12}]);
});
test('varias exclusoes podem ser desfeitas na ordem inversa, sem duplicar',()=>{
 const s=initial();F.remove(s,'c');F.remove(s,'b');F.restore(s);F.restore(s);assert.equal(F.restore(s),null);assert.deepEqual(s.batches.map(x=>x.id),['a','b','c']);assert.equal(new Set(s.batches.map(x=>x.id)).size,3);
});
test('ultima fornada excluida deixa seleção vazia e nao renasce apos recarregar',()=>{
 let s={batches:[{id:'a'}],selected:'a',observations:[]};F.remove(s,'a');s=JSON.parse(JSON.stringify(s));assert.deepEqual(s.batches,[]);assert.equal(s.selected,null);assert.equal(F.remove(s,'ausente'),null);assert.equal(F.restore(s).id,'a');
});
