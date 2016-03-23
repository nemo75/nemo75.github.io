var express = require('express');
var app = express();
var server = require('http').createServer(app);
var io = require('socket.io').listen(server);
var ent = require('ent');
var fs = require('fs');

// On charge la page index.html
app.use(express.static(__dirname + '/public'));
server.listen(3000);

var users = {};
var messages = [];
var history = 4;

io.sockets.on('connection', function(socket){
    var me = false;
    console.log('New user');

    for(var k in users){
        socket.emit('newusr', users[k]);
    }
    for(var k in messages){
        socket.emit('newmsg', messages[k]);
    }


    socket.on('login', function(user){
         me = user;
        // me = ent.encode(user);
        me.id = user.id;
        socket.emit('logged');
        users[me.id] = me;
        io.sockets.emit('newusr', me);
    });

    socket.on('disconnect', function(){
        if (!me) {
            return false;
        }
        delete users[me.id];
        io.sockets.emit('disusr', me);
    })


// recuperer le pseudo a chaque message envoye
    socket.on('newmsg', function(message){
        // message = ent.encode(message);
        message.user = me;
        date = new Date();
        message.h = date.getHours();
        if(message.h<10)
        {
                message.h = "0"+message.h;
        }
        message.m = date.getMinutes();
        if(message.m<10)
        {
            message.m = "0" + message.m;
        }
        message.s = date.getSeconds();
         if(message.s<10)
        {
            message.s = "0" + message.s;
        }
        messages.push(message);
        if(messages.length > history){
            messages.shift();
        }
        io.sockets.emit('newmsg', message);
    });
});

