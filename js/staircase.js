var Staircase = function(coord) {
  Item.call(this, coord);
  this.setSymbol(">");
  this.setColor("#ff00ff");
}

Staircase.extend(Item);
