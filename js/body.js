//Class for the body that guards drop when they're ganked
var Body = function(coord) {
  Item.call(this, coord);
  this.setSymbl("%");
  this.setColor("#aa5500");
}

Body.extend(Item);
