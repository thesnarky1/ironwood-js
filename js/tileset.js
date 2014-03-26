var TileSet = function(width, height, symbol) {
  this._tiles = [];
  for(var y = 0; y < height; y++) {
    for(var x = 0; x < width; x++) {
      this._tiles[y][x] = symbol;
    }
  }
}

TileSet.prototype.getWidth = function() {
  return this._tiles[0].length;
}

TileSet.prototype.getHeight = function() {
  return this._tiles.length;
}

TileSet.prototype.fillWith = function(symbol) {
  for(var y = 0; y < this.getHeight(); y++) {
    for(var x = 0; x < this.getWidth(); x++) {
      this._tiles[y][x] = symbol;
    }
  }
}

TileSet.prototype.getXY = function(x, y) {
  return this._tiles[y][x];
}

TileSet.prototype.get = function(coords) {
  return this.getXY(coords.getX(), coords.getY());
}

TileSet.prototype.removeRow = function(row) {
  if(row < 0 || row >= this.getHeight()) { return; } //row out of bounds
  if(row == 0) {
    this._tiles.shift();
  } else if(row == this.getHeight() - 1 || row == -1) {
    this._tiles.pop();
  } else {
    this._tiles = this._tiles.slice(0, row).concat(this._tiles.slice(row + 1, this.getWidth()));
  }
}

TileSet.prototype.removeColumn = function(col) {
  if(col < 0 || col >= this.getWidth()) { return; } //col out of bounds
  for(var y = 0; y < this.getHeight(); y++) {
    var row = this._tiles[y];
    this._tiles[y] = row.slice(0, col).concat(row.slice(col + 1, row.length));
  }
}

TileSet.prototype.checkTiles(coordStart, coordEnd, symbol) {
  for(var y = coordStart.getY(); y <= coordEnd.getY(); y++) {
    for(var x = coordStart.getX(); x <= coordEnd.getX(); x++) {
      if(this.getXY(x,y) != symbol) {
        return false;
      }
    }
  }
}

TileSet.prototype.checkTile(coord, symbol) {
  return this.get(coord) == symbol;
}

TileSet.prototype.setTiles(coordStart, coordEnd, symbol) {
  for(var y = coordStart.getY(); y <= coordEnd.getY(); y++) {
    for(var x = coordStart.getX(); x <= coordEnd.getX(); x++) {
      this._tiles[y][x] = symbol;
    }
  }
}

TileSet.prototype.getRow(row) {
  if(row < 0 || row >= this.getHeight()) { return; } //row out of bounds
  return this._tiles[row];
}
