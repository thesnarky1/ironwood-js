//Class for the body that guards drop when they're ganked
var Body = function(map, coord) {
  Item.call(this, map, coord);
  this.setSymbol("%");
  this.setColor("red");
}

Body.extend(Item);
