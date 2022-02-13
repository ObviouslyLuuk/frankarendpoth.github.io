// Frank Poth 03/09/2018

/* The keyDownUp handler was moved to the main file. */

class Controller {
  constructor() {

    this.left  = new Controller.ButtonInput();
    this.right = new Controller.ButtonInput();
    this.B     = new Controller.ButtonInput()
    this.T     = new Controller.ButtonInput()

    this.keyDownUp = function(type, key_code) {

      let down
      if (type == "keydown") {
        down = true
      } else {
        down = false
      }
      
      switch(key_code) {

        case 37: this.left.getInput(down);  break;
        case 39: this.right.getInput(down); break;
        case 66: this.B.getInput(down);     break;
        case 84: this.T.getInput(down);     break;

      }

    };

  };
}

Controller.ButtonInput = class {
  constructor() {

    this.active = this.down = false;

  };

  getInput(down) {

    if (this.down != down) this.active = down;
    this.down = down;

  }

};
