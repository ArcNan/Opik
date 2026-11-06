/* Efek suara kembang api (WebAudio) + musik dari file audio/music.mp3 + lilin tiup */
(function(){
  const FX=window.FX={on:false,live:false,launch(){},boom(){}};
  let ctx,master,fxG,noiseBuf,music=null,muted=false,mic=null,done=false;
  const R=Math.random,$=id=>document.getElementById(id);
  const gate=$('gate'),gateBtn=$('gateBtn'),box=$('candleBox'),candle=$('candle'),hint=$('blowHint'),muteBtn=$('mute');
  document.body.classList.add('locked');

  function init(){
    if(ctx)return;
    ctx=new(window.AudioContext||window.webkitAudioContext)();
    master=ctx.createGain();master.connect(ctx.destination);
    fxG=ctx.createGain();fxG.gain.value=.7;fxG.connect(master);
    noiseBuf=ctx.createBuffer(1,ctx.sampleRate*2,ctx.sampleRate);
    const d=noiseBuf.getChannelData(0);for(let i=0;i<d.length;i++)d[i]=R()*2-1;
  }
  function out(pan){
    if(!ctx.createStereoPanner)return fxG;
    const p=ctx.createStereoPanner();p.pan.value=Math.max(-1,Math.min(1,pan||0));p.connect(fxG);return p;
  }
  function noise(t,dur,type,f0,f1,vol,dest){
    const s=ctx.createBufferSource();s.buffer=noiseBuf;
    const f=ctx.createBiquadFilter();f.type=type;f.frequency.setValueAtTime(f0,t);f.frequency.exponentialRampToValueAtTime(f1,t+dur);
    const g=ctx.createGain();g.gain.setValueAtTime(.0001,t);g.gain.exponentialRampToValueAtTime(vol,t+Math.min(.05,dur/4));g.gain.exponentialRampToValueAtTime(.0001,t+dur);
    s.connect(f);f.connect(g);g.connect(dest);s.start(t,R()*.5);s.stop(t+dur+.05);
  }
  function tone(t,dur,f0,f1,type,vol,dest){
    const o=ctx.createOscillator(),g=ctx.createGain();o.type=type;
    o.frequency.setValueAtTime(f0,t);o.frequency.exponentialRampToValueAtTime(f1,t+dur);
    g.gain.setValueAtTime(.0001,t);g.gain.exponentialRampToValueAtTime(vol,t+.03);g.gain.exponentialRampToValueAtTime(.0001,t+dur);
    o.connect(g);g.connect(dest);o.start(t);o.stop(t+dur+.05);
  }
  FX.launch=function(pan){
    if(!FX.on)return;const t=ctx.currentTime,o=out(pan);
    noise(t,.9,'bandpass',300,2400,.5,o);tone(t,.9,500,1700,'sine',.06,o);
  };
  FX.boom=function(pan){
    if(!FX.on)return;const t=ctx.currentTime,o=out(pan);
    noise(t,1.3,'lowpass',2200,150,1,o);tone(t,.6,140,35,'sine',.9,o);
    for(let i=0;i<14;i++)noise(t+.15+R()*1,.05,'highpass',3000+R()*3000,2500,.25,o);
  };

  /* ketuk pertama: buka audio, siapkan musik dari file, tampilkan lilin */
  gateBtn.addEventListener('click',()=>{
    init();ctx.resume();FX.on=true;
    music=new Audio('audio/music.mp3');
    music.loop=true;music.volume=.7;music.preload='auto';
    music.addEventListener('error',()=>console.error('Musik gagal dimuat:',music.error));
    gateBtn.hidden=true;box.hidden=false;listenBlow();
  });

  async function listenBlow(){
    try{
      mic=await navigator.mediaDevices.getUserMedia({audio:{echoCancellation:false,noiseSuppression:false,autoGainControl:false}});
      const an=ctx.createAnalyser();an.fftSize=512;ctx.createMediaStreamSource(mic).connect(an);
      const buf=new Uint8Array(an.fftSize);let hold=0;
      hint.textContent='Tiup ke mikrofon, atau ketuk lilinnya 🌬️';
      (function tick(){
        if(done)return;
        an.getByteTimeDomainData(buf);let s=0;for(const v of buf){const d=(v-128)/128;s+=d*d;}
        const rms=Math.sqrt(s/buf.length);
        candle.style.setProperty('--blow',Math.min(1,rms/.22).toFixed(2));
        hold=rms>.09?hold+1:Math.max(0,hold-2);
        if(hold>18){blowOut();return;}
        requestAnimationFrame(tick);
      })();
    }catch(e){hint.textContent='Ketuk lilinnya untuk meniupnya 🌬️';}
  }

  function blowOut(){
    if(done)return;done=true;
    if(mic)mic.getTracks().forEach(t=>t.stop());
    candle.style.setProperty('--blow',0);candle.classList.add('out');
    noise(ctx.currentTime,.5,'lowpass',2500,300,.6,fxG);
    hint.textContent='Make a wish… ✨';
    /* putar musik langsung saat ketukan/tiupan, jangan menunggu setTimeout */
    music.play().catch(()=>addEventListener('pointerdown',()=>music.play(),{once:true}));
    setTimeout(()=>{
      gate.classList.add('hide');document.body.classList.remove('locked');muteBtn.hidden=false;
      FX.live=true;
      if(typeof confetti==='function')confetti({particleCount:200,spread:120,origin:{y:.17},colors:['#ffd27a','#ff7eb6','#7fe7ff','#ffffff']});
    },1800);
  }
  candle.addEventListener('click',()=>{if(ctx)blowOut();});
  candle.addEventListener('keydown',e=>{if((e.key==='Enter'||e.key===' ')&&ctx)blowOut();});

  muteBtn.addEventListener('click',()=>{
    muted=!muted;master.gain.value=muted?0:1;if(music)music.muted=muted;
    muteBtn.textContent=muted?'🔇':'🔊';muteBtn.setAttribute('aria-label',muted?'Nyalakan suara':'Matikan suara');
  });
  document.addEventListener('visibilitychange',()=>{
    if(!ctx)return;
    if(document.hidden){ctx.suspend();if(music)music.pause();}
    else{ctx.resume();if(music&&FX.live)music.play().catch(()=>{});}
  });
})();
