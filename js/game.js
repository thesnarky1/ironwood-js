var Game = function(screenWidth, screenHeight) {
  this._screenWidth = screenWidth;
  this._screenHeight = screenHeight;

  this._time = new GameTime();

  this._statusbar = new StatusBar(this);
  this._score = new Score(this.getTime());
  this._gameover = false;

  this._map = new Map(this, this.getTime()); //Redo map stuff
  var playerCoords = this.getMap().makeAHole();
  this._player = new Player(this.getMap(), playerCoords, ROT.RNG.getUniformInt(0,7));
  this.getMap().addPlayer(this.getPlayer());
  this._player.calculateFOV();
  this._map.display();
  this.displayStatus();
  this._mapDisplay = null;
}

Game.prototype.displayStatus = function() {
  var text = this.getStatusbar().view();
  var x = Math.floor((IRONWOOD_WIDTH - ROT.Text.measure(text, 100).width) / 2);
  Ironwood.display.drawText(x,0,text)
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
  this.getPlayer().setCoord(this.getMap().makeAHole());
  this.getMap().addPlayer(this.getPlayer());
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
  var playerCoords = this.getMap().makeAHole();
  this.getPlayer().setCoord(playerCoords);
  this.getMap().addPlayer(this.getPlayer());
  this.getPlayer().onNewMap(); //Fix onNewMap function
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
