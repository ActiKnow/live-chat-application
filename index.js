const express = require('express');
const http = require('http');
const mysql = require('mysql');
require('dotenv').config();

const app = express();
const server = http.createServer(app);
const { Server } = require("socket.io");
const io = new Server(server,{
    cors: {
        origin: '*',
    }
});



var db = mysql.createConnection({
    host: process.env.db_host,
    user: process.env.db_user,
    password: process.env.db_password,
    database: process.env.database,
});


db.connect(function (error) {
    if (!!error)
    throw error;
  
    console.log('mysql connected to db');
});


app.get('/',(req,res) => {
    res.send('<h1>hello</h1>');
})
const users = [];
const user_ids = [];
io.on('connection', (socket) => {
    //console.log('a user connected');
    if(!user_ids.includes(socket.user_id)){
        socket.broadcast.emit("user connected", {
            user_id: socket.user_id,
            socket_id : socket.id,
            username: socket.username,
        });
    }

    for (let [id, socket] of io.of("/").sockets) {
        //
        if(!user_ids.includes(socket.user_id)){
            user_ids.push(socket.user_id)
            users.push({
                user_id: socket.user_id,
                socket_id : socket.id,
                username: socket.username,
            });
        }
        
    }
    

    socket.emit("users", users);
    
    socket.on('disconnect', () => {
            console.log('user disconnected');
    });


    socket.on('chat message', (data) => {
        //console.log(data);
        let user_id = data.user_id;
        let msg = data.msg;
        db.query("insert into user_chats(user_id,message) values(?,?)",[user_id,msg],(err, result) => {
            if(!!err)
            throw err;
            
            if(!['',null,undefined].includes(data.to_user_id))
                io.emit('private message', data);
            else
                io.emit('chat message', data);
            //console.log(result);
        });

    });
});

io.use((socket, next) => {
    //console.log('hi')
    const username = socket.handshake.auth.username;
    const user_id = socket.handshake.auth.user_id;
    //console.log(socket.handshake.auth)
    if (!username) {
      return next(new Error("invalid username"));
    }
    socket.username = username;
    socket.user_id = user_id;
    next();
});


server.listen(3000, () => {
    console.log('start server')
    
})