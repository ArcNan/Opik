(function(){
  const c=document.getElementById('bg'),x=c.getContext('2d'),R=Math.random;
  const WORDS=['I Love U','Aku Sayang Kamu','HDB Sayang','Sehat Selalu','Panjang Umur','Banyak Rezeki'];
  const FONT='"Dancing Script",cursive';
  let w,h,rockets=[],parts=[],n=0,wi=0,nextAt=600;
  /* konfeti latar (kanvas terpisah, tanpa jejak) */
  const k=document.createElement('canvas');k.id='cf';k.setAttribute('aria-hidden','true');c.after(k);
  const kx=k.getContext('2d');let conf=[];
  const COLS=['#ffd27a','#ff7eb6','#7fe7ff','#ffffff','#ff8a5c','#9bf06b','#b48cff'];
  function newConf(any){return{x:Math.random()*w,y:any?Math.random()*h:-20,s:5+R()*6,vy:.8+R()*1.3,vx:.2+R()*.6,a:R()*6,va:(R()-.5)*.08,f:R()*6,ff:.05+R()*.08,c:COLS[Math.floor(R()*COLS.length)],k:Math.floor(R()*3)};}
  function drawConf(t){
    kx.clearRect(0,0,w,h);
    for(const p of conf){
      p.y+=p.vy;p.x+=p.vx+Math.sin(t/900+p.f)*.6;p.a+=p.va;p.f+=p.ff;
      if(p.y>h+20||p.x>w+30)Object.assign(p,newConf(false),{x:R()*w-w*.2});
      kx.save();kx.translate(p.x,p.y);kx.rotate(p.a);kx.scale(1,Math.cos(p.f));kx.fillStyle=p.c;
      if(p.k===0)kx.fillRect(-p.s,-p.s*.55,p.s*2,p.s*1.1);
      else if(p.k===1){kx.beginPath();kx.arc(0,0,p.s*.6,0,7);kx.fill();}
      else kx.fillRect(-p.s*1.4,-p.s*.2,p.s*2.8,p.s*.4);
      kx.restore();
    }
  }
  function size(){const d=Math.min(devicePixelRatio||1,2);w=innerWidth;h=innerHeight;c.width=w*d;c.height=h*d;x.setTransform(d,0,0,d,0,0);x.fillStyle='#000';x.fillRect(0,0,w,h);k.width=w*d;k.height=h*d;kx.setTransform(d,0,0,d,0,0);conf=Array.from({length:Math.min(46,Math.floor(w/16))},()=>newConf(true));}

  function sample(word){
    const o=document.createElement('canvas'),g=o.getContext('2d');
    g.font=`600 60px ${FONT}`;
    const fs=Math.max(26,Math.min(70,60*(w*.86)/g.measureText(word).width));
    g.font=`600 ${fs}px ${FONT}`;
    const tw=Math.ceil(g.measureText(word).width)+10,th=Math.ceil(fs*1.5);
    o.width=tw;o.height=th;g.font=`600 ${fs}px ${FONT}`;g.textBaseline='middle';g.fillStyle='#fff';g.fillText(word,5,th/2);
    const d=g.getImageData(0,0,tw,th).data,st=Math.max(2,Math.round(fs/20)),pts=[];
    for(let yy=0;yy<th;yy+=st)for(let xx=0;xx<tw;xx+=st)if(d[(yy*tw+xx)*4+3]>128)pts.push([xx-tw/2,yy-th/2]);
    return{pts,tw};
  }
  function launch(tx,ty,text){
    const sx=tx==null?w*(.15+R()*.7):tx*.9+w*.05;
    if(window.FX)FX.launch(sx/w*2-1);
    rockets.push({sx,x:sx,y:h,tx:tx==null?sx+(R()-.5)*60:tx,ty:ty==null?h*(text?.4+R()*.15:.15+R()*.35):ty,p:0,d:.014+R()*.006,text,hue:Math.floor(R()*360)});
  }
  function explode(r){
    if(window.FX)FX.boom(r.x/w*2-1);
    const hue=r.hue,text=r.text;
    if(r.text){
      const word=WORDS[wi++%WORDS.length],{pts,tw}=sample(word);
      const cx=Math.min(Math.max(r.x,tw/2+8),w-tw/2-8);
      for(const[px,py]of pts)parts.push({x:r.x,y:r.y,tx:cx+px,ty:r.y+py,vx:(R()-.5)*.6,vy:R()*.4,a:1,hue:hue+R()*30-15,s:1.3+R()*.9,t:1,age:0,hold:130+R()*30,sp:.06+R()*.04});
    }
    const cnt=text?50:110;
    for(let i=0;i<cnt;i++){
      const an=R()*6.283,sp=(text?1:1.5)+R()*(text?4:5.5);
      parts.push({x:r.x,y:r.y,vx:Math.cos(an)*sp,vy:Math.sin(an)*sp,a:1,hue:hue+R()*40-20,s:1.2+R()*1.4,t:0,age:0});
    }
  }
  function draw(ts){
    x.globalCompositeOperation='source-over';x.fillStyle='rgba(0,0,0,.2)';x.fillRect(0,0,w,h);
    x.globalCompositeOperation='lighter';
    if(ts>nextAt&&(!window.FX||FX.live)){launch(null,null,n++%2===0);nextAt=ts+1300+R()*1200;}
    rockets=rockets.filter(r=>{
      r.p=Math.min(1,r.p+r.d);const e=1-Math.pow(1-r.p,2.2);
      r.x=r.sx+(r.tx-r.sx)*e;r.y=h+(r.ty-h)*e;
      x.fillStyle=`hsl(${r.hue},100%,75%)`;x.beginPath();x.arc(r.x,r.y,2.2,0,7);x.fill();
      if(r.p>=1){explode(r);return false}return true;
    });
    parts=parts.filter(p=>{
      p.age++;
      if(p.t&&p.age<p.hold){
        p.x+=(p.tx-p.x)*p.sp;p.y+=(p.ty-p.y)*p.sp;
        p.a=.75+.25*Math.sin(p.age*.3+p.tx);
      }else{
        if(p.t){p.vy+=.035;p.a-=.014;}else{p.vx*=.97;p.vy=p.vy*.97+.045;p.a-=.011;}
        p.x+=p.vx;p.y+=p.vy;
      }
      if(p.a<=0)return false;
      x.fillStyle=`hsla(${p.hue},100%,${p.t?72:62}%,${p.a})`;
      x.beginPath();x.arc(p.x,p.y,p.s,0,7);x.fill();return true;
    });
    drawConf(ts);
    requestAnimationFrame(draw);
  }
  addEventListener('resize',()=>{if(innerWidth!==w)size();});
  addEventListener('pointerdown',e=>{if((!window.FX||FX.live)&&!e.target.closest('button,a,.stack,.card-wrap'))launch(e.clientX,e.clientY,n++%2===0);},{passive:true});
  size();requestAnimationFrame(draw);
})();
