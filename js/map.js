var Map = function(time) {
  this._mobs = new Mobs(); //Holds the mobs for the level
  this._time = time;
  this._sounds = {}; //Sounds is a hash based on the time tick the sound occurred at
  this._items = new Items; 
  this._pathfindingCache = {};
  this._tiles = new TileSet(1,1,'');;
  this.generate();
}

Map.prototype.getHeight = function() {
  return this.getTiles().getHeight();
}

Map.prototype.getWidth = function() {
  return this.getTiles().getHeight();
}

Map.prototype.getTiles = function() {
  return this._tiles;
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
  return this.getTiles().get(coords);
}

Map.prototype.cropTile = function(coords) {
  if(!this.inBounds(coords)) { return " "; }
  return this.getTiles().get(coords);
}

Map.prototype.blocksVisibility = function(coords) {
  return Tile.blocksVisibility(this.getTiles().get(coords));
}

Map.prototype.blocksMovement = function(coords) {
  return Tile.blocksMovement(this.getTiles(coords));
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

  var rooms = [];
  startingWidth = this.getRandomInt(60, 100);
  startingHeight = this.getRandomInt(60, 100);
  this._tiles = new TileSet(startingWidth, startingHeight, '#');

  var roof    = this.getRandomInt(1, this.getHeight() - MAP_GEN_MIN_DIM - 2); //So top is protected in Javascript, hence roof
  var bottom = roof + this.getRandomInt(MAP_GEN_MIN_DIM, Math.min(MAP_GEN_MAX_DIM, this.getHeight() - roof - 2));
  var left   = this.getRandomInt(1, this.getWidth() - MAP_GEN_MIN_DIM - 2);
  var right  = left + this.getRandomInt(MAP_GEN_MIN_DIM, Math.min(MAP_GEN_MAX_DIM, this.getWidth() - left - 2));

  this.digRoom(new Coordinate(left, roof), new Coordinate(right, bottom)); //Make the first room
  
  //Dig more rooms
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
          left = this.getRandomInt(Math.max(1, from[ROOM_LEFT] - width), Math.min(this.getWidth() - width - 2, from[ROOM_RIGHT]));
          right = left + width;

          this.digRoom(new Coordinate(left, roof), new Coordinate(right, bottom)); //Make the room

          //Dig a corridor between the initial room and the new room
          var x = this.getRandomInt(Math.max(left, from[ROOM_LEFT]), Math.min(right, from[ROOM_RIGHT]));
          this.setTiles(new Coordinate(x, bottom), new Coordinate(x, from[ROOM_TOP]), '.');

          //Add a door if these rooms are technically adjacent (no room for corridor)
          if(from[ROOM_TOP] - bottom == 2 && 
             this.checkTile(new Coordinate(x-1, bottom+1), '#') && 
             this.checkTile(new Coordinate(x+1, bottom+1), '#')) {
              this.setTile(new Coordinate(x, bottom+1), '+');
          }
        }
        break;
      case 1: //Building off the bottom
        roof = from[ROOM_BOTTOM] + distance;
        height = this.getRandomInt(MAP_GEN_MIN_DIM, MAP_GEN_MAX_DIM);
        bottom = roof + height;
        if(bottom < this.getHeight() - 1) {

          width = this.getRandomInt(MAP_GEN_MIN_DIM, MAP_GEN_MAX_DIM);
          left = this.getRandomInt(Math.max(1, from[ROOM_LEFT] - width), Math.min(this.getWidth() - width - 2, from[ROOM_RIGHT]));
          right = left + width;

          this.digRoom(new Coordinate(left, roof), new Coordinate(right, bottom)); //Make the room

          //Dig a corridor between the initial room and the new room
          var x = this.getRandomInt(Math.max(left, from[ROOM_LEFT]), Math.min(right, from[ROOM_RIGHT]));
          this.setTiles(new Coordinate(x, from[ROOM_BOTTOM]), new Coordinate(x, roof), '.');
          
          //Add a door if these rooms are technically adjacent (no room for corridor)
          if(roof - from[ROOM_BOTTOM] == 2 && 
             this.checkTile(new Coordinate(x-1,roof-1), '#') && 
             this.checkTile(new Coordinate(x+1,roof-1),'#')) {
              this.setTile(new Coordinate(x,roof-1),'+');
          }
        }
        break;
      case 2: //Building off the left
        right = from[ROOM_LEFT] - distance;
        width = this.getRandomInt(MAP_GEN_MIN_DIM, MAP_GEN_MAX_DIM);
        left = right - width;
        if(left > 0) {
          height = this.getRandomInt(MAP_GEN_MIN_DIM, MAP_GEN_MAX_DIM);
          roof = this.getRandomInt(Math.max(1, from[ROOM_TOP] - height), Math.min(this.getHeight() - height - 2, from[ROOM_BOTTOM]));
          bottom = roof + height;

          this.digRoom(new Coordinate(left, roof), new Coordinate(right, bottom));
          var y = this.getRandomInt(Math.max(roof, from[ROOM_TOP]), Math.min(bottom, from[ROOM_BOTTOM]));
          this.setTiles(new Coordinate(right, y), new Coordinate(from[ROOM_LEFT], y), '.');

          if(from[ROOM_LEFT] - right == 2 &&
             this.checkTile(new Coordinate(right+1,y), '#') &&
             this.checkTile(new Coordinate(right-1,y), '#')) {
              this.setTile(new Coordinate(right,y), '+');
          }
        }
        break;
      case 3: //Building off the right
        left = from[ROOM_RIGHT] + distance;
        width = width = this.getRandomInt(MAP_GEN_MIN_DIM, MAP_GEN_MAX_DIM);
        right = left + width;
        if(right < this.getWidth() - 1) {
          height = this.getRandomInt(MAP_GEN_MIN_DIM, MAP_GEN_MAX_DIM);
          roof = this.getRandomInt(Math.max(1, from[ROOM_TOP] - height), Math.min(this.getHeight() - height - 2, from[ROOM_BOTTOM]));
          bottom = roof + height;
          
          this.digRoom(new Coordinate(left, roof), new Coordinate(right, bottom));
          var y = this.getRandomInt(Math.max(roof, from[ROOM_TOP]), Math.min(bottom, from[ROOM_BOTTOM]));
          this.setTiles(new Coordinate(from[ROOM_RIGHT], y), new Coordinate(left, y), '.');

          if(left - from[ROOM_RIGHT] == 2 &&
             this.checkTile(new Coordinate(left-1,y), '#') &&
             this.checkTile(new Coordinate(left+1,y), '#')) {
              this.setTile(new Coordinate(left,y), '+');
          }
        }
        break;
    }
  }

  //Remove unneeded rows and columns, essentially butt everything up against the edge of the map if possible
  var leftMost  = this.getWidth();
  var rightMost = 0;
  var upperMost = this.getHeight();
  var lowerMost = 0;
  for(room in this._rooms) {
    if(room[ROOM_LEFT]  < leftMost)  { leftMost  = room[ROOM_LEFT];  }
    if(room[ROOM_RIGHT] > rightMost) { rightMost = room[ROOM_RIGHT]; }
    if(room[ROOM_TOP]   < upperMost) { upperMost = room[ROOM_TOP];   }
    if(room[ROOM_BOTTOM]> lowerMost) { lowerMost = room[ROOM_BOTTOM];}
  }
  
  //Kill off the row one to above of our lowermost room until it's the final wall
  var rowToKill = lowerMost + 1;
  for(var x = 0; x < this.getheight() - rowToKill - 1; x++) {
    this.getTiles().removeRow(rowToKill);
  }

  //Kill off the row one below the top until the uppermost room touches it
  var rowToKill = 1;
  for(var x = 0; x < upperMost - 1; x++) {
    this.getTiles().removeRow(rowToKill);
  }

  //Kill off the column one to the right of our rightmost room until it's the final wall
  var columnToKill = rightMost + 1;
  for(var x = 0; x < this.getWidth() - columnToKill - 1; x++) {
    this.getTiles().removeColumn(columnToKill);
  }

  //Kill off the column one to the right of our left side until the leftmost room touches it
  var columnToKill = 1;
  for(var x = 0; x < leftMost - 1; x++) {
    this.getTiles().removeColumn(columnToKill);
  }

  //Drop staircase (142)
  var tmpCoords = new Coordinate(0,0);
  while(!this.available(tmpCoords)) {
    tmpCoords.setCoords(this.getRandomInt(0, this.getWidth() - 1), this.getRandomInt(0, this.getHeight() - 1));
  }
  this.dropItem(new Staircase(this, tmpCoords));

  //Drop treasure (149)
  var treasureNum = this.getRandomInt(60, 90);
  for(var x = 0; x < treasureNum; x++) {
    var tmpCoords = new Coordinate(this.getRandomInt(1, this.getWidth() - 2), this.getRandomInt(1, this.getHeight() - 2));
    if(this.avilable(tmpCoords)) {
      this.dropItem(new Treasure(this, tmpCoords));
      if(this.getRandomInt(0,3) == 0) {
        this.addGuardGuarding(tmpCoords);
      }
    }
  }

  //Drop guards (161)
  var guardNum = this.getRandomInt(10, 20);
  for(var x = 0; x < guardNum; x++) {
    var tmpCoords = this.getAvailableSpot();
    this.addMob(new Guard(this, tmpCoords, this.getRandomInt(0, 7)));
  }

  //Drop guards guarding guards (169)
  var guardGuardsNum = this.getRandomInt(3, 80);
  for(var x = 0; x < guardGuardsNum; x++) {
    var potentialMobs = this.getMobs().getMobs();
    this.addGuardGuarding(potentialMobs[this.getRandomInt(0, potentialMobs.length - 1)]);
  }

  //Add patrols (177)
  var patrolNum = this.getRandomInt(2, 10);
  for(var x = 0; x < patrolNum; x++) {
    var potentialMobs = this.getMobs().getMobs();
    var mob = potentialMobs[this.getRandomInt(0, potentialMobs.length - 1)];
    var patrolRadius = 30;
    var tmpCoords = new Coordinate(this.getRandomInt(mob.getX() - patrolRadius, mob.getX() + patrolRadius), 
                                   this.getRandomInt(mob.getY() - patrolRadius, mob.getY() + patrolRadius));
    while(!this.available(tmpCoords)) {
      tmpCoords = new Coordinate(this.getRandomInt(mob.getX() - patrolRadius, mob.getX() + patrolRadius), 
                                 this.getRandomInt(mob.getY() - patrolRadius, mob.getY() + patrolRadius));
    }
    //order patrol to this location... need to write that code
  }
  
  //Add trapdoors (188)
  var trapdoorNum = this.getRandomInt(2, 5);
  for(var x = 0; x < trapdoorNum; x++) {
    var tmpCoords = this.getAvailableSpot();
    this.dropItem(new Trapdoor(this, tmpCoords));
  }
}

