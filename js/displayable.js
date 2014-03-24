var Displayable = function(coord, sym) {
  this._coord = coord;
  this._symbol = sym;
  this._color = "#ccc";
}

Displayable.prototype.display = function() {
  Ironwood.display.draw(this.getX(), this.getY(), this.getSymbol(), this.getColor());
}

//Get/set this displayable object's location
Displayable.prototype.getCoord = function() {
  return this._coord;
}

Displayable.prototype.setCoord = function(newCoord) {
  this._coord = newCoord;
}

//helper function to get the X coordinate of this location
Displayable.prototype.getX = function() {
  return this.getCoord().getX();
}

//helper function to get the Y coordinate of this location
Displayable.prototype.getY = function() {
  return this.getCoord().getY();
}

//Functions to get/set the color of this displayable object
Displayable.prototype.getColor = function() {
  return this._color;
}

Displayable.prototype.setColor = function(newColor) {
  this._color = newColor;
}
