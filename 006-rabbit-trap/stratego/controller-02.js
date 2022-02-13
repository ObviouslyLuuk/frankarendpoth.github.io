class Controller {
  constructor() {

    this.active_tile = null

    this.del  = new Controller.ButtonInput()

    this.keyDownUp = function(type, key_code) {

      let is_down
      if (type == "keydown") {
        is_down = true
      } else { // key release
        is_down = false
      }
      
      switch(key_code) {
        case 46: this.del.active = is_down;  break;
      }
    }
  }

  init_buttons(game) {
    let game_screen = document.getElementById("game_screen")
    game_screen.value = game // for referencing the game object
    // let tr = game_screen.querySelector('table tr')
    // let td = document.createElement('td')

    let finish_setup_btn = document.createElement("button")
    finish_setup_btn.id = "finish_setup_btn"
    finish_setup_btn.setAttribute('class', "btn btn-primary")
    finish_setup_btn.innerHTML = "Ready" 
    finish_setup_btn.setAttribute("onclick", "document.getElementById('game_screen').value.start()")

    // td.appendChild(finish_setup_btn)
    // tr.appendChild(td)
    game_screen.appendChild(finish_setup_btn)

    // document.getElementById('tile_holder').parentElement.insertAdjacentHTML('afterbegin', `
    //   <table><tr><td>
    //     <input style="width: 500px;" type="range" min="0" max="1000" value="50" oninput="changeEngineSpeed(this.value)">
    //   </td><td>
    //     <input type="checkbox" checked="true" oninput="changeRender(this.checked)">
    //   </td><td>
    //     <div id="engineSpeed" style="color: white">fps</div>
    //   </td></tr></table>      
    // `)

    document.getElementById('tile_holder').parentElement.insertAdjacentHTML('afterbegin', `
      <div style="grid-column-start: 1; grid-column-end: 4; display: grid; grid-template-columns: auto auto auto; align-items: center">
        <input style="width: 500px;" type="range" min="0" max="1000" value="50" oninput="changeEngineSpeed(this.value)">
        <input type="checkbox" checked="true" oninput="changeRender(this.checked)">
        <div id="engineSpeed" style="color: white">fps</div>
      </div>  
    `)

  }

  init_tiles(canvas_height, canvas_width, map, parent) {

    let map_height = map.length
    let map_width = map[0].length

    let tile_height = canvas_height/map_height
    let tile_width = canvas_width/map_width

    for (let r in map) {
      let row = map[r]
      for (let t in row) {
        let tile_value = row[t]

        if (tile_value == 'X') {continue}

        new Controller.Tile(this, parent, parseInt(t), parseInt(r), tile_width, tile_height)
                
      }
    }
  }
}

Controller.ButtonInput = class {
  constructor() {
    this.active = false
  }
}

Controller.Tile = class {
  constructor(controller, parent, x, y, width, height) {
    this.controller = controller

    this.pos = {x: x, y: y}
    this.element = this.create_element(parent, width, height)
  }

  select() {
    this.controller.active_tile = this
  }

  create_element(parent, width, height) {
    let pixel_x = this.pos.x*width
    let pixel_y = this.pos.y*height

    // Clickable Tile
    let tile_elem = document.createElement("div")
    tile_elem.value = this
    
    let style = "position: absolute;"
    tile_elem.innerHTML = "&nbsp"
    style += `width: ${width}px;`
    style += `height: ${height}px;`
    style += `left: ${pixel_x}px;`
    style += `top: ${pixel_y}px;`
    tile_elem.style = style

    tile_elem.setAttribute("id", `tile_${this.pos.x},${this.pos.y}`)
    tile_elem.setAttribute("class", "tile")
    // tile_elem.setAttribute("onmouseover", `document.getElementById("svg_holder-${this.ticker}").value.showInfo(this, true, '${bar_color}')`)
    // tile_elem.setAttribute("onmouseout", `document.getElementById("svg_holder-${this.ticker}").value.showInfo(this, false, '${bar_color}')`)
    tile_elem.setAttribute("onclick", `this.value.select()`)

    parent.appendChild(tile_elem)

    return tile_elem
  }
}