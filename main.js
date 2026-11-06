const $=s=>document.querySelector(s);

(function(){
  const el=$('#typewriter'),text='Happy Birthday',sleep=ms=>new Promise(r=>setTimeout(r,ms));
  (async function loop(){
    await sleep(1500);
    for(;;){
      for(let i=1;i<=text.length;i++){el.textContent=text.slice(0,i);await sleep(110+Math.random()*40-20);}
      await sleep(1800);
      for(let i=text.length;i>=0;i--){el.textContent=text.slice(0,i);await sleep(55);}
      await sleep(350);
    }
  })();
})();

(function(){
  const els=document.querySelectorAll('[data-r]');
  if(!('IntersectionObserver' in window)){els.forEach(e=>e.classList.add('in'));return;}
  const io=new IntersectionObserver(es=>es.forEach(e=>{if(e.isIntersecting){e.target.classList.add('in');io.unobserve(e.target);}}),{threshold:.15});
  els.forEach(e=>io.observe(e));
})();

(function(){
  const root=document.documentElement,tilts=[...document.querySelectorAll('.tilt')],clamp=(v,a,b)=>Math.min(b,Math.max(a,v));
  addEventListener('pointermove',e=>{
    root.style.setProperty('--mx',clamp(e.clientX/innerWidth-.5,-.5,.5).toFixed(3));
    root.style.setProperty('--my',clamp(e.clientY/innerHeight-.5,-.5,.5).toFixed(3));
    for(const t of tilts){
      const r=t.getBoundingClientRect();
      if(e.clientY<r.top-80||e.clientY>r.bottom+80||e.clientX<r.left-80||e.clientX>r.right+80){t.style.transform='';continue;}
      const px=clamp((e.clientX-r.left)/r.width-.5,-.5,.5),py=clamp((e.clientY-r.top)/r.height-.5,-.5,.5);
      t.style.transform=`perspective(900px) rotateY(${(px*16).toFixed(1)}deg) rotateX(${(-py*16).toFixed(1)}deg)`;
    }
  },{passive:true});
  addEventListener('pointerleave',()=>tilts.forEach(t=>t.style.transform=''));
  document.addEventListener('pointerup',e=>{if(e.pointerType==='touch')tilts.forEach(t=>t.style.transform='');});
})();

(function(){
  const cards=[...document.querySelectorAll('.polaroid')],n=cards.length,stack=$('#stack'),count=$('#count');
  let idx=0,timer;
  function render(){
    cards.forEach((c,i)=>{
      let o=((i-idx)%n+n)%n;if(o>n/2)o-=n;
      const a=Math.abs(o);
      c.style.zIndex=10-a;
      c.style.opacity=a>1?0:1;
      c.style.pointerEvents=a>1?'none':'auto';
      c.style.filter=a?'brightness(.6)':'none';
      c.style.transform=`translateX(${o*62}%) translateZ(${-a*170}px) rotateY(${-o*42}deg) rotateZ(${o*2}deg)`;
      c.dataset.o=o;
    });
    count.textContent=`${idx+1} / ${n}`;
  }
  const go=d=>{idx=((idx+d)%n+n)%n;render();};
  const user=d=>{go(d);clearInterval(timer);timer=setInterval(()=>go(1),5500);};
  $('#nextImg').onclick=()=>user(1);
  $('#prevImg').onclick=()=>user(-1);
  addEventListener('keydown',e=>{if(e.key==='ArrowRight')user(1);if(e.key==='ArrowLeft')user(-1);});
  let sx=null,target=null;
  stack.addEventListener('pointerdown',e=>{sx=e.clientX;target=e.target.closest('.polaroid');});
  stack.addEventListener('pointerup',e=>{
    if(sx===null)return;const d=e.clientX-sx;sx=null;
    if(Math.abs(d)>40)user(d<0?1:-1);
    else{const o=target?+target.dataset.o:0;user(o||1);}
  });
  stack.addEventListener('pointercancel',()=>sx=null);
  render();timer=setInterval(()=>go(1),5500);
})();

(function(){
  const card=$('#card'),flip=()=>card.classList.toggle('flipped');
  $('#toggleButton').addEventListener('click',e=>{e.stopPropagation();flip();});
  $('#cardContainer').addEventListener('click',flip);
})();

(function(){
  const cols=['#ffd27a','#ff7eb6','#7fe7ff','#ffffff'];
  const boom=()=>{if(typeof confetti==='function')confetti({particleCount:200,spread:120,origin:{y:.17},colors:cols});};
  if(document.readyState==='complete')boom();else addEventListener('load',boom);
  const msg=$('#wishMsg'),lines=['wish sent, it will come true ✨','close your eyes and think of it 🌟','the candles are out, make it big 🎂'];
  let k=0;
  $('#wishBtn').addEventListener('click',()=>{
    msg.textContent=lines[k++%lines.length];msg.classList.remove('pop');void msg.offsetWidth;msg.classList.add('pop');
    if(typeof confetti==='function')[0,1].forEach(s=>confetti({particleCount:90,angle:s?120:60,spread:65,origin:{x:s,y:.75},colors:cols}));
    const box=$('#lanterns');
    for(let i=0;i<8;i++){
      const l=document.createElement('span');l.className='lantern';
      l.style.left=(6+Math.random()*88)+'%';
      l.style.setProperty('--t',(5+Math.random()*4)+'s');
      l.style.setProperty('--x',((Math.random()-.5)*120)+'px');
      l.style.animationDelay=(Math.random()*1.2)+'s';
      box.appendChild(l);l.addEventListener('animationend',()=>l.remove());
    }
  });
})();
