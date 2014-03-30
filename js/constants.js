//Constants for app
IRONWOOD_WIDTH = 80;
IRONWOOD_HEIGHT = 40;

//Constants for guard states
var GUARD_GUARDING = 0;
var GUARD_WALKING  = 1;
var GUARD_HUNTING  = 2;
var GUARD_YELLING  = 3;
var GUARD_RAGING   = 4;
var GUARD_STUNNED  = 5;

var GUARD_RAGING_COLOR  = "#ff0000";
var GUARD_NORMAL_COLOR  = "#9990ff";
var GUARD_STUNNED_COLOR = "#ffff00";


//Constants for direction
var DIR_N  = 0;
var DIR_NE = 1;
var DIR_E  = 2;
var DIR_SE = 3;
var DIR_S  = 4;
var DIR_SW = 5;
var DIR_W  = 6;
var DIR_NW = 7;

//Constants for Player action keys
var ACTION_SMOKEBOMB = 0;
var ACTION_STAIRS    = 1;
var ACTION_REST      = 2;
var ACTION_DRAG      = 3;
var ACTION_STUN      = 4;
var ACTION_RUN       = 5;
var ACTION_MOVE      = 6;
var ACTION_YELL      = 7;

//Mob view distances
var PLAYER_VIEW_RADIUS = 12;
var GUARD_VIEW_RADIUS  = 6;
var GUARD_PATROL_RADIUS= 30;


//Sound constants
var SOUND_COLOR = "#00ff00";
var SOUND_TILE  = '!';
var SOUND_DURATION = 4;
var SOUND_RADIUSES = {};
SOUND_RADIUSES[ACTION_RUN]  = 10;
SOUND_RADIUSES[ACTION_DRAG] = 6;
SOUND_RADIUSES[ACTION_YELL] = 15;
var SOUND_PRIORITIES = {};
SOUND_PRIORITIES[ACTION_RUN]  = 10;
SOUND_PRIORITIES[ACTION_DRAG] = 6;
SOUND_PRIORITIES[ACTION_YELL] = 15;


//Constants to index Floor array in score
var FLOOR_TREASURES    = 0;
var FLOOR_GUARDS       = 1;
var FLOOR_FINISHED_AT  = 2;

//Constants for map generation
var MAP_GEN_MIN_ROOM_DIM        = 2;
var MAP_GEN_MAX_ROOM_DIM        = 9;
var MAP_GEN_ROOM_DISTANCES = [1,1,1,2,2,2,2,2,2,2,2,3,3,3,3,4,4,5];

var MAP_GEN_MAP_MIN_WIDTH  = 40;
var MAP_GEN_MAP_MAX_WIDTH  = 70;
var MAP_GEN_MAP_MIN_HEIGHT = 30;
var MAP_GEN_MAP_MAX_HEIGHT = 40;

var MAP_GEN_MIN_ROOMS = 20;
var MAP_GEN_MAX_ROOMS = 200;

var MAP_GEN_TREASURE_MIN = 8;
var MAP_GEN_TREASURE_MAX = 20;

var MAP_GEN_PATROL_MIN = 2;
var MAP_GEN_PATROL_MAX = 10;

var MAP_GEN_GUARD_MIN = 10;
var MAP_GEN_GUARD_MAX = 40;

var MAP_GEN_GUARD_GUARDS_MIN   = 2;
var MAP_GEN_GUARD_GUARDS_MAX   = 5;
var MAP_GEN_GUARD_GUARDS_RANGE = 10;

var MAP_GEN_TRAPDOOR_MIN = 2;
var MAP_GEN_TRAPDOOR_MAX = 5;

var MAP_GEN_PLAYER_HOLE_SIZE = 8;

var MAP_GEN_AVAILABLE_TRIES = 100;

//Constants for Room struct
var ROOM_TOP    = 0;
var ROOM_BOTTOM = 1;
var ROOM_LEFT   = 2;
var ROOM_RIGHT  = 3;

//Constants for output
var MAP_Y_OFFSET = 1;
var MAP_X_OFFSET = 0;

var STATUSBAR_TEXT_COLOR = "black";
var STATUSBAR_BACKGROUND_COLOR = "orange";
