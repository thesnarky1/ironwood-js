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

Coordinate.prototype.equals = function(coord) {
  return (this.x == coord.getX() && this.y == coord.getY());
}

//Function to help all the times we're checking how close something is
//NOT a true distance function
Coordinate.prototype.withinRadius = function(coords, radius, inclusive) {
  if(inclusive) { radius++; }
  var diffX = Math.abs(coords.getX() - this.getX());
  var diffY = Math.abs(coords.getY() - this.getY());
  return (diffX < radius && diffY < radius);
}
