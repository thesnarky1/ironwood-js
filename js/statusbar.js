var StatusBar = function(game) {
  this._game = game;
}

StatusBar.prototype.view = function() { //Removed 'game' arg from original as we already track that
  var toReturn = "%b{" + STATUSBAR_BACKGROUND_COLOR + "}%c{" + STATUSBAR_TEXT_COLOR + "}";
  var smokebombs = this.getGame().getPlayer().getSmokebombs();
  var noiseCount = this.getGame().getPlayer().noiseCount();

  //Color smokebombs
  var smokeColor = "green";
  if(smokebombs == 1) {
    smokeColor = "yellow";
  } else if(smokebombs == 0) {
    smokeColor = "red";
  }
  toReturn += "Smoke bombs: %b{" + smokeColor + "}" + 
              smokebombs + "%b{" + STATUSBAR_BACKGROUND_COLOR + "}" + 
              " | ";

  //Color the noise section based on how loud we are
  toReturn += "Noise: ";
  var noiseLevel = "._-^*!";
  var noiseIndex = noiseCount + 1;

  //Determine color for the text
  var noiseColor = "green";
  if(noiseCount >= 5) { noiseColor = "red"; }
  else if(noiseCount > 1) { noiseColor = "yellow"; }
  else { noiseColor = "green"; }
  
  noiseLevel = "%b{" + noiseColor + "}" + 
               noiseLevel.substr(0,noiseIndex) + 
               "%b{" + STATUSBAR_BACKGROUND_COLOR + "}" +  
               noiseLevel.substr(noiseIndex,noiseLevel.length - noiseIndex);
  toReturn += noiseLevel + " | ";
  toReturn += this.getGame().getScore().statusLine();
  toReturn += "%b{}";
  return toReturn;
}

StatusBar.prototype.getGame = function() {
  return this._game;
}
