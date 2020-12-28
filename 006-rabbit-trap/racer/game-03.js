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
  constructor(friction = 0.90) {

    this.friction = friction;

    this.player   = new Game.World.Player();

    this.score = 0

    this.map = {
      targets: [],
      walls: []
    }    

    let outside_points = []
    let inside_points = []
    let center = {x: 1000, y: 500}
    for (let angle = 0; angle < Math.PI*2; angle +=Math.PI/800) {
      let size = 500
      let outside_point = add_coords({x: 2 * size*Math.cos(angle), y: size*Math.sin(angle)}, center)
      outside_points.push(outside_point)
      size *= .85
      let inside_point = add_coords({x: 2 * size*Math.cos(angle), y: size*Math.sin(angle)}, center)
      inside_points.push(inside_point)
    }    

    for (let p in outside_points) {
      p = parseInt(p)
      let point = outside_points[p]
      let next_point = outside_points[p+1]
      if (!next_point) {
        next_point = outside_points[0]
      }
      this.map.walls.push(new Game.World.Wall(point, next_point))

      let inside_point = inside_points[p]
      let next_inside_point = inside_points[p+1]
      if (!next_inside_point) {
        next_inside_point = inside_points[0]
      }
      this.map.walls.push(new Game.World.Wall(inside_point, next_inside_point))   

      this.map.targets.push(new Game.World.Target(point, inside_point))
    }
    

    this.height   = 1000
    this.width    = 2000

  };

  update() {

    this.player.update();

    this.player.velocity.x *= this.friction;
    this.player.velocity.y *= this.friction;

    this.player.resetSensors()

    for (let wall of this.map.walls) {
      if (wall.collideObject(this.player)) {
        this.score -= 1
      }
    }
    for (let target of this.map.targets) {
      if (target.collideObject(this.player)) {
        this.score++
      }
    }   

  }

};

Game.World.Object = class {
  constructor(start, end) {
    this.start = start
    this.end =  end
  }

  collideObject(object) {

    let p0 = this.start
    let p1 = this.end

    let left_bound = Math.min(p0.x, p1.x)
    let right_bound = Math.max(p0.x, p1.x)

    let a = (p1.y - p0.y)/(p1.x - p0.x)
    let b = p0.y - a * p0.x

    // Loop through all object borders
    for (let object_border of Object.entries(object.getBorders()) ) {
      let border_name = object_border[0]
      let border_points = object_border[1]

      let q0 = border_points[0]
      let q1 = border_points[1]

      let left_bound_object = Math.min(q0.x, q1.x)
      let right_bound_object = Math.max(q0.x, q1.x)

      let c = (q1.y - q0.y)/(q1.x - q0.x)
      let d = q0.y - c * q0.x

      /* ax+b=cx+d -> (a-c)x=d-b -> x=(d-b)/(a-c) */
      let intersect_x = (d-b)/(a-c)
      let intersection = {x: intersect_x, y: a*intersect_x + b}

      // Add intersections for distance detection
      if (this.type == "wall" && intersect_x >= left_bound && intersect_x <= right_bound) {

        let distance0 = get_distance(intersection, q0)
        let distance1 = get_distance(intersection, q1)
        let side
        if (distance0 < distance1) {
          side = 0
        } else {
          side = 1
        }

        let direction
        let corner_name
        switch(border_name) {
          case "front":   direction = "side";     if(side == 0) corner_name = "frontLeft";  else corner_name = "frontRight";  break
          case "left":    direction = "straight"; if(side == 0) corner_name = "frontLeft";  else corner_name = "backLeft";    break
          case "right":   direction = "straight"; if(side == 0) corner_name = "frontRight"; else corner_name = "backRight";   break
          case "back":    direction = "side";     if(side == 0) corner_name = "backLeft";   else corner_name = "backRight";
        }

        // If there was already an intersection with another wall from this sensor
        let distance = Math.min(distance0, distance1)
        let former_distance = object.sensors[corner_name][direction].distance
        if(!former_distance || distance < former_distance) {
          object.sensors[corner_name][direction] = {x: intersect_x, y: a*intersect_x + b, distance: distance}
        }
      }

      // Check if there is a collision
      if (intersect_x >= left_bound && intersect_x <= right_bound && intersect_x >= left_bound_object && intersect_x <= right_bound_object) {
        object.collision(this.type)
        if ( this.collision(border_name) ) {
          return true          
        }
      }

    }

    // Set object to normal if no collisions
    object.noCollision(this.type)
    this.noCollision()
    return false

  }

  collision() {return true}

  noCollision() {}
}

Game.World.Target = class extends Game.World.Object {
  constructor(start, end) {
    super(start, end)
    this.type = "target"
    this.timeout = 0
  }

  collision(border_name) {
    let res = (this.timeout == 0)
    switch(border_name) {
      case "front": this.timeout = 100; return res;
      case "left" || "right": this.timeout = 100; return res;
      case "back": this.timeout = 100; return false;
    }
  }

  noCollision() {
    if (this.timeout > 0) {
      this.timeout--
    }
  }
}

Game.World.Wall = class extends Game.World.Object {
  constructor(start, end) {
    super(start, end)
    this.type = "wall"
  }
}

