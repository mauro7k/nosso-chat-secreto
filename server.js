// server.js
const express = require('express');
const http = require('http');
const { Server } = require('socket.io');

const app = express();
const server = http.createServer(app);
const io = new Server(server);

app.use(express.static('public'));

// Aqui guardamos as mensagens temporárias (cifradas, ninguém lê)
let messages = [];

// A cada minuto, apaga mensagens com mais de 12h
setInterval(() => {
  const agora = Date.now();
  const limite = 12 * 60 * 60 * 1000; // 12 horas
  messages = messages.filter(msg => agora - msg.timestamp < limite);
}, 60000);

io.on('connection', (socket) => {
  console.log('Alguém entrou');
  // Envia as mensagens guardadas (só as que ainda não expiraram)
  socket.emit('previous messages', messages);

  socket.on('chat message', (data) => {
    const nova = { ...data, timestamp: Date.now() };
    messages.push(nova);
    io.emit('chat message', nova);
  });

  socket.on('disconnect', () => console.log('Alguém saiu'));
});

server.listen(3000, () => {
  console.log('Chat pronto! Abre http://localhost:3000');
});