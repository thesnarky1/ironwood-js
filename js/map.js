var Map = function(game, time) {
  this._cleanUp();
  this._game = game;
  this._mobs = new Mobs(); //Holds the mobs for the level
  this._time = time;
  this._sounds = new Sounds(this.getTime()); //Sounds is a hash based on the time tick the sound occurred at
  this._items = new Items; 
  this._pathfindingCache = {};
  this._tiles = new TileSet(1,1,'');
  this._rooms = [];
  this.generate();
  Ironwood.display.clear();
}

//
//Variable getters/setters
//
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

Map.prototype.getItems = function() {
  return this._items;
}

Map.prototype.getMobs = function() {
  return this._mobs;
}

Map.prototype.getSounds = function() {
  return this._sounds;
}

//
//Game dynamics functions
//
Map.prototype.turn = function() {
  //console.log("Calling new turn");
  var timeToDelete = this._time.getTick() - SOUND_DURATION;
  var deletedSoundCoords = this.getSounds().deleteSoundsAt(timeToDelete);

  //Redraw the tiles each sound was on to erase them from our view
  //Need to do this manually since we're not redrawing the entire screen every time
  for(var x = 0; x < deletedSoundCoords.length; x++) {
    var soundCoord = deletedSoundCoords[x];
    this.displayTile(soundCoord);
  }
  this.getGame().getTime().advance();
  this.display();
  this.getGame().displayStatus();
}

//
//Sound functions
//
Map.prototype.makeSound = function(sound) {
  this.getSounds().addSound(sound);
  this.displayTile(sound.getCoord(), true);
}

//
//Item functions
//
Map.prototype.dropItem = function(item) {
  this._items.addItem(item);
}

Map.prototype.itemsSeenBy = function(mob) {
  //Fill in after we have FOV going
}

//
//Mob functions
//
Map.prototype.mobsSeenBy = function(mob) {
  //Fill in after we have FOV going
}

//
//Tile functions
//
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

Map.prototype.inBounds = function(coords) {
  //console.log("Checking in bounds for " + coords);
  return (coords.getX() > 0 && coords.getX() < this.getWidth() - 1 &&
          coords.getY() > 0 && coords.getY() < this.getHeight() - 1);
}

Map.prototype.checkTile = function(coords, symbol) {
  //console.log("Map check tile function "  + coords + symbol);
  return this.getTiles().checkTile(coords, symbol);
}

Map.prototype.available = function(coords) {
  //console.log("Checking " + coords);
  return (this.inBounds(coords) &&
          this.checkTile(coords, Tile.FLOOR) && 
          !this.getMobs().mobAt(coords) && 
          !this.getItems().itemAt(coords));
}

Map.prototype.setTile = function(coords, symbol) {
  this.getTiles().setTile(coords, symbol);
}

Map.prototype.setTiles = function(startCoords, endCoords, symbol) {
  this.getTiles().setTiles(startCoords, endCoords, symbol);
}

