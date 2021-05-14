/** Chat rooms that can be joined/left/broadcast to. */

// in-memory storage of roomNames -> room

const ROOMS = new Map();

/** Room is a collection of listening members; this becomes a "chat room"
 *   where individual users can join/leave/broadcast to.
 */

class Room {
  /** get room by that name, creating if nonexistent
   *
   * This uses a programming pattern often called a "registry" ---
   * users of this class only need to .get to find a room; they don't
   * need to know about the ROOMS variable that holds the rooms. To
   * them, the Room class manages all of this stuff for them.
   **/

  static get(roomName) {
    if (!ROOMS.has(roomName)) {
      ROOMS.set(roomName, new Room(roomName));
    }

    return ROOMS.get(roomName);
  }

  /** make a new room, starting with empty set of listeners */

  constructor(roomName) {
    this.name = roomName;
    this.members = new Set();
  }

  /** member joining a room. */

  join(member) {
    this.members.add(member);
  }

  /** member leaving a room. */

  leave(member) {
    this.members.delete(member);
  }

  /** send message to all members in a room. */

  broadcast(data) {
    for (let member of this.members) {
      member.send(JSON.stringify(data));
    }
  }

  // returns array of members
  getMembers() {
    return [...this.members]
  }

  // returns a single member of a given name
  getMember( name ) {
    for( member of this.members ) {
      if( name === member.name ) {
        return member
      }
    }
    throw new Error("no such member")
  }

  // returns true if there is a member with the given name
  // returns false otherwise
  hasMember( name ) {
    for( let member of this.members ){
      if( member.name === name ){
        return true
      }
    }
    return false
  }

  //returns a username and the rest of text if the text has a member's
  // name at the beginning of it
  seperateUserFromMsg( text ) {
    for( let member of this.members ) {
      if( text.startsWith( member.name ) ) {
        return { 
          member:member,
          msg: text.slice( member.name.length ).trimStart()
        }
      }
    }
    throw new Error("no such member's name at the beginning of that text")
  }


}

module.exports = Room;
