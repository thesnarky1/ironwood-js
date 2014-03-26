var Score = function(time) {
  this._time = time; //GameTime object
  this._floor = 0;
  this._floors = [[0,0,0]];
  this._smokebombs = 0;
  this.newFloor();
}

Score.prototype.newFloor = function() {
  var floorArray = this.getFloors();
  var currFloor = this.getFloor();
  if(currFloor != 0) {
    floorArray[currFloor][FLOOR_FINISHED_AT] = this.getTime().getTick();
    this.setFloor(currFloor + 1);
    this._floors.push([0,0,0]);
  }
}

Score.prototype.getFloor = function() {
  return this._floor;
}

Score.prototype.setFloor = function(newFloor) {
  this._floor = newFloor;
}

Score.prototype.getFloors = function() {
  return this._floors;
}

Score.prototype.getTime = function() {
  return this._time;
}

Score.prototype.addTreasure = function() {
  this._floors[this.getFloor()][FLOOR_TREASURERS]++;
}

Score.prototype.addGuard = function() {
  this._floors[this.getFloor()][FLOOR_GUARDS]++;
}

Score.prototype.statusLine = function() {
  var toReturn = "";
  toReturn += "Floor " + this.getFloor() + " | ";
  toReturn += "Time " + this.getTime().getTick() + " | ";
  toReturn += "Treasures " + this.getTreasures() + " | ";
  toReturn += "Guards " + this.getGuards(); 
  return toReturn;
}

Score.prototype.getTreasures = function() {
  var totalTreasures = 0;
  for(floor in this.getFloors()) {
    totalTreasures += floor[FLOOR_TREASURES];
  }
  return totalTreasures;
}

Score.prototype.getGuards = function() {
  var totalGuards = 0;
  for(floor in this.getFloors()) {
    totalGuards += floor[FLOOR_GUARDS];
  }
  return totalGuards;
}

Score.prototype.printFinal = function() {
  //We can do better here...
}
