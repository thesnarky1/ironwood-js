var GameTime = function() {
  this._tick = 0;
}

GameTime.prototype.getTick = function() {
  return this._tick;
}

GameTime.prototype.advance = function() {
  return this._tick++;
}

GameTime.prototype.previous = function() {
  return this._tick - 1;
}
