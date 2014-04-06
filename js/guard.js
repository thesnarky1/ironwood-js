var Guard = function(map, coord, direction) {
  Living.call(this, map, coord, direction);
  this.setColor("#9990ff"); //Doesn't really matter since we override getColor() below
  this.setSymbol("G");
  this._postCoord = coord;
  this._postDirection = direction;
  this._destinationCoord = null;
  this._patrolCoord = null;
  this.setStun(0);
  this.setState(GUARD_GUARDING);
  this._guardWalkingState = GUARD_WALKING_WALK;
  this._guardPeekingState = GUARD_PEEKING_LEFT;
}

Guard.extend(Living);

//Functions to get/set stun
Guard.prototype.getStun = function() {
  return this._stun;
}

Guard.prototype.setStun = function(newStun) {
  this._stun = newStun;
}

Guard.prototype.stunRemaining = function() {
  currStun = this.getStun();
  if(currStun > 0) {
    this.setStun(currStun - 1);
  }
  return (this.getStun() > 0);
}

Guard.prototype.stun = function() {
  this.setStun(9 + this.getStun());
  this.setState(GUARD_STUNNED);
}

//Overriding the usual Displabale getColor to allow for different states
Guard.prototype.getColor = function() {
  var currState = this.getState();
  if(currState == GUARD_RAGING || currState == GUARD_HUNTING) {
    return GUARD_RAGING_COLOR;
  } else if(currState == GUARD_STUNNED) {
    return GUARD_STUNNED_COLOR;
  } else {
    return GUARD_NORMAL_COLOR;
  }
}

//Gets the guard's state for the eventual state machine
Guard.prototype.getState = function() {
  return this._state;
}

//Gets the guard's state for the eventual state machine
Guard.prototype.setState = function(newState) {
  this._state = newState;
}

//Destination functions
Guard.prototype.getDestination = function() {
  return this._destinationCoord;
}

//Destination functions
Guard.prototype.setDestination = function(newDestination) {
  this._destinationCoord = newDestination;
}

Guard.prototype.atDestination = function() {
  return (this.getX() == this.getDestination().getX() && this.getY() == this.getDestination().getY());
}

Guard.prototype.haveDestination = function() {
  return (this._destinationCoord != null);
}

Guard.prototype.decideArrived = function() {
  switch(this.getState()) {
    case GUARD_STUNNED:
      if(this.getStun() > 0) { return false; }
      if(this.haveDestination()) {
        //order walk to destination
      } else if(!this.atPost()) {
        //order walk to post
      } else {
        this.setState(GUARD_GUARDING);
      }
      break;
    case GUARD_RAGING:
      if(!this.atDestination()) { return false; }
      //This seems overpowered that guards automaticlly learn the player's location when they lose them
      this.setDestination(this.getMap().getGame().getPlayer().getCoord());
      this.setState(GUARD_HUNTING);
      break;
    case GUARD_HUNTING:
      if(!this.atDestination()) { return false; }
      this.setState(GUARD_WALKING);
      this.setDestination(this.getPost());
      break;
    case GUARD_WALKING:
      if(!this.atDestination()) { return false; }
      if(this.atPost()) {
        if(this.patrolling()) {

          //order walk to patrol coords
        } else {
          this.setDirection(this.getPostDirection());
          //stand guard
        }
      } else {
        //order walk to post
      }
      break;
  }
}

//Post functions
Guard.prototype.getPost = function() {
  return this._postCoord;
}

Guard.prototype.getPostDirection = function() {
  return this._postDirection;
}

Guard.prototype.atPost = function() {
  return (this.getX() == this.getPost().getX() && this.getY() == this.getPost().getY());
}

Guard.prototype.havePost = function() {
  return (this._postCoord != null);
}

//Patrol function
Guard.prototype.patrolling = function() {
  return (this._patrolCoord != null);
}

Guard.prototype.getViewRadius = function() {
  return GUARD_VIEW_RADIUS;
}

Guard.prototype.checkFOVForPlayer = function() {
  if(this.seeOtherMob(this.getMap().getGame().getPlayer())) {
    this.setDestination(this.getMap().getGame().getPlayer().getCoord());
  }
}

//
//Action function
//
Guard.prototype.act = function() {
  var playerCoord = this.getMap().getGame().getPlayer().getCoord();
  var guardCoord = this.getCoord();
  Ironwood.engine.lock();

  //This will make sure we do the appropriate action
  this.decideState();
  switch(this.getState()) {
    case GUARD_GUARDING:
      //walk around all quiet like
      break;
    case GUARD_STUNNED:
      //Not doing anything
      break;
    case GUARD_HUNTING:
      this.walkTowards(this.getDestination());
      this.checkFOVForPlayer();
      break;
    case GUARD_YELLING:
      this.getMap().makeSound(new Sound(this, ACTION_YELL, this.getMap().getTime().getTick()));
      this.setState(GUARD_HUNTING);
      break;
    case GUARD_RAGING:
      this.getMap().makeSound(new Sound(this, ACTION_YELL, this.getMap().getTime().getTick()));
      this.walkTowards(this.getDestination());
      this.checkFOVForPlayer();
      break;
    case GUARD_WALKING:
      if(this._guardWalkingState == GUARD_WALKING_WALK) {
        this.walkTowards(this.getDestination());
        this.checkFOVForPlayer();
        this._guardWalkingState = GUARD_WALKING_REST;
      } else if (this._guardWalkingState == GUARD_WALKING_REST) {
        this.doAction(ACTION_REST);
        var dir = this.directionTo(this.getDestination());
        this.setDirection(this.directionOffset(dir, this._guardPeekingState));
        this._guardPeekingState *= -1;
        this._guardWalkingState = GUARD_WALKING_WALK;
      }
      break;
  }
  Ironwood.engine.unlock();
}

