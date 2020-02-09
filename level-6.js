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
    if (this.isBound(this.dir)) {
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

class Player {
  constructor() {
    this.actionsChain = new ActionsChain([
      new GoWhileCanAction('backward'),
      new RescueAction('backward'),
      new GoWhileCanAction('forward'),
      new KillAction('forward'),
      new GoWhileCanAction('backward'),
      new RestHealthAction(Infinity),
      new GoWhileCanAction('forward'),
      new KillAction('forward'),
      new GoWhileCanAction('forward'),
      new KillAction('forward'),
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
