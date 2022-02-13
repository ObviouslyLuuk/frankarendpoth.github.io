// Frank Poth 03/23/2018

/* I moved some generic functions to the Display.prototype.
I created the Display.TileSheet class, which handles the tile sheet image and its
dimensions.
I got rid of the drawRectangle function and replaced it with the drawPlayer function. */

class Display {
  constructor() {

    this.buffer  = {
      map: document.createElement("canvas").getContext("2d"),
      // player: document.createElement("canvas").getContext("2d"),
    }
    let canvas = document.createElement('canvas')
    this.context = canvas.getContext("2d")
    document.querySelector('body').appendChild(canvas)
  }


  /* This function draws the map to the buffer. */
  drawMap(height, width, map_height, map_width, map, qs, player) {
    // this.buffer.map.fillStyle = "#ffffff";
    // this.buffer.map.fillRect(0,0,2000, 2000)

    this.buffer.map.lineWidth = 5

    let tile_height = height/map_height
    let tile_width = width/map_width

    for (let r in map) {
      if (r == 0 || r == map_height-1) {continue}
      let row = map[r]
      for (let t in row) {
        if (t == 0 || t == map_width-1) {continue}
        let tile = row[t]

        let color
        switch(tile) {
          case 0: color = "white"; break;
          case 1: color = "black"; break;
          case 2: color = "yellow"; break;
          case 3: color = "green"; break;
        }

        let x = t*tile_width
        let y = r*tile_height

        // this.buffer.map.fillStyle = color
        // this.buffer.map.fillRect(x, y, tile_width, tile_height)
        drawBorderedRect(x, y, tile_width, tile_height, this.buffer.map, color, "grey", 2)

        if (tile == 1) {continue}

        this.buffer.map.fillStyle = "orange"
        let font_size = tile_height/5
        this.buffer.map.font = `${font_size}px Arial`

        let up_q =    qs[r][t].moveUp
        let down_q =  qs[r][t].moveDown
        let left_q =  qs[r][t].moveLeft
        let right_q = qs[r][t].moveRight

        this.buffer.map.textAlign = "center"
        this.buffer.map.fillText(up_q,      x+tile_width/2, y+font_size,                  tile_width/3)
        this.buffer.map.fillText(down_q,    x+tile_width/2, y+tile_height,                tile_width/3)
        this.buffer.map.textAlign = "left"
        this.buffer.map.fillText(left_q,    x,              y+tile_height/2+font_size/2,  tile_width/3)
        this.buffer.map.textAlign = "right"
        this.buffer.map.fillText(right_q,   x+tile_width,   y+tile_height/2+font_size/2,  tile_width/3)

      }
    }

    this.buffer.map.fillStyle = player.color1;

    // Draw filled shape of the player
    let x = player.x*tile_width + tile_width/2
    let y = player.y*tile_height + tile_height/2
    let player_width = tile_width/3
    let player_height = tile_height/3
    this.buffer.map.fillRect(x-player_width/2, y-player_height/2, player_width, player_height);

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
    // this.context.drawImage(this.buffer.player.canvas, 0, 0, this.buffer.player.canvas.width, this.buffer.player.canvas.height, 0, 0, this.context.canvas.width, this.context.canvas.height);   
  }  

}

function drawBorderedRect(x, y, width, height, context, fillColor, borderColor="black", thickness=5) {
  context.fillStyle = borderColor
  context.fillRect(x, y, width, height)
  context.fillStyle = fillColor
  context.fillRect(x+thickness, y+thickness, width-thickness*2, height-thickness*2)
}