var Trapdoor = function(coord) {
  Item.call(this, coord);
  this.setSymbol("^");
  this.setColor("#ff00ff");
}

Trapdoor.extend(Item);
