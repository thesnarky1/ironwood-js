//Smoke bombs:   3 | Noise: ._-^*! | Floor 1 | Time 1 | Treasures 0 | Guards 0
var Ironwood = {
  WIDTH: 100,
  HEIGHT: 60,

  game: null,

  init: function() { //Init the required variables
    this.display = new ROT.Display({width: this.WIDTH, height: this.HEIGHT});
    document.body.appendChild(this.display.getContainer());

    //Make the game
    this.game = new Game(this.WIDTH, this.HEIGHT);

    //Start this game's scheduler and engine (not in Ironwood so we can restart the game)
    this.scheduler = new ROT.Scheduler.Simple();
    this.scheduler.add(this.game.getPlayer(), true);
    this.engine = new ROT.Engine(this.scheduler);
    this.engine.start();
  },
}
