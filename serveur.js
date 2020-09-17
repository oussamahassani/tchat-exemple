const path = require('path');
const http = require('http');
const express = require('express');
const moment = require('moment');
const socketio = require('socket.io')
const Chat = require('./module/model/message.model')
const formatMessage = require('./module/messages');
const fs = require('fs')
const multer = require('multer')
const {
  userJoin,
  getCurrentUser,
  userLeave,
  getRoomUsers
} = require('./module/users');
const dotenv = require('dotenv');
const app = express();
const server = http.createServer(app);
const io = socketio(server);
const  mongoose  = require("mongoose");
dotenv.config();
const  connect  =  mongoose.connect(process.env.ATLAS, { useNewUrlParser: true  });

// Set static folder
app.use(express.static(path.join(__dirname, 'public')));

const Namesite = 'mon chat';
var storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, 'public/image')
  },
  filename: function (req, file, cb) {
    cb(null,file.originalname )
  }
})

var upload = multer({ storage: storage }).array('file')
// Run when client connects
io.on('connection', client => {

  client.on('fileuplod',file => {
    const user = getCurrentUser(client.id);
    io.to(user.room).emit('addimage' , file)
    
    });

  client.on('joinRoom', ({ username, room }) => {
    const user = userJoin(client.id, username, room);
    fs.readFile(__dirname + '/index.jpeg', function(err, buf){
      // it's possible to embed binary data
      // within arbitrarily-complex objects
      client.emit('image', { image: true, buffer: buf });
      console.log('image file is initialized');
    })
  
    client.join(user.room);

    // Welcome current user
    client.emit('message', formatMessage(Namesite, `welcome ${username}`));

    // Broadcast when a user connects
    client.broadcast
      .to(user.room)
      .emit(
        'message',
        formatMessage(Namesite, `${user.username} has joined the chat`)
      );

    // Send users and room info
    io.to(user.room).emit('roomUsers', {
      room: user.room,
      users: getRoomUsers(user.room)
    });
  });

  // Listen for chatMessage
  client.on('monmessage', msg => {
    const user = getCurrentUser(client.id);

    console.log("message: "  +  msg );
    connect.then(db  =>  {
      console.log("connected correctly to the server");
   
      Chat.create({idmessage:Date.now(), message: msg, sender: user.username ,time : moment().format('h:mm a')})
      .then(ok => console.log("ok"))
      .catch(err => console.log(err))

     
      });

    io.to(user.room).emit('message', formatMessage(user.username, msg));
  });
  client.on('historique', async (msg) => {
    const user = getCurrentUser(client.id);
    console.log("ok rsponse" , msg)
    await Chat.find()
    .then ( res => {console.log(res)
      io.to(user.room).emit('ResultHistorique', res)
    }
      )
    .catch(err => console.log(err))
  })

  // Runs when client disconnects
  client.on('disconnect', () => {
    const user = userLeave(client.id);
    console.log("new connection",user)
    if (user) {
      io.to(user.room).emit(
        'message',
        formatMessage(Namesite, `${user.username} has left the chat`)
      );

      // Send users and room info
      io.to(user.room).emit('roomUsers', {
        room: user.room,
        users: getRoomUsers(user.room)
      });
    }
  });
});

const PORT = 8000 ;

server.listen(PORT, () => console.log(`Server running on port ${PORT}`));
