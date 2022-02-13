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
  constructor() {

    this.player   = new Game.World.Player();

    this.score = 0    

    this.height   = 1000
    this.width    = 2000

    // this.map = [
    //   [1,1,1,1,1,1,1,1],
    //   [1,0,0,1,1,1,1,1],
    //   [1,1,0,0,0,0,1,1],
    //   [1,0,2,1,1,2,1,1],
    //   [1,0,1,0,0,0,0,1],
    //   [1,0,3,1,1,1,0,1],
    //   [1,1,0,0,0,0,0,1],
    //   [1,1,1,1,1,1,1,1],
    // ]

    this.map = [
      [1,1,1,1,1,1,1,1],
      [1,0,0,0,0,0,0,1],
      [1,0,0,1,0,0,0,1],
      [1,0,0,2,0,1,0,1],
      [1,0,1,0,0,0,0,1],
      [1,0,0,0,1,3,0,1],
      [1,0,0,0,0,0,0,1],
      [1,1,1,1,1,1,1,1],
    ]    

    this.map_qs = []

    this.map_height = this.map.length
    this.map_width = this.map[0].length

  };

  update() {

    this.player.update();

    // // Stay inside borders
    // if (this.player.x < 0)                  {this.player.x = 0}
    // if (this.player.x > this.map_width-1)   {this.player.x = this.map_width-1}
    // if (this.player.y < 0)                  {this.player.y = 0}
    // if (this.player.y > this.map_height-1)  {this.player.y = this.map_height-1}

    // Stay inside borders
    if (this.player.x < 0)                  {this.score--; this.player.done = true; return}
    if (this.player.x > this.map_width-1)   {this.score--; this.player.done = true; return}
    if (this.player.y < 0)                  {this.score--; this.player.done = true; return}
    if (this.player.y > this.map_height-1)  {this.score--; this.player.done = true; return}  

    // Collisions
    let position = this.map[this.player.y][this.player.x]
    if (position == 1) {this.score--; this.player.done = true}
    else if (position == 2) {
      this.score+=10;
      this.map[this.player.y][this.player.x] = 0 // remove single reward
    }
    else if (position == 3) {this.score+=10; this.player.done = true}

    if (this.player.done) {
      this.player.x=this.player.start_x; 
      this.player.y=this.player.start_y
    }
  }

};

Game.World.Player = class {
  constructor() {
    this.color1     = "#303030";
    this.color2     = "#992000";

    this.start_x = 1
    this.start_y = 1
    this.x          = this.start_x
    this.y          = this.start_y

    this.done = false
  }

  moveUp() {   
    this.y--
  }
  moveDown() {    
    this.y++
  }
  moveLeft() {   
    this.x--
  }
  moveRight() {    
    this.x++
  }  

  update() {

    

  }

};