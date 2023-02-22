const socket = io.connect();
let userId;
socket.on('messages', async (data) => {
    await getAuthenticateUserInfo();
    renderMessages(data);
});
async function getInfoUser(id) {
    const response = await fetch(`/api/user/${id}`);
    const data = await response.json();
    return data;
}
async function getAuthenticateUserInfo() {
    const response = await fetch(`/api/user/`);
    const data = await response.json();
    userId = data.id;
    return data;
}
function renderMessages(messages) {
    const messagesContainer = document.getElementById('messages_container');
    messages.forEach(async (message) => {
        const div = document.createElement('div');
        const userInfo = await getInfoUser(message.from);
        if (message.from != userId) {
            div.classList.add('d-flex', 'justify-content-start', 'mb-4');
            div.innerHTML = `
							<div class="img_cont_msg">
								<img src="${userInfo.avatar}" class="rounded-circle user_img_msg">
							</div>
							<div class="msg_cotainer">
								${message.message}
								<span class="msg_time">8:40 AM, Today</span>
							</div>
						`;
        } else {
            div.classList.add('d-flex', 'justify-content-end', 'mb-4');
            div.innerHTML = `
							<div class="msg_cotainer_send">
								${message.message}
								<span class="msg_time_send">8:55 AM, Today</span>
							</div>
							<div class="img_cont_msg">
								<img src="${userInfo.avatar}" class="rounded-circle user_img_msg">
							</div>
						`;
        }
        messagesContainer.appendChild(div);
    });
}
function sendNewMessage() {
    const el = document.getElementById('message_input');
    const messageObj = {
        from: userId,
        message: el.value,
    };
    socket.emit('new-message', messageObj);
    el.value = '';
}
document.getElementById('message_input').addEventListener('keyup', (e) => {
    if (e.keyCode == 13) {
        sendNewMessage();
    }
});
