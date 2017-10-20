var Koa = require('koa'),
    router = require('koa-router'),
    app = new Koa(),
    fs = require('fs'),
    server = require('http').Server(app.callback()),
    io = require('socket.io').listen(server),
    koaStatic = require('koa-static'),
    route = require('koa-route'),
    //use for saving online user
    users = []
    ;

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
        socket.emit('loginSucceed', username);
        io.sockets.emit('system', 'login', username, users.length);
    });
    socket.on('disconnect', () => {
        console.log('disconnect...');
        users.splice(users.indexOf(socket.username), 1);
        // everyone gets it but the sender by using socket.broadcast
        socket.broadcast.emit('system', 'logout', socket.username, users.length);
    });
    socket.on('message', (username, msg) => {
        console.log(msg);
        socket.broadcast.emit('message', username, msg);
    })
});