//Class to handle everything that lives and moves, be it friend or foe
var Living = function(newCoord) {
  Displayable.call(this, newCoord);
}
  
Living.extend(Displayable);
