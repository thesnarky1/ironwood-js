var Items = function() {
  this._items = [];
}

Items.prototype.getItems = function() {
  return this._items;
}

Items.prototype.addItem = function(item) {
  this._items.push(item);
}

Items.prototype.trapdoorAt = function(coords) {
  var item = this.itemAt(coords);
  return (item && item instanceof Trapdoor);
}

Items.prototype.itemAt = function(coords) {
  if(this.hasItems()) {
    for(var x = 0; x < this._items.length; x++) {
      if(this._items[x].getCoord() == coords) {
        return item;
      }
    }
  }
  return false;
}

Items.prototype.hasItems = function() {
  return this._items.length > 0;
}

Items.prototype.bodyNearPlayer = function(player) {
  var playerCoords = player.getCoord();
  for(var x = 0; x < this._items.length; x++) {
    var itemCoords = this._items[x].getCoord();
    if(!(this._items[x] instanceof Body)) {
      //Skip, we only want bodies
    } else if(itemCoords == playerCoords) {
      //Skip, we don't want bodies under the player
    } else if(itemCoords.withinRadius(playerCoords, 1, true)) {
      return this._items[x];
    }
  }
  return false;
}
