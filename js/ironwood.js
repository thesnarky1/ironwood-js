//Smoke bombs:   3 | Noise: ._-^*! | Floor 1 | Time 1 | Treasures 0 | Guards 0
var Ironwood = {
  game: null,

  init: function() { //Init the required variables
    window.addEventListener("keypress", this);
  },

  handleEvent: function(e) {
    if(e.type == "keypress") { //Load the game
      window.removeEventListener("keypress", this);
      var displayOptions = {
        width: IRONWOOD_WIDTH,
        height: IRONWOOD_HEIGHT,
        spacing: .9,
        fontFamily: "arial"
      }
      this.display = new ROT.Display(displayOptions);
      document.getElementById('content').innerHTML = "";
      document.getElementById('content').appendChild(this.display.getContainer());

      //Make the game
      this.game = new Game(this.WIDTH, this.HEIGHT);

      //Start this game's scheduler and engine (not in Ironwood so we can restart the game)
      this.scheduler = new ROT.Scheduler.Simple();
      this.scheduler.add(this.game.getPlayer(), true);
      this.engine = new ROT.Engine(this.scheduler);
      this.engine.start();
    }
  }


}
