var StatusBar = function(game) {
  this._game = game;
}

StatusBar.prototype.view = function() { //Removed 'game' arg from original as we already track that
  var toReturn = "";
  var smokebombs = this.getGame().getPlayer().getSmokebombs();
  var noiseCount = this.getGame().getPlayer().noiseCount();
  toReturn += "%b{222334}Smoke bombs: " + smokebombs + " | ";
  toReturn += "Noise: ";
  //This is hackish
  if(noiseCount >= 5) { toReturn += "%c{red}._-^*!%c{} | "; }
  else if(noiseCount == 4) { toReturn += "%c{#dddddd}._-^*%c{}! | "; }
  else if(noiseCount == 3) { toReturn += "%c{#dddddd}._-^%c{}*! | "; }
  else if(noiseCount == 2) { toReturn += "%c{#dddddd}._-%c{}^*! | "; }
  else if(noiseCount == 1) { toReturn += "%c{#dddddd}._%c{}-^*! | "; }
  else { toReturn += "%c{#dddddd}.%c{}_-^*! | "; }
  toReturn += this.getGame().getScore().statusLine();
  toReturn += "%b{}";
}

StatusBar.prototype.getGame = function() {
  return this._game;
}
