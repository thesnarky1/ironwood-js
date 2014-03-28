var TileSet = function(width, height, symbol) {
  //console.log("Creating a new tileset: " + width + "," + height);
  this._tiles = new Array(height);
  for(var y = 0; y < height; y++) {
    this._tiles[y] = new Array(width);
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
  var toReturn = this._tiles[y][x];
  return toReturn;
}

TileSet.prototype.debug = function() {
  //console.log(this._tiles);
  console.log("Tile dump - width: " + this.getWidth() + " - height: " + this.getHeight());
  for(var y = 0; y < this.getHeight(); y++) {
    console.log(y + ": " + this._tiles[y]);
  }
}

TileSet.prototype.get = function(coords) {
  return this.getXY(coords.getX(), coords.getY());
}

TileSet.prototype.removeRow = function(row) {
  if(row < -1 || row >= this.getHeight()) { return; } //row out of bounds
  var tmpHeight = this.getHeight();
  //console.log("Deleting row " + row);
  if(row == 0) {
    this._tiles.shift();
  } else if(row == this.getHeight() - 1 || row == -1) {
    this._tiles.pop();
  } else {
    var endPart = this._tiles.slice(row + 1, this.getWidth());
    var firstPart = this._tiles.slice(0, row);
    this._tiles = firstPart.concat(endPart);
  }
  var newHeight = this.getHeight();
  //console.log("Old height: " + tmpHeight + " and new height: " + newHeight);
}

TileSet.prototype.removeColumn = function(col) {
  if(col < -1 || col >= this.getWidth()) { return; } //col out of bounds
  //console.log("Deleting column " + col);
  for(var y = 0; y < this.getHeight(); y++) {
    var row = this._tiles[y];
    var endPart = row.slice(col + 1, row.length);
    var startPart = row.slice(0, col);
    this._tiles[y] = startPart.concat(endPart);
  }
}

TileSet.prototype.checkTiles = function(coordStart, coordEnd, symbol) {
  //console.log("Check Tiles: " + coordStart + " " + coordEnd + " " + symbol);
  for(var y = coordStart.getY(); y <= coordEnd.getY(); y++) {
    for(var x = coordStart.getX(); x <= coordEnd.getX(); x++) {
      if(this.getXY(x,y) != symbol) {
        //console.log(this.getXY(x,y) + " does not equal " + symbol);
        return false;
      }
    }
  }
  return true;
}

TileSet.prototype.checkTile = function(coord, symbol) {
  return this.checkTileXY(coord.getX(), coord.getY(), symbol);
}

TileSet.prototype.checkTileXY = function(x, y, symbol) {
  return this.getXY(x, y) == symbol;
}

TileSet.prototype.setTiles = function(coordStart, coordEnd, symbol) {
  for(var y = coordStart.getY(); y <= coordEnd.getY(); y++) {
    for(var x = coordStart.getX(); x <= coordEnd.getX(); x++) {
      this._tiles[y][x] = symbol;
    }
  }
}

TileSet.prototype.setTile = function(coords, symbol) {
  this._tiles[coords.getY()][coords.getX()] = symbol;
}

TileSet.prototype.getRow = function(row) {
  if(row < 0 || row >= this.getHeight()) { return; } //row out of bounds
  return this._tiles[row];
}

//Function takes a symbol that will represent the edges desire
//It trims the TileSet down to where the first non-symbol 
//appears reliably one tile inside of the edge
TileSet.prototype.trimTo = function(symbol) {

  //this.debug();
  var trimOffset = new Coordinate(0,0);

  //Figure out what our boundaries are
  var leftMost  = this.getWidth();
  var rightMost = 0;
  var upperMost = this.getHeight();
  var lowerMost = 0;
  for(var y = 0; y < this.getHeight(); y++) {
    for(var x = 0; x < this.getWidth(); x++) {
      if(!this.checkTileXY(x, y, symbol)) {
        if(x < leftMost)  { leftMost  = x; }
        if(x > rightMost) { rightMost = x; }
        if(y > lowerMost) { lowerMost = y; }
        if(y < upperMost) { upperMost = y; }
      }
    }
  }

  //Kill off the row one to above of our lowermost room until it's the final wall
  var rowToKill = lowerMost + 1;
  var numToKill = this.getHeight() - rowToKill - 1;
  //console.log("Lowermost row was " + lowerMost + ", stripping off " + numToKill + " rows");
  for(var x = 0; x < numToKill; x++) {
    this.removeRow(-1);
  }

  //Kill off the row one below the top until the uppermost room touches it
  var rowToKill = 1;
  var numToKill = upperMost - 1;
  //console.log("Uppermost row was " + upperMost + ", stripping off " + numToKill + " rows");
  for(var x = 0; x < numToKill; x++) {
    trimOffset.setY(trimOffset.getY() + 1);
    this.removeRow(0);
  }

  //Kill off the column one to the right of our rightmost room until it's the final wall
  var columnToKill = rightMost + 1;
  var numToKill = this.getWidth() - columnToKill - 1;
  //console.log("Rightmost column was " + rightMost + ", stripping off " + numToKill + " columns");
  for(var x = 0; x < numToKill; x++) {
    //console.log("deleting rightmost column: " + x + "," + columnToKill);
    this.removeColumn(columnToKill);
  }

  //Kill off the column one to the right of our left side until the leftmost room touches it
  var columnToKill = 1;
  var numToKill = leftMost - 1;
  //console.log("Leftmost column was " + leftMost + ", stripping off " + numToKill + " columns");
  for(var x = 0; x < leftMost - 1; x++) {
    //console.log("deleting leftmost column: " + x + "," + columnToKill);
    trimOffset.setX(trimOffset.getX() + 1);
    this.removeColumn(columnToKill);
  }

  //this.debug();
  return trimOffset;
}
