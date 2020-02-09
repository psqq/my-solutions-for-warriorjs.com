
class Action {
  constructor() {
    this.done = false;
    /** @type {Warrior} */
    this.warrior = null;
  }
  /**
   * @param {Warrior} warrior
   */
  setWarrior(warrior) {
    this.warrior = warrior;
  }
  isDone() {
    return this.done;
  }
  doIt() {
    this.done = true;
  }
  isBound(dir) {
    const unit = this.warrior.feel(dir).getUnit();
    if (!unit) {
      return false;
    }
    return unit.isBound();
  }
  isEnemy(dir) {
    const unit = this.warrior.feel(dir).getUnit();
    if (!unit) {
      return false;
    }
    return unit.isEnemy();
  }
  isEmpty(dir) {
    return this.warrior.feel(dir).isEmpty();
  }
  lookForUnit(dir) {
    const arr = this.warrior.look(dir);
    for(let space of arr) {
      if (space.isUnit()) {
        return space.getUnit();
      }
    }
  }
}

class ActionsChain extends Action {
  /**
   * @param {Action[]} actions
   */
  constructor(actions = []) {
    super();
    /** @type {Action[]} */
    this.actions = actions;
    this.currentAction = this.actions[0];
    this.i = 0;
  }
  isDone() {
    if (!this.currentAction) {
      return true;
    }
    return super.isDone();
  }
  /**
   * @param {Warrior} warrior
   */
  setWarrior(warrior) {
    for(let action of this.actions) {
      action.setWarrior(warrior);
    }
  }
  next() {
    this.i++;
    this.currentAction = this.actions[this.i];
  }
  doIt() {
    while (this.currentAction 
      && this.currentAction.isDone()
    ) {
      this.next();
    }
    if (this.currentAction) {
      this.currentAction.doIt();
    } else {
      this.done = true;
    }
  }
}

class GoWhileCanAction extends Action {
  constructor(dir) {
    super();
    this.dir = dir;
  }
  isDone() {
    if (!this.isEmpty(this.dir)) {
      return true;
    }
    return super.isDone();
  }
  doIt() {
    this.warrior.walk(this.dir);
  }
}

class RescueAction extends Action {
  constructor(dir) {
    super();
    this.dir = dir;
  }
  isDone() {
    if (!this.isBound(this.dir)) {
      return true;
    }
    return super.isDone();
  }
  doIt() {
    this.warrior.rescue(this.dir);
  }
}

class KillAction extends Action {
  constructor(dir) {
    super();
    this.dir = dir;
  }
  isDone() {
    if (!this.isEnemy(this.dir)) {
      return true;
    }
    return super.isDone();
  }
  doIt() {
    this.warrior.attack(this.dir);
  }
}

class PivotAction extends Action {
  constructor(dir) {
    super();
    this.dir = dir;
  }
  doIt() {
    this.warrior.pivot(this.dir);
    this.done = true;
  }
}

class RestHealthAction extends Action {
  constructor(essentialHealth) {
    super();
    this.essentialHealth = essentialHealth;
  }
  isDone() {
    if (this.warrior.health() >= this.warrior.maxHealth()
      || this.warrior.health() >= this.essentialHealth
    ) {
      return true;
    }
    return super.isDone();
  }
  doIt() {
    this.warrior.rest();
  }
}

class UseBowWhileCanAction extends Action {
  constructor(dir) {
    super();
    this.dir = dir;
  }
  isDone() {
    const unit = this.lookForUnit(this.dir);
    if (!unit || !unit.isEnemy()) {
      return true;
    }
    return super.isDone();
  }
  doIt() {
    this.warrior.shoot(this.dir);
  }
}

class StepAction extends Action {
  constructor(dir) {
    super();
    this.dir = dir;
  }
  isDone() {
    return super.isDone();
  }
  doIt() {
    this.warrior.walk(this.dir);
    this.done = true;
  }
}

class Player {
  constructor() {
    this.actionsChain = new ActionsChain([
      new RescueAction('right'),
      new StepAction('right'),
      new StepAction('backward'),
      new KillAction('left'),
      new StepAction('left'),
      new StepAction('left'),
    ]);
  }
  /**
   * Plays a warrior turn.
   *
   * @param {Warrior} warrior The warrior.
   */
  playTurn(warrior) {
    this.actionsChain.setWarrior(warrior);
    warrior.think(this.actionsChain.i);
    this.actionsChain.doIt();
    warrior.think(this.actionsChain.i);
  }
}
