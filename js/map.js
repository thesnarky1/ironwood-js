var Map = function(time) {
  this._mobs = new Mobs(); //Holds the mobs for the level
  this._time = time;
  this._sounds = {}; //Sounds is a hash based on the time tick the sound occurred at
  this._items = new Items; 
  this._pathfindingCache = {};
  this._width = 0;
  this._height = 0;
  this._tiles = {};
  this.generate();
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
  for(var i = y; i <= (y + height - 1); i++) {
    row = "";
    for(var j = x; j <= (x + width - 1); j++) {
      row += this.cropTile(coords);
    }
  }
  return lines;
}

Map.prototype.getItems = function() {
  return this._items;
}

Map.prototype.getMobs = function() {
  return this._mobs;
}

Map.prototype.generate = function() {
  this._mobs = new Mobs();
  this._items = new Items();
  this._sounds = {};

  @rooms = [];
  this._width = this.getRandomInt(60, 100);
  this._height = this.getRandomInt(60, 100);
  this._tiles = [];
  for(var y = 0; y < this._height; y++) {
    for(var x = 0; x < this._width; x++) {
      this._tiles[y][x] = '#';
    }
  }

  var roof    = this.getRandomInt(1, this._height - MAP_GEN_MIN_DIM - 2); //So top is protected in Javascript, hence roof
  var bottom = roof + this.getRandomInt(MAP_GEN_MIN_DIM, Math.min(MAP_GEN_MAX_DIM, this._height - roof - 2));
  var left   = this.getRandomInt(1, this._width - MAP_GEN_MIN_DIM - 2);
  var right  = left + this.getRandomInt(MAP_GEN_MIN_DIM, Math.min(MAP_GEN_MAX_DIM, this._width - left - 2));

  this.digRoom(roof, bottom, left, right); //Make the first room
  
  var times = this.getRandomInt(10, 350);
  for(var i = 0; i < times; i++) {
    var from = this._rooms[this.getRandomInt(0, this._rooms.length - 1)];
    var distance = MAP_GEN_ROOM_DISTANCES[this.getRandomInt(0, MAP_GEN_ROOM_DISTANCES.length - 1)];
    switch(this.getRandomInt(0, 3)) {
      case 0: //Building off the top
        bottom = from[ROOM_TOP] - distance;
        if((bottom - MAP_GEN_MIN_DIM) > 0) {
          height = this.getRandomInt(MAP_GEN_MIN_DIM, Math.min(MAP_GEN_MAX_DIM, bottom - 1));
          roof = bottom - height;

          width = this.getRandomInt(MAP_GEN_MIN_DIM, MAP_GEN_MAX_DIM);
          left = this.getRandomInt(Math.max(1, from[ROOM_LEFT] - width), Math.min(this._width - width - 2, from[ROOM_RIGHT]));
          right = left + width;

          this.digRoom(roof, bottom, left, right); //Make the room

          //Dig a corridor between the initial room and the new room
          var x = this.getRandomInt(Math.max(left, from[ROOM_LEFT]), Math.min(right, from[ROOM_RIGHT]));
          for(var y = bottom; y <= from[ROOM_TOP]; y++) {
            this._tiles[y][x] = '.';
          }
          
          //Add a door if these rooms are technically adjacent (no room for corridor)
          if(from[ROOM_TOP] - bottom == 2 && 
             this._tiles[bottom+1][x-1] == '#' && 
             this._tiles[bottom+1][x+1] == '#') {
              this._tiles[bottom+1][x] = '+';
          }
        }
        break;
      case 1: //Building off the bottom
        roof = from[ROOM_BOTTOM] + distance;
        height = this.getRandomInt(MAP_GEN_MIN_DIM, MAP_GEN_MAX_DIM);
        bottom = top + height;
        if(bottom < this._height - 1) {

          width = this.getRandomInt(MAP_GEN_MIN_DIM, MAP_GEN_MAX_DIM);
          left = this.getRandomInt(Math.max(1, from[ROOM_LEFT] - width), Math.min(this._width - width - 2, from[ROOM_RIGHT]));
          right = left + width;

          this.digRoom(roof, bottom, left, right); //Make the room

          //Dig a corridor between the initial room and the new room
          var x = this.getRandomInt(Math.max(left, from[ROOM_LEFT]), Math.min(right, from[ROOM_RIGHT]));
          for(var y = from[ROOM_BOTTOM]; y <= roof; y++) {
            this._tiles[y][x] = '.';
          }
          
          //Add a door if these rooms are technically adjacent (no room for corridor)
          if(roof - from[ROOM_BOTTOM] == 2 && 
             this._tiles[roof-1][x-1] == '#' && 
             this._tiles[roof-1][x+1] == '#') {
              this._tiles[roof-1][x] = '+';
          }
        }
        break;
      case 2: //Building off the left
        right = from[ROOM_LEFT] - distance;
        width = this.getRandomInt(MAP_GEN_MIN_DIM, MAP_GEN_MAX_DIM);
        left = right - width;
        if(left > 0) {
          height = this.getRandomInt(MAP_GEN_MIN_DIM, MAP_GEN_MAX_DIM);
          roof = this.getRandomInt(Math.max(1, from[ROOM_TOP] - height), Math.min(this._height - height - 2, from[ROOM_BOTTOM]));
          bottom = roof + height;

          this.digRoom(roof, bottom, left, right);
          var y = this.getRandomInt(Math.max(roof, from[ROOM_TOP]), Math.min(bottom, from[ROOM_BOTTOM]));
          for(var x = right; x <= from[ROOM_LEFT]; x++) {
            this._tiles[y][x] = '.';
          }
          if(from[ROOM_LEFT] - right == 2 &&
             this._tiles[y][right + 1] == '#' &&
             this._tiles[y][right - 1] == '#') {
              this._tiles[y][right] = '+';
          }
        }
        break;
      case 3: //Building off the right
        left = from[ROOM_RIGHT] + distance;
        width = width = this.getRandomInt(MAP_GEN_MIN_DIM, MAP_GEN_MAX_DIM);
        right = left + width;
        if(right < this._width - 1) {
          height = this.getRandomInt(MAP_GEN_MIN_DIM, MAP_GEN_MAX_DIM);
          roof = this.getRandomInt(Math.max(1, from[ROOM_TOP] - height), Math.min(this._height - height - 2, from[ROOM_BOTTOM]));
          bottom = roof + height;
          
          this.digRoom(roof, bottom, left, right);
          var y = this.getRandomInt(Math.max(roof, from[ROOM_TOP]), Math.min(bottom, from[ROOM_BOTTOM]));
          for(var x = from[ROOM_RIGHT]; x <= left; x++) {
            this._tiles[y][x] = '.';
          }
          if(left - from[ROOM_RIGHT] == 2 &&
             this._tiles[y][left - 1] == '#' &&
             this._tiles[y][left + 1] == '#') {
              this._tiles[y][left] = '+';
          }
        }
        break;
    }
  }

}

