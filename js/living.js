//Class to handle everything that lives and moves, be it friend or foe
var Living = function(map, coord, direction) {
  Displayable.call(this, map, coord);
  this._direction = direction;
  this._fov = null; //This may get removed depending on how I do FOV
  this._lastActions = [];
}
  
Living.extend(Displayable);

Living.prototype.setDirection = function(newDirection) {
  this._direction = newDirection;
}

Living.prototype.getDirection = function() {
  return this._direction;
}

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
    this._map.makeSound(new Sound(this, ACTION_DRAG));
  }
  if(action == ACTION_MOVE && 
     ((this instanceof Player) && this.noiseCount() >= 5) ||
     (!(this instanceof Player) && this.noiceCount() >= 3)) {
      this._map.makeSound(new Sound(this, ACTION_RUN));
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
