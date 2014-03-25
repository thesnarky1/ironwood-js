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
  for(item in this._items) {
    if(item.getCoords() == coords) {
      return item;
    }
  }
  return false;
}

Items.prototype.bodyNearPlayer = function(player) {
  var playerCoords = player.getCoords();
  for(item in this._items) {
    var itemCoords = item.getCoords();
    if(!(item instanceof Body)) {
      //Skip, we only want bodies
    } else if(itemCoords == playerCoords) {
      //Skip, we don't want bodies under the player
    } else if(itemCoords.withinRadius(playerCoords, 1, true)) {
      return item;
    }
  }
  return false;
}