Guard.prototype.directionOffset = function(dir, offset) {
  return (dir + offset + 8) % 8;
}

Guard.prototype.yell = function() {
  console.log("Yelling!");
  this.setState(GUARD_YELLING);
}

Guard.prototype.decideState = function() {
  if(this.stunRemaining()) { return; }
  if(this.spotPlayer())    { return; }
  if(this.seeBody())       { return; }
  if(this.hearSomething()) { return; }
  if(this.getState() == GUARD_GUARDING) { return; }
 
  this.decideArrived();
}

Guard.prototype.hearSomething = function() {
  if(this.getState() == GUARD_HUNTING) {
    return false;
  }
  var sound = this.getMap().getSounds().soundHeardByMob(this);
  if(sound) {
    this.setDestination(sound.getCoord());
    this.setState(GUARD_HUNTING);
    return true;
  }
  return false;
}

Guard.prototype.seeBody = function() {
  var toCheck = this.getMap().itemsSeenBy(this);
  for(var x = 0; x < toCheck.length; x++) {
    if(toCheck[x] instanceof Body) {
      this.setDestination(toCheck[x].getCoord());
      this.setState(GUARD_RAGING);
      return true;
    }
  }
}

Guard.prototype.spotPlayer = function() {
  var playerCoord = this.getMap().getGame().getPlayer().getCoord();
  if(this.seeOtherMob(this.getMap().getGame().getPlayer())) {
    this.setDestination(playerCoord);
    if(this.getState() != GUARD_YELLING && this.getState() != GUARD_HUNTING) {
      this.yell();
    }
    return true;
  }
  return false;
}

Guard.prototype.canMoveTo = function(coords) {
  //console.log("Checking if I can move to " + coords + " from " + this.getCoord());
  if(this.getMap().blocksMovement(coords))  { return false; }
  //console.log("Block didn't block movement");
  var mob = this.getMap().getMobs().mobAt(coords);
  if(mob && mob instanceof Guard) {
    return false;
  }
  return true;
}

Guard.prototype.move = function(coords) {
  if(!this.canMoveTo(coords)) { return; }
  var dir = this.directionTo(coords);
  this.setCoord(coords);
  this.setDirection(dir);
  //console.log("Set direction and coords");
  //Check for player under us
  if(this.getMap().getGame().getPlayer().getCoord().equals(this.getCoord())) {
    Ironwood.engine.unlock();
    this.getMap().getGame().end();
    //Game over, man, game over
  }
}

Guard.prototype.walkTowards = function(coords) {
  if(coords.equals(this.getCoord())) { return; }
  var path = this.getPath(coords);
  var nextStep = path[0];
  this.move(nextStep);
  this.doAction(ACTION_MOVE);
}

//Made this its own function to simplify the walkTowards function
Guard.prototype.getPath = function(coords) {
  var key = this.getCoord() + "," + coords;
  var pathfindingCache = this.getMap().getPathfindingCache();
  if(pathfindingCache[key] != undefined) {
    return pathfindingCache[key];
  }
  var newPath = [];
  var pathfinder = new ROT.Path.AStar(coords.getX(), coords.getY(), this.buildMovementPassesCallback(this.getMap()));
  pathfinder.compute(this.getX(), this.getY(), this.buildPathfindingCallback(newPath));
  newPath.shift(); //Get rid of the starting point from our path
  pathfindingCache[key] = newPath.slice();
  while(newPath.length > 0) {
    var tmpCoords = newPath.shift();
    var newKey = tmpCoords + "," + coords;
    if(pathfindingCache[newKey] == undefined && (!tmpCoords.equals(coords))) {
      pathfindingCache[newKey] = newPath.slice();
    } 
  }
  return pathfindingCache[key];
}

Guard.prototype.buildMovementPassesCallback = function(map) {
  var result = function(x, y) {
    var coords = new Coordinate(x, y);
    if(!map.inBounds(coords)) {
      //console.log("Buildmovement: coords out of bounds");
      return false;
    }
    if(map.blocksMovement(coords)) {
      //console.log("Buildmovement: block blocks movement: " + map.getTiles().get(coords));
      return false;
    }
    return true;
  };
  return result;
}

//Expects an array to push the path onto
Guard.prototype.buildPathfindingCallback = function(toStore) {
  var result = function(x, y) {
    var coord = new Coordinate(x, y);
    toStore.push(coord);
  };
  return result;
}
