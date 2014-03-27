var Game = function(screenWidth, screenHeight) {
  this._statusbar = new StatusBar(this);
  this._time = new GameTime();
  this._gameover = false;

  this._map = new Map(this.getTime()); //Redo map stuff
  this._player = new Player(this.getMap(), 0, 0, this._map.getRandomInt(0,7));
  var playerCoords = this.getMap().addPlayer(this.getPlayer());
  this._player.setCoord(playerCoords);
  this._screenWidth = screenWidth;
  this._screenHeight = screenHeight;
  this._mapDisplay = null;
  this._score = new Score(this.getTime());

  //Start this game's scheduler and engine (not in Ironwood so we can restart the game
  //this._scheduler = new ROT.Scheduler.Simple();
  //scheduler.add(game.getPlayer(), true);
  //this._engine = new ROT.Engine(scheduler);
  //this._engine.start();
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

Game.prototype.getTime = function() {
  return this._time;
}

Game.prototype.setMap = function(newMap) {
  this._map = newMap;
  this.getPlayer().setCoords(this.getMap().addPlayer(this.getPlayer()));
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
  this.setMap(new Map(this.getTime()));
  this.getPlayer().onNewMap(this.getMap(), this.getPlayer().getDirection()); //Fix onNewMap function
  this._mapDisplay = null;
}

//Should return an array of lines for Ironwood to draw
Game.prototype.display = function() {
  //Finish HIM
  return this.getStatusBar().view();
}

Game.prototype.view = function() {
  //Concats statusBar.view and mapDisplay.view
}
