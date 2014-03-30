var FieldOfView = function() {
  this._seen = {};
}

FieldOfView.prototype.clearSeen = function() {
  this._seen = {};
}

FieldOfView.prototype.allSeen = function() {
  var toReturn = [];
  for(coords in this._seen) {
    var tmpCoord = new Coordinate(0,0);
    tmpCoord.fromString(coords);
    toReturn.push(tmpCoord);
  }
  return toReturn;
}

FieldOfView.prototype.seenWithin = function(radius) {
  var toReturn = [];
  for(coords in this._seen) {
    var distance = this._seen[coords];
    var tmpCoord = new Coordinate(0,0);
    tmpCoord.fromString(coords);
    if(distance <= radius) {
      toReturn.push(tmpCoord);
    }
  }
  return toReturn;
}

FieldOfView.prototype.tileSeenXY = function(x, y) {
  return this.tileSeen(new Coordinate(x, y));
}

FieldOfView.prototype.tileSeen = function(coords) {
  if(this._seen[coords]) {
    return true;
  } else {
    return false;
  }
}

FieldOfView.prototype.howVisibleXY = function(x, y) {
  return this.howVisible(new Coordinate(x, y));
}

FieldOfView.prototype.howVisible = function(coords) {
  if(this.tileSeen(coords)) {
    return this._seen[coords];
  } else {
    return false;
  }
}

FieldOfView.prototype.setTile = function(coords, value) {
  this._seen[coords] = value;
}

FieldOfView.prototype.setTileXY = function(x, y, value) {
  this.setTile(new Coordinate(x, y), value);
}
