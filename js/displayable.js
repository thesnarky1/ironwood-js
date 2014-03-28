var Displayable = function(map, coord) {
  this._map = map;
  this._coord = coord;
  this._symbol = "";
  this._color = "#ccc";
}

Displayable.prototype.getMap = function() {
  return this._map;
}

Displayable.prototype.setMap = function(newMap) {
  this._map = newMap;
}

//Handles displaying this thing, whatever it is
Displayable.prototype.display = function() {
  Ironwood.display.draw(this.getCoord().x, this.getCoord().y, this.getSymbol(), this.getColor());
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
  return this.getCoord().x;
}

//helper function to get the Y coordinate of this location
Displayable.prototype.getY = function() {
  return this.getCoord().y;
}

//Functions to get/set the color of this displayable object
Displayable.prototype.getColor = function() {
  return this._color;
}

Displayable.prototype.setColor = function(newColor) {
  this._color = newColor;
}

//Functions to get/set the color of this displayable object
Displayable.prototype.getSymbol = function() {
  return this._symbol;
}

Displayable.prototype.setSymbol = function(sym) {
  this._symbol = sym;
}
