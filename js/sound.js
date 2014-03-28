var Sound = function(creator, type) {
  this._creator = creator;
  this._type = type;
  this._radius = Sound.radiuses[type];
  this._priority = Sound.priorities[type];
  this._coord = creator.getCoord();
}

Sound.radiuses = {
  "run": 10,
  "drag": 6,
  "yell": 15
}

Sound.priorities = {
  "run": 10,
  "drag": 6,
  "yell": 15
}

Sound.prototype.heardBy = function(listener) {
  var listenerCoord = listener.getCoord();
  var soundCoord = this.getCoord();
  if(listener == this._creator && !listener.isPlayer()) { return false; }
  if(listenerCoord == soundCoord) { return false; }
  return soundCoord.withinRadius(listenerCoord, this.getRadius(), false);
}

Sound.prototype.getCoord = function() {
  return this._coord;
}

Sound.prototype.getRadius = function() {
  return this._radius;
}

Sound.prototype.getPriority = function() {
  return this._priority;
}
