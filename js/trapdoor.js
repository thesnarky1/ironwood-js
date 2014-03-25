var Trapdoor = function(map, coord) {
  Item.call(this, map, coord);
  this.setSymbol("^");
  this.setColor("#ff00ff");
}

Trapdoor.extend(Item);
