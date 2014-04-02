//Class to handle everything that lives and moves, be it friend or foe
var Living = function(map, coord, direction) {
  Displayable.call(this, map, coord);
  this._direction = direction;
  this._fov = new ROT.FOV.RecursiveShadowcasting(this.buildLightPassesCallback(this.getMap()));
  this._lastActions = [];
  this._currentVision = new FieldOfView(this instanceof Player);
  this.calculateFOV();
}
  
Living.extend(Displayable);

//
//Direction related function
//
Living.prototype.setDirection = function(newDirection) {
  this._direction = newDirection;
  this.calculateFOV();
}

Living.prototype.getDirection = function() {
  return this._direction;
}

Living.prototype.directionTo = function(coords) {
  var dx = 0;
  var dy = 0;
  if(coords.getX() > this.getX()) { dx = 1;  }
  if(coords.getX() < this.getX()) { dx = -1; }
  if(coords.getY() > this.getY()) { dy = 1;  }
  if(coords.getY() < this.getY()) { dy = -1; }
  for(var x = 0; x < ROT.DIRS[8].length; x++) {
    if(ROT.DIRS[8][x][0] == dx && ROT.DIRS[8][x][1] == dy) {
      return x;
    }
  }
  return 0; //<-- If something's jacked, face north. It'll save you every time
}

//
//FOV-related function
//
Living.prototype.getFOV = function() {
  return this._currentVision;
}

Living.prototype.buildLightPassesCallback = function(map) {
  var result = function(x, y) {
    var coords = new Coordinate(x, y);
    return map.inBounds(coords) && !map.blocksVisibility(coords);
  };
  return result;
}

Living.prototype.buildFOVCallback = function(toStore) {
  var result = function(x, y, vis) {
    var coord = new Coordinate(x, y);
    toStore.setTile(coord, vis);
  };
  return result;
}

Living.prototype.calculateFOV = function() {
  this._currentVision.clearSeen();
  this._fov.compute90(this.getX(), this.getY(), this.getViewRadius(), this.getDirection(), this.buildFOVCallback(this.getFOV()));
}

Living.prototype.getViewRadius = function() {
  if(this instanceof Player) { return PLAYER_VIEW_RADIUS; }
  if(this instanceof Guard)  { return GUARD_VIEW_RADIUS;  }
  return 0; //If you're not a player and not a guard, what are you doing in my dungeon?
}

//
//Action-related functions
//
Living.prototype.doAction = function(action) {
  if(action == ACTION_REST) {
    this._lastActions = [];
  } else {
    this._lastActions.push(action);
  }
  while(this._lastActions.length > 5) {
    this._lastActions.shift();
  }
  if(action == ACTION_DRAG && this.noiseCount() >= 3) {
    this._map.makeSound(new Sound(this, ACTION_DRAG, this.getMap().getTime().getTick()));
  }
  if(action == ACTION_MOVE && 
     ((this instanceof Player) && this.noiseCount() >= 5) ||
     (!(this instanceof Player) && this.noiceCount() >= 3)) {
      this._map.makeSound(new Sound(this, ACTION_RUN, this.getMap().getTime().getTick()));
  }
}

Living.prototype.running = function() {
  if(this._lastActions.length == 5) {
    for(action in this._lastActions) {
      if(action != ACTON_MOVE) { return false; }
    }
    return true;
  } else {
    return false;
  }
}

Living.prototype.noiseCount = function() {
  var noise = 0;
  for(var x = 0; x < this._lastActions.length; x++) {
    if(this._lastActions[x] == ACTION_MOVE) {
      noise += 1;
    } else if(this._lastActions[x] == ACTION_DRAG) {
      noise += 2;
    }
  }
  return noise;
}
