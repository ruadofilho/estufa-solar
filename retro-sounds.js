(()=>{
'use strict';
let enabled=true,context;
function play(notes){
 if(!enabled)return;
 try{
 const Audio=window.AudioContext||window.webkitAudioContext;
 if(!Audio)throw new Error('unavailable');
 context ||= new Audio();
 context.resume().then(()=>{
 const start=context.currentTime;
 notes.forEach(([frequency,offset,duration])=>{
 const oscillator=context.createOscillator(),gain=context.createGain();
 oscillator.type='square';oscillator.frequency.value=frequency;
 gain.gain.setValueAtTime(0,start+offset);
 gain.gain.linearRampToValueAtTime(.025,start+offset+.008);
 gain.gain.exponentialRampToValueAtTime(.0001,start+offset+duration);
 oscillator.connect(gain);gain.connect(context.destination);
 oscillator.start(start+offset);oscillator.stop(start+offset+duration+.01);
 oscillator.onended=()=>{oscillator.disconnect();gain.disconnect();};
 });
 }).catch(disable);
 }catch(error){disable();}
}
function disable(){enabled=false;}
document.addEventListener('click',event=>{
 const target=event.target.closest('button,summary');
 if(!target||target.disabled)return;
 if(target.matches('summary'))play([[523,0,.07],[784,.08,.12]]);
 else if(target.getAttribute('role')==='tab')play([[392,0,.06],[523,.07,.09]]);
 else play([[660,0,.06]]);
});
})();
