import http from 'node:http';
import crypto from 'node:crypto';
import express from 'express';
import cors from 'cors';
import {Server} from 'socket.io';
import {createClient} from '@supabase/supabase-js';

const PORT=Number(process.env.PORT||3000);
const SUPABASE_URL=process.env.SUPABASE_URL||'';
const SUPABASE_PUBLISHABLE_KEY=process.env.SUPABASE_PUBLISHABLE_KEY||'';
const PROTOCOL='sc.online.v1';
const origins=String(process.env.CORS_ORIGINS||'*').split(',').map(v=>v.trim()).filter(Boolean);
if(!SUPABASE_URL||!SUPABASE_PUBLISHABLE_KEY){console.error('Missing SUPABASE_URL or SUPABASE_PUBLISHABLE_KEY');process.exit(1)}

const auth=createClient(SUPABASE_URL,SUPABASE_PUBLISHABLE_KEY,{auth:{persistSession:false,autoRefreshToken:false}});
const app=express();
app.use(cors({origin:origins.includes('*')?true:origins,credentials:true}));
app.get('/health',(_req,res)=>res.json({ok:true,service:'survive-chaos-online',protocol:PROTOCOL,rooms:rooms.size,players:io.engine.clientsCount}));
const server=http.createServer(app);
const io=new Server(server,{cors:{origin:origins.includes('*')?true:origins,credentials:true},pingInterval:10000,pingTimeout:10000,maxHttpBufferSize:100_000});

const rooms=new Map();
const socketRoom=new Map();
const uid=()=>crypto.randomUUID();
const code=()=>{const abc='ABCDEFGHJKLMNPQRSTUVWXYZ23456789';let out='';for(let i=0;i<5;i++)out+=abc[Math.floor(Math.random()*abc.length)];return rooms.has(out)?code():out};
const publicRoom=r=>({id:r.id,code:r.code,hostId:r.hostId,maxPlayers:r.maxPlayers,createdAt:r.createdAt,players:[...r.players.values()].map(p=>({id:p.id,nick:p.nick,ready:!!p.ready,host:p.id===r.hostId}))});
const playerNick=user=>String(user.user_metadata?.full_name||user.user_metadata?.name||user.email?.split('@')[0]||'Jogador').slice(0,20);
function broadcast(r){if(!r)return;io.to(r.code).emit('sc:room',publicRoom(r))}
function leave(socket){const code=socketRoom.get(socket.id);if(!code)return;const r=rooms.get(code);socketRoom.delete(socket.id);socket.leave(code);if(!r)return;r.players.delete(socket.data.user.id);if(r.players.size===0){rooms.delete(code);return}if(r.hostId===socket.data.user.id)r.hostId=r.players.values().next().value.id;broadcast(r)}

io.use(async(socket,next)=>{try{const token=socket.handshake.auth?.token,protocol=socket.handshake.auth?.protocol;if(protocol!==PROTOCOL)return next(new Error('protocol_mismatch'));if(!token)return next(new Error('missing_token'));const {data,error}=await auth.auth.getUser(token);if(error||!data?.user)return next(new Error('invalid_session'));socket.data.user=data.user;next()}catch(err){next(err)}});

io.on('connection',socket=>{
  socket.on('sc:request',async(packet,ack=()=>{})=>{
    try{
      if(!packet||packet.protocol!==PROTOCOL)throw new Error('PROTOCOLO_INVÁLIDO');
      if(packet.playerId&&packet.playerId!==socket.data.user.id)throw new Error('PLAYER_ID_INVÁLIDO');
      const type=String(packet.type||'');
      if(type==='room.create'){
        leave(socket);
        const c=code(),maxPlayers=Math.max(2,Math.min(4,Number(packet.payload?.maxPlayers)||4));
        const r={id:uid(),code:c,hostId:socket.data.user.id,maxPlayers,createdAt:Date.now(),players:new Map()};
        r.players.set(socket.data.user.id,{id:socket.data.user.id,nick:playerNick(socket.data.user),ready:false,socketId:socket.id});rooms.set(c,r);socketRoom.set(socket.id,c);socket.join(c);const room=publicRoom(r);broadcast(r);return ack({ok:true,room});
      }
      if(type==='room.join'){
        leave(socket);
        const c=String(packet.payload?.code||'').trim().toUpperCase(),r=rooms.get(c);if(!r)throw new Error('SALA_NÃO_ENCONTRADA');if(r.players.size>=r.maxPlayers)throw new Error('SALA_CHEIA');r.players.set(socket.data.user.id,{id:socket.data.user.id,nick:playerNick(socket.data.user),ready:false,socketId:socket.id});socketRoom.set(socket.id,c);socket.join(c);const room=publicRoom(r);broadcast(r);return ack({ok:true,room});
      }
      if(type==='room.leave'){const c=socketRoom.get(socket.id),r=c&&rooms.get(c);leave(socket);return ack({ok:true,room:r?null:null})}
      if(type==='room.ready'){
        const c=socketRoom.get(socket.id),r=c&&rooms.get(c);if(!r)throw new Error('SEM_SALA');const p=r.players.get(socket.data.user.id);if(!p)throw new Error('JOGADOR_FORA_DA_SALA');p.ready=!!packet.payload?.ready;const room=publicRoom(r);broadcast(r);return ack({ok:true,room});
      }
      if(type==='room.state'){
        const c=socketRoom.get(socket.id),r=c&&rooms.get(c);if(!r)throw new Error('SEM_SALA');return ack({ok:true,room:publicRoom(r)});
      }
      if(packet.channel==='admin')throw new Error('ADMIN_SERVER_NOT_ENABLED_YET');
      throw new Error('COMANDO_DESCONHECIDO');
    }catch(err){ack({ok:false,error:err.message||'ERRO'})}
  });
  socket.on('disconnect',()=>leave(socket));
});

server.listen(PORT,'0.0.0.0',()=>console.log(`Survive Chaos Online listening on :${PORT} (${PROTOCOL})`));
