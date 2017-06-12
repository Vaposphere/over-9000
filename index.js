const express     = require('express');
const app         = express();
const server      = require('http').Server(app);
const io          = require('socket.io')(server);
const httpProxy   = require('http-proxy');
const apiProxy    = httpProxy.createProxyServer();


server.listen(8080);

app.use('/o9x-ui', express.static('src/ui'));

app.use('/o9x-test', express.static('src/test'));

app.use((req, res) => {
  console.log('redirecting to Server1');
  apiProxy.web(req, res, {target: 'https://github.com/', secure: false, autoRewrite: true});
});

io.on('connection', (socket) => {
  socket.on('openWindow', (data) => {
    io.emit('openWindow', data);
  });
});
