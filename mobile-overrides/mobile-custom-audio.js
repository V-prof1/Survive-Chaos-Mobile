(() => {
'use strict';
try{
  if(typeof S==='undefined')return;
  const VERSION='13.0',DB_NAME='survive-chaos-custom-audio',STORE='audio',DB_VER=1,MAX_FILE=25*1024*1024;
  const LS_KEY='sc_custom_audio_settings_v1';
  const MUSIC=[
    ['music:musica_jogo','🎵','Música da partida','Menu e combate normal','musica_jogo'],
    ['music:musica_boss','👹','Música de Boss','Bosses normais','musica_boss'],
    ['music:musica_dev_1','👁️','DEV · Fase 1','Barras 1–5','musica_dev_1'],
    ['music:musica_dev_2','⚠️','DEV · Fase 2','Barras 6–10','musica_dev_2'],
    ['music:musica_dev_3','☠️','DEV · Fase 3','Barras 11–15','musica_dev_3']
  ];
  const SPECIAL=[
    ['special:efeito_dev_aviso','🚨','Aviso do DEV','Entrada do boss secreto','efeito_dev_aviso'],
    ['special:efeito_boss_derrotado','🏆','Boss derrotado','Final de boss normal','efeito_boss_derrotado'],
    ['special:efeito_dev_derrotado','💀','DEV derrotado','Final da luta secreta','efeito_dev_derrotado']
  ];
  const SFX=[
    ['sfx:shoot','🔫','Tiro','Disparo da arma','shoot'],['sfx:hit','✴️','Acerto','Projétil atinge inimigo','hit'],['sfx:kill','☠️','Abate','Inimigo eliminado','kill'],
    ['sfx:hurt','❤️‍🩹','Dano recebido','Player recebe dano','hurt'],['sfx:lvl','⬆️','Level Up','Subida de nível','lvl'],['sfx:dash','💨','Dash','Ativação do dash','dash'],
    ['sfx:boom','💥','Explosão','Explosões e impactos pesados','boom'],['sfx:coin','🪙','Moeda','Coleta e recompensa','coin'],['sfx:boss','👺','Boss aparece','Entrada/transição de boss','boss'],
    ['sfx:boss2','✨','Boss derrotado · synth','Fanfarra sintetizada','boss2'],['sfx:die','🪦','Morte','Player derrotado','die'],['sfx:win','🏁','Vitória','Run concluída','win'],['sfx:ui','🖱️','Interface','Cliques e confirmações','ui']
  ];
  const ALL=[...MUSIC,...SPECIAL,...SFX];
  const meta=new Map(ALL.map(v=>[v[0],v]));
  const records=new Map(),urls=new Map(),pools=new Map(),lastPlay=new Map();
  let db=null,preview=null,pendingSlot=null,toastTimer=0,opened=false;
  let settings={music:1,sfx:1};
  try{settings=Object.assign(settings,JSON.parse(localStorage.getItem(LS_KEY)||'{}'))}catch(_){ }
  settings.music=Math.max(0,Math.min(1,Number(settings.music)||0));
  settings.sfx=Math.max(0,Math.min(1,Number(settings.sfx)||0));
  const saveSettings=()=>{try{localStorage.setItem(LS_KEY,JSON.stringify(settings))}catch(_){}};
  const human=n=>n>=1024*1024?(n/1024/1024).toFixed(1)+' MB':(n/1024).toFixed(0)+' KB';
  const safeName=n=>String(n||'arquivo').replace(/[\r\n\t]/g,' ').slice(0,80);

  function openDb(){return new Promise((resolve,reject)=>{
    const r=indexedDB.open(DB_NAME,DB_VER);
    r.onupgradeneeded=()=>{const d=r.result;if(!d.objectStoreNames.contains(STORE))d.createObjectStore(STORE,{keyPath:'slot'})};
    r.onsuccess=()=>resolve(r.result);r.onerror=()=>reject(r.error||new Error('IndexedDB'));
  })}
  function tx(mode='readonly'){return db.transaction(STORE,mode).objectStore(STORE)}
  function getAll(){return new Promise((resolve,reject)=>{const r=tx().getAll();r.onsuccess=()=>resolve(r.result||[]);r.onerror=()=>reject(r.error)})}
  function putRec(rec){return new Promise((resolve,reject)=>{const r=tx('readwrite').put(rec);r.onsuccess=()=>resolve();r.onerror=()=>reject(r.error)})}
  function delRec(slot){return new Promise((resolve,reject)=>{const r=tx('readwrite').delete(slot);r.onsuccess=()=>resolve();r.onerror=()=>reject(r.error)})}
  function clearDb(){return new Promise((resolve,reject)=>{const r=tx('readwrite').clear();r.onsuccess=()=>resolve();r.onerror=()=>reject(r.error)})}

  function revoke(slot){const u=urls.get(slot);if(u)try{URL.revokeObjectURL(u)}catch(_){}urls.delete(slot);const pool=pools.get(slot)||[];pool.forEach(a=>{try{a.pause();a.src=''}catch(_){}});pools.delete(slot)}
  function makeUrl(slot,blob){revoke(slot);const u=URL.createObjectURL(blob);urls.set(slot,u);return u}
  function toast(t){let n=document.getElementById('scAudioToast');if(!n){n=document.createElement('div');n.id='scAudioToast';document.body.appendChild(n)}n.textContent=t;n.classList.remove('on');void n.offsetWidth;n.classList.add('on');clearTimeout(toastTimer);toastTimer=setTimeout(()=>n.classList.remove('on'),2100)}

  const origSfx=typeof sfx==='function'?sfx:null;
  const origVol=typeof vol==='function'?vol:null;
  const hasAud=typeof AUD!=='undefined';
  const origAudUrl=hasAud?AUD.url.bind(AUD):null;
  const origAudSf=hasAud?AUD.sf.bind(AUD):null;
  const baseMusicVol=hasAud?Object.assign({},AUD.vol):{};

  function customPlay(slot,v=1,force=false){
    if(!force&&S.mute)return false;
    const u=urls.get(slot);if(!u)return false;
    const isMusic=slot.startsWith('music:'),gain=isMusic?settings.music:settings.sfx;
    const th={shoot:70,hit:50,kill:50,boom:100,coin:50};
    const raw=meta.get(slot),name=raw&&raw[4],now=performance.now(),delay=slot.startsWith('sfx:')?(th[name]||0):0;
    if(delay&&!force){const lp=lastPlay.get(slot)||0;if(now-lp<delay)return true;lastPlay.set(slot,now)}
    let pool=pools.get(slot);if(!pool){pool=[];pools.set(slot,pool)}
    let a=pool.find(q=>q.paused||q.ended);
    if(!a&&pool.length<5){a=new Audio(u);a.preload='auto';pool.push(a)}
    if(!a)a=pool[0];
    try{a.pause();a.currentTime=0;a.volume=Math.max(0,Math.min(1,v*gain));a.play().catch(()=>{})}catch(_){ }
    return true;
  }

  function resetMusic(key){if(!hasAud)return;const a=AUD.els&&AUD.els[key];if(a){try{a.pause();a.src=''}catch(_){};delete AUD.els[key]}if(AUD.cur===key)AUD.cur=null;try{AUD.tick()}catch(_){}}
  function applyGains(){
    if(hasAud)for(const k in baseMusicVol)AUD.vol[k]=baseMusicVol[k]*settings.music;
    try{if(typeof GM!=='undefined'&&GM)GM.gain.value=S.mute?0:.28*settings.music;if(typeof GS!=='undefined'&&GS)GS.gain.value=S.mute?0:.6*settings.sfx}catch(_){ }
  }

  if(hasAud){
    AUD.url=f=>{const b=String(f||'').replace(/^.*\//,'').replace(/\.mp3$/i,''),m='music:'+b,s='special:'+b;return urls.get(m)||urls.get(s)||origAudUrl(f)};
    AUD.sf=(n,v)=>{if(customPlay('special:'+n,v==null?.9:v))return;return origAudSf(n,(v==null?.9:v)*settings.sfx)};
  }
  if(origSfx){try{sfx=function(n){if(customPlay('sfx:'+n,1))return;return origSfx(n)}}catch(_){}}
  if(origVol){try{vol=function(){const r=origVol();applyGains();return r}}catch(_){}}

  function stopPreview(){if(preview){try{preview.pause();preview.src=''}catch(_){}preview=null}}
  function previewSlot(slot){
    stopPreview();const m=meta.get(slot);if(!m)return;
    if(urls.has(slot)){const a=new Audio(urls.get(slot));a.volume=slot.startsWith('music:')?settings.music:settings.sfx;a.preload='auto';preview=a;a.play().catch(()=>toast('Não foi possível tocar este arquivo'));setTimeout(()=>{if(preview===a)stopPreview()},8000);return}
    if(slot.startsWith('sfx:')&&origSfx){try{if(typeof au==='function')au();origSfx(m[4]);return}catch(_){}}
    if(slot.startsWith('special:')&&origAudSf){try{origAudSf(m[4],.9);return}catch(_){}}
    if(slot.startsWith('music:')&&hasAud){try{const src=origAudUrl(m[4]+'.mp3'),a=new Audio(src);a.volume=(baseMusicVol[m[4]]||.5)*settings.music;preview=a;a.play().catch(()=>{});setTimeout(()=>{if(preview===a)stopPreview()},8000)}catch(_){}}
  }

  function countCustom(){return records.size}
  function mount(){
    if(document.getElementById('scAudioCustom'))return;
    const root=document.createElement('div');root.id='scAudioCustom';root.setAttribute('aria-hidden','true');
    root.innerHTML='<div class="scAudShell" role="dialog" aria-modal="true" aria-label="Áudio personalizado"><div class="scAudHead"><div class="scAudTitle"><small>OFFLINE · SEM SERVIDOR</small><h2>Áudio personalizado</h2><p>Troque músicas e efeitos por arquivos do seu próprio celular.</p></div><button class="scAudClose" id="scAudClose" aria-label="Fechar">×</button></div><div class="scAudSummary"><div class="scAudStat"><span class="scAudStatIcon">🎛️</span><div class="scAudStatCopy"><small>SLOTS CUSTOMIZADOS</small><b id="scAudCount">0 / 21</b></div></div><div class="scAudStat"><span class="scAudStatIcon">💾</span><div class="scAudStatCopy"><small>ARMAZENAMENTO LOCAL</small><b id="scAudStorage">0 MB</b></div></div></div><div class="scAudTabs"><button class="scAudTab on" data-tab="music">MÚSICAS</button><button class="scAudTab" data-tab="special">ESPECIAIS</button><button class="scAudTab" data-tab="sfx">SFX</button><button class="scAudTab" data-tab="mix">VOLUME</button></div><div class="scAudBody"><section class="scAudSection on" data-sec="music"><div class="scAudSectionHead"><h3>Trilha sonora</h3><span>MP3 · OGG · WAV · M4A · AAC</span></div><div class="scAudGrid" id="scAudMusic"></div></section><section class="scAudSection" data-sec="special"><div class="scAudSectionHead"><h3>Efeitos especiais</h3><span>Eventos cinematográficos</span></div><div class="scAudGrid" id="scAudSpecial"></div></section><section class="scAudSection" data-sec="sfx"><div class="scAudSectionHead"><h3>Efeitos de gameplay</h3><span>Substituem os sons sintetizados</span></div><div class="scAudGrid" id="scAudSfx"></div></section><section class="scAudSection" data-sec="mix"><div class="scAudSectionHead"><h3>Mixagem</h3><span>Vale para padrão e custom</span></div><div class="scAudControls"><div class="scAudRange"><label>Músicas <output id="scAudMusicOut">100%</output></label><input id="scAudMusicVol" type="range" min="0" max="100" step="5" value="100"></div><div class="scAudRange"><label>Efeitos <output id="scAudSfxOut">100%</output></label><input id="scAudSfxVol" type="range" min="0" max="100" step="5" value="100"></div></div><div class="scAudInfo"><b>Como funciona:</b> o Android abre o seletor de arquivos do sistema. O Survive Chaos salva uma cópia do áudio no armazenamento privado do app usando IndexedDB. <em>Não existe upload e nenhum servidor recebe o arquivo.</em><br><br>Os arquivos continuam após fechar o jogo e normalmente continuam após atualizar o APK. Eles só somem se você limpar os dados/desinstalar o aplicativo.</div></section></div><div class="scAudFooter"><div class="scAudFootText">Máx. 25 MB por arquivo · áudio fica somente neste aparelho</div><button class="scAudFootBtn danger" id="scAudResetAll">Restaurar tudo</button><button class="scAudFootBtn" id="scAudDone">Concluir</button></div></div>';
    document.body.appendChild(root);
    const fi=document.createElement('input');fi.id='scAudioCustomFile';fi.type='file';fi.accept='audio/*,.mp3,.ogg,.wav,.m4a,.aac';document.body.appendChild(fi);
    fi.addEventListener('change',async()=>{const f=fi.files&&fi.files[0];const slot=pendingSlot;fi.value='';pendingSlot=null;if(!f||!slot)return;await importFile(slot,f)});
    document.getElementById('scAudClose').onclick=close;document.getElementById('scAudDone').onclick=close;
    document.getElementById('scAudResetAll').onclick=async()=>{if(!records.size){toast('Tudo já está no padrão');return}if(!confirm('Restaurar todas as músicas e efeitos originais?'))return;await restoreAll()};
    root.querySelectorAll('.scAudTab').forEach(b=>b.onclick=()=>switchTab(b.dataset.tab));
    const mv=document.getElementById('scAudMusicVol'),svv=document.getElementById('scAudSfxVol');
    mv.value=Math.round(settings.music*100);svv.value=Math.round(settings.sfx*100);
    const onRange=()=>{settings.music=Number(mv.value)/100;settings.sfx=Number(svv.value)/100;saveSettings();applyGains();renderSummary();document.getElementById('scAudMusicOut').textContent=mv.value+'%';document.getElementById('scAudSfxOut').textContent=svv.value+'%'};
    mv.addEventListener('input',onRange);svv.addEventListener('input',onRange);onRange();
    renderAll();
  }
  function switchTab(tab){const root=document.getElementById('scAudioCustom');if(!root)return;root.querySelectorAll('.scAudTab').forEach(b=>b.classList.toggle('on',b.dataset.tab===tab));root.querySelectorAll('.scAudSection').forEach(s=>s.classList.toggle('on',s.dataset.sec===tab))}
  function buildCard(row){
    const [slot,icon,title,desc]=row,rec=records.get(slot),d=document.createElement('div');d.className='scAudCard'+(rec?' custom':'');d.dataset.slot=slot;
    const ic=document.createElement('div');ic.className='scAudCardIcon';ic.textContent=icon;d.appendChild(ic);
    const cp=document.createElement('div');cp.className='scAudCardCopy';const st=document.createElement('strong');st.textContent=title;const sm=document.createElement('small');sm.textContent=desc;const fl=document.createElement('span');fl.className='scAudFile';fl.textContent=rec?safeName(rec.name)+' · '+human(rec.size):'PADRÃO DO JOGO';cp.append(st,sm,fl);d.appendChild(cp);
    const ac=document.createElement('div');ac.className='scAudActions';const test=document.createElement('button');test.className='scAudAct';test.textContent='▶';test.title='Testar';test.onclick=()=>previewSlot(slot);const change=document.createElement('button');change.className='scAudAct change';change.textContent='Trocar';change.onclick=()=>choose(slot);const reset=document.createElement('button');reset.className='scAudAct reset';reset.textContent='↺';reset.title='Restaurar padrão';reset.disabled=!rec;reset.onclick=()=>restore(slot);ac.append(test,change,reset);d.appendChild(ac);return d
  }
  function renderGroup(id,data){const g=document.getElementById(id);if(!g)return;g.replaceChildren(...data.map(buildCard))}
  function renderAll(){renderGroup('scAudMusic',MUSIC);renderGroup('scAudSpecial',SPECIAL);renderGroup('scAudSfx',SFX);renderSummary();syncEntryPoints()}
  function renderSummary(){const c=document.getElementById('scAudCount'),s=document.getElementById('scAudStorage');if(c)c.textContent=countCustom()+' / '+ALL.length;if(s){let n=0;records.forEach(r=>n+=Number(r.size)||0);s.textContent=(n/1024/1024).toFixed(1)+' MB'}const a=document.getElementById('scSetCustomAudio');if(a){const b=a.querySelector('.scSetCopy b');if(b)b.textContent=countCustom()?countCustom()+' CUSTOM':'PADRÃO';a.classList.toggle('on',countCustom()>0)}const m=document.getElementById('scCustomAudioMenu');if(m)m.dataset.scAudioCount=countCustom()}
  function choose(slot){pendingSlot=slot;const f=document.getElementById('scAudioCustomFile');if(f)f.click()}
  async function importFile(slot,file){
    if(!meta.has(slot))return;
    const ext=(file.name.split('.').pop()||'').toLowerCase(),ok=(file.type&&file.type.startsWith('audio/'))||['mp3','ogg','wav','m4a','aac','flac'].includes(ext);
    if(!ok){toast('Escolha um arquivo de áudio válido');return}if(file.size>MAX_FILE){toast('Arquivo acima de 25 MB');return}
    try{const rec={slot,name:safeName(file.name),type:file.type||'audio/*',size:file.size,blob:file,lastModified:file.lastModified||Date.now(),savedAt:Date.now()};await putRec(rec);records.set(slot,rec);makeUrl(slot,file);pools.delete(slot);if(slot.startsWith('music:'))resetMusic(meta.get(slot)[4]);renderAll();toast('Áudio salvo: '+rec.name)}catch(e){console.warn('[Custom Audio import]',e);toast('Falha ao salvar o áudio')}
  }
  async function restore(slot){if(!records.has(slot))return;try{await delRec(slot);records.delete(slot);revoke(slot);if(slot.startsWith('music:'))resetMusic(meta.get(slot)[4]);renderAll();toast('Restaurado para o áudio padrão')}catch(e){toast('Não foi possível restaurar')}}
  async function restoreAll(){try{await clearDb();for(const k of [...records.keys()])revoke(k);records.clear();MUSIC.forEach(r=>resetMusic(r[4]));renderAll();toast('Todos os áudios foram restaurados')}catch(e){toast('Falha ao restaurar os áudios')}}

  function open(){mount();opened=true;stopPreview();const r=document.getElementById('scAudioCustom');r.classList.add('on');r.setAttribute('aria-hidden','false');renderAll();setTimeout(()=>document.getElementById('scAudClose')?.focus(),0)}
  function close(){opened=false;stopPreview();const r=document.getElementById('scAudioCustom');if(r){r.classList.remove('on');r.setAttribute('aria-hidden','true')}}

  function syncEntryPoints(){
    const pg=document.querySelector('#pause .scPauseGrid');
    if(pg&&!document.getElementById('scSetCustomAudio')){const b=document.createElement('button');b.type='button';b.className='scPauseSetting';b.id='scSetCustomAudio';b.dataset.scButtonRefined='1';b.innerHTML='<span class="scSetIcon">🎚️</span><span class="scSetCopy"><small>Áudio personalizado</small><b>'+(countCustom()?countCustom()+' CUSTOM':'PADRÃO')+'</b></span><i></i>';b.onclick=()=>{try{if(S.uiPrefs&&S.uiPrefs.haptic&&navigator.vibrate)navigator.vibrate(8)}catch(_){}open()};pg.appendChild(b)}
    const systems=document.querySelector('#menu.scMenuV2 .scMenuSystems');
    if(systems&&!document.getElementById('scCustomAudioMenu')){const b=document.createElement('button');b.type='button';b.id='scCustomAudioMenu';b.className='btn g';b.dataset.scButtonRefined='1';b.innerHTML='🎚️ ÁUDIO PERSONALIZADO';b.onclick=open;systems.appendChild(b)}
    renderSummary();
  }

  async function init(){
    try{db=await openDb();const rows=await getAll();for(const r of rows){if(r&&meta.has(r.slot)&&r.blob){records.set(r.slot,r);makeUrl(r.slot,r.blob)}}applyGains();MUSIC.forEach(r=>{if(records.has(r[0]))resetMusic(r[4])});mount();syncEntryPoints();console.log('[Mobile] Custom Audio '+VERSION+' ready · '+records.size+' custom slots loaded.')}catch(e){console.warn('[Mobile Custom Audio]',e);mount();toast('Armazenamento de áudio indisponível')}
  }
  const mo=new MutationObserver(()=>{if(!opened)syncEntryPoints()});mo.observe(document.body,{childList:true,subtree:true});
  addEventListener('keydown',e=>{if(opened&&e.key==='Escape'){e.preventDefault();close()}},{capture:true});
  document.addEventListener('visibilitychange',()=>{if(document.hidden)stopPreview()});
  window.SCCustomAudio={version:VERSION,open,close,slots:ALL.map(v=>v[0]),restore,restoreAll,get customCount(){return records.size},get settings(){return Object.assign({},settings)}};
  init();
}catch(err){console.warn('[Mobile Custom Audio fatal]',err)}
})();