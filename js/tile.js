var Tile = {
  WALL: '#',
  FLOOR: '.',
  WATER: '~',
  DOOR: '+',
  CROPPED: ' ',
  TYPES: {
    "+": {blocks_movement: false, blocks_vision: true},  //Door
    "#": {blocks_movement: true, blocks_vision: true},   //Wall
    ".": {blocks_movement: false, blocks_vision: false}, //Floor
    "~": {blocks_movement: true, blocks_vision: false}   //Water
  },
  
  blocksVisibility: function(toTest) {
    return this.TYPES[toTest] && this.TYPES[toTest]['blocks_vision'];
  },

  blocksMovement: function(toTest) {
    return this.TYPES[toTest] && this.TYPES[toTest]['blocks_movement'];
  }
}
