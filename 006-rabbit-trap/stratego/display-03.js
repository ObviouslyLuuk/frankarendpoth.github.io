class Display {
  constructor() {

    this.buffer  = {
      // background: document.createElement("canvas").getContext("2d"),
      map:        document.createElement("canvas").getContext("2d"),
    }
    let canvas = this.initCanvas()
    this.context = canvas.getContext("2d");
    this.context2 = document.getElementById('menu_canvas').getContext("2d")

  }

  initCanvas() {
    let game_screen = document.createElement('div')
    game_screen.id = 'game_screen'
    game_screen.style = `
    display: grid;
    grid-template-columns: 187px auto 187px;
    align-items: center;
    justify-items: center;
    `
    // game_screen.innerHTML = `
    //   <table style="height: 100%"><tr><td>
    //     <div id="menu_holder" style="background-color: green">
    //       <canvas id="menu_canvas"></canvas>
    //     </div>         
    //   </td><td>      
    //     <div id="tile_holder">
    //       <canvas id="main_canvas"></canvas> <!-- This is the active game screen -->
    //     </div>  
    //   </td></tr></table>    
    // `

    // Position: relative is necessary because children with position: absolute look at their offsetParents which need to be positioned
    game_screen.innerHTML = `
      <div id="menu_holder" style="border:1px solid #c3c3c3; position: relative; background-color: green">
        <canvas id="menu_canvas" style="display: block"></canvas>
      </div>         
      <div id="tile_holder" style="border:1px solid #c3c3c3; position: relative; background-color: green">
        <canvas id="main_canvas" style="display: block"></canvas> <!-- This is the active game screen -->
      </div>  
    `

    document.body.prepend(game_screen)
    return document.getElementById('main_canvas')
  }

  /* This function draws the map to the buffer. */
  drawMap(height, width, map_height, map_width, map, player, last_move, animation_steps) {

    let animation_piece = null
    if (last_move) {
      animation_piece = last_move.piece
    }

    this.buffer.map.clearRect(0,0,10000,10000)
    this.context.clearRect(0,0,10000,10000)

    let moves = []
    let selected_pos  = {x: null, y: null}
    let forbidden_pos = {x: null, y: null}
    if (player.selected_piece) {
      moves = player.selected_piece.moves
      selected_pos = player.selected_piece.pos

      let forbidden_move = player.selected_piece.forbidden_move
      if (forbidden_move) {forbidden_pos = forbidden_move}
    }

    this.buffer.map.lineWidth = 5

    let tile_height = height/map_height
    let tile_width = width/map_width


    this.context2.canvas.height = this.context.canvas.height/map_height*6
    this.context2.canvas.width = this.context.canvas.width/map_width*2


    for (let r in map) {
      let row = map[r]
      for (let t in row) {
        let tile = row[t]

        // Pick tile color
        let tile_color = "#eeeeee"
        let border_color = "grey"
        let border_thickness = 5
        switch(tile) {
          case 'X': tile_color = "blue";  
                    border_thickness = 0; break;
          case ' ': tile_color = "#ffffff"; break;
        }

        let piece = map[r][t]
        if (piece.scouted) {border_color = "#9999ff"}
        if (piece.moved)   {tile_color = "#ffffff"}

        let pos = {x: t, y: r}
        let selected = false
        if (selected_pos.x == pos.x && selected_pos.y == pos.y) {
          selected = true        
        }
        let in_moves = false
        for (let move of moves) {
          if (move.x == pos.x && move.y == pos.y) {
            in_moves = true
            break
          }
        }
        if (selected || in_moves) {
          tile_color = "#ffffee"
          border_color = "#ffdd00"
          border_thickness = 10          
        }
        if (forbidden_pos.x == pos.x && forbidden_pos.y == pos.y) {
          tile_color = "#ffeeee"
          border_color = "#ff2222"
          border_thickness = 10           
        }
        // ---------------------------

        let x = t*tile_width
        let y = r*tile_height

        drawBorderedRect(x, y, tile_width, tile_height, this.buffer.map, tile_color, border_color, border_thickness)
        if (tile == 'X' || tile == ' ') {continue}
        if (piece == animation_piece)   {continue}

        this.drawPiece(piece, player, x, y, tile_width, tile_height)
      }
    }

    // Animate piece
    if (animation_piece) {
      let dist = last_move.move.distance
      let pos0 = last_move.move.pos
      let pos1 = animation_piece.pos
      let progress = .5
      if (dist != 0) {
        progress = dist * animation_steps
      }

      let x = (pos0.x + (pos1.x - pos0.x)*progress) * tile_width
      let y = (pos0.y + (pos1.y - pos0.y)*progress) * tile_height
      
      this.drawPiece(animation_piece, player, x, y, tile_width, tile_height)
    }

    // Draw last move indicators
    for (let i in player.world.players) {
      let last_move = player.world.players[i].last_moves[0].move
      if (last_move.pos) {
        let pos = last_move.pos
        let direction = last_move.direction

        let x = (pos.x+1/3) * tile_width
        let y = (pos.y+1/3) * tile_height

        let color
        switch (i) {
          case '0': color = "#ffaaaa";  break
          case '1': color = "#aaaaff";   break
        }
        drawTriangle(x, y, tile_width/3, tile_height/3, direction, this.buffer.map, color)
      }      
    }

  }

  drawPiece(piece, player, x, y, tile_width, tile_height) {
    // Draw text inside piece
    let piece_color
    switch (piece.player.id) {
      case 1:   piece_color = "blue"; break;
      default:  piece_color = "red";  break;
    }

    this.buffer.map.fillStyle = piece_color
    let font_size = tile_height/1.2
    this.buffer.map.font = `${font_size}px Arial`

    let text
    if (piece.player != player && !piece.scouted) {
      text = '?'
    } else {
      switch (piece.rank) {
        case 0:   text = "F";         break;
        case 1:   text = "S";         break;
        case 11:  text = "B";         break;
        default:  text = piece.rank;  break;
      }          
    }

    this.buffer.map.textAlign = "center"
    this.buffer.map.fillText(text, x+tile_width/2, y+tile_height/2+font_size/2.5)    
  }

  resize(width, height, height_width_ratio) {

    if (height / width > height_width_ratio) {

      this.context.canvas.height = width * height_width_ratio;
      this.context.canvas.width = width;

    } else {

      let ratio = this.context.canvas.height/height

      this.context.canvas.height = height;
      this.context.canvas.width = height / height_width_ratio;
      let side_width = (width - this.context.canvas.width) / 2
      document.getElementById('game_screen').style["grid-template-columns"] = `${side_width}px auto ${side_width}px`
      // this.context2.canvas.height *= ratio
      // this.context2.canvas.width *= ratio

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

function drawTriangle(x, y, width, height, direction, context, color="black", pointiness=.5) {
  let x1, x2, x3, y1, y2, y3
  switch (direction) {
    case "left":
      x1 = x + width
      x2 = x + width - width*pointiness
      x3 = x1
      y1 = y
      y2 = y + height/2
      y3 = y + height 
      break
    case "right":
      x1 = x
      x2 = x + width*pointiness
      x3 = x1
      y1 = y
      y2 = y + height/2
      y3 = y + height    
      break
    case "up":
      x1 = x
      x2 = x + width/2
      x3 = x + width
      y1 = y + height
      y2 = y + height - height*pointiness
      y3 = y1
      break
    case "down":
      x1 = x
      x2 = x + width/2
      x3 = x + width
      y1 = y
      y2 = y + height*pointiness
      y3 = y1
      break
  }

  context.fillStyle = color
  context.beginPath()
  context.moveTo(x1, y1)
  context.lineTo(x2, y2)
  context.lineTo(x3, y3)
  context.fill()
}