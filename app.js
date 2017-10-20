var Koa = require('koa'),
    router = require('koa-router'),
    app = new Koa(),
    fs = require('fs'),
    server = require('http').Server(app.callback()),
    io = require('socket.io').listen(server),
    koaStatic = require('koa-static'),
    route = require('koa-route'),
    //use for saving online user
    users = [],
    //use for saving socket for the specifical user
    userSockets = {};

const main = ctx => {
    ctx.response.body = fs.readFileSync(__dirname + '/client/yChat.html');
    ctx.response.type = 'text/html'
};

app.use(route.get('/', main));
app.use(koaStatic(__dirname + "/client"));
server.listen(process.env.PORT || 3000, function () {
    console.log('listen on 3000')
});

io.sockets.on('connection', socket => {
    socket.on('login', username => {
        if (users.indexOf(username) > -1) {
            socket.emit('nameExisted');
            return;
        }
        socket.username = username;
        users.push(username);
        userSockets[username] = socket;
        socket.emit('loginSucceed', username, users);
        socket.broadcast.emit('system', 'login', username, users);
    });
    socket.on('disconnect', () => {
        console.log('disconnect...');
        userSockets[socket.username] = null;
        delete userSockets[socket.username];
        users.splice(users.indexOf(socket.username), 1);
        // everyone gets it but the sender by using socket.broadcast
        socket.broadcast.emit('system', 'logout', socket.username, users);
    });
    socket.on('message', (username, msg, to) => {
        console.log(msg);
        to = to ? to : 'all';
        if (to === 'all') {
            socket.broadcast.emit('message', username, msg);
            return;
        } else {
            //private message
            userSockets[to].emit('pm', username, msg, to)
        }
    });
});