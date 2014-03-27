//This class holds the list of mobs on a given level
var Mobs = function() {
  this._mobs = [];
}

Mobs.prototype.getMobs = function() {
  return this._mobs;
}

Mobs.prototype.enemies = function() {
  var toReturn = [];
  for(var x = 0; x < this._mobs.length; x++) {
    if(!(this._mobs[x] instanceof Player)) {
      toReturn.push(this._mobs[x]);
    }
  }
  return toReturn;
}

Mobs.prototype.player = function() {
  if(this.hasMobs()) {
    for(var x = 0; x < this._mobs.length; x++) {
      if(this._mobs[x] instanceof Player) {
        return this._mobs[x];
      }
    }
  }
  return false;
}

Mobs.prototype.mobAt = function(coord) {
  if(this.hasMobs()) {
    for(var x = 0; x < this._mobs.length; x++) {
      if(this._mobs[x].getCoord().equals(coord)) {
        return this._mobs[x];
      }
    }
  }
  return false;
}

Mobs.prototype.mobAtPlayer = function() {
  var player = this.player();
  if(!player) { return false; }
  return this.mobAt(player.getCoord());
}

Mobs.prototype.updateFOV = function() {
  if(this.hasMobs()) {
    for(var x = 0; x < this._mobs.length; x++) {
      //FOV code goes here
    }
  }
}

Mobs.prototype.addMob = function(newMob) {
  this._mobs.push(newMob);
}

Mobs.prototype.deleteMob = function(toDelete) {
  if(this.hasMobs()) {
    for(var x = 0; x < this._mobs.length; x++) {
      if(this._mobs[x] == toDelete) {
        this._mobs.splice(x,1);
      }
    }
  }
}

Mobs.prototype.hasMobs = function() {
  return this._mobs.length > 0
}
