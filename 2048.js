(() => {
  'use strict';
  const boardEl=document.getElementById('grid'),scoreEl=document.getElementById('score'),message=document.getElementById('message');
  let board=[],score=0,won=false;
  const fresh=()=>Array.from({length:4},()=>Array(4).fill(0));
  const addTile=()=>{const spaces=[];board.forEach((row,y)=>row.forEach((value,x)=>{if(value===0)spaces.push([x,y])}));if(spaces.length){const [x,y]=spaces[Math.floor(Math.random()*spaces.length)];board[y][x]=Math.random()<.9?2:4}};
  const draw=()=>{boardEl.innerHTML='';board.flat().forEach(value=>{const tile=document.createElement('div');tile.className=value?`tile v${value}`:'tile';tile.textContent=value||'';boardEl.appendChild(tile)});scoreEl.textContent=score};
  const collapse=line=>{const values=line.filter(Boolean),result=[],gain=0;for(let i=0;i<values.length;i++){if(values[i]===values[i+1]){values[i]*=2;gain+=values[i];i++}result.push(values[i])}return{line:result.concat(Array(4-result.length).fill(0)),gain}};
  const canMove=()=>board.some(row=>row.some(v=>v===0))||board.some((row,y)=>row.some((v,x)=>(x<3&&v===row[x+1])||(y<3&&v===board[y+1][x])));
  const move=direction=>{const before=JSON.stringify(board),next=fresh();let gained=0;if(direction==='left'||direction==='right'){board.forEach((row,y)=>{let line=direction==='right'?[...row].reverse():[...row],result=collapse(line);if(direction==='right')result.line.reverse();next[y]=result.line;gained+=result.gain})}else{for(let x=0;x<4;x++){let line=board.map(row=>row[x]);if(direction==='down')line.reverse();let result=collapse(line);if(direction==='down')result.line.reverse();result.line.forEach((v,y)=>next[y][x]=v);gained+=result.gain}}if(JSON.stringify(next)===before)return;board=next;score+=gained;addTile();if(board.flat().includes(2048)&&!won){won=true;message.textContent='YOU REACHED 2048!'}else if(!canMove())message.textContent='GAME OVER · TRY AGAIN';draw()};
  const start=()=>{board=fresh();score=0;won=false;message.textContent='';addTile();addTile();draw()};
  const keys={ArrowLeft:'left',ArrowRight:'right',ArrowUp:'up',ArrowDown:'down'};addEventListener('keydown',e=>{const direction=keys[e.key];if(direction){e.preventDefault();move(direction)}});document.querySelectorAll('[data-dir]').forEach(button=>button.onclick=()=>move(button.dataset.dir));document.getElementById('restart').onclick=start;start();
})();
