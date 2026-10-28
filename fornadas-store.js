/* Remoção reversível de fornadas. Dados vão para a lixeira local. */
(function(root){
function list(state){return Array.isArray(state.batches)?state.batches:[];}
function remove(state,id){
 const items=list(state),index=items.findIndex(b=>b.id===id);
 if(index<0)return null;
 const batch=items[index],observations=(state.observations||[]).filter(o=>o.batch===id);
 if(!Array.isArray(state.trash))state.trash=[];
 state.trash.push({batch,observations,index,deletedAt:Date.now()});
 state.batches=items.filter(b=>b.id!==id);
 state.observations=(state.observations||[]).filter(o=>o.batch!==id);
 if(state.selected===id){
 const open=state.batches.filter(b=>b.status!=='closed');
 state.selected=(open.at(-1)||state.batches.at(-1))?.id||null;
 }
 return batch;
}
function restore(state){
 if(!Array.isArray(state.trash)||!state.trash.length)return null;
 const item=state.trash.at(-1);
 if(!item.batch||list(state).some(b=>b.id===item.batch.id))return null;
 state.trash.pop();
 state.batches.splice(Math.min(Math.max(0,item.index||0),state.batches.length),0,item.batch);
 state.observations=(state.observations||[]).concat(item.observations||[]);
 state.selected=item.batch.id;
 return item.batch;
}
const api={remove,restore};
if(typeof module!=='undefined'&&module.exports)module.exports=api;else root.FornadaStore=api;
})(typeof window!=='undefined'?window:globalThis);
