var Coordinate = function(x,y) {
  this._x = x;
  this._y = y;
}

Coordinate.prototype.toString = function() {
  return this._x + "," + this._y;
}

Coordinate.prototype.fromString = function(toParse) {
  var parts = toParse.split(",");
  this._x = Number(parts[0]);
  this._y = Number(parts[1]);
}

Coordinate.prototype.getX = function() {
  return this._x;
}

Coordinate.prototype.getY = function() {
  return this._y;
}
