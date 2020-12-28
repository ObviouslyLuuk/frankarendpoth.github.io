// Frank Poth 03/23/2018

/* I moved some generic functions to the Display.prototype.
I created the Display.TileSheet class, which handles the tile sheet image and its
dimensions.
I got rid of the drawRectangle function and replaced it with the drawPlayer function. */

class Display {
  constructor(canvas) {

    this.buffer  = {
      map: document.createElement("canvas").getContext("2d"),
      player: document.createElement("canvas").getContext("2d"),
    }
    this.context = canvas.getContext("2d");

  }


  /* This function draws the map to the buffer. */
  drawMap(map) {
    this.buffer.map.fillStyle = "#ffffff";
    this.buffer.map.fillRect(0,0,2000, 2000)

    this.buffer.map.lineWidth = 5

    for (let mapObjectLists of Object.entries(map) ) {
      let object_name = mapObjectLists[0]
      let object_list = mapObjectLists[1]
      let color
      switch(object_name) {
        case "targets": color = "#00ff00"
        case "walls":   color = "#999999"
      }
      this.buffer.map.strokeStyle = color // overwrites other color?

      for (let object of object_list) {
        if (object.timeout > 0) continue;
        let p0 = object.start
        let p1 = object.end
        this.buffer.map.beginPath()
        this.buffer.map.moveTo(p0.x, p0.y)
        this.buffer.map.lineTo(p1.x, p1.y)
        this.buffer.map.stroke() 
      }
    }

  }

  drawPlayer(rectangle, color1, color2, draw_sensors=true, draw_corners=false, draw_borders=false) {

    this.buffer.player.clearRect(0,0,2000,2000)

    // Draw lines and dots for the sensors
    if (draw_sensors) {
      let corners = rectangle.getCorners()
      this.buffer.player.strokeStyle = "#000000"
  
      for (let corner_sensor of Object.entries(rectangle.sensors) ) {
        let corner_name = corner_sensor[0]
        let sensor = corner_sensor[1]
  
        let corner = corners[corner_name]
  
        // Loop through the different directions of the sensor (straight and side)
        for (let p of Object.values(sensor) ) { 
          if (!p.x) continue;
          this.buffer.player.beginPath()
          this.buffer.player.moveTo(corner.x, corner.y)
          this.buffer.player.lineTo(p.x, p.y)
          this.buffer.player.ellipse(p.x, p.y, 3, 3, 0, 0, 7)
          this.buffer.player.lineWidth = 2
          this.buffer.player.stroke()
        }
      }
    }

    this.buffer.player.strokeStyle = color1

    // Draw circles at the corners of the car
    if (draw_corners) {
      for (let p of Object.values(corners) ) {
        this.buffer.player.beginPath()
        this.buffer.player.ellipse(p.x, p.y, 3, 3, 0, 0, 7)
        this.buffer.player.stroke()
      }      
    }

    // Draw borders of the car
    if (draw_borders) {
      for (let points of Object.values(rectangle.getBorders()) ) {
        let p0 = points[0]
        let p1 = points[1]
        this.buffer.player.beginPath()
        this.buffer.player.moveTo(p0.x, p0.y)
        this.buffer.player.lineTo(p1.x, p1.y)
        this.buffer.player.stroke()
      }    
    }

    this.buffer.player.fillStyle = color1;

    // Draw filled shape of the car
    let cx = rectangle.getCx()
    let cy = rectangle.getCy()
    this.buffer.player.translate(cx, cy)
    this.buffer.player.rotate(rectangle.direction)
    this.buffer.player.fillRect(-rectangle.height/2, -rectangle.width/2, rectangle.height, rectangle.width);
    this.buffer.player.rotate(-rectangle.direction)
    this.buffer.player.translate(-cx, -cy)

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
    this.context.drawImage(this.buffer.map.canvas, 0, 0, this.buffer.map.canvas.width, this.buffer.map.canvas.height, 0, 0, this.context.canvas.width, this.context.canvas.height); 
    this.context.drawImage(this.buffer.player.canvas, 0, 0, this.buffer.player.canvas.width, this.buffer.player.canvas.height, 0, 0, this.context.canvas.width, this.context.canvas.height);   
  }  

}