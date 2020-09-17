const chatForm = document.getElementById('chat-form');
const chatMessages = document.querySelector('.chat-messages');
const roomName = document.getElementById('room-name');
const userList = document.getElementById('users');

// Get username and room from URL
const { username, room }  = Qs.parse(location.search, {
  ignoreQueryPrefix: true
});

const socket = io();
// Join chatroom
socket.emit('joinRoom', { username, room });

// Get room and users
socket.on('roomUsers', ({ room, users }) => {
  outputRoomName(room);
  outputUsers(users);
});

// Message from server
socket.on('message', message => {
  console.log(message);
  outputMessage(message);

  // Scroll down
  chatMessages.scrollTop = chatMessages.scrollHeight;
});
socket.on('ResultHistorique' , tabmessage =>{
  outputHistorique(tabmessage)
})
// Message submit
chatForm.addEventListener('submit', e => {
  e.preventDefault();

  // Get message text
  const msg = e.target.elements.msg.value;

  // Emit message to server
  socket.emit('monmessage', msg);

  // Clear input
  e.target.elements.msg.value = '';
  e.target.elements.msg.focus();
});

// Output message to DOM
function outputMessage(message) {
  const div = document.createElement('div');
  div.classList.add('message');
  div.innerHTML = `<p class="meta">${message.username} <span>${message.time}</span></p>
  <p class="text">
    ${message.text}
  </p>`;
  document.querySelector('.chat-messages').appendChild(div);
}
function outputHistorique(tabmessage){
  const parent = document.querySelector('.chat-messages')
  while (parent.firstChild) {
    parent.removeChild(parent.firstChild);
} 
  for(let i = 0 ; i<tabmessage.length ; i++) {
console.log(tabmessage[i].message)
  const div = document.createElement('div');
  div.classList.add('message');
  div.innerHTML = `<p class="meta">  ` + tabmessage[i].sender + `<span>  `  + tabmessage[i].time + '</span></p>' +
  '<p class="text">' +
  tabmessage[i].message
  + '</p>';
  
 
  parent.appendChild(div);
}
}
// Add room name to DOM
function outputRoomName(room) {
  roomName.innerText = room;
}

// Add users to DOM
function outputUsers(users) {
  userList.innerHTML = `
    ${users.map(user => `<li>${user.username}</li>`).join("")}
  `;
}
function sendaction(){
  console.log("button cliked")
  const msg = 'nono'
  socket.emit('historique', msg);
}
