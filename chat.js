$(document).ready(function(){
    username = {};
    var person = prompt("Please enter your name", "");
    if (person != null) {
      username.username = person;
    }else{
      username.username = 'rand-'+Date.now();
    }
    var socket = io('http://localhost:3000');

    
    var messages = $('#chat');
    var message_txt = $('#common-msg');
    var form = document.getElementById('form');
    var pform = document.getElementById('pform');
    var pinput = document.getElementById('pinput');

    
    //username.username = 'Ajay'//pass here username 
    username.user_id = Date.now(); //pass here user_id 
    socket.auth = username ;
    console.log(socket.auth)
    socket.connect();

    form.addEventListener('submit', function(e) {
        e.preventDefault();
        //console.log(message_txt.val())
        if (message_txt.text) {
            data = {};
            data.msg = message_txt.val();
            data.user_id = username.user_id ;
            data.username = username.username ;
            socket.emit('chat message', data);
            var my_msg = `<li class="me" >
                    <div class="entete">
                        <h3>10:12AM, Today</h3>
                        <h2>${username.username}</h2>
                        <span class="status blue"></span>
                    </div>
                    <div class="triangle"></div>
                    <div class="message">
                        ${data.msg}
                    </div>
                </li>`;
            messages.append(my_msg);
            window.scrollTo(0, document.body.scrollHeight);
            message_txt.text = '';
        }
    });

    


    socket.on("users", (users) => {
        let userLi = '';
        users.forEach((user) => {
          if(user.user_id != username.user_id){
            userLi+=`<li class="users" rel-id="${user.user_id}" rel-name="${user.username}">
              <!-- <img src="https://s3-us-west-2.amazonaws.com/s.cdpn.io/1940306/chat_avatar_01.jpg" alt=""> -->
              <i class="fa fa-user-circle" style="font-size: 55px;color:#fff"></i>
              <div>
                <h2>${user.username}</h2>
                <h3>
                  <span class="status orange"></span>
                  offline
                </h3>
              </div>
            </li>`; 
            
          }

        })
        $('#users').html(userLi);
        

    })
    socket.on("user connected", (user) => {
      if(user.user_id != username.user_id){
        var item=`<li class="users" rel-id="${user.user_id}" rel-name="${user.username}">
            <!-- <img src="https://s3-us-west-2.amazonaws.com/s.cdpn.io/1940306/chat_avatar_01.jpg" alt=""> -->
            <i class="fa fa-user-circle" style="font-size: 55px;color:#fff"></i>
            <div>
              <h2>${user.username}</h2>
              <h3>
                <span class="status orange"></span>
                offline
              </h3>
            </div>
          </li>`; 
          $('#users').append(item);
      }
    });
    
    socket.on('chat message', function(msg) {
        //console.log(msg)
        if(msg.user_id != username.user_id){
            var item = `<li class="you">
                    <div class="entete">
                        <span class="status green"></span>
                        <h2>${msg.username }</h2>
                        <h3>10:12AM, Today</h3>
                    </div>
                    <div class="triangle"></div>
                    <div class="message">
                        ${msg.msg}
                    </div>
                </li>`;
            messages.append(item);
            window.scrollTo(0, document.body.scrollHeight);
        }
    });

    $(document).on('submit','.private-form', function(e) {
        e.preventDefault();
        if ($(this).find('textarea').val()) {
            data = {};
            data.msg = $(this).find('textarea').val();
            data.user_id = username.user_id ;
            data.username = username.username ;
            data.to_user_id =  $(this).find('input[name="user_id"]').val();
            socket.emit('chat message', data);
            var msg = `<div class="message-box-holder">
                <div class="message-box">
                  ${data.msg}
                </div>
              </div>`;
              $(`#userChatBox-${data.to_user_id}`).find('.p-chat').append(msg)
              $(this).find('textarea').val('');
        }
        return false;
    });

    var pmessages = document.getElementById('p-msg');

    socket.on("private message", (msg) => {
        //console.log(msg)
        
        if(msg.to_user_id == username.user_id){
          if($(`#userChatBox-${msg.user_id}`).length == 0){
            var chatBox = `<div class="chatbox" id="userChatBox-${msg.user_id}">
                  <div class="chatbox-top">
                  
                    <div class="chat-partner-name">
                      <span class="status online"></span>
                      <a href="javascript:void(0)">${msg.username}</a>
                    </div>
                    <div class="chatbox-icons">
                      <a href="javascript:void(0);"><i class="fa fa-minus"></i></a>
                      <a href="javascript:void(0);"><i class="fa fa-times"></i></a>       
                    </div>      
                  </div>
                  
                  <div class="chat-messages p-chat" >
                    
                
                  </div>
                  
                  <div class="chat-input-holder">
                    <form class="private-form">
                      <input type="hidden" name="user_id" value="${msg.user_id}">
                      <textarea class="chat-input"></textarea>
                      <input type="submit" value="Send" class="message-send" />
                    </form>
                  </div>
                  
                </div>`;
            $('.chatbox-holder').append(chatBox);
          }
            var item = `<div class="message-box-holder">
                <div class="message-sender">
                  ${msg.username}
                </div>
                <div class="message-box message-partner">
                  ${msg.msg}
                </div>
              </div>`;
            $(`#userChatBox-${msg.user_id}`).find('.p-chat').append(item)
            window.scrollTo(0, document.body.scrollHeight);
        }
    });

    $(document).on('click','.users',function(){
      var user_id = $(this).attr('rel-id');
      var name = $(this).attr('rel-name');
      var chatBox = `<div class="chatbox" id="userChatBox-${user_id}">
            <div class="chatbox-top">
             
              <div class="chat-partner-name">
                <span class="status online"></span>
                <a href="javascript:void(0)">${name}</a>
              </div>
              <div class="chatbox-icons">
                <a href="javascript:void(0);"><i class="fa fa-minus"></i></a>
                <a href="javascript:void(0);"><i class="fa fa-times"></i></a>       
              </div>      
            </div>
            
            <div class="chat-messages p-chat" >
              
           
            </div>
            
            <div class="chat-input-holder">
              <form class="private-form">
                <input type="hidden" name="user_id" value="${user_id}">
                <textarea class="chat-input"></textarea>
                <input type="submit" value="Send" class="message-send" />
              </form>
            </div>
            
          </div>`;
      $('.chatbox-holder').append(chatBox);
    });
});