Game.World.Player = class {
  constructor() {
    this.color1     = "#ff0000";
    this.color2     = "#f0f0f0";
    this.height     = 50;
    this.width      = 25;
    this.velocity   = {
      x: 0,
      y: 0,
    }
    this.direction  = 0;
    this.x          = 900;
    if (Math.random() > 0) {
      this.y          = 20;
    } else {
      this.y          = 940;
    }
    this.turn_speed = .1;

    this.dead = false

    this.sensors = {
      frontLeft: {
        straight: {x: null, y: null, distance: 0},
        side:     {x: null, y: null, distance: 0},
      },
      frontRight: {
        straight: {x: null, y: null, distance: 0},
        side:     {x: null, y: null, distance: 0},
      },
      backLeft: {
        straight: {x: null, y: null, distance: 0},
        side:     {x: null, y: null, distance: 0},
      },
      backRight: {
        straight: {x: null, y: null, distance: 0},
        side:     {x: null, y: null, distance: 0},
      },
    }
  }

  getCx() {
    return this.x + this.width / 2
  }

  getCy() {
    return this.y + this.height / 2
  }

  rotateToDirection(p) {
    // Simple rotation matrix
    return {
      x: p.x * Math.cos(this.direction) + -p.y * Math.sin(this.direction),
      y: p.x * Math.sin(this.direction) +  p.y * Math.cos(this.direction),
    }
  }

  getCorners() {
    // Height and width are swapped here because the car is facing the right at first so height is in the x direction
    let cx = this.getCx()
    let cy = this.getCy()
    let cp = {x: cx, y: cy}
    return {
      frontLeft:  add_coords( cp, this.rotateToDirection({x:  this.height/2, y: -this.width/2}) ),
      frontRight: add_coords( cp, this.rotateToDirection({x:  this.height/2, y:  this.width/2}) ),
      backLeft:   add_coords( cp, this.rotateToDirection({x: -this.height/2, y: -this.width/2}) ),
      backRight:  add_coords( cp, this.rotateToDirection({x: -this.height/2, y:  this.width/2}) ),
    }
  }

  getBorders() {
    let corners = this.getCorners()
    return {
      front: [ {x: corners.frontLeft.x,  y: corners.frontLeft.y},  {x: corners.frontRight.x, y: corners.frontRight.y} ],
      left:  [ {x: corners.frontLeft.x,  y: corners.frontLeft.y},  {x: corners.backLeft.x,   y: corners.backLeft.y} ],
      right: [ {x: corners.frontRight.x, y: corners.frontRight.y}, {x: corners.backRight.x,  y: corners.backRight.y} ],
      back:  [ {x: corners.backLeft.x,   y: corners.backLeft.y},   {x: corners.backRight.x,  y: corners.backRight.y} ],
    }
  }

  collision(collisionObject) {
    switch(collisionObject) {
      case "wall":
        this.dead = true
        this.velocity.x = 0
        this.velocity.y = 0
        this.color1 = "#00ff00"
        break
      case "target":

    }
  }

  noCollision(collisionObject) {
    switch(collisionObject) {
      case "wall":
        this.color1 = "#ff0000"
        break
      case "target":
    }   
  }  

  resetSensors() {
    // Reset the sensors
    for (let corner_sensors of Object.values(this.sensors) ) {
      corner_sensors.straight = {x: null, y: null, distance: 0}
      corner_sensors.side = {x: null, y: null, distance: 0}  
    }      
  }

  moveForward() {   
    if (vector_signed_length(this.velocity, this.direction) < 50) {
      this.velocity = add_to_vector(this.velocity, this.direction, 2)
    }
  }
  moveBackward() {    
    if (vector_signed_length(this.velocity, this.direction) > -10) {
      this.velocity = add_to_vector(this.velocity, this.direction, -2)
    }
  }

  turnLeft()  {
    let turn_speed = this.turn_speed
    //  * Math.min(vector_length(this.velocity)/5, 1)
    //  * vector_sign(this.velocity, this.direction)
    this.direction += turn_speed
  }
  turnRight() { 
    let turn_speed = this.turn_speed
    //  * Math.min(vector_length(this.velocity)/5, 1)
    //  * vector_sign(this.velocity, this.direction)
    this.direction -= turn_speed
  }  

  update() {

    this.x += this.velocity.x;
    this.y += this.velocity.y;

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

function vector_sign(vector, direction) {
  // I don't really understand how I did this but it's given me a lot of trouble so I gave up trying to simplify and just accepted that it worked
  // Basically it checks whether the direction angle is on the same side of the unit circle as the velocity angle
  direction = -direction

  let x = vector.x
  let y = vector.y

  let velocity_angle = Math.sign(y) * Math.PI
  if (x != 0)
    velocity_angle = Math.atan(-y/x) + Math.PI*(x < 0)
  if (velocity_angle < 0) velocity_angle = 2*Math.PI + velocity_angle

  let res = Math.abs( (direction - velocity_angle + Math.PI) % (2*Math.PI) )
  // console.log("direction", direction % (2*Math.PI))
  // console.log("angle", velocity_angle)
  // console.log(res)
  if (res > 2.2 && res < 4.1)
    return -1
  return 1
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