var Tile = {
  TYPES: {
    "+": {blocks_movement: false, blocks_vision: true},  //Door
    "#": {blocks_movement: true, blocks_vision: true},   //Wall
    ".": {blocks_movement: false, blocks_vision: false}, //Floor
    "~": {blocks_movement: true, blocks_vision: false}   //Water
  },
  
  blocksView: function(toTest) {
    return TYPES[toTest] && TYPES[toTest][blocks_vision];
  },

  blocksMovement: function(toTest) {
    return TYPES[toTest] && TYPES[toTest][blocks_movement];
  }
}