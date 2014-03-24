var Coordinate = function(x,y) {
  this.x = x;
  this.y = y;
}

Coordinate.prototype.toString = function() {
  return this.x + "," + this.y;
}

Coordinate.prototype.fromString = function(toParse) {
  var parts = toParse.split(",");
  this.x = Number(parts[0]);
  this.y = Number(parts[1]);
}

Coordinate.prototype.getX = function() {
  return this.x;
}

Coordinate.prototype.getY = function() {
  return this.y;
}
