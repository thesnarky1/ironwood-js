var MapCollection = function() {
  this._objects = [];
}

MapCollection.prototype.getObjects = function() {
  return this._objects;
}

MapCollection.prototype.hasObjects = function() {
  return this._objects.length > 0;
}

MapCollection.prototype.objectAt = function(coord) {
  if(this.hasObjects()) {
    for(var x = 0; x < this._objects.length; x++) {
      if(this._objects[x].getCoord().equals(coord)) {
        return this._objects[x];
      }
    }
  }
  return false;
}

MapCollection.prototype.deleteObject = function(toDelete) {
  if(this.hasObjects()) {
    for(var x = 0; x < this._objects.length; x++) {
      if(this._objects[x] == toDelete) {
        this._objects.splice(x,1);
      }
    }
  }
}

MapCollection.prototype.addObject = function(newObject) {
  this._objects.push(newObject);
}
