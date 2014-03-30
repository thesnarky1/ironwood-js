var FieldOfView = function(player) {
  this._seen = {};
  this._previous = {};
  this._allTime = {};
  this._isPlayer = player;
}

FieldOfView.prototype.getAllTime = function() {
  var toReturn = [];
  for(coords in this._allTime) {
    var tmpCoord = new Coordinate(0,0);
    tmpCoord.fromString(coords);
    toReturn.push(tmpCoord);
  }
  return toReturn;
}

FieldOfView.prototype.onlySeenHistoricallyXY = function(x, y) {
  return this.onlySeenHistorically(new Coordinate(x, y));
}

FieldOfView.prototype.onlySeenHistorically = function(coords) {
  if(this._allTime[coords] != undefined) {
    return (this._seen[coords] == undefined);
  }
  return false;
}

FieldOfView.prototype.everSeenXY = function(x, y) {
  return this.everSeen(new Coordinate(x, y));
}

FieldOfView.prototype.everSeen = function(coords) {
  return (this._allTime[coords] != undefined);
}

FieldOfView.prototype.clearSeen = function() {
  this._previous = this._seen;
  this._seen = {};
}

FieldOfView.prototype.getPreviousSeen = function() {
  return this._previous;
}

//Returns the union of the previous FOV and current FOV to make map updates easier
FieldOfView.prototype.getPreviousAndCurrent = function() {
  var toReturn = [];
  for(coords in this._seen) {
    var tmpCoord = new Coordinate(0,0);
    tmpCoord.fromString(coords);
    toReturn.push(tmpCoord);
  }
  for(coords in this._previous) {
    if(!this._seen[coords]) {
      var tmpCoord = new Coordinate(0,0);
      tmpCoord.fromString(coords);
      toReturn.push(tmpCoord);
    }
  }
  return toReturn;
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
  if(this._seen[coords] != undefined) {
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

  //Call me a miser, I don't want to carry around all the places seen by dozens of guards that I'll never have to render
  if(this._isPlayer) {
    if(this._allTime[coords] == undefined) {
      this._allTime[coords] = value;
    }
  }
}

FieldOfView.prototype.setTileXY = function(x, y, value) {
  this.setTile(new Coordinate(x, y), value);
}
