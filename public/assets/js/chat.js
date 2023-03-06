const socket = io.connect();
let userId;
socket.on('messages', async (data) => {
    try{
        await getAuthenticateUserInfo();
        renderMessages(data);
    }catch(err){
        location.href = '/fatal_error?err='+err.message;
    }
});
async function getAuthenticateUserInfo() {
    try{
        const response = await fetch(`/api/user/?admin=true`);
        const data = await response.json();
        userId = data.user._id;
        return data;
    }catch(err){
        location.href = '/fatal_error?err='+err.message;
    }
}
function renderMessages(messages) {
    try{
        const messagesContainer = document.getElementById('messages_container');
        messages.forEach(async (message) => {
            try{
                const div = document.createElement('div');
                if (message.from._id != userId) {
                    div.classList.add('d-flex', 'justify-content-start', 'mb-4');
                    div.innerHTML = `
                                    <div class="img_cont_msg">
                                        <img src="${message.from.avatar}" class="rounded-circle user_img_msg">
                                    </div>
                                    <div class="msg_cotainer">
                                        ${message.message}
                                        <span class="msg_time">${calcTextDate(message.timestamp)}</span>
                                    </div>
                                `;
                } else {
                    div.classList.add('d-flex', 'justify-content-end', 'mb-4');
                    div.innerHTML = `
                                    <div class="msg_cotainer_send">
                                        ${message.message}
                                        <span class="msg_time_send">${calcTextDate(message.timestamp)}</span>
                                    </div>
                                    <div class="img_cont_msg">
                                        <img src="${message.from.avatar}" class="rounded-circle user_img_msg">
                                    </div>
                                `;
                }
                if(document.getElementsByClassName('spinner-visible')[0]){
                    removeSpinner(spinner);
                    document.getElementById('message_input').removeAttribute('disabled');
                }
                messagesContainer.appendChild(div);
            }catch(err){
                location.href = '/fatal_error?err='+err.message;
            }
        });
    }catch(err){
        location.href = '/fatal_error?err='+err.message;
    }
}

function calcTextDate(timestamp) {
    try{
        const today = new Date().toISOString().split('T')[0].split('-');
        const messageDate = timestamp.split('T')[0].split('-');
        const messageHour = changeHourFormat(timestamp.split('T')[1].split(':'));
        if((today[2] == messageDate[2]) && (today[1] == messageDate[1]) && (today[0] == messageDate[0])){
            return (messageHour+', Hoy');
        }else if((today[2]) - messageDate[2] == 1){
            return (messageHour+', Ayer');
        }else if((today[2]) - messageDate[2] == 2){
            return (messageHour+', Anteyer');
        }else{
            return (messageDate[2]+'/'+messageDate[1]+'/'+messageDate[0]);
        }
    }catch(err){
        location.href = '/fatal_error?err='+err.message;
    }
}

function changeHourFormat(hour) {
    try{
        if(hour[0] > 12){
            hour[0] = hour[0] - 12;
            hour[1] = hour[1] + ' PM';
        }else{
            hour[1] = hour[1] + ' AM';
        }
        return hour[0] + ':' + hour[1];
    }catch(err){
        location.href = '/fatal_error?err='+err.message;
    }
}

function removeSpinner(spinner) {
    try{
        spinner.classList.add('spinner-hidden');
        spinner.classList.remove('spinner-visible');
    }catch(err){
        location.href = '/fatal_error?err='+err.message;
    }
}

function sendNewMessage() {
    try{
        const el = document.getElementById('message_input');
        const messageObj = {
            from: userId,
            message: el.value,
        };
        socket.emit('new-message', messageObj);
        el.value = '';
    }catch(err){
        location.href = '/fatal_error?err='+err.message;
    }
}
document.getElementById('message_input').addEventListener('keyup', (e) => {
    try{
        if (e.keyCode == 13) {
            sendNewMessage();
        }
    }catch(err){
        location.href = '/fatal_error?err='+err.message;
    }
});
