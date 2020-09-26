class Unit {
  constructor(name, id, hp, group = " default") {
    this.name = name;
    this.id = id;
    this.group = group;
    this.fullHP = hp;
    this.hp = hp;
  }

  reduceHP(amount) {
    if(this.hp - amount >= 0)
      this.hp -= amount;
  }

  resetHP() {
    this.hp = this.fullHP;
  }

  get uniqueName() {
    return this.name + " " + this.id;
  }
}

class Roster {
  constructor() {
    this.units = [];
  }

  addCharacter(name, hp, group = "") {
	if(!(name === "")) {
		if(!(group === "")) {
		  roster.addUnit(new Unit(name, roster.nextUnitId(name), hp, group));
		} else {
		  roster.addUnit(new Unit(name, roster.nextUnitId(name), hp));
		}
	  }
	}

  addUnit(unit) {
    this.units.push(unit);
  }

  nextUnitId(name) {
    var id = 1;
    var unit;
    for(unit of this.units) {
      if(unit.name === name)
        id += 1;
    }
    return id;
  }

  isUnique(unit) {
    var unique = true;
    var other;
    for(other of this.units) {
      if(unit != other && unit.name === other.name)
        unique = false;
    }
    return unique;
  }

  reduceHP(name, id, amount) {
    for(unit of this.units) {
      if(unit.name === name && unit.id == id) {
        unit.reduceHP(amount);
      }
    }
  }

  resetHP() {
    for(unit of this.units)
      unit.resetHP();
  }

  removeUnit(filterName, filterId) {
    this.units = this.units.filter(function(unit){
      return !(unit.name === filterName && unit.id == filterId);
    });
  }

  removeGroup(groupName) {
    this.units = this.units.filter(function(unit){
      return !(unit.group === groupName);
    });
  }

  get getUnitsByGroup() {
    var byGroup = new Map();
    var unit;
    for(unit of this.units) {
      if(byGroup.has(unit.group)) {
        byGroup.get(unit.group).push(unit);
      } else {
        byGroup.set(unit.group, [unit]);
      }
    }
    return byGroup;
  }

  get getUniqueGroups() {
    var groups = [];
    var unit;
    for(unit of this.units) {
      if(!groups.includes(unit.group))
        groups.push(unit.group);
    }
    return groups;
  }

  get getUniqueNames() {
    var names = [];
    var unit;
    for(unit of this.units) {
      if(!names.includes(unit.name))
        names.push(unit.name);
    }
    return names;
  }

  get getNames() {
    var names = [];
    var unit;
    for(unit of this.units) {
      names.push(unit.name);
    }
    return names;
  }

  get getHPs() {
    var hps = [];
    var unit;
    for(unit of this.units) {
      hps.push(unit.hp);
    }
    return hps;
  }

  get getGroups() {
    var groups = [];
    var unit;
    for(unit of this.units) {
      groups.push(unit.group);
    }
    return groups;
  }
  
  get getURL() {
	return "?" + "names="+this.getNames.map(encodeURIComponent)+"&groups="+this.getGroups.map(encodeURIComponent)+"&hps="+this.getHPs.map(encodeURIComponent);
  }
}

var roster = new Roster();

function hpLevel(full, current) {
  var ratio = current / full
  if(ratio <= 0.2) return 'low';
  else if(ratio > 0.2 && ratio <= 0.4) return 'lowmed';
  else if(ratio > 0.4 && ratio <= 0.6) return 'med';
  else if(ratio > 0.6 && ratio <= 0.8) return 'medhigh';
  else return 'high';
}

