var Treasure = function(map, coord) {
  Item.call(this, map, coord);
  this.setSymbol("$");
  this.setColor("#ffff00");
}

Treasure.extend(Item);
