// Frank Poth 03/23/2018

/* I moved the world object into its own class and I made the Player class a class
inside of Game.World. I am doing this in order to compartmentalize my objects more
accurately. The Player class will never be used outside of the World class, and the
World class will never be used outside of the Game class, therefore the classes will
be nested: Game -> Game.World -> Game.World.Player */

class Game {
  constructor() {

    /* The world object is now its own class. */
    this.world = new Game.World();

  }

  /* The Game.update function works the same as in part 2. */
  update() {

    this.world.update();

  }
}

/* The world is now its own class. */
Game.World = class {
  constructor(friction = .9) {

    this.friction = friction;

    this.player   = new Game.World.Player();

    this.score = 0    

    this.height   = 1000
    this.width    = 2000

  };

  update() {

    this.player.update();

    // this.player.velocity.x *= this.friction;
    this.player.turn_velocity *= this.friction;

    if (!this.player.dead) {
      this.score += .5 - Math.abs(this.player.pole_angle)*10
    }

  }

};

Game.World.Player = class {
  constructor() {
    this.color1     = "#303030";
    this.color2     = "#992000";
    this.cart_height      = 100;
    this.cart_width       = 200;
    this.pole_height      = 500;
    this.pole_width       = 50;

    this.pole_angle       = (Math.random()-.5)*.0001;

    this.velocity   = {x: 0}
    this.turn_velocity = 0;

    this.x          = 1000 - this.cart_width/2;
    this.y          = 500

    this.acceleration = .5
    this.gravity = .05

    this.dead = false

    this.max_turn_velocity = 0.07
    this.max_velocity = 3
    this.max_angle = Math.PI/9
  }

  getCx() {
    return this.x + this.cart_width / 2
  }

  getCy() {
    return this.y + this.cart_height / 2
  }

  moveForward() {   
    this.velocity.x += this.acceleration
    this.turn_velocity -= this.acceleration*Math.cos(this.pole_angle)/500
  }
  moveBackward() {    
    this.velocity.x -= this.acceleration
    this.turn_velocity += this.acceleration*Math.cos(this.pole_angle)/500 // weird
  }

  update() {

    this.x += this.velocity.x;

    this.turn_velocity += this.gravity*Math.sin(this.pole_angle)
    this.pole_angle += this.turn_velocity

    if (Math.abs(this.velocity.x) > this.max_velocity) {
      this.velocity.x = this.max_velocity * Math.sign(this.velocity.x)
    }
    if (Math.abs(this.turn_velocity) > this.max_turn_velocity) {
      this.turn_velocity = this.max_turn_velocity * Math.sign(this.turn_velocity)
    }

    if (Math.abs(this.pole_angle) > this.max_angle || this.x < 0 || this.x > 2000) {
      this.dead = true
    }

  }

};

function add_coords(p0, p1) {
  return {
    x: p0.x + p1.x,
    y: p0.y + p1.y
  }
}

function get_distance(p0, p1) {
  return vector_length({x: p0.x - p1.x, y: p0.y - p1.y})
}

function vector_length(vector) {
  let x = vector.x
  let y = vector.y
  return Math.sqrt( Math.pow(x, 2) + Math.pow(y, 2) )
}

function vector_signed_length(vector, direction) {
  return vector_length(vector) * vector_sign(vector, direction)
}

function add_to_vector(vector, direction, strength) {
  return {
    x: vector.x + Math.cos(direction) * strength,
    y: vector.y + Math.sin(direction) * strength,
  }
}