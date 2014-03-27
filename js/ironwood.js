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
  },

  //Deprecated, leaving here for funsies
  _generateMap: function() { //Generate our map at the start
    //Set up digger options
    var freeCells = [];
    var digger = new ROT.Map.Digger(this.WIDTH, 
                                    this.HEIGHT - 1,          //Allow room for status bar at bottom
                                    {roomWidth:[5, 25],       //Rooms should be at least 5, at most 25 pixels wide
                                     roomHeight: [3, 20],     //Rooms should be at least 3, at most 20 pixels high
                                     corridorLength: [0, 5], //I don't want long cooridors
                                     dugPercentage: .60,      //Let's dig out most of the map
                                     timeLimit: 2000});       //Or stop if it takes 2 seconds

    //Callback to add each dug room into our map
    var digCallback = function(x, y, value) {
      if(value) {
        return;
      }
      var key = new Coordinate(x,y).toString();
      freeCells.push(key);
      this.map[key] = ".";
    }
    
    //Callback to change door locations into + symbols
    var doorCallback = function(x,y) {
      var coord = new Coordinate(x,y);
      this.map[coord.toString()] = "+";
    }

    //Dig out the map
    digger.create(digCallback.bind(this));

    //Add doors to rooms
    var rooms = digger.getRooms();
    for(var i = 0; i < rooms.length; i++) {
      var room = rooms[i];
      room.getDoors(doorCallback.bind(this));
    }
   
    //Show the map 
    this._displayWholeMap();

    //Create player
    this.player = this._createBeing(Player, freeCells);
    this.player.display();
    console.log(this.player);
  },

  _createBeing: function(what, freeCells) {
    var index = Math.floor(ROT.RNG.getUniform() * freeCells.length);
    var key = freeCells.splice(index, 1)[0];
    var coord = new Coordinate(0,0);
    coord.fromString(key);
    var what = new what(coord);
    return what;
  },

  _displayWholeMap: function() { //Renders entire map in one go
    for(var key in this.map) {
      var coord = new Coordinate(0,0);
      coord.fromString(key);
      this.display.draw(coord.getX(),coord.getY(),this.map[key]);
    }
  },

  _displayGame: function() {
  }
}
