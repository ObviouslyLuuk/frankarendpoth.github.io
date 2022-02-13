// Frank Poth 03/23/2018

/* I moved some generic functions to the Display.prototype.
I created the Display.TileSheet class, which handles the tile sheet image and its
dimensions.
I got rid of the drawRectangle function and replaced it with the drawPlayer function. */

class Display {
  constructor(canvas) {

    this.buffer  = {
      player: document.createElement("canvas").getContext("2d"),
    }
    this.context = canvas.getContext("2d");

  }

  drawPlayer(rectangle, color1, color2) {

    this.buffer.player.clearRect(0,0,2000,2000)
    this.buffer.player.fillStyle = "#ffffff";
    this.buffer.player.fillRect(0,0,2000, 2000)    

    this.buffer.player.fillStyle = color1;

    this.buffer.player.fillRect(rectangle.x, rectangle.y, rectangle.cart_width, rectangle.cart_height);

    this.buffer.player.fillStyle = color2;

    // Draw filled shape of the pole
    let cx = rectangle.getCx()
    let cy = rectangle.getCy()
    this.buffer.player.translate(cx, cy)
    this.buffer.player.rotate(rectangle.pole_angle - Math.PI/2)
    this.buffer.player.fillRect(-rectangle.pole_width/2, -rectangle.pole_width/2, rectangle.pole_height, rectangle.pole_width);
    this.buffer.player.rotate(-rectangle.pole_angle + Math.PI/2)
    this.buffer.player.translate(-cx, -cy)

    this.buffer.player.strokeStyle = "#000000"
    this.buffer.player.beginPath()
    this.buffer.player.ellipse(cx, cy, 3, 3, 0, 0, 7)
    this.buffer.player.stroke()    

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
    this.context.drawImage(this.buffer.player.canvas, 0, 0, this.buffer.player.canvas.width, this.buffer.player.canvas.height, 0, 0, this.context.canvas.width, this.context.canvas.height);   
  }  

}