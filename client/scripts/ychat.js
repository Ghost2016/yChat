; (function (win) {
    var YChat = function () {
        this.socket = null;
    }
    win.YChat = YChat;
    YChat.prototype = {
        constructor: YChat,
        init: function () {
            let that = this, doc = document;
            this.socket = io.connect();
            this.socket.on('connect', function () {
                doc.getElementById('loginWapper').style.display = 'flex';
                doc.getElementById('username').focus();
            });
            this.socket.on('nameExisted', function () {
                doc.getElementById('tips').textContent = 'name existed ,choose another one pls';
            });
            this.socket.on('loginSucceed', function (username) {
                that.socket.username = username;
                doc.getElementById('loginWapper').style.display = 'none';
                doc.getElementById('messageInput').focus();
                // _newMessage('system','Welcome'+)
            });
            this.socket.on('error', function (err) {
                if (document.getElementById('loginWrapper').style.display == 'none') {
                    document.getElementById('status').textContent = 'fail to connect';
                } else {
                    document.getElementById('tips').textContent = 'fail to connect';
                }
            });
            this.socket.on('system', function (type, username, userCount) {
                var sysmsg = username + (type === 'login' ? ' join' : ' left');
                that._newMessage('system', sysmsg);
                document.getElementById('status').innerHTML = userCount + ' online!';
            });
            this.socket.on('message', function (user, msg) {
                that._newMessage(user, msg);
            });
            //login btn
            doc.getElementById('loginBtn').addEventListener('click', function () {
                var username = doc.getElementById('username').value;
                if (username.trim()) {
                    that.socket.emit('login', username);
                }
            });
            //send btn
            doc.getElementById('sendBtn').addEventListener('click', function () {
                var messageInput = doc.getElementById('messageInput'),
                    message = messageInput.value;
                if (message.trim()) {
                    that.socket.emit('message', that.socket.username, message);
                    that._newMessage('self', message);
                    messageInput.value = '';
                    messageInput.focus();
                }
            }, true);
            //clear btn
            doc.getElementById('clearBtn').addEventListener('click', function () {
                doc.getElementById('history').innerHTML = '';
            })
        },
        _newMessage: function (username, msg) {
            var history = document.getElementById('history'),
                str = '';
            if (username === 'system') {
                str = '<div class="systemmsg msg-item">\
                        <img src="seven.png"><span>'+ msg + '</span>\
                        </div>'
            } else if (username === 'self' || username === this.socket.username) {
                username = this.socket.username;
                str = '<div class="msg-item mymsg">\
                        <img src="seven.png" class="user-icon">\
                        <span class="msg-time">'+ username + ' ' + new Date().toLocaleString().replace(/[\u4e00-\u9fa5]/g, '') + '</span>\
                        <span class="msg-content">'+ msg + '</span>\
                        </div>'
            } else {
                str = '<div class="msg-item othermsg">\
                        <img src="seven.png" class="user-icon">\
                        <span class="msg-time">' + new Date().toLocaleString().replace(/[\u4e00-\u9fa5]/g, '') +  ' '+ username + '</span>\
                        <span class="msg-content">'+ msg + '</span>\
                    </div>'
            }
            history.innerHTML += str;
            history.scrollTop = history.scrollHeight;
        }
    }
})(window);