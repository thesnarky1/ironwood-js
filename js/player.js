var Player = function(map, coord, direction) {
  Living.call(this, map, coord, direction);
  this.setColor("#9999ff");
  this.setSymbol("@");
  this._smokebombs = 2;
  this.display();  

  //Store applicable keys for various inputs
  this._dirMap = {};
  this._actionMap = {};

  //Numpad
  this._dirMap[ROT.VK_NUMPAD8] = DIR_N;
  this._dirMap[ROT.VK_NUMPAD9] = DIR_NE;
  this._dirMap[ROT.VK_NUMPAD6] = DIR_E;
  this._dirMap[ROT.VK_NUMPAD3] = DIR_SE;
  this._dirMap[ROT.VK_NUMPAD2] = DIR_S;
  this._dirMap[ROT.VK_NUMPAD1] = DIR_SW;
  this._dirMap[ROT.VK_NUMPAD4] = DIR_W;
  this._dirMap[ROT.VK_NUMPAD7] = DIR_NW;
  this._actionMap[ROT.VK_NUMPAD5] = ACTION_REST;


  //VIM
  this._dirMap[ROT.VK_K] = DIR_N;
  this._dirMap[ROT.VK_U] = DIR_NE;
  this._dirMap[ROT.VK_L] = DIR_E;
  this._dirMap[ROT.VK_N] = DIR_SE;
  this._dirMap[ROT.VK_J] = DIR_S;
  this._dirMap[ROT.VK_B] = DIR_SW;
  this._dirMap[ROT.VK_H] = DIR_W;
  this._dirMap[ROT.VK_Y] = DIR_NW;
  this._actionMap[ROT.VK_PERIOD] = ACTION_REST;

  //Schema agnostic
  this._actionMap[ROT.VK_GREATER_THAN] = ACTION_STAIRS;
  this._actionMap[ROT.VK_D] = ACTION_DRAG;
  this._actionMap[ROT.VK_S] = ACTION_SMOKEBOMB;
  this._actionMap[ROT.VK_SPACE] = ACTION_REST;
}

Player.extend(Living);

Player.prototype.onNewMap = function() { //Finish out this function once levels are implemented
  this._smokebombs += 1;
}

Player.prototype.act = function() {
  Ironwood.engine.lock();
  window.addEventListener("keydown", this);
}

Player.prototype.handleEvent = function(e) {
  var code = e.keyCode;

  if(code in this._dirMap) { //We move
    var currX = this.getCoord().getX();
    var currY = this.getCoord().getY();
    var diff = ROT.DIRS[8][this._dirMap[code]];
    var newX = currX + diff[0];
    var newY = currY + diff[1];
    var newCoord = new Coordinate(newX, newY);

    var newKey = newCoord.toString();
    if(!(newKey in Ironwood.map)) { return; }
    
    Ironwood.display.draw(currX, currY, Ironwood.map[this.getCoord().toString()]);
    this.setCoord(newCoord);
    this.display();
    this.doAction(ACTION_MOVE);
    window.removeEventListener("keydown", this);
    Ironwood.engine.unlock();
//do next turn
  } else if(code in this._actionMap) { //We ride
    var actionCode = this._actionMap[code];

    if(actionCode == ACTION_SMOKEBOMB) {
      if(this._smokebombs == 0) { return; }
      this._smokebombs--;
      for(mob in this._map.mobsSeenBy(this)) {
        alert("Need to implement stunning");//Move mob to smokebomb'd state
      }
    } else if(actionCode == ACTION_STAIRS) {
      var stairs = this._map.getItems().itemAt(this.getCoords());
      if(!stairs || !(stairs instanceof Staircase)) {
        return;
      }
      alert("Need to implement making a new level");//Create new floor!!
      this.doAction(ACTION_STUN);
      window.removeEventListener("keydown", this);
      Ironwood.engine.unlock();
    } else if(actionCode == ACTION_REST) {
      this.doAction(ACTION_REST);
      window.removeEventListener("keydown", this);
      Ironwood.engine.unlock();
//do next turn
    } else if(actionCode == ACTION_DRAG) {
      var body = this._map.getItems().bodyNearPlayer(this);
      if(!body) { return; }
      body.setCoords(this.getCoords());
      this.doAction(ACTION_DRAG);
      window.removeEventListener("keydown", this);
      Ironwood.engine.unlock();
//do next turn
    }
    window.removeEventListener("keydown", this);
    Ironwood.engine.unlock();
  } else { //We're just smashing the keyboard
    return;
  }
}