Map.prototype.addGuardGuarding = function(guardCoords) {
  var newCoords = new Coordinate(-1,-1);
  var tries = 0;
  while(!this.available(newCoords)) {
    newCoords.setCoords(guardCoords.getX() + this.getRandomInt(-5, 5),
                        guardCoords.getY() + this.getRandomInt(-5, 5));
    if(tries++ > 20) {
      return;
    }
  }
  var guard = new Guard(this, newCoords,DIR_N);
  guard.setDirection(guard.directionTo(guardCoords)); //Need to write the directionTo code
  this._mobs.addMob(guard);
}

Map.prototype.getRandomInt(min, max) {
  return Math.floor(ROT.RNG.getUniform() * (max - min + 1)) + min;
}

Map.prototype.available = function(coords) {
  return (this.inBounds(coords) && this.tile(coords) == '.' && 
          !this.getMobs().mobAt(coords) && !this.getItems().itemAt(coords));
}

Map.prototype.digRoom = function(roof, bottom, left, right) {
  //Check to make sure everything we're digging is a wall
  for(var y = left; y <= right; y++) {
    for(var x = roof; x <= bottom; x++) {
      if(this._tiles[y][x] != '#') {
        return;
      }
    }
  }
  //Remove all walls and fill with floor
  for(var y = left; y <= right; y++) {
    for(var x = roof; x <= bottom; x++) {
      this._tiles[y][x] = '.';
    }
  }

  this.addRoom([roof, bottom, left, right]);
}

//Should be an array of type [top, bottom, left, right]
Map.prototype.addRoom = function(newRoom) {
  this._rooms.push(newRoom);
}
