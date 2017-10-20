; (function (win, doc) {
    var YChat = function () {
        this.socket = null;
    }
    win.YChat = YChat;
    YChat.prototype = {
        constructor: YChat,
        init: function () {
            let that = this;
            this.socket = io.connect();
            this.socket.on('connect', function () {
                doc.getElementById('loginWapper').style.display = 'flex';
                doc.getElementById('username').focus();
            });
            this.socket.on('nameExisted', function () {
                doc.getElementById('tips').textContent = 'name existed ,choose another one pls';
            });
            this.socket.on('loginSucceed', function (username, userlist) {
                that.socket.username = username;
                doc.getElementById('loginWapper').style.display = 'none';
                doc.getElementById('messageInput').focus();
                that._initUser(userlist, username);
            });
            this.socket.on('error', function (err) {
                if (doc.getElementById('loginWrapper').style.display == 'none') {
                    doc.getElementById('status').textContent = 'fail to connect';
                } else {
                    doc.getElementById('tips').textContent = 'fail to connect';
                }
            });
            this.socket.on('system', function (type, username, userlist) {
                // [].forEach.apply(arguments, console.log);
                var sysmsg = username + (type === 'login' ? ' join' : ' left');
                that._newMessage('system', sysmsg);
                that._updateUser(type, username, userlist);
            });
            this.socket.on('message', function (user, msg) {
                that._newMessage(user, msg);
            });
            this.socket.on('pm', function (user, msg, from) {
                that._newMessage(user, msg, from);
            });
            //login btn
            doc.getElementById('loginBtn').addEventListener('click', function () { that._login() });
            /*控制键键码值(keyCode)
            按键 键码  按键  键码  按键  键码  按键  键码
            BackSpace  8   Esc 27  Right Arrow 39  -_  189
            Tab    9   Spacebar    32  Dw Arrow    40  .>  190
            Clear  12  Page Up 33  Insert  45  /?  191
            Enter  13  Page Down   34  Delete  46  `~ 192
            Shift  16  End 35  Num Lock    144 [{  219
            Control    17  Home    36  ;:  186 \|  220
            Alt    18  Left Arrow  37  =+  187 ]}  221
            Cape Lock  20  Up Arrow    38  ,<  188 '"  222
            * */
            //通过“回车键”提交用户名
            doc.getElementById('username').onkeydown = function (e) {
                console.log(e);
                e = e || event;
                if (e.keyCode === 13) {
                    that._login();
                }
            };
            //通过“回车键”提交聊天内容
            doc.getElementById('messageInput').onkeydown = function (e) {
                e = e || event;
                if (e.keyCode === 13 && e.shiftKey) {
                    that._sendMessage();
                }
            };
            //send btn
            doc.getElementById('sendBtn').addEventListener('click', function () { that._sendMessage() }, true);
            //clear btn
            doc.getElementById('clearBtn').addEventListener('click', function () {
                doc.getElementById('history').innerHTML = '';
            })
        },
        _newMessage: function (username, msg, target) {
            target = target ? target : 'all';
            var history = doc.getElementById('history'),
                str = '',
                pm = (target === 'all') ? '' : ' [PM]';
            if (username === 'system') {
                str = '<div class="systemmsg msg-item">\
                        <img src="seven.png"><span>'+ msg + '</span>\
                        </div>'
            } else if (username === 'self' || username === this.socket.username) {
                username = this.socket.username;
                str = '<div class="msg-item mymsg">\
                        <img src="seven.png" class="user-icon">\
                        <span class="msg-time">'+ username + pm + ' ' + new Date().toLocaleString().replace(/[\u4e00-\u9fa5]/g, '') + '</span>\
                        <span class="msg-content">'+ msg + '</span>\
                        </div>'
            } else {
                str = '<div class="msg-item othermsg">\
                        <img src="seven.png" class="user-icon">\
                        <span class="msg-time">' + new Date().toLocaleString().replace(/[\u4e00-\u9fa5]/g, '') + ' ' + username + pm + '</span>\
                        <span class="msg-content">'+ msg + '</span>\
                    </div>'
            }
            history.innerHTML += str;
            history.scrollTop = history.scrollHeight;
        },
        _sendMessage: function () {
            var messageInput = doc.getElementById('messageInput'),
                message = messageInput.value,
                target = doc.getElementById('select').value;
            if (message.trim()) {
                this.socket.emit('message', this.socket.username, message, target);
                this._newMessage('self', message, target);
                messageInput.value = '';
                messageInput.focus();
            }
        },
        _login: function () {
            var username = doc.getElementById('username').value;
            if (username.trim()) {
                this.socket.emit('login', username);
            }
        },
        _initUser: function (userlist, username) {
            var selectStr = '<option selected>\
                                all\
                            </option>',
                divStr = '<li>\
                            <span>在线用户</span>\
                        </li>';
            userlist.forEach(function (_username) {
                divStr += '<li data-id="' + _username + '">' + _username + '</li>';
                if (_username === username) {
                    return;
                }
                selectStr += '<option data-id="' + _username + '">' + _username + '</option>';
            }, this);
            select.innerHTML += selectStr;
            doc.getElementById('select').innerHTML = selectStr;
            doc.getElementById('userlist-ul').innerHTML = divStr;
            doc.getElementById('status').innerHTML = userlist.length + ' online';
        },
        _updateUser: function (type, username, userlist) {
            var select = doc.getElementById('select'),
                userlistUl = doc.getElementById('userlist-ul'),
                doms = null;
            if (type === 'login') {
                doc.getElementById('select').innerHTML += '<option data-id="' + username + '">' + username + '</option>';
                doc.getElementById('userlist-ul').innerHTML += '<li data-id="' + username + '">' + username + '</li>';
            } else {
                doms = doc.querySelectorAll('[data-id="' + username + '"]');
                [].forEach.call(doms, function (dom) {
                    dom.parentNode.removeChild(dom);
                })
            }
            doc.getElementById('status').innerHTML = userlist.length + ' online';
        }
    }
})(window, window.document);