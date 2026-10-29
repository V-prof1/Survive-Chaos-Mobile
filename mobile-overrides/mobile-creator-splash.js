(()=>{
'use strict';
const root=document.getElementById('scCreatorSplash');
if(!root)return;
const started=performance.now();
const showDev=()=>root.classList.add('sc-dev');
const finish=()=>{root.classList.add('sc-out');setTimeout(()=>root.remove(),320)};
setTimeout(showDev,1280);
setTimeout(finish,3000);
window.SCCreatorSplash={version:'30.0',started,root,showDev,finish};
})();
