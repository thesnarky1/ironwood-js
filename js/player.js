var Player = function(newCoord) {
  Living.call(this, newCoord);
  this.setColor("#9999ff");
  this.setSymbol("@");
  this._smokebombs = 2;
  this.display();  

  //Store applicable keys for various inputs
  this._keyMap = {};

  //Numpad
  this._keyMap[ROT.VK_NUMPAD8] = 0;
  this._keyMap[ROT.VK_NUMPAD9] = 1;
  this._keyMap[ROT.VK_NUMPAD6] = 2;
  this._keyMap[ROT.VK_NUMPAD3] = 3;
  this._keyMap[ROT.VK_NUMPAD2] = 4;
  this._keyMap[ROT.VK_NUMPAD1] = 5;
  this._keyMap[ROT.VK_NUMPAD4] = 6;
  this._keyMap[ROT.VK_NUMPAD7] = 7;

  //VIM
  this._keyMap[ROT.VK_K] = 0;
  this._keyMap[ROT.VK_U] = 1;
  this._keyMap[ROT.VK_L] = 2;
  this._keyMap[ROT.VK_N] = 3;
  this._keyMap[ROT.VK_J] = 4;
  this._keyMap[ROT.VK_B] = 5;
  this._keyMap[ROT.VK_H] = 6;
  this._keyMap[ROT.VK_Y] = 7;
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

  if(!(code in this._keyMap)) { return; }
  var currX = this.getCoord().getX();
  var currY = this.getCoord().getY();
  var diff = ROT.DIRS[8][this._keyMap[code]];
  var newX = currX + diff[0];
  var newY = currY + diff[1];
  var newCoord = new Coordinate(newX, newY);

  var newKey = newCoord.toString();
  if(!(newKey in Ironwood.map)) { return; }
  
  Ironwood.display.draw(currX, currY, Ironwood.map[this.getCoord().toString()]);
  this.setCoord(newCoord);
  this.display();
  window.removeEventListener("keydown", this);
  Ironwood.engine.unlock();
}
