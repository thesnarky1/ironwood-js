var Game = function(screenWidth, screenHeight) {
  this._statusbar = new StatusBar(this);
  this._time = new GameTime();
  this._gameover = false;

  this._map = null; //Redo map stuff
  this._player = new Player(this.getMap(), 0, 0, DIR_E);
  this._screenWidth = screenWidth;
  this._screenHeight = screenHeight;
  this._mapDisplay = null;
  this._score = new Score(this._time);
}

Game.prototype.getPlayer = function() {
  return this._player;
}

Game.prototype.getScore = function() {
  return this._score;
}

Game.prototype.getMap = function() {
  return this._map;
}

Game.prototype.setMap = function(newMap) {
  this._map = newMap;
}

Game.prototype.getPlayer = function() {
  return this._player;
}

Game.prototype.turn = function() {
  //Finish HIM
}

Game.prototype.newFloor = function() {
  this.getPlayer().doAction(ACTION_REST);
  this.getScore().newFloor();
  this.setMap(null) //fix map code, pass in time
  this.getPlayer().onNewMap(this.getMap(), this.getPlayer().getDirection()); //Fix onNewMap function
  this._mapDisplay = null;
}

Game.prototype.display = function() {
  //Finish HIM
}

Game.prototype.view = function() {
  //Concats statusBar.view and mapDisplay.view
}
