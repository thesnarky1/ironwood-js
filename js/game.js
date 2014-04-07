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
  this._gameOver = false;
}

Game.prototype.gameOver = function() {
  return this._gameOver;
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

Game.prototype.end = function() {
  this._gameOver = true;
  //Ironwood.getScheduler().clear();
  var toDraw = "%c{green}" + this.getScore().printFinal() + "%c{}";
  var toDrawDimensions = ROT.Text.measure(toDraw);
  var smokebombs = this.getPlayer().getSmokebombs();

  var totalEndGameHeight = toDrawDimensions['height'] + 4;
  if(smokebombs > 0) { totalEndGameHeight += 2; }
  var startY = (IRONWOOD_HEIGHT - totalEndGameHeight) / 2;
  var endY = startY + totalEndGameHeight;
  var startX = (IRONWOOD_WIDTH - END_GAME_BOX_WIDTH) / 2;
  var endX = startX + END_GAME_BOX_WIDTH;
  for(var y = startY; y < endY; y++) {
    for(var x = startX; x < endX; x++) {
      if(x == startX || x == endX - 1 || y == startY || y == endY - 1) {
        Ironwood.display.draw(x, y, '=', "red", "black");
      } else {
        Ironwood.display.draw(x, y, ' ', "black", "black");
      }
    }
  }
  //Add header text
  var headerText = "%c{red}Game over - a guard caught you%c{}";
  var headerTextStart = startX + ((END_GAME_BOX_WIDTH - ROT.Text.measure(headerText)['width']) / 2);
  Ironwood.display.drawText(headerTextStart, startY, headerText);

  //Add score
  var startScoreX = startX + (END_GAME_BOX_WIDTH - toDrawDimensions['width'])/2;
  var startScoreY = startY + 2;
  Ironwood.display.drawText(startScoreX, startScoreY, toDraw);

  //Add smokebomb information
  if(smokebombs > 0) {
    var smokebombText = "And you still had " + smokebombs + " smokebombs!";
    var smokebombColor = "orange";
    var smokebombScoreX = startX + (END_GAME_BOX_WIDTH - ROT.Text.measure(smokebombText)['width'])/2;
    var smokebombScoreY = endY - 3;
    Ironwood.display.drawText(smokebombScoreX, smokebombScoreY, "%c{" + smokebombColor + "}" + smokebombText + "%c{}");
  }


  //Add footer text
  var footerText = "%c{red}Press Enter to play again%c{}";
  var footerTextStart = startX + ((END_GAME_BOX_WIDTH - ROT.Text.measure(footerText)['width']) / 2);
  Ironwood.display.drawText(footerTextStart, endY - 1, footerText);

  //set up handler to start new game
  window.addEventListener("keypress", Ironwood);
}
