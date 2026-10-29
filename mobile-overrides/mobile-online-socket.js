/* ©criado por Vitor Ag/Nyx - 2026 */
/* ©criado por Vitor Ag/Nyx - 2026 */
/* ©criado por Vitor Ag/Nyx - 2026 */
(() => {
'use strict';
const cfg=window.SC_ONLINE_CONFIG||{};
let socket=null,loading=null,connecting=false;
const readyCfg=()=>!!(cfg.enabled&&cfg.multiplayerUrl&&window.SCOnline);
function loadIO(){if(window.io)return Promise.resolve(window.io);if(loading)return loading;loading=new Promise((resolve,reject)=>{const s=document.createElement('script');s.src='https://cdn.socket.io/4.8.3/socket.io.min.js';s.async=true;s.onload=()=>resolve(window.io);s.onerror=()=>reject(new Error('Falha ao carregar cliente multiplayer'));document.head.appendChild(s)});return loading}
function request(packet){return new Promise((resolve,reject)=>{if(!socket?.connected)return reject(new Error('Servidor desconectado'));const timer=setTimeout(()=>reject(new Error('Servidor não respondeu')),8000);socket.emit('sc:request',packet,response=>{clearTimeout(timer);if(response?.ok===false)reject(new Error(response.error||'Comando rejeitado'));else resolve(response)})})}
async function connect(){if(!readyCfg()||connecting)return false;const session=SCOnline.state.session;if(!session?.access_token)return false;connecting=true;try{const io=await loadIO();if(socket){try{socket.disconnect()}catch(_){}}socket=io(cfg.multiplayerUrl,{auth:{token:session.access_token,protocol:cfg.protocol||'sc.online.v1'},transports:['websocket','polling'],reconnection:true,reconnectionAttempts:8,reconnectionDelay:700,timeout:8000});socket.on('connect',()=>{SCOnline.setTransport(request,{socketId:socket.id,endpoint:cfg.multiplayerUrl});console.log('[Mobile Online] socket connected',socket.id)});socket.on('disconnect',()=>SCOnline.setTransport(null,{reason:'disconnect'}));socket.on('sc:room',room=>{SCOnline.state.room=room||null;try{SCOnline.events.dispatchEvent(new CustomEvent('room',{detail:room}))}catch(_){}});socket.on('connect_error',err=>console.warn('[Mobile Online socket]',err.message));return true}catch(err){console.warn('[Mobile Online socket init]',err);return false}finally{connecting=false}}
function disconnect(){if(socket){socket.disconnect();socket=null}SCOnline?.setTransport(null,{reason:'manual'})}
if(window.SCOnline){SCOnline.events.addEventListener('session',e=>{if(e.detail)connect();else disconnect()});if(SCOnline.state.session)connect()}
window.SCOnlineSocket={connect,disconnect,get socket(){return socket}};
console.log('[Mobile] Socket.IO lobby adapter prepared; endpoint configured=',!!cfg.multiplayerUrl);
})();