function updateTable() {
  document.getElementById("figures").innerHTML = "";
  let unitsByGroup = roster.getUnitsByGroup;
	for(group of roster.getUniqueGroups.sort()) {
    if(!(group === " default")) {
      document.getElementById("figures").innerHTML +=
        "<tr class='groupheader'>"+
        "<td class='title' colspan='5'>" +
        "<button class='delete' onclick=\"removeGroup('"+group+"')\"><img src='trash-can.png'/></button>" +
        group + "</td></tr>";
    }
    var r = 0;
    for(unit of unitsByGroup.get(group)) {
      document.getElementById("figures").innerHTML +=
      "<tr class='row"+r%2+" "+(unit.hp===0? "dead" : "alive")+"'>"+
      "<td class='name'><button class='delete' onclick=\"removeUnit('"+unit.name+"', '"+unit.id+"')\"><img src='trash-can.png'/></button> " + (roster.isUnique(unit)? unit.name : unit.uniqueName) + "</td>"+
			"<td class='hp hp-"+hpLevel(unit.fullHP, unit.hp)+"'>" + unit.hp + " HP</td>"+
			"<td class='button'><button onclick=\"reduceHP('"+unit.name+"', '"+unit.id+"', -1)\"><img src='health-increase.png'/></button></td>" +
			"<td class='button'><button onclick=\"reduceHP('"+unit.name+"', '"+unit.id+"', 1)\"><img src='health-decrease.png'/></button></td>" +
			"</tr>";
      r += 1;
    }
	}

  document.getElementById("names").innerHTML = "";
  for(name of roster.getUniqueNames.sort())
    document.getElementById("names").innerHTML += "<option value='"+name+"'>";

  document.getElementById("groups").innerHTML = "";
  for(group of roster.getUniqueGroups.sort())
    document.getElementById("groups").innerHTML += "<option value='"+group+"'>";
}


function reduceHP(name, id, amount) {
  roster.reduceHP(name, id, amount);
  updateTable();
}

function addCharacter(name, hp, group) {
  roster.addCharacter(name, hp, group);
  updateTable();
}

function importBattleScribeRoster(importText) {
	var lines = importText.split("\n");
	var newUnitName = null;
	for(line of lines) {
		if(!(line === "" || line.startsWith('+'))) {
			var unit = line.split(new RegExp('\[[0-9,]+pts\]'));

			if (newUnitName == null) {
				if(unit.length > 1)
					newUnitName = unit[0].substring(0,unit[0].length-1);
			} else {
				var hpStr = line.match(new RegExp('Wounds:[0-9]+'));
				if(hpStr != null) {
					var hp = hpStr[0].substring(7, hpStr[0].length);
					roster.addCharacter(newUnitName, hp, "");
					newUnitName = null;
				}
			}
		}
	}
  
	window.location.href = "index.html" + roster.getURL;
}

function importHPTrackerRoster(importText) {
	var lines = importText.split("\n");
	var newGroupName = null;
	for(line of lines) {
		if(line.startsWith('# ')) {
			newGroupName = line.substring(2, line.length);
		} else if(line.startsWith('- ')) {
			var unit = line.substring(2, line.length).split(', ');
			var name = unit[0];
			var hp = unit[1];
			if(newGroupName === null) roster.addCharacter(name, hp, "");
			else roster.addCharacter(name, hp, newGroupName);
		}
	}
  
	window.location.href = "index.html" + roster.getURL;
}

function importRoster(importText, sourceType) {
	if(sourceType === 'battlescribe') importBattleScribeRoster(importText);
	else if(sourceType === 'hptracker') importHPTrackerRoster(importText);
	else window.alert("Unknown import format.");
}

function removeUnit(name, id) {
  roster.removeUnit(name, id);
  updateTable();
}

function removeGroup(name) {
  roster.removeGroup(name);
  updateTable();
}

function copyToClipboard(text) {
  const listener = function(ev) {
    ev.preventDefault();
    ev.clipboardData.setData('text/plain', text);
  };
  document.addEventListener('copy', listener);
  document.execCommand('copy');
  document.removeEventListener('copy', listener);
}

function copyURL() {
	let wl = window.location;
	var baseURL = wl.protocol+wl.host+wl.pathname;
	
	copyToClipboard(baseURL + roster.getURL);
	window.alert("Copied URL to this roster. Store it somewhere.\n\n"+baseURL + roster.getURL);
}

function fullReset() {
	roster = new Roster();
  updateTable();
}

function resetHP() {
	roster.resetHP();
  updateTable();
}