var Map = function(game, time) {
  this._game = game;
  this._mobs = new Mobs(); //Holds the mobs for the level
  this._time = time;
  this._sounds = {}; //Sounds is a hash based on the time tick the sound occurred at
  this._items = new Items; 
  this._pathfindingCache = {};
  this._tiles = new TileSet(1,1,'');
  this._rooms = [];
  this.generate();
}

Map.prototype.getGame = function() {
  return this._game;
}

Map.prototype.getHeight = function() {
  return this.getTiles().getHeight();
}

Map.prototype.getWidth = function() {
  return this.getTiles().getWidth();
}

Map.prototype.getTiles = function() {
  return this._tiles;
}

Map.prototype.getTime = function() {
  return this._time;
}

Map.prototype.inBounds = function(coords) {
  //console.log("Checking in bounds for " + coords);
  return (coords.getX() > 0 && coords.getX() < this.getWidth() - 1 &&
          coords.getY() > 0 && coords.getY() < this.getHeight() - 1);
}

Map.prototype.turn = function() {
  //console.log("Calling new turn");
  var timeToDelete = this._time.getTick() - SOUND_DURATION;
  var soundsToBeDeleted = this._sounds[timeToDelete];

  if(soundsToBeDeleted) {

    //Redraw the tiles each sound was on to erase them from our view
    //Need to do this manually since we're not redrawing the entire screen every time
    for(var x = 0; x < soundsToBeDeleted.length; x++) {
      var sound = soundsToBeDeleted[x];
      var soundCoord = sound.getCoord();
      delete soundsToBeDeleted[x];
      //console.log("Displaying a tile for a sound to be deleted");
      this.displayTile(soundCoord);
    }

    delete this._sounds[timeToDelete];
  }
  this.getGame().getTime().advance();
  this.getGame().displayStatus();
}

