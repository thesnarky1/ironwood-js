//Class to handle everything that lives and moves, be it friend or foe
var Living = function(map, coord) {
  Displayable.call(this, map, coord);
}
  
Living.extend(Displayable);
