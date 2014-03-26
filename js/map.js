var Map = function(time) {
  this._mobs = new Mobs(); //Holds the mobs for the level
  this._time = time;
  this._sounds = {}; //Sounds is a hash based on the time tick the sound occurred at
  this._items = new Items; 
  this._pathfindingCache = {};
  this._width = 0;
  this._height = 0;
  this._tiles = {};
}

Map.prototype.getTime = function() {
  return this._time;
}

Map.prototype.inBounds = function(coords) {
  return (coords.getX() > 0 && coords.getX() < this.getWidth() - 1 &&
          coords.getY() > 0 && coords.getY() < this.getHeight() - 1);
}

Map.prototype.turn = function() {
  delete this._sounds[time.getTick() - 4]
}

Map.prototype.makeSound = function(sound) {
  var currTick = this.getTime().getTick();
  if(!sounds[currTick]) {
    sounds[currTick] = [];
  }
  sounds[currTick].push(sound);
}

Map.prototype.soundsHeardBy = function(mob) {
  var toCheck = [];
  var toReturn = [];
  for(tick in this._sounds) {
    //We want to give everyone a shot at the previous two ticks, Players get any time
    if(tick >= this.getTime().previous() || mob instanceof Player) {
      toCheck = toCheck.concat(this._sounds[tick]);
    }
  }
  for(sound in toCheck) {
    if(sound.headBy(mob)) {
      toReturn.push(sound);
    }
  }
  return toReturn;
}

Map.prototype.soundHeardByMob = function(mob) {
  var allSounds = this.soundsHeardBy(mob);
  allSounds.sort(function(a,b) {
    if(a.getPriority() < b.getPriority()) {
      return -1;
    } else if(a.getPriority() > b.getPriority()){
      return 1;
    } else {
      return 0;
    }
  });
  return allSounds[allSounds.length - 1];
}

Map.prototype.dropItem = function(item) {
  this._items.addItem(item);
}

Map.prototype.itemsSeenBy = function(mob) {
  //Fill in after we have FOV going
}

Map.prototype.mobsSeenBy = function(mob) {
  //Fill in after we have FOV going
}

Map.prototype.tile = function(coords) {
  if(!this.inBounds(coords)) { return false; }
  return this._tiles[coords.getY()][coords.getX()];
}

Map.prototype.cropTile = function(coords) {
  if(!this.inBounds(coords)) { return " "; }
  return this._tiles[coords.getY()][coords.getX()];
}

Map.prototype.blocksVisibility = function(coords) {
  return Tile.blocksVisibility(this._tiles[coords.getY()][coords.getX()]);
}

Map.prototype.blocksMovement = function(coords) {
  return Tile.blocksMovement(this._tiles[coords.getY()][coords.getX()]);
}

Map.prototype.crop = function(coords, width, height) {
  var lines = [];
  var x = coords.getX();
  var y = coords.getY();
  for(var i = y; i < (y + height - 1); i++) {
    row = "";
    for(var j = x; j < (x + width - 1); j++) {
      row += this.cropTile(coords);
    }
  }
  return lines;
}

Map.prototype.getItems = function() {
  return this._items;
}