//
//Map display functions
//
Map.prototype.crop = function(coords, width, height) { //This function may die, not sure I'll need it
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
  //console.log("Starting map display");

  //Grab our FOV to check everything
  var playerFOV = this.getGame().getPlayer().getFOV();

  //Var to keep track of the FOV viewsheds we'll add on
  var enemyViewsheds = {};

  //Find out what tiles will be within mob views
  //MAN this has to be able to be simplified!!!
  if(this.getMobs().hasMobs()) {
    var mobs = this.getMobs().getMobs();
    for(var x = 0; x < mobs.length; x++) {
      var mobCoords = mobs[x].getCoord();
      var mobFOV = mobs[x].getFOV().allSeen();
      var mobColor = mobs[x].getColor();
      if(!(mobs[x] instanceof Player) && playerFOV.tileSeen(mobCoords)) { //We don't want to color everything the player touchesand we only want to see the FOV if we can see the guard

        //Iterate through the Mob's field of vision
        for(var i = 0; i < mobFOV.length; i++) {
          //Only worry about it if we can see it
          if(playerFOV.tileSeen(mobFOV[i])) {
            //if it's not in there or raging we'll put it in
            if(!enemyViewsheds[mobFOV[i]] || mobColor == GUARD_RAGING_COLOR) {
              enemyViewsheds[mobFOV[i]] = mobColor;

              //Otherwise, if it's in there as the lowest color we can add it and it'll trump whatever
            } else if(enemyViewsheds[mobFOV[i]] == GUARD_STUNNED_COLOR) { 
                enemyViewsheds[mobFOV[i]] = mobColor;
            }
          }
        }
      }
    }
  }

  //This should speed up display
  //Rather than loop over all tiles and check them, only loop over tiles we know the player has seen
  //Als, instead of redrawing tiles inside the fg of war, draw them as they transition to fog of war and leave them
  var tilesToCheck = playerFOV.getPreviousAndCurrent();
  for(x = 0; x < tilesToCheck.length; x++) {
    var coord = tilesToCheck[x];
    var toDisplay = this.getTiles().get(coord);
    var color = "grey";
    if(playerFOV.tileSeen(coord)) {
      if(enemyViewsheds[coord]) {
        color = enemyViewsheds[coord];
      } else {
        color = "white";
      }
    }
    this._displayWithOffsetXY(coord.getX(), coord.getY(), toDisplay, color);
  }

  //console.log("Displaying items");
  //Then display the items
  if(this.getItems().hasItems()) {
    var items = this.getItems().getItems();
    for(var x = 0; x < items.length; x++) {
      var itemCoord = items[x].getCoord();
      var itemColor = items[x].getColor();
      var itemSymbol = items[x].getSymbol();
      if(playerFOV.tileSeen(itemCoord)) {
        this._displayWithOffset(itemCoord, itemSymbol, itemColor);
      }
    }
  }

  //console.log("Displaying sounds");
  var playerSounds = this.getSounds().soundsHeardBy(this.getGame().getPlayer());
  for(var x = 0; x < playerSounds.length; x++) {
    var sound = playerSounds[x];
    this._displayWithOffset(sound.getCoord(), SOUND_TILE, SOUND_COLOR);
  }

  //console.log("Displaying mobs");
  //Then display the mobs
  if(this.getMobs().hasMobs()) {
    var mobs = this.getMobs().getMobs();
    for(var x = 0; x < mobs.length; x++) {
      var mobFOV = mobs[x].getFOV();
      var mobCoord = mobs[x].getCoord();
      var mobSymbol = mobs[x].getSymbol();
      var mobColor = mobs[x].getColor();
      if(playerFOV.tileSeen(mobCoord)) {
        this._displayWithOffset(mobCoord, mobSymbol, mobColor);
      }
    }
  } 
}

//This function is the one we want to call every time we have to update a time. 
//It'll handle the logic of inside/outside FOV, and figure out the proper orde to display stuff in
//evenOutsideFOV is how we'll tell this function to display regardless of the player's FOV
Map.prototype.displayTile = function(coords, evenOutsideFOV) {
  //Check to see if we have a mob
  //  if so, is it within the FOV? 
  //    If so, display and back out
  //
  //Check to see if we have a sound
  //  who cares if it's in FOV, this trumps, display it and back out
  //
  //Check to see if we have an item
  //  if so, is it within the FOV? 
  //    If so, display and back out
  //  
  //Render the map tile
  //  if so, is it within the FOV? 
  //    If so, display and back out
  //    If not, check to see if the player ever saw it
  //      If not, ignore
  //  
  var mob = this.getMobs().mobAt(coords);
  if(mob) {
    //console.log("Display Tile displaying mob tile");
    var mobColor = mob.getColor();
    var mobSymbol = mob.getSymbol();
    //<---Need to check FOV here
    this._displayWithOffset(coords, mobSymbol, mobColor);
    return;
  }

  var playerSounds = this.getSounds().soundsHeardBy(this.getGame().getPlayer());
  for(var x = 0; x < playerSounds.length; x++) {
    var sound = playerSounds[x];
    if(sound.getCoord().equals(coords)) {
      //console.log("Display Tile displaying sound tile");
      this._displayWithOffset(sound.getCoord(), SOUND_TILE, SOUND_COLOR);
      return;
    }
  }

  //Then display the items
  var item = this.getItems().itemAt(coords);
  if(item) {
    //console.log("Display Tile displaying item tile");
    var itemColor = item.getColor();
    var itemSymbol = item.getSymbol();
    //<---Need to check FOV here
    this._displayWithOffset(coords, itemSymbol, itemColor);
    return;
  }

  //Finally, display the map
  var toDisplay = this.getTiles().get(coords);
  //console.log("Display Tile displaying map tile");
  //<--- Need to check FOV here to determine color
  this._displayWithOffset(coords, toDisplay);

}

