var Player = function(map, coord) {
  Living.call(this, map, coord);
  this.setColor("#9999ff");
  this.setSymbol("@");
  this._smokebombs = 2;
  this.display();  

  //Store applicable keys for various inputs
  this._keyMap = {};

  //Numpad
  this._keyMap[ROT.VK_NUMPAD8] = DIR_N;
  this._keyMap[ROT.VK_NUMPAD9] = DIR_NE;
  this._keyMap[ROT.VK_NUMPAD6] = DIR_E;
  this._keyMap[ROT.VK_NUMPAD3] = DIR_SE;
  this._keyMap[ROT.VK_NUMPAD2] = DIR_S;
  this._keyMap[ROT.VK_NUMPAD1] = DIR_SW;
  this._keyMap[ROT.VK_NUMPAD4] = DIR_W;
  this._keyMap[ROT.VK_NUMPAD7] = DIR_NW;

  //VIM
  this._keyMap[ROT.VK_K] = DIR_N;
  this._keyMap[ROT.VK_U] = DIR_NE;
  this._keyMap[ROT.VK_L] = DIR_E;
  this._keyMap[ROT.VK_N] = DIR_SE;
  this._keyMap[ROT.VK_J] = DIR_S;
  this._keyMap[ROT.VK_B] = DIR_SW;
  this._keyMap[ROT.VK_H] = DIR_W;
  this._keyMap[ROT.VK_Y] = DIR_NW;
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
