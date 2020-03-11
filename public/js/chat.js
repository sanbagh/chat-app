const socket = io();
const $messageForm = document.querySelector('#message-form');
const $shareLocBtn = document.querySelector('#share-location');
const $messageContainer = document.querySelector('#messageContainer');
const messageTemplate = document.querySelector('#message-template').innerHTML;
const locationUrlTemplate = document.querySelector('#locationUrlTemplate')
  .innerHTML;
const chatSideBarTempalte = document.querySelector('#chatSideBarTempalte')
  .innerHTML;
const $chatSideBar = document.querySelector('#chatSideBar');
const { username, room } = Qs.parse(location.search, {
  ignoreQueryPrefix: true
});

autoscroll = () => {
  const $lastMessage = $messageContainer.lastElementChild;
  const lastMessageStyle = getComputedStyle($lastMessage);
  const lastMessageHeight =
    $lastMessage.offsetHeight + parseInt(lastMessageStyle.marginBottom);
  const visibleHeight = $messageContainer.offsetHeight;
  const totalContainerHeight = $messageContainer.scrollHeight;
  const scrollOffset = $messageContainer.scrollTop + visibleHeight;
  if (totalContainerHeight - lastMessageHeight <= scrollOffset) {
    $messageContainer.scrollTop = $messageContainer.scrollHeight;
  }
};
socket.on('message', message => {
  const html = Mustache.render(messageTemplate, {
    username: message.username,
    message: message.text,
    createdAt: moment(message.createdAt).format('h:mm a')
  });
  $messageContainer.insertAdjacentHTML('beforeend', html);
  autoscroll();
});

socket.on('locationMessage', locationObj => {
  const html = Mustache.render(locationUrlTemplate, {
    username: locationObj.username,
    locationUrl: locationObj.locationUrl,
    createdAt: moment(locationObj.createdAt).format('h:mm a')
  });
  $messageContainer.insertAdjacentHTML('beforeend', html);
  autoscroll();
});
socket.on('roomData', ({ room, users }) => {
  const html = Mustache.render(chatSideBarTempalte, { room, users });
  chatSideBar.innerHTML = html;
});
$messageForm.addEventListener('submit', e => {
  e.preventDefault();
  $messageForm.setAttribute('disabled', 'disabled');
  const $messageInput = e.target.elements.message;
  const message = $messageInput.value;
  socket.emit('sendMessage', message, err => {
    if (err) {
      return console.log(err);
    }
    console.log('delivered');
  });
  $messageInput.value = '';
  $messageInput.focus();
  $messageForm.removeAttribute('disabled');
});

$shareLocBtn.addEventListener('click', () => {
  if (!navigator.geolocation) {
    return alert('you browser does not support geolocation');
  }
  $shareLocBtn.setAttribute('disabled', 'disabled');
  navigator.geolocation.getCurrentPosition(position => {
    socket.emit(
      'shareLocation',
      {
        latitude: position.coords.latitude,
        longitude: position.coords.longitude
      },
      message => {
        console.log(message);
        $shareLocBtn.removeAttribute('disabled');
      }
    );
  });
});

socket.emit('join', { username, room }, err => {
  if (err) {
    location.href = '/';
    alert(err);
  }
});
