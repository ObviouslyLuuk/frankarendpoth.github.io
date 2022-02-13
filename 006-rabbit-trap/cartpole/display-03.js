// Frank Poth 03/23/2018

/* I moved some generic functions to the Display.prototype.
I created the Display.TileSheet class, which handles the tile sheet image and its
dimensions.
I got rid of the drawRectangle function and replaced it with the drawPlayer function. */

class Display {
  constructor() {

    this.buffer  = document.createElement("canvas").getContext("2d")

    let canvas = document.createElement('canvas')
    this.context = canvas.getContext("2d")
    document.querySelector('body').appendChild(canvas)

    this.color1     = "#303030";
    this.color2     = "#992000";    

    this.scale = 1
  }

  init(world) {
    let world_width = world.x_threshold * 2
    this.scale = world.width / world_width
    let cart_y = world.height - 100 // Top of cart (except it's not lol)

    this.buffer.translate(world.width/2, cart_y)
  }

  drawWorld(world) {
    // this.buffer.clearRect(-1000,-1000,2000,2000)
    this.buffer.fillStyle = "#ffffff";
    this.buffer.fillRect(-1000,-1000,2000, 2000)   

    let pole_width = 10.0
    let pole_len = this.scale * (2*world.length)
    let cart_width = 50.0
    let cart_height = 30.0

    let top = -cart_height/2
    let left = -cart_width/2

    this.buffer.fillStyle = this.color1;
    this.buffer.translate(world.state.x*this.scale, 0)
      this.buffer.fillRect(left, top, cart_width, cart_height)

      top = -pole_len + pole_width/2
      left = -pole_width/2
      let axle_offset = cart_height / 4.0

      this.buffer.fillStyle = this.color2;
      this.buffer.translate(0, -axle_offset)
        this.buffer.rotate(world.state.theta)
          this.buffer.fillRect(left, top, pole_width, pole_len)
        this.buffer.rotate(-world.state.theta)

        this.buffer.strokeStyle = "#000000"
        this.buffer.lineWidth = 1
        this.buffer.beginPath()
        this.buffer.ellipse(0, 0, 2, 2, 0, 0, Math.PI*2)
        this.buffer.stroke()
      this.buffer.translate(0, axle_offset)
    this.buffer.translate(-world.state.x*this.scale, 0)

  }

  resize(width, height, height_width_ratio) {

    if (height / width > height_width_ratio) {

      this.context.canvas.height = width * height_width_ratio;
      this.context.canvas.width = width;

    } else {

      this.context.canvas.height = height;
      this.context.canvas.width = height / height_width_ratio;

    }

    this.context.imageSmoothingEnabled = false;

  }

  render() { 
    this.context.drawImage(this.buffer.canvas, 0, 0, this.buffer.canvas.width, this.buffer.canvas.height, 0, 0, this.context.canvas.width, this.context.canvas.height);   
  }  

}