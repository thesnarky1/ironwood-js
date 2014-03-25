var GUARD_GUARDING = 0;
var GUARD_WALKING  = 1;
var GUARD_HUNTING  = 2;
var GUARD_YELLING  = 3;
var GUARD_RAGING   = 4;
var GUARD_STUNNED  = 5;

var Guard = function(map, coord, direction) {
  Living.call(this, map, coord);
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
  if(currState == GUARD_RAGING || currState = GUARD_HUNTING) {
    return "#ff0000";
  } else if(currState == GUARD_STUNNED) {
    return "#ffff00";
  } else {
    return "#9990ff";
  }
}

//Gets the guard's state for the eventual state machine
Guard.prototype.getState = function() {
  return this._state;
}

//Destination functions
Guard.prototype.getDestination = function() {
  return this._destinationCoord;
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