Map.prototype.makeSound = function(sound) {
  var currTick = this.getTime().getTick();
  if(!this._sounds[currTick]) {
    this._sounds[currTick] = [];
  }
  this._sounds[currTick].push(sound);
  //We need to update the location of the sound to display it
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
  //console.log(toCheck);
  for(var x = 0; x < toCheck.length; x++) {
    sound = toCheck[x];
    if(sound && sound.heardBy(mob)) {
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
  if(!this.inBounds(coords)) { return Tile.CROPPED; }
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
  this._rooms = [];

  startingWidth = this.getRandomInt(MAP_GEN_MAP_MIN_WIDTH, MAP_GEN_MAP_MAX_WIDTH);
  startingHeight = this.getRandomInt(MAP_GEN_MAP_MIN_HEIGHT, MAP_GEN_MAP_MAX_HEIGHT);
  this._tiles = new TileSet(startingWidth, startingHeight, Tile.WALL);

  //this._tiles.debug();

  //console.log("Digging first room");
  var firstPlaced = false;
  var roof = 0;
  var bottom = 0;
  var left = 0;
  var right = 0;
  while(!firstPlaced) { //While loop to ensure we place the first room, otherwise everything blows up
    roof   = this.getRandomInt(1, 
                               this.getHeight() - MAP_GEN_MIN_ROOM_DIM - 2);
    bottom = roof + this.getRandomInt(MAP_GEN_MIN_ROOM_DIM, 
                                      Math.min(MAP_GEN_MAX_ROOM_DIM, this.getHeight() - roof - 2));
    left   = this.getRandomInt(1, 
                               this.getWidth() - MAP_GEN_MIN_ROOM_DIM - 2);
    right  = left + this.getRandomInt(MAP_GEN_MIN_ROOM_DIM, 
                                      Math.min(MAP_GEN_MAX_ROOM_DIM, this.getWidth() - left - 2));
    firstPlaced = this.digRoom(new Coordinate(left, roof), new Coordinate(right, bottom));
  }
  
  //Dig more rooms
  var times = this.getRandomInt(MAP_GEN_MIN_ROOMS, MAP_GEN_MAX_ROOMS); //350 is real time....
  for(var i = 0; i < times; i++) {
    //console.log("Digging room " + i + " of " + times);

    var from = this.getRandomRoom();

    var distance = MAP_GEN_ROOM_DISTANCES[this.getRandomInt(0, MAP_GEN_ROOM_DISTANCES.length - 1)];
    //console.log("Distance: " + distance);

    switch(this.getRandomInt(0, 3)) {
      case 0: //Building off the top
        bottom = from[ROOM_TOP] - distance;
        if((bottom - MAP_GEN_MIN_ROOM_DIM) > 0) {
          height = this.getRandomInt(MAP_GEN_MIN_ROOM_DIM, Math.min(MAP_GEN_MAX_ROOM_DIM, bottom - 1));
          roof = bottom - height;

          width = this.getRandomInt(MAP_GEN_MIN_ROOM_DIM, MAP_GEN_MAX_ROOM_DIM);
          left = this.getRandomInt(Math.max(1, from[ROOM_LEFT] - width), Math.min(this.getWidth() - width - 2, from[ROOM_RIGHT]));
          right = left + width;

          this.digRoom(new Coordinate(left, roof), new Coordinate(right, bottom)); //Make the room
          //Note, this may not actually dig the room. 
          //If digRoom fails, the code continues because that gives us awesome little alcoves for hiding
        
          //Dig a corridor between the initial room and the new room
          var x = this.getRandomInt(Math.max(left, from[ROOM_LEFT]), Math.min(right, from[ROOM_RIGHT]));
          this.setTiles(new Coordinate(x, bottom), new Coordinate(x, from[ROOM_TOP]), Tile.FLOOR);

          //Add a door if these rooms are technically adjacent (no room for corridor)
          if(from[ROOM_TOP] - bottom == 2 && 
             this.checkTile(new Coordinate(x-1, bottom+1), Tile.WALL) && 
             this.checkTile(new Coordinate(x+1, bottom+1), Tile.WALL)) {
              this.setTile(new Coordinate(x, bottom+1), Tile.DOOR);
          }
        }
        break;
      case 1: //Building off the bottom
        roof = from[ROOM_BOTTOM] + distance;
        height = this.getRandomInt(MAP_GEN_MIN_ROOM_DIM, MAP_GEN_MAX_ROOM_DIM);
        bottom = roof + height;
        if(bottom < this.getHeight() - 1) {

          width = this.getRandomInt(MAP_GEN_MIN_ROOM_DIM, MAP_GEN_MAX_ROOM_DIM);
          left = this.getRandomInt(Math.max(1, from[ROOM_LEFT] - width), Math.min(this.getWidth() - width - 2, from[ROOM_RIGHT]));
          right = left + width;

          this.digRoom(new Coordinate(left, roof), new Coordinate(right, bottom)); //Make the room

          //Dig a corridor between the initial room and the new room
          var x = this.getRandomInt(Math.max(left, from[ROOM_LEFT]), Math.min(right, from[ROOM_RIGHT]));
          this.setTiles(new Coordinate(x, from[ROOM_BOTTOM]), new Coordinate(x, roof), Tile.FLOOR);
          
          //Add a door if these rooms are technically adjacent (no room for corridor)
          if(roof - from[ROOM_BOTTOM] == 2 && 
             this.checkTile(new Coordinate(x-1,roof-1), Tile.WALL) && 
             this.checkTile(new Coordinate(x+1,roof-1), Tile.WALL)) {
              this.setTile(new Coordinate(x,roof-1),Tile.DOOR);
          }
        }
        break;
      case 2: //Building off the left
        right = from[ROOM_LEFT] - distance;
        width = this.getRandomInt(MAP_GEN_MIN_ROOM_DIM, MAP_GEN_MAX_ROOM_DIM);
        left = right - width;
        if(left > 0) {
          height = this.getRandomInt(MAP_GEN_MIN_ROOM_DIM, MAP_GEN_MAX_ROOM_DIM);
          roof = this.getRandomInt(Math.max(1, from[ROOM_TOP] - height), Math.min(this.getHeight() - height - 2, from[ROOM_BOTTOM]));
          bottom = roof + height;

          this.digRoom(new Coordinate(left, roof), new Coordinate(right, bottom));
          var y = this.getRandomInt(Math.max(roof, from[ROOM_TOP]), Math.min(bottom, from[ROOM_BOTTOM]));
          this.setTiles(new Coordinate(right, y), new Coordinate(from[ROOM_LEFT], y), Tile.FLOOR);

          if(from[ROOM_LEFT] - right == 2 &&
             this.checkTile(new Coordinate(right+1,y), Tile.WALL) &&
             this.checkTile(new Coordinate(right-1,y), Tile.WALL)) {
              this.setTile(new Coordinate(right,y), Tile.DOOR);
          }
        }
        break;
      case 3: //Building off the right
        left = from[ROOM_RIGHT] + distance;
        width = width = this.getRandomInt(MAP_GEN_MIN_ROOM_DIM, MAP_GEN_MAX_ROOM_DIM);
        right = left + width;
        if(right < this.getWidth() - 1) {
          height = this.getRandomInt(MAP_GEN_MIN_ROOM_DIM, MAP_GEN_MAX_ROOM_DIM);
          roof = this.getRandomInt(Math.max(1, from[ROOM_TOP] - height), Math.min(this.getHeight() - height - 2, from[ROOM_BOTTOM]));
          bottom = roof + height;
          
          this.digRoom(new Coordinate(left, roof), new Coordinate(right, bottom));
          var y = this.getRandomInt(Math.max(roof, from[ROOM_TOP]), Math.min(bottom, from[ROOM_BOTTOM]));
          this.setTiles(new Coordinate(from[ROOM_RIGHT], y), new Coordinate(left, y), Tile.FLOOR);

          if(left - from[ROOM_RIGHT] == 2 &&
             this.checkTile(new Coordinate(left-1,y), Tile.WALL) &&
             this.checkTile(new Coordinate(left+1,y), Tile.WALL)) {
              this.setTile(new Coordinate(left,y), Tile.DOOR);
          }
        }
        break;
    }
  }

  //Trim down the map to only store what we have to
  var trimOffset = this._tiles.trimTo(Tile.WALL); 
  for(var x = 0; x < this._rooms.length; x++) {
    this._rooms[x][ROOM_TOP]    = this._rooms[x][ROOM_TOP] - trimOffset.getY();
    this._rooms[x][ROOM_BOTTOM] = this._rooms[x][ROOM_BOTTOM] - trimOffset.getY();
    this._rooms[x][ROOM_LEFT]   = this._rooms[x][ROOM_LEFT] - trimOffset.getX();
    this._rooms[x][ROOM_RIGHT]  = this._rooms[x][ROOM_RIGHT] - trimOffset.getX();
  }

  //Drop staircase (142)
  //console.log("Adding staircase");
  var tmpCoords = this.getAvailableSpot();
  if(tmpCoords) {
    this.dropItem(new Staircase(this, tmpCoords));
  } else {
    console.log("Never found a valid place for the staircase");
  }

  //Drop treasure (149)
  //console.log("Adding treasure");
  var treasureNum = this.getRandomInt(MAP_GEN_TREASURE_MIN, MAP_GEN_TREASURE_MAX); //original is 60-90
  for(var x = 0; x < treasureNum; x++) {
    var tmpCoords = this.getAvailableSpot();
    if(tmpCoords) {
      this.dropItem(new Treasure(this, tmpCoords));
      if(this.getRandomInt(0,3) == 0) {
        this.addGuardGuarding(tmpCoords);
      }
    } else { console.log("Error placing treasure"); }
  }

  //Drop guards (161)
  //console.log("Adding guards");
  var guardNum = this.getRandomInt(MAP_GEN_GUARD_MIN, MAP_GEN_GUARD_MAX);
  for(var x = 0; x < guardNum; x++) {
    var tmpCoords = this.getAvailableSpot();
    if(tmpCoords) {
      this.addMob(new Guard(this, tmpCoords, this.getRandomInt(0, 7)));
    } else { console.log("Error placing guard"); }
  }

  //Drop guards guarding guards (169)
  //console.log("Adding guards guarding guards");
  var guardGuardsNum = this.getRandomInt(MAP_GEN_GUARD_GUARDS_MIN, MAP_GEN_GUARD_GUARDS_MAX);
  for(var x = 0; x < guardGuardsNum; x++) {
    var toGuard = this.getRandomMob();
    if(toGuard) { this.addGuardGuarding(toGuard); }
  }

  //Add patrols (177)
  //console.log("Adding patrols");
  var patrolNum = this.getRandomInt(MAP_GEN_PATROL_MIN, MAP_GEN_PATROL_MAX);
  for(var x = 0; x < patrolNum; x++) {
    var mob = this.getRandomMob();
    if(mob) {
      var tmpCoords = this.getAvailableWithinRadius(mob.getCoord(), GUARD_PATROL_RADIUS);
      //order patrol to this location... need to write that code
    }
  }
  
  //Add trapdoors (188)
  //console.log("Adding trapdoors");
  var trapdoorNum = this.getRandomInt(MAP_GEN_TRAPDOOR_MIN, MAP_GEN_TRAPDOOR_MAX);
  for(var x = 0; x < trapdoorNum; x++) {
    var tmpCoords = this.getAvailableSpot();
    if(tmpCoords) {
      this.dropItem(new Trapdoor(this, tmpCoords));
    } else { console.log("Error placing trapdoor"); }
  }
}

Map.prototype.checkTile = function(coords, symbol) {
  //console.log("Map check tile function "  + coords + symbol);
  return this.getTiles().checkTile(coords, symbol);
}

Map.prototype.addPlayer = function(player) {
  var tmpCoords = this.getAvailableSpot();
  while(!tmpCoords) {
    tmpCoords = this.getAvailableSpot();
  }
  //Make a hole for our hero
  for(var y = Math.max(0, tmpCoords.getY() - MAP_GEN_PLAYER_HOLE_SIZE); 
      y <= Math.max(this.getHeight() - 1, tmpCoords.getY() + MAP_GEN_PLAYER_HOLE_SIZE); 
      y++) {
    for(var x = Math.max(0, tmpCoords.getX() - MAP_GEN_PLAYER_HOLE_SIZE); 
        x <= Math.max(this.getWidth() - 1, tmpCoords.getX() + MAP_GEN_PLAYER_HOLE_SIZE); 
        x++) {
      var mob = this._mobs.mobAt(new Coordinate(x, y));
      if(mob) {
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
    var range = MAP_GEN_GUARD_GUARDS_RANGE / 2;
    newCoords.setCoords(guardCoords.getX() + this.getRandomInt(0 - range, range),
                        guardCoords.getY() + this.getRandomInt(0 - range, range));
    if(tries++ > 20) {
      return;
    }
  }
  var guard = new Guard(this, newCoords, DIR_N);
  guard.setDirection(guard.directionTo(guardCoords)); //Need to write the directionTo code
  this.addMob(guard);
}

Map.prototype.getRandomInt = function(min, max) {
  return Math.floor(ROT.RNG.getUniform() * (max - min + 1)) + min;
}

Map.prototype.available = function(coords) {
  //console.log("Checking " + coords);
  return (this.inBounds(coords) &&
          this.checkTile(coords, Tile.FLOOR) && 
          !this.getMobs().mobAt(coords) && 
          !this.getItems().itemAt(coords));
}

Map.prototype.digRoom = function(upperLeft, lowerRight) {
  //Check to make sure everything we're digging is a wall
  //console.log("Dig Room: " + upperLeft + " " + lowerRight);
  if(this.getTiles().checkTiles(upperLeft, lowerRight, Tile.WALL)) {
    //console.log("Room checks out!");
    this.getTiles().setTiles(upperLeft, lowerRight, Tile.FLOOR);
    this.addRoom([upperLeft.getY(), lowerRight.getY(), upperLeft.getX(), lowerRight.getX()]);
    return true;
  } else {
    //console.log("Something blocked the placement of this room");
    return false;
  }
}

//Should be an array of type [top, bottom, left, right]
Map.prototype.addRoom = function(newRoom) {
  //console.log("Add room: " + newRoom);
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
  //We want to get out if it takes too long
  var tries = 0;

  //Grab an available room to place in (saves a TON of time checking massive amounts of wall)
  var tmpRoom = this.getRandomRoom();
  var roomUpperLeft = new Coordinate(tmpRoom[ROOM_LEFT], tmpRoom[ROOM_TOP]);
  var roomLowerRight = new Coordinate(tmpRoom[ROOM_RIGHT], tmpRoom[ROOM_BOTTOM]);

  var tmpCoords = new Coordinate(this.getRandomInt(roomUpperLeft.getX(),roomLowerRight.getX()), 
                                 this.getRandomInt(roomUpperLeft.getY(),roomLowerRight.getY()));

  while(!this.available(tmpCoords) && tries < MAP_GEN_AVAILABLE_TRIES) {
    tmpCoords = new Coordinate(this.getRandomInt(roomUpperLeft.getX(),roomLowerRight.getX()), 
                               this.getRandomInt(roomUpperLeft.getY(),roomLowerRight.getY()));
    tries++;
  }
  if(tries == MAP_GEN_AVAILABLE_TRIES) { return false; }
  return tmpCoords;
}

Map.prototype.getAvailableWithinRadius = function(coords, radius) {
  //We want to get out if it takes too long
  var tries = 0;

  var tmpCoords = new Coordinate(this.getRandomInt(coords.getX() - radius, coords.getX() + radius), 
                                 this.getRandomInt(coords.getY() - radius, coords.getY() + radius));
  while(!this.available(tmpCoords) && tries < MAP_GEN_AVAILABLE_TRIES) {
    tmpCoords = new Coordinate(this.getRandomInt(coords.getX() - radius, coords.getX() + radius), 
                               this.getRandomInt(coords.getY() - radius, coords.getY() + radius));
    tries++;
  }

  if(tries == MAP_GEN_AVAILABLE_TRIES) { return false; }
  return tmpCoords;
}

Map.prototype._displayWithOffsetXY = function(x, y, symbol, color, bgColor) {
  var player = this.getGame().getPlayer();

  //Centering the map on the screen allows us to look pretty but not have to redraw the map everytime
  //as if we centered on the player
  var dx = parseInt((IRONWOOD_WIDTH - this.getWidth()) / 2);
  var dy = parseInt((IRONWOOD_HEIGHT - this.getHeight()) / 2);
  Ironwood.display.draw(x + dx + MAP_X_OFFSET, y + dy + MAP_Y_OFFSET, symbol, color, bgColor);
}

Map.prototype._displayWithOffset = function(coords, symbol, color, bgColor) {
  this._displayWithOffsetXY(coords.getX(), coords.getY(), symbol, color, bgColor);
}

Map.prototype.display = function() {
  //Clear it
  Ironwood.display.clear();

  //First display the map, offset y by 1 to allow for scoreboard up top
  for(y = 0; y < this.getHeight(); y++) {
    for(x = 0; x < this.getWidth(); x++) {
      var toDisplay = this.getTiles().getXY(x,y);
      if(false) {
        if(x == 0) { toDisplay = y%10; }
        if(y == 0) { toDisplay = x%10; }
      }
      this._displayWithOffsetXY(x, y, toDisplay);
    }
  }

  //Then display the items
  if(this.getItems().hasItems()) {
    var items = this.getItems().getItems();
    for(var x = 0; x < items.length; x++) {
      var itemCoord = items[x].getCoord();
      var itemColor = items[x].getColor();
      var itemSymbol = items[x].getSymbol();
      this._displayWithOffset(itemCoord, itemSymbol, itemColor);
      //Ironwood.display.draw(itemCoord.getX() + MAP_X_OFFSET, itemCoord.getY() + MAP_Y_OFFSET, itemSymbol, itemColor);
    }
  }

  //Then display the mobs
  if(this.getMobs().hasMobs()) {
    var mobs = this.getMobs().getMobs();
    for(var x = 0; x < mobs.length; x++) {
      var mobCoord = mobs[x].getCoord();
      var mobSymbol = mobs[x].getSymbol();
      var mobColor = mobs[x].getColor();
      this._displayWithOffset(mobCoord, mobSymbol, mobColor);
      //Ironwood.display.draw(mobCoord.getX() + MAP_X_OFFSET, mobCoord.getY() + MAP_Y_OFFSET, mobSymbol, mobColor);
    }
  }
}

Map.prototype.displayTile = function(coords) {
  //First display the map, offset y by 1 to allow for scoreboard up top
  var toDisplay = this.getTiles().get(coords);
  //console.log("Display Tile displaying map tile");
  this._displayWithOffset(coords, toDisplay);

  //Then display the items
  var item = this.getItems().itemAt(coords);
  if(item) {
    //console.log("Display Tile displaying item tile");
    var itemColor = item.getColor();
    var itemSymbol = item.getSymbol();
    this._displayWithOffset(coords, itemSymbol, itemColor);
  }

  var playerSounds = this.soundsHeardBy(this.getGame().getPlayer());
  for(var x = 0; x < playerSounds.length; x++) {
    var sound = playerSounds[x];
    if(sound.getCoord().equals(coords)) {
      //console.log("Display Tile displaying sound tile");
      this._displayWithOffset(sound.getCoord(), SOUND_TILE, SOUND_COLOR);
    }
  }

  //Then display the mobs
  var mob = this.getMobs().mobAt(coords);
  if(mob) {
    //console.log("Display Tile displaying mob tile");
    var mobColor = mob.getColor();
    var mobSymbol = mob.getSymbol();
    this._displayWithOffset(coords, mobSymbol, mobColor);
  }
}

Map.prototype.getRandomRoom = function() {
  if(this._rooms.length == 0) { return false; }
  return this._rooms[this.getRandomInt(0, this._rooms.length - 1)];
}

Map.prototype.getRandomMob = function() {
  var potentialMobs = this.getMobs().getMobs();
  if(potentialMobs.length == 0) { return false; }
  var mob = potentialMobs[this.getRandomInt(0, potentialMobs.length - 1)];
  return mob;
}
