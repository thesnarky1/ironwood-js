var Game = function(screenWidth, screenHeight) {
  this._screenWidth = screenWidth;
  this._screenHeight = screenHeight;

  this._time = new GameTime();

  this._statusbar = new StatusBar(this);
  this._score = new Score(this.getTime());
  this._gameover = false;

  this._map = new Map(this, this.getTime()); //Redo map stuff
  this._player = new Player(this.getMap(), 0, 0, this._map.getRandomInt(0,7));
  var playerCoords = this.getMap().addPlayer(this.getPlayer());
  this._player.setCoord(playerCoords);
  this.displayStatus();
  this._map.display();
  this._mapDisplay = null;
}

Game.prototype.displayStatus = function() {
  Ironwood.display.drawText(0,0,this.getStatusbar().view())
}

Game.prototype.getPlayer = function() {
  return this._player;
}

Game.prototype.getScore = function() {
  return this._score;
}

Game.prototype.getStatusbar = function() {
  return this._statusbar;
}

Game.prototype.getMap = function() {
  return this._map;
}

Game.prototype.getTime = function() {
  return this._time;
}

Game.prototype.setMap = function(newMap) {
  this._map = newMap;
  this.getPlayer().setMap(newMap);
  this.getPlayer().setCoord(this.getMap().addPlayer(this.getPlayer()));
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
  this.setMap(new Map(this, this.getTime()));
  this.getPlayer().onNewMap(this.getMap(), this.getPlayer().getDirection()); //Fix onNewMap function
  this._mapDisplay = null;
  this.displayStatus();
  this.getMap().display();
}

//Should return an array of lines for Ironwood to draw
Game.prototype.display = function() {
  //Finish HIM
  return this.getStatusBar().view();
}

Game.prototype.view = function() {
  //Concats statusBar.view and mapDisplay.view
}
