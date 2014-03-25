//This class holds the list of mobs on a given level
var Mobs = function() {
  this._mobs = [];
}

Mobs.prototype.getMobs = function() {
  return this._mobs;
}

Mobs.prototype.enemies = function() {
  var toReturn = [];
  for(mob in this._mobs) {
    if(!(mob instanceof Player)) {
      toReturn.push(mob);
    }
  }
  return toReturn;
}

Mobs.prototype.player = function() {
  for(mob in this._mobs) {
    if(mob instanceof Player) {
      return mob;
    }
  }
  return false;
}

Mobs.prototype.mobAt = function(coord) {
  for(mob in this._mobs) {
    if(mob.getCoord().equals(coord)) {
      return mob;
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
  for(mob in this._mobs) {
    //FOV code goes here
  }
}
