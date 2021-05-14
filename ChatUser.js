/** Functionality related to chatting. */

// Room is an abstraction of a chat channel
const Room = require('./Room');
const Joke = require('./Joke')

/** ChatUser is a individual connection from client -> server to chat. */

class ChatUser {
  /** make chat: store connection-device, rooom */

  constructor(send, roomName) {
    this._send = send; // "send" function for this user
    this.room = Room.get(roomName); // room user will be in
    this.name = null; // becomes the username of the visitor

    console.log(`created chat in ${this.room.name}`);
  }

  /** send msgs to this client using underlying connection-send-function */

  send(data) {
    try {
      this._send(data);
      return true
    } catch {
      // If trying to send to a user fails, ignore it
      return false
    }
  }

  /** handle joining: add to room members, announce join */

  handleJoin(name) {
    this.name = name;
    this.room.join(this);
    this.room.broadcast({
      type: 'note',
      text: `${this.name} joined "${this.room.name}".`
    });
  }

  /** handle a chat: broadcast to room. */

  handleChat(text) {
    this.room.broadcast({
      name: this.name,
      type: 'chat',
      text: text
    });
  }

  // handles a joke: broadcast to the user
  async handleJoke() {
    const joke = await Joke.getNew()
    this.send( JSON.stringify({name: this.name,
      type: 'note',
      text: joke} ))
  }

  // handles requests for the member list for the chatroom
  handleMemberReq() {
    const members = this.room.getMembers()
    this.send(JSON.stringify({name: this.name,
      type: 'note',
      text: `Members: ${members.map( member => member.name ).join( ", " )}`}))
  }

  // handles private messages
  handlePrivateChat( text ) {
    try{

      const { member, msg } = this.room.seperateUserFromMsg( text )
      if(
        member.send(JSON.stringify({
        name: this.name,
        type: 'chat',
        text: `Private msg to ${member.name}: ` + msg
      }))){

        this.send(JSON.stringify({
          name: this.name,
          type: 'chat',
          text: `Private msg to ${member.name}: ` + msg
        }))
      }
    }
    catch(err){
      // ignore errors
    }
  }

  // handles name change
  handleNameChange( newName ) {
    if( !this.room.hasMember( newName ) ){
      
      const oldName = this.name
      this.name = newName
      this.room.broadcast({
        type: 'note',
        text: `${oldName} is now ${this.name}`})
    }
    else{
      this.send(JSON.stringify(
        {
          type:'note',
          text:`user:${newName} already exists`
        }
      ))
    }
  }

  /** Handle messages from client:
   *
   * - {type: "join", name: username}    : join
   * - {type: "chat", text: msg }        : chat
   * 
   * Adding the following
   * - {type: "joke"}                    : joke
   * - {type: "members"}                 : member list
   * - {type: "priv", text: toUsr + msg} : private chat
   * - {type: "name", text: newUsername} : new name
   */

  async handleMessage(jsonData) {
    let msg = JSON.parse(jsonData);

    console.log( msg )

    if (msg.type === 'join') this.handleJoin(msg.name);
    else if (msg.type === 'joke') await this.handleJoke()
    else if (msg.type === 'members') this.handleMemberReq()
    else if (msg.type === 'priv') this.handlePrivateChat(msg.text)
    else if (msg.type === 'name') this.handleNameChange(msg.text)
    else if (msg.type === 'chat') this.handleChat(msg.text);
    else throw new Error(`bad message: ${msg.type}`);
  }

  /** Connection was closed: leave room, announce exit to others */

  handleClose() {
    this.room.leave(this);
    this.room.broadcast({
      type: 'note',
      text: `${this.name} left ${this.room.name}.`
    });
  }
}

module.exports = ChatUser;
