const socket = io();

// elements
const $messageForm = document.querySelector("#message-form");
const $messageInput = document.querySelector("input");
const $locationButton = document.querySelector("button");
const $messages = document.querySelector("#messages");
const $sidebar = document.querySelector("#sidebar");

// templates
const messageTemplate = document.querySelector("#message-template").innerHTML;
const locationTemplate = document.querySelector("#location-template").innerHTML;
const sidebarTemplate = document.querySelector("#sidebar-template").innerHTML;

// options
const { username, room } = Qs.parse(location.search, { ignoreQueryPrefix: true });

// receive chat message
socket.on("message", (message) => {
  const html = Mustache.render(messageTemplate, {
    sender: message.sender,
    message: message.text,
    createdAt: moment(message.createdAt).format("MMM Mo h:mm a"),
  });
  $messages.insertAdjacentHTML("beforeend", html);
  autoScroll();
});

//receive location message
socket.on("locationMessage", (location) => {
  const html = Mustache.render(locationTemplate, {
    sender: location.sender,
    url: location.url,
    createdAt: moment(location.createdAt).format("MMM Mo h:mm a"),
  });
  $messages.insertAdjacentHTML("beforeend", html);
  autoScroll();
});

socket.on("roomData", ({ room, users }) => {
  const html = Mustache.render(sidebarTemplate, {
    room,
    users,
  });
  $sidebar.insertAdjacentHTML("beforeend", html);
});

// send chat message
$messageForm.addEventListener("submit", (e) => {
  e.preventDefault();
  const message = e.target.elements.formInput.value;

  // disable for until processing messages
  $messageInput.setAttribute("disabled", "disabled");

  socket.emit("sendMessage", message, (error) => {
    // enable
    $messageInput.removeAttribute("disabled");
    $messageInput.value = "";
    $messageInput.focus();

    if (error) {
      return alert(error);
    }
  });
});

//location message
document.querySelector("#send-location").addEventListener("click", () => {
  //check whether browser support location or not
  if (!navigator.geolocation) {
    return alert("Geolocation i snot supported by your browser");
  }

  // disable location button
  $locationButton.setAttribute("disabled", "disabled");

  navigator.geolocation.getCurrentPosition((position, error) => {
    if (error) {
      return { error: error.message };
    }

    socket.emit(
      "sendLocation",
      {
        latitude: position.coords.latitude,
        longitude: position.coords.longitude,
      },
      () => {
        //enable location button
        $locationButton.removeAttribute("disabled");
      }
    );
  });
});

// join announcement
socket.emit("join", { username, room }, (error) => {
  if (error) {
    alert(error);
    location.href = "/";
  }
});

const autoScroll = () => {
  // new message element
  const $newMessage = $messages.lastElementChild;

  // height of the new message
  const newMessageStyles = getComputedStyle($newMessage);
  const newMessageMargin = parseInt(newMessageStyles.marginBottom);
  const newMessageHeight = $newMessage.offsetHeight + newMessageMargin;

  // visible height
  const visibleHeight = $messages.offsetHeight;

  // height of message container
  const containerHeight = $messages.scrollHeight;

  // how far scrolled
  const scrolledOffset = $messages.scrollTop + visibleHeight;

  if (containerHeight - newMessageHeight <= scrolledOffset) {
    $messages.scrollTop = $messages.scrollHeight;
  }
};
