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
  }
  this.setFloor(currFloor + 1);
  this._floors.push([0,0,0]);
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
  this._floors[this.getFloor()][FLOOR_TREASURES]++;
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
  for(var x = 0; x < this.getFloors().length; x++) {
    totalTreasures += this.getFloors()[x][FLOOR_TREASURES];
  }
  return totalTreasures;
}

Score.prototype.getGuards = function() {
  var totalGuards = 0;
  for(var x = 0; x < this.getFloors().length; x++) {
    totalGuards += this.getFloors()[x][FLOOR_GUARDS];
  }
  return totalGuards;
}

Score.prototype.printFinal = function() {
  var toReturn = "%c{orange}";
  toReturn += "Final Score: \n";
  toReturn += "FLOOR    %c{yellow}$%c{}    %c{red}G%c{}  %c{orange}Time%c{}\n";
  var previousTick = 0;
  var floors = this.getFloors();
  for(var x = 1; x < floors.length; x++) {
    var tmpFloor = floors[x];
    var floorStr = "" + x;
    var treasures = "" + tmpFloor[FLOOR_TREASURES];
    var guards = "" + tmpFloor[FLOOR_GUARDS];
    var finishedAt = 0;
    if(x == floors.length - 1) {
      finishedAt = (this.getTime().getTick() - previousTick);
    } else {
      finishedAt = (tmpFloor[FLOOR_FINISHED_AT] - previousTick);
      previousTick = tmpFloor[FLOOR_FINISHED_AT];
    }
    var timeString = "" + finishedAt;
    toReturn += "%c{orange}" + floorStr.rpad(' ', 5) + "%c{yellow}" + treasures.lpad(' ', 5) + "%c{red}" + guards.lpad(' ', 5) + "%c{orange}" + timeString.lpad(' ', 6) + "\n";
  }
  var totalTreasures = "" + this.getTreasures();
  var totalGuards = "" + this.getGuards();
  var totalTime = "" + this.getTime().getTick();
  toReturn += "Total".rpad(' ', 5) + "%c{yellow}" + totalTreasures.lpad(' ', 5) + "%c{red}" + totalGuards.lpad(' ', 5) + "%c{orange}" + totalTime.lpad(' ', 6);
  return toReturn;
}
