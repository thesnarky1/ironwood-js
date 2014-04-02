var Guard = function(map, coord, direction) {
  Living.call(this, map, coord, direction);
  this.setColor("#9990ff"); //Doesn't really matter since we override getColor() below
  this.setSymbol("G");
  this._postCoord = coord;
  this._postDirection = direction;
  this._destinationCoord = null;
  this._patrolCoord = null;
  this._stun = 0;
  this._state = GUARD_GUARDING;
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

//Post functions
Guard.prototype.getPost = function() {
  return this._postCoord;
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

//
//Action function
//
Guard.prototype.act = function() {
  var playerCoord = this.getMap().getGame().getPlayer().getCoord();
  var guardCoord = this.getCoord();
  Ironwood.engine.lock();
  switch(this.getState()) {
    case GUARD_GUARDING:
      if(this.getFOV().tileSeen(playerCoord)) {
        this.yell();
        this.setDestination(playerCoord);
        this.setState(GUARD_HUNTING);
      }
      break;
    case GUARD_STUNNED:
      //Not doing anything
      console.log("Stunned");
      break;
    case GUARD_HUNTING:
      var dirToMove = this.directionTo(this.getDestination());
      var dx = ROT.DIRS[8][dirToMove][0];
      var dy = ROT.DIRS[8][dirToMove][1];
      var newCoord = new Coordinate(guardCoord.getX() + dx, guardCoord.getY() + dy);
      if(!Tile.blocksMovement(this.getMap().getTiles().get(newCoord))) {
        this.setCoord(newCoord);
        this.setDirection(dirToMove);
        this.doAction(ACTION_MOVE);
      } else { console.log("Jon needs to implement Astar"); }
      break;
  }
  Ironwood.engine.unlock();
}

Guard.prototype.yell = function() {
  console.log("Yelling!");
  this.getMap().makeSound(new Sound(this, ACTION_YELL, this.getMap().getTime().getTick()));
}
