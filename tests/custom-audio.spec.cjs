const assert=require('assert');
const fs=require('fs'),path=require('path'),http=require('http');
const {chromium}=require('playwright');
const root=path.resolve(process.argv[2]||'www');
const mime={'.html':'text/html','.js':'text/javascript','.css':'text/css','.png':'image/png','.mp3':'audio/mpeg','.wav':'audio/wav'};
const server=http.createServer((req,res)=>{let p=(req.url||'/').split('?')[0];if(p==='/')p='/index.html';const f=path.join(root,decodeURIComponent(p));fs.readFile(f,(e,d)=>{if(e){res.writeHead(404);return res.end()}res.writeHead(200,{'content-type':mime[path.extname(f)]||'application/octet-stream','cache-control':'no-store'});res.end(d)})});
(async()=>{
  await new Promise(r=>server.listen(0,'127.0.0.1',r));
  const browser=await chromium.launch({headless:true});
  const context=await browser.newContext({viewport:{width:1280,height:720}});
  await context.addInitScript(()=>{try{localStorage.setItem('sc_tutorial_complete_v3','1');localStorage.setItem('sc_guided_tutorial_complete_v4','1')}catch(_){}});
  const page=await context.newPage(),errors=[];
  page.on('pageerror',e=>errors.push(e.stack||e.message));
  page.on('console',m=>{if(m.type()==='error')errors.push(m.text())});
  const url=`http://127.0.0.1:${server.address().port}/index.html`;
  await page.goto(url,{waitUntil:'domcontentloaded'});
  await page.waitForFunction(()=>window.SCCustomAudio&&String(SCCustomAudio.version)==='13.3',{timeout:22000});
  await page.evaluate(()=>SCCustomAudio.open());
  await page.waitForSelector('#scAudioCustom.on');
  await page.waitForTimeout(250);
  const state=await page.evaluate(()=>({
    cards:document.querySelectorAll('#scAudioCustom .scAudCard').length,
    music:document.querySelectorAll('#scAudMusic .scAudCard').length,
    special:document.querySelectorAll('#scAudSpecial .scAudCard').length,
    sfx:document.querySelectorAll('#scAudSfx .scAudCard').length,
    importButtons:document.querySelectorAll('#scAudioCustom .scAudAct.change').length,
    menuEntry:!!document.getElementById('scCustomAudioMenu'),
    pauseEntry:!!document.getElementById('scSetCustomAudio'),
    firstLabel:document.querySelector('#scAudMusic .scAudFile')?.textContent||'',
    sfxLabel:document.querySelector('#scAudSfx .scAudFile')?.textContent||'',
    visible:[...document.querySelectorAll('#scAudMusic .scAudAct.change')].every(b=>{const r=b.getBoundingClientRect();return r.width>20&&r.height>20&&getComputedStyle(b).display!=='none'})
  }));
  assert.equal(state.cards,21,'custom audio UI must render all 21 slots');
  assert.equal(state.music,5);assert.equal(state.special,3);assert.equal(state.sfx,13);
  assert.equal(state.importButtons,21,'every audio slot must have Import/Change button');
  assert(state.menuEntry,'custom audio menu entry missing');assert(state.pauseEntry,'custom audio pause entry missing');
  assert(state.firstLabel.includes('musica_jogo.mp3'),'default music filename is not shown');
  assert(state.sfxLabel.includes('sintetizado'),'default synthesized SFX is not identified');
  assert(state.visible,'music import buttons are hidden');
  const chooserP=page.waitForEvent('filechooser');
  await page.click('#scAudMusic .scAudAct.change');
  const chooser=await chooserP;
  await chooser.setFiles({name:'meu-audio.wav',mimeType:'audio/wav',buffer:Buffer.from([82,73,70,70,4,0,0,0,87,65,86,69])});
  await page.waitForFunction(()=>document.querySelector('#scAudMusic .scAudCard')?.classList.contains('custom'));
  const imported=await page.evaluate(()=>({label:document.querySelector('#scAudMusic .scAudFile')?.textContent||'',count:SCCustomAudio.customCount,resetDisabled:document.querySelector('#scAudMusic .scAudAct.reset')?.disabled}));
  assert(imported.label.includes('meu-audio.wav'),'imported filename is not shown in current-audio label');
  assert(imported.count>=1,'import did not register a custom slot');
  assert.equal(imported.resetDisabled,false,'restore-default button did not enable after import');
  assert.deepEqual(errors,[],errors.join('\n'));
  console.log('Custom Audio 13.3 suite passed: 21 current-audio slots visible, import/change buttons visible, Android-style file import works.');
  await browser.close();await new Promise(r=>server.close(r));
})().catch(e=>{console.error(e);try{server.close()}catch(_){}process.exit(1)});
