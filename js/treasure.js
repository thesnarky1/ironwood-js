var Treasure = function(coord) {
  Item.call(this, coord);
  this.setSymbol("$");
  this.setColor("#ffff00");
}

Treasure.extend(Item);
