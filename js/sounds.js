//This class holds the list of sounds on a given level
var Sounds = function(time) {
  MapCollection.call(this);
  this._time = time;
}

Sounds.extend(MapCollection);

Sounds.prototype.getSounds = function() {
  return this.getObjects();
}

Sounds.prototype.getSoundsAtTick = function(timeTick) {
  var toReturn = [];
  var allSounds = this.getSounds();
  for(var x = 0; x < allSounds.length; x++) {
    if(allSounds[x].getTick() == timeTick) {
      toReturn.push(allSounds[x]);
    }
  }
  return toReturn;
}

Sounds.prototype.soundAt = function(coord) {
  return this.objectAt(coord);
}

Sounds.prototype.addSound = function(newSound) {
  this.addObject(newSound);
}

Sounds.prototype.soundsHeardBy = function(mob) {
  var toCheck = [];
  var toReturn = [];
  var allSounds = this.getSounds();
  for(var x = 0; x < allSounds.length; x++) {
    var tick = allSounds[x].getTick();
    //We want to give everyone a shot at the previous two ticks, Players get any time
    if(tick >= this._time.previous() || mob instanceof Player) {
      toCheck.push(allSounds[x]);
    }
  }
  //console.log(toCheck);
  for(var x = 0; x < toCheck.length; x++) {
    sound = toCheck[x];
    if(sound && sound.heardBy(mob)) {
      toReturn.push(sound);
    }
  }
  return toReturn;
}

//Grabs the top sound off the stack in order of importance
Sounds.prototype.soundHeardByMob = function(mob) {
  var allSounds = this.soundsHeardBy(mob);
  allSounds.sort(function(a,b) {
    if(a.getPriority() < b.getPriority()) {
      return -1;
    } else if(a.getPriority() > b.getPriority()){
      return 1;
    } else {
      return 0;
    }
  });
  return allSounds[allSounds.length - 1];
}

Sounds.prototype.deleteSound = function(toDelete) {
  return this.deleteObject(toDelete);
}

Sounds.prototype.deleteSoundsAt = function(timeTick) {
  var deletedSoundCoords = [];
  var soundsAtTime = this.getSoundsAtTick(timeTick);
  for(var x = 0; x < soundsAtTime.length; x++) {
    var soundCoord = soundsAtTime[x].getCoord();
    deletedSoundCoords.push(soundCoord);
    this.deleteSound(soundsAtTime[x]);
  }
  return deletedSoundCoords;
}

Sounds.prototype.hasSounds = function() {
  return this.hasObjects();
}
