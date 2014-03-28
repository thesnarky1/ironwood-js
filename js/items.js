var Items = function() {
  MapCollection.call(this);
}

Items.extend(MapCollection);

Items.prototype.getItems = function() {
  return this.getObjects();
}

Items.prototype.addItem = function(item) {
  this.addObject(item);
}

Items.prototype.trapdoorAt = function(coords) {
  var item = this.itemAt(coords);
  return (item && item instanceof Trapdoor);
}

Items.prototype.itemAt = function(coords) {
  return this.objectAt(coords);
}

Items.prototype.hasItems = function() {
  return this.hasObjects();
}

Items.prototype.bodyNearPlayer = function(player) {
  var playerCoords = player.getCoord();
  var items = this.getItems();
  for(var x = 0; x < items.length; x++) {
    var itemCoords = items[x].getCoord();
    if(!(items[x] instanceof Body)) {
      //Skip, we only want bodies
    } else if(itemCoords == playerCoords) {
      //Skip, we don't want bodies under the player
    } else if(itemCoords.withinRadius(playerCoords, 1, true)) {
      return items[x]; //Only grab the first we see
    }
  }
  return false;
}

Items.prototype.deleteItem = function(toDelete) {
  this.deleteObject(toDelete);
}
