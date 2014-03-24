var Player = function(newCoord) {
  Living.call(this, newCoord);
  this.setColor("#9999ff");
  this.setSymbol("@");
  this._smokebombs = 2;
  this.display();  
}

Player.extend(Living);

Player.prototype.onNewMap = function() { //Finish out this function once levels are implemented
  this._smokebombs += 1;
}