Map.prototype.addPlayer = function(player) {
  var tmpCoords = this.getAvailableSpot();
  //Make a hole for our hero
  for(var y = Math.max(0, tmpCoords.getY() - 8); y <= Math.max(this.getHeight() - 1, tmpCoords.getY() + 8); y++) {
    for(var x = Math.max(0, tmpCoords.getX() - 8); x <= Math.max(this.getWidth() - 1, tmpCoords.getX() + 8); x++) {
      if(this._mobs.mobAt(new Coordinate(x, y))) {
        this._mobs.deleteMob(mob);
      }
    }
  }
  //Add the player
  this.addMob(player);
  return tmpCoords;
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
  var guard = new Guard(this, newCoords, DIR_N);
  guard.setDirection(guard.directionTo(guardCoords)); //Need to write the directionTo code
  this.addMob(guard);
}

Map.prototype.getRandomInt(min, max) {
  return Math.floor(ROT.RNG.getUniform() * (max - min + 1)) + min;
}

Map.prototype.available = function(coords) {
  return (this.inBounds(coords) && 
          this.getTiles().checkTile(coords, '.') && 
          !this.getMobs().mobAt(coords) && 
          !this.getItems().itemAt(coords));
}

Map.prototype.digRoom = function(upperLeft, lowerRight) {
  //Check to make sure everything we're digging is a wall
  if(this.getTiles().checkTiles(upperLeft, lowerRight, '#')) {
    this.getTiles().setTiles(upperLeft, lowerRight, '.';
    this.addRoom([upperLeft.getY(), lowerRight.getY(), upperLeft.getX(), lowerRight.getX()]);
  }
}

//Should be an array of type [top, bottom, left, right]
Map.prototype.addRoom = function(newRoom) {
  this._rooms.push(newRoom);
}

Map.prototype.addMob = function(mob) {
  this._mobs.addMob(mob);
}

Map.prototype.setTile = function(coords, symbol) {
  this.getTiles().setTile(coords, symbol);
}

Map.prototype.setTiles = function(startCoords, endCoords, symbol) {
  this.getTiles().setTiles(startCoords, endCoords, symbol);
}

Map.prototype.getAvailableSpot = function() {
  var tmpCoords = new Coordinate(this.getRandomInt(1,this.getWidth() - 2), 
                                 this.getRandomInt(1,this.getHeight() - 2);
  while(!this.available(tmpCoords)) {
    tmpCoords = new Coordinate(this.getRandomInt(1,this.getWidth() - 2), 
                               this.getRandomInt(1,this.getHeight() - 2);
  }
  return tmpCoords;
}
