var Sound = function(creator, type, tick) {
  //console.log("Creator: " + creator + ", type: " + type);
  this._creator = creator;
  this._type = type;
  this._radius = SOUND_RADIUSES[type];
  this._priority = SOUND_PRIORITIES[type];
  this._coord = creator.getCoord();
  this._tick = tick; //This should be an int, NOT a GameTime object
}

Sound.prototype.heardBy = function(listener) {
  var listenerCoord = listener.getCoord();
  var soundCoord = this.getCoord();
  if(listener == this._creator && !(listener instanceof Player)) { return false; }
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

Sound.prototype.getTick = function() {
  return this._tick;
}
