import { io } from 'socket.io-client'; import { API_BASE } from './config';
export function connectSocket(token){ return io(API_BASE,{transports:['websocket'],auth:{token:`Bearer ${token}`}}); }
