
var Ironwood = {
  WIDTH: 100,
  HEIGHT: 40,

  map: {}, //This is a has indexed by Coordinate strings, it points to a symbol at each coordinate

  init: function() { //Init the required variables
    this.display = new ROT.Display({width: this.WIDTH, height: this.HEIGHT});
    document.body.appendChild(this.display.getContainer());
    this._generateMap();
    this._displayWholeMap();
  },

  _generateMap: function() { //Generate our map at the start
    //Set up digger options
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
  },

  _displayWholeMap: function() {
    for(var key in this.map) {
      var coord = new Coordinate(0,0);
      coord.fromString(key);
      this.display.draw(coord.getX(),coord.getY(),this.map[key]);
    }
  }
}