//
//Map generation function
//
Map.prototype.generate = function() {
  this._mobs = new Mobs();
  this._items = new Items();
  this._rooms = [];

  startingWidth = ROT.RNG.getUniformInt(MAP_GEN_MAP_MIN_WIDTH, MAP_GEN_MAP_MAX_WIDTH);
  startingHeight = ROT.RNG.getUniformInt(MAP_GEN_MAP_MIN_HEIGHT, MAP_GEN_MAP_MAX_HEIGHT);
  this._tiles = new TileSet(startingWidth, startingHeight, Tile.WALL);

  //this._tiles.debug();

  //console.log("Digging first room");
  var firstPlaced = false;
  var roof = 0;
  var bottom = 0;
  var left = 0;
  var right = 0;
  while(!firstPlaced) { //While loop to ensure we place the first room, otherwise everything blows up
    roof   = ROT.RNG.getUniformInt(1, 
                               this.getHeight() - MAP_GEN_MIN_ROOM_DIM - 2);
    bottom = roof + ROT.RNG.getUniformInt(MAP_GEN_MIN_ROOM_DIM, 
                                      Math.min(MAP_GEN_MAX_ROOM_DIM, this.getHeight() - roof - 2));
    left   = ROT.RNG.getUniformInt(1, 
                               this.getWidth() - MAP_GEN_MIN_ROOM_DIM - 2);
    right  = left + ROT.RNG.getUniformInt(MAP_GEN_MIN_ROOM_DIM, 
                                      Math.min(MAP_GEN_MAX_ROOM_DIM, this.getWidth() - left - 2));
    firstPlaced = this.digRoom(new Coordinate(left, roof), new Coordinate(right, bottom));
  }
  
  //Dig more rooms
  var times = ROT.RNG.getUniformInt(MAP_GEN_MIN_ROOMS, MAP_GEN_MAX_ROOMS); //350 is real time....
  for(var i = 0; i < times; i++) {
    //console.log("Digging room " + i + " of " + times);

    var from = this.getRandomRoom();

    var distance = MAP_GEN_ROOM_DISTANCES[ROT.RNG.getUniformInt(0, MAP_GEN_ROOM_DISTANCES.length - 1)];
    //console.log("Distance: " + distance);

    switch(ROT.RNG.getUniformInt(0, 3)) {
      case 0: //Building off the top
        bottom = from[ROOM_TOP] - distance;
        if((bottom - MAP_GEN_MIN_ROOM_DIM) > 0) {
          height = ROT.RNG.getUniformInt(MAP_GEN_MIN_ROOM_DIM, Math.min(MAP_GEN_MAX_ROOM_DIM, bottom - 1));
          roof = bottom - height;

          width = ROT.RNG.getUniformInt(MAP_GEN_MIN_ROOM_DIM, MAP_GEN_MAX_ROOM_DIM);
          left = ROT.RNG.getUniformInt(Math.max(1, from[ROOM_LEFT] - width), Math.min(this.getWidth() - width - 2, from[ROOM_RIGHT]));
          right = left + width;

          this.digRoom(new Coordinate(left, roof), new Coordinate(right, bottom)); //Make the room
          //Note, this may not actually dig the room. 
          //If digRoom fails, the code continues because that gives us awesome little alcoves for hiding
        
          //Dig a corridor between the initial room and the new room
          var x = ROT.RNG.getUniformInt(Math.max(left, from[ROOM_LEFT]), Math.min(right, from[ROOM_RIGHT]));
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
        height = ROT.RNG.getUniformInt(MAP_GEN_MIN_ROOM_DIM, MAP_GEN_MAX_ROOM_DIM);
        bottom = roof + height;
        if(bottom < this.getHeight() - 1) {

          width = ROT.RNG.getUniformInt(MAP_GEN_MIN_ROOM_DIM, MAP_GEN_MAX_ROOM_DIM);
          left = ROT.RNG.getUniformInt(Math.max(1, from[ROOM_LEFT] - width), Math.min(this.getWidth() - width - 2, from[ROOM_RIGHT]));
          right = left + width;

          this.digRoom(new Coordinate(left, roof), new Coordinate(right, bottom)); //Make the room

          //Dig a corridor between the initial room and the new room
          var x = ROT.RNG.getUniformInt(Math.max(left, from[ROOM_LEFT]), Math.min(right, from[ROOM_RIGHT]));
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
        width = ROT.RNG.getUniformInt(MAP_GEN_MIN_ROOM_DIM, MAP_GEN_MAX_ROOM_DIM);
        left = right - width;
        if(left > 0) {
          height = ROT.RNG.getUniformInt(MAP_GEN_MIN_ROOM_DIM, MAP_GEN_MAX_ROOM_DIM);
          roof = ROT.RNG.getUniformInt(Math.max(1, from[ROOM_TOP] - height), Math.min(this.getHeight() - height - 2, from[ROOM_BOTTOM]));
          bottom = roof + height;

          this.digRoom(new Coordinate(left, roof), new Coordinate(right, bottom));
          var y = ROT.RNG.getUniformInt(Math.max(roof, from[ROOM_TOP]), Math.min(bottom, from[ROOM_BOTTOM]));
          this.setTiles(new Coordinate(right, y), new Coordinate(from[ROOM_LEFT], y), Tile.FLOOR);

          if(from[ROOM_LEFT] - right == 2 &&
             this.checkTile(new Coordinate(right+1,y-1), Tile.WALL) &&
             this.checkTile(new Coordinate(right+1,y+1), Tile.WALL)) {
              this.setTile(new Coordinate(right+1,y), Tile.DOOR);
          }
        }
        break;
      case 3: //Building off the right
        left = from[ROOM_RIGHT] + distance;
        width = ROT.RNG.getUniformInt(MAP_GEN_MIN_ROOM_DIM, MAP_GEN_MAX_ROOM_DIM);
        right = left + width;
        if(right < this.getWidth() - 1) {
          height = ROT.RNG.getUniformInt(MAP_GEN_MIN_ROOM_DIM, MAP_GEN_MAX_ROOM_DIM);
          roof = ROT.RNG.getUniformInt(Math.max(1, from[ROOM_TOP] - height), Math.min(this.getHeight() - height - 2, from[ROOM_BOTTOM]));
          bottom = roof + height;
          
          this.digRoom(new Coordinate(left, roof), new Coordinate(right, bottom));
          var y = ROT.RNG.getUniformInt(Math.max(roof, from[ROOM_TOP]), Math.min(bottom, from[ROOM_BOTTOM]));
          this.setTiles(new Coordinate(from[ROOM_RIGHT], y), new Coordinate(left, y), Tile.FLOOR);

          if(left - from[ROOM_RIGHT] == 2 &&
             this.checkTile(new Coordinate(left-1,y-1), Tile.WALL) &&
             this.checkTile(new Coordinate(left-1,y+1), Tile.WALL)) {
              this.setTile(new Coordinate(left-1,y), Tile.DOOR);
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
  var treasureNum = ROT.RNG.getUniformInt(MAP_GEN_TREASURE_MIN, MAP_GEN_TREASURE_MAX); //original is 60-90
  for(var x = 0; x < treasureNum; x++) {
    var tmpCoords = this.getAvailableSpot();
    if(tmpCoords) {
      this.dropItem(new Treasure(this, tmpCoords));
      if(ROT.RNG.getUniformInt(0,3) == 0) {
        this.addGuardGuarding(tmpCoords);
      }
    } else { console.log("Error placing treasure"); }
  }

  //Drop guards (161)
  //console.log("Adding guards");
  var guardNum = ROT.RNG.getUniformInt(MAP_GEN_GUARD_MIN, MAP_GEN_GUARD_MAX);
  for(var x = 0; x < guardNum; x++) {
    var tmpCoords = this.getAvailableSpot();
    if(tmpCoords) {
      this.addMob(new Guard(this, tmpCoords, ROT.RNG.getUniformInt(0, 7)));
    } else { console.log("Error placing guard"); }
  }

  /*for(var x = 0; x < 5; x++) {
    var tmpGuard = this.getRandomMob();
    tmpGuard.setState(GUARD_RAGING);
  }
  for(var x = 0; x < 5; x++) {
    var tmpGuard = this.getRandomMob();
    tmpGuard.setState(GUARD_STUNNED);
  }*/

  //Drop guards guarding guards (169)
  //console.log("Adding guards guarding guards");
  var guardGuardsNum = ROT.RNG.getUniformInt(MAP_GEN_GUARD_GUARDS_MIN, MAP_GEN_GUARD_GUARDS_MAX);
  for(var x = 0; x < guardGuardsNum; x++) {
    var toGuard = this.getRandomMob();
    if(toGuard) { this.addGuardGuarding(toGuard); }
  }

  //Add patrols (177)
  //console.log("Adding patrols");
  var patrolNum = ROT.RNG.getUniformInt(MAP_GEN_PATROL_MIN, MAP_GEN_PATROL_MAX);
  for(var x = 0; x < patrolNum; x++) {
    var mob = this.getRandomMob();
    if(mob) {
      var tmpCoords = this.getAvailableWithinRadius(mob.getCoord(), GUARD_PATROL_RADIUS);
      //order patrol to this location... need to write that code
    }
  }
  
  //Add trapdoors (188)
  //console.log("Adding trapdoors");
  var trapdoorNum = ROT.RNG.getUniformInt(MAP_GEN_TRAPDOOR_MIN, MAP_GEN_TRAPDOOR_MAX);
  for(var x = 0; x < trapdoorNum; x++) {
    var tmpCoords = this.getAvailableSpot();
    if(tmpCoords) {
      this.dropItem(new Trapdoor(this, tmpCoords));
    } else { console.log("Error placing trapdoor"); }
  }
}

Map.prototype.getRandomRoom = function() {
  if(this._rooms.length == 0) { return false; }
  return this._rooms[ROT.RNG.getUniformInt(0, this._rooms.length - 1)];
}

Map.prototype.getRandomMob = function() {
  var potentialMobs = this.getMobs().getMobs();
  if(potentialMobs.length == 0) { return false; }
  var mob = potentialMobs[ROT.RNG.getUniformInt(0, potentialMobs.length - 1)];
  return mob;
}

Map.prototype.addPlayer = function(player) {
  //Add the player
  this.addMob(player);
}

Map.prototype.makeAHole = function() {
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
        Ironwood.getScheduler().remove(mob);
        this._mobs.deleteMob(mob);
      }
    }
  }
  return tmpCoords;
}

Map.prototype.addGuardGuarding = function(guardCoords) {
  var newCoords = new Coordinate(-1,-1);
  var tries = 0;
  while(!this.available(newCoords)) {
    var range = MAP_GEN_GUARD_GUARDS_RANGE / 2;
    newCoords.setCoords(guardCoords.getX() + ROT.RNG.getUniformInt(0 - range, range),
                        guardCoords.getY() + ROT.RNG.getUniformInt(0 - range, range));
    if(tries++ > 20) {
      return;
    }
  }
  var guard = new Guard(this, newCoords, DIR_N);
  guard.setDirection(guard.directionTo(guardCoords)); //Need to write the directionTo code
  this.addMob(guard);
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
  Ironwood.getScheduler().add(mob, true);
  this.getMobs().addMob(mob);
}

Map.prototype.getAvailableSpot = function() {
  //We want to get out if it takes too long
  var tries = 0;

  //Grab an available room to place in (saves a TON of time checking massive amounts of wall)
  var tmpRoom = this.getRandomRoom();
  var roomUpperLeft = new Coordinate(tmpRoom[ROOM_LEFT], tmpRoom[ROOM_TOP]);
  var roomLowerRight = new Coordinate(tmpRoom[ROOM_RIGHT], tmpRoom[ROOM_BOTTOM]);
  var tmpCoords = new Coordinate(ROT.RNG.getUniformInt(roomUpperLeft.getX(),roomLowerRight.getX()), 
                                 ROT.RNG.getUniformInt(roomUpperLeft.getY(),roomLowerRight.getY()));
  while(!this.available(tmpCoords) && tries < MAP_GEN_AVAILABLE_TRIES) {
    tmpCoords = new Coordinate(ROT.RNG.getUniformInt(roomUpperLeft.getX(),roomLowerRight.getX()), 
                               ROT.RNG.getUniformInt(roomUpperLeft.getY(),roomLowerRight.getY()));
    tries++;
  }
  if(tries == MAP_GEN_AVAILABLE_TRIES) { console.log("We failed"); return false; }
  return tmpCoords;
}

Map.prototype.getAvailableWithinRadius = function(coords, radius) {
  //We want to get out if it takes too long
  var tries = 0;

  var tmpCoords = new Coordinate(ROT.RNG.getUniformInt(coords.getX() - radius, coords.getX() + radius), 
                                 ROT.RNG.getUniformInt(coords.getY() - radius, coords.getY() + radius));
  while(!this.available(tmpCoords) && tries < MAP_GEN_AVAILABLE_TRIES) {
    tmpCoords = new Coordinate(ROT.RNG.getUniformInt(coords.getX() - radius, coords.getX() + radius), 
                               ROT.RNG.getUniformInt(coords.getY() - radius, coords.getY() + radius));
    tries++;
  }

  if(tries == MAP_GEN_AVAILABLE_TRIES) { return false; }
  return tmpCoords;
}

//Clean up clean up everybody everywhere
Map.prototype._cleanUp = function() {
  Ironwood.getScheduler().clear();
}
