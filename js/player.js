var Player = function(map, coord, direction) {
  Living.call(this, map, coord, direction);
  this.setColor("#9999ff");
  this.setSymbol("@");
  this._smokebombs = 2;
  //this.display();  

  //Store applicable keys for various inputs
  this._dirMap = {};
  this._actionMap = {};

  //Numpad
  this._dirMap[ROT.VK_NUMPAD8] = DIR_N;
  this._dirMap[ROT.VK_NUMPAD9] = DIR_NE;
  this._dirMap[ROT.VK_NUMPAD6] = DIR_E;
  this._dirMap[ROT.VK_NUMPAD3] = DIR_SE;
  this._dirMap[ROT.VK_NUMPAD2] = DIR_S;
  this._dirMap[ROT.VK_NUMPAD1] = DIR_SW;
  this._dirMap[ROT.VK_NUMPAD4] = DIR_W;
  this._dirMap[ROT.VK_NUMPAD7] = DIR_NW;
  this._actionMap[ROT.VK_NUMPAD5] = ACTION_REST;


  //For laptop users
  this._dirMap[ROT.VK_W] = DIR_N;
  this._dirMap[ROT.VK_E] = DIR_NE;
  this._dirMap[ROT.VK_D] = DIR_E;
  this._dirMap[ROT.VK_C] = DIR_SE;
  this._dirMap[ROT.VK_X] = DIR_S;
  this._dirMap[ROT.VK_Z] = DIR_SW;
  this._dirMap[ROT.VK_A] = DIR_W;
  this._dirMap[ROT.VK_Q] = DIR_NW;

  //VIM
  this._dirMap[ROT.VK_K] = DIR_N;
  this._dirMap[ROT.VK_U] = DIR_NE;
  this._dirMap[ROT.VK_L] = DIR_E;
  this._dirMap[ROT.VK_N] = DIR_SE;
  this._dirMap[ROT.VK_J] = DIR_S;
  this._dirMap[ROT.VK_B] = DIR_SW;
  this._dirMap[ROT.VK_H] = DIR_W;
  this._dirMap[ROT.VK_Y] = DIR_NW;
  this._actionMap[ROT.VK_PERIOD] = ACTION_REST;

  //Schema agnostic
  this._actionMap[ROT.VK_GREATER_THAN] = ACTION_STAIRS;
  this._actionMap[ROT.VK_D] = ACTION_DRAG;
  this._actionMap[ROT.VK_S] = ACTION_SMOKEBOMB;
  this._actionMap[ROT.VK_SPACE] = ACTION_REST;
}

Player.extend(Living);

Player.prototype.onNewMap = function() { //Finish out this function once levels are implemented
  this._fov = new ROT.FOV.RecursiveShadowcasting(this.buildLightPassesCallback(this.getMap()));
  this._currentVision = new FieldOfView(true);
  this.setDirection(this.getDirection());
  this._smokebombs += 1;
}

Player.prototype.act = function() {
  Ironwood.engine.lock();
  window.addEventListener("keydown", this);
}

Player.prototype.handleEvent = function(e) {
  var success = false;
  var code = e.keyCode;

  if(code == ROT.VK_PERIOD && e.shiftKey) { //Because I'm only using keydown, ROT believes it's the period being pressed for greater than
    code = ROT.VK_GREATER_THAN;
  }

  if(code in this._dirMap) { //We move
    var oldCoord = this.getCoord();
    var currX = oldCoord.getX();
    var currY = oldCoord.getY();
    var diff = ROT.DIRS[8][this._dirMap[code]];
    var newX = currX + diff[0];
    var newY = currY + diff[1];
    var newCoord = new Coordinate(newX, newY);

    if(!Tile.blocksMovement(this.getMap().getTiles().get(newCoord))) { //Don't let them walk through walls

      var skipMovement = false; //if we fall down a trapdoor we'll want to skip actually moving and just draw the new level

      //Check to see if we're hitting something
      var newItem = this._map.getItems().itemAt(newCoord);
      if(newItem) {
        if(newItem instanceof Treasure) {
          this._map.getItems().deleteItem(newItem); //Remove the treasure
          this._map.getGame().getScore().addTreasure(); //Profit!
        } else if(newItem instanceof Trapdoor) { //Drop them down
          this._map.getGame().newFloor();
          skipMovement = true;
          success = true;
        }
      }

      var mob = this.getMap().getMobs().mobAt(newCoord);

      if(!skipMovement) {
        //Move the player
        var dir = this.directionTo(newCoord);
        if(!DEBUG_SILENT_MODE) { this.doAction(ACTION_MOVE); }
        this.setCoord(newCoord);
        if(mob && mob instanceof Guard) {
          //Can't knock out alert guards
          if(mob.getState() == GUARD_HUNTING || mob.getState() == GUARD_RAGING) {
            this.getMap().getGame().end();
          } else { //git sum
            this.getMap().getGame().getScore().addGuard();
            this.getMap().getMobs().deleteMob(mob);
            Ironwood.getScheduler().remove(mob);
            this.getMap().dropItem(new Body(this.getMap(), newCoord));
          }
        }
        this.setDirection(dir);
        success = true;
      }
    }
  } else if(code in this._actionMap) { //We ride
    var actionCode = this._actionMap[code];

    if(actionCode == ACTION_SMOKEBOMB) {
      if(this._smokebombs > 0) {
        this._smokebombs--;
        var mobsSeen = this.getMap().mobsSeenBy(this);
        for(var i = 0; i < mobsSeen.length; i++) {
          if(!(mobsSeen[i] instanceof Player)) { //Not flashing ourselves
            mobsSeen[i].stun();
          }
        }
        this.doAction(ACTION_STUN);
        success = true;
      }
    } else if(actionCode == ACTION_STAIRS) {
      //Check to see if we're at stairs
      var stairs = this.getMap().getItems().itemAt(this.getCoord());
      if(stairs && (stairs instanceof Staircase)) {
        this._map.getGame().newFloor();
        success = true;
      }
    } else if(actionCode == ACTION_REST) {
      this.doAction(ACTION_REST);
      success = true;
    } else if(actionCode == ACTION_DRAG) {
      var body = this.getMap().getItems().bodyNearPlayer(this);
      if(body) {
        var bodyCoords = body.getCoord();
        body.setCoord(this.getCoord());
        this.doAction(ACTION_DRAG);
        success = true;
      }
    }
  }
  this.finishAct(success);
}

Player.prototype.finishAct = function(success) {
  if(success) {
    window.removeEventListener("keydown", this);
    Ironwood.engine.unlock();
    this._map.turn();
  }
}

Player.prototype.getSmokebombs = function() {
  return this._smokebombs;
}

Player.prototype.getViewRadius = function() {
  return PLAYER_VIEW_RADIUS;
}

Player.prototype.calculateFOV = function() {
  //console.log(this);
  this._currentVision.clearSeen();
  this._fov.compute(this.getX(), this.getY(), this.getViewRadius(), this.buildFOVCallback(this.getFOV()));
  //console.log("Made it out of computation");
  //console.log(this._currentVision);
}
