//This class holds the list of mobs on a given level
var Mobs = function() {
  MapCollection.call(this);
}

Mobs.extend(MapCollection);

Mobs.prototype.getMobs = function() {
  return this.getObjects();
}

Mobs.prototype.enemies = function() {
  var toReturn = [];
  var mobs = this.getMobs();
  for(var x = 0; x < mobs.length; x++) {
    if(!(mobs[x] instanceof Player)) {
      toReturn.push(mobs[x]);
    }
  }
  return toReturn;
}

Mobs.prototype.player = function() {
  if(this.hasMobs()) {
    var mobs = this.getMobs();
    for(var x = 0; x < mobs.length; x++) {
      if(mobs[x] instanceof Player) {
        return mobs[x];
      }
    }
  }
  return false;
}

Mobs.prototype.mobAt = function(coord) {
  return this.objectAt(coord);
}

Mobs.prototype.mobAtPlayer = function() {
  var player = this.player();
  if(!player) { return false; }
  return this.mobAt(player.getCoord());
}

Mobs.prototype.updateFOV = function() {
  if(this.hasMobs()) {
    var mobs = this.getMobs();
    for(var x = 0; x < mobs.length; x++) {
      //FOV code goes here
    }
  }
}

Mobs.prototype.addMob = function(newMob) {
  this.addObject(newMob);
}

Mobs.prototype.deleteMob = function(toDelete) {
  return this.deleteObject(toDelete);
}

Mobs.prototype.hasMobs = function() {
  return this.hasObjects();
}
