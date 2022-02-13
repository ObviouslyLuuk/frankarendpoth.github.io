window.addEventListener("load", function(event) {

  "use strict";

    ///////////////////
   //// FUNCTIONS ////
  ///////////////////

  var keyDownUp = function(event) {

    controller.keyDownUp(event.type, event.keyCode);

  };

  var resize = function(event) {

    display.resize(document.documentElement.clientWidth - 32, document.documentElement.clientHeight - 32 - 50, game.world.height / game.world.width);
    display.render();

  };

  var render = function() {

    let map = game.world.map
    let last_move = null
    if (game.state == 'animate') {
      map = game.animation_map
      last_move = game.world.last_move
    }

    display.drawMap(game.world.pixel_height, game.world.pixel_width, game.world.height, game.world.width, map, game.world.players[0], last_move, game.animation_steps) 
        
    display.render()    

  }

  var update = function() {

    if (game.state == "setup")    {setup_update()}
    // if (game.state == "setup")  {game.start()}
    if (game.state == "active")   {active_update()}
    if (game.state == "animate")  {game.animate()}

  }

  function setup_update() {
    let player = game.world.players[0]

    if (controller.del.active && player.selected_piece) {
      player.selected_piece.die()
    }

    let active_tile = controller.active_tile
    controller.active_tile = null 

    if (active_tile)  {
      let pos = active_tile.pos
      let target = game.world.map[pos.y][pos.x]

      if ([' ', 'X'].includes(target)) {return}    

      let selected = player.selected_piece

      if (selected == target) {player.selected_piece = null; selected = null}
      else if (selected && target.player == player) {
        target.set_pos(selected.pos)
        selected.set_pos(pos, false)
        player.selected_piece = null        
      }
      else if (![' ', 'X'].includes(target)) {target.select()}    
    }
  }

  function active_update() {
    let player = game.world.player_turn

    // if (player.id == 1) {bot_update(player)}
    // if (player.id == 1) {bot_update_random(player)}
    if (true) {bot_update(player)}
    else {
      let active_tile = controller.active_tile
      controller.active_tile = null 

      if (active_tile)  {
        let pos = active_tile.pos
        let target = game.world.map[pos.y][pos.x]

        let selected = player.selected_piece

        if (selected) {
          for (let move of selected.moves) {
            if (move.x == pos.x && move.y == pos.y) {
              if (player.selected_piece.move(pos)) {
                game.update()
              }
            }
          }
        }
        if (selected == target) {player.selected_piece = null}
        else if (![' ', 'X'].includes(target)) {target.select()}
      }      
    }    
  }

  function bot_update_random(player) {
    let movable_pieces = []
    for (let piece of player.pieces) {
      if (piece.moves.length > 0) {movable_pieces.push(piece)}
    }

    let piece = movable_pieces[ Math.floor(Math.random()*movable_pieces.length) ]
    let move  = piece.moves   [ Math.floor(Math.random()*piece.moves   .length) ]
    if (piece.move(move)) {
      game.update()
    }    
  }

  function bot_update(player) {
    let best_moves = [{score: -Infinity}]
    for (let piece of player.pieces) {
      if (piece.moves.length > 0) {
        let move = piece.get_best_move()

        if (move.score > best_moves[0].score) {
          best_moves = [move]
        } else if (move.score == best_moves[0].score) {
          best_moves.push(move)
        }
      }
    }

    let best_move = best_moves[ Math.floor(Math.random()*best_moves.length) ]

    // console.log(`current move score: `, best_move.score0, best_move.score1, best_move.score2)
    let piece = best_move.piece
    let move  = best_move.pos
    if (piece.move(move)) {
      game.update()
    }    
  }  

  window.changeEngineSpeed = function changeEngineSpeed(time_step) {
    engine.time_step = 1000/time_step
    document.getElementById("engineSpeed").innerHTML = `${time_step}fps`
  }     
  window.changeRender = function switchAnimation(checked) {
    game.animation = checked
    if (!checked) {engine.default_time_step = engine.time_step; engine.time_step = 10}
    else          {engine.time_step = engine.default_time_step}
  }

    /////////////////
   //// OBJECTS ////
  /////////////////

  var controller = new Controller()
  var game       = new Game()
  var display    = new Display()
  var engine     = new Engine(1000/30, render, update)

    ////////////////////
   //// INITIALIZE ////
  ////////////////////

  display.buffer.map.canvas.height = game.world.pixel_height
  display.buffer.map.canvas.width  = game.world.pixel_width

  resize()
  let tile_holder = document.getElementById("tile_holder")
  controller.init_tiles(display.context.canvas.height, display.context.canvas.width, game.world.map, tile_holder) 
  let menu_holder = document.getElementById("menu_holder")
  let height = display.context2.canvas.height = display.context.canvas.height/game.world.map.length*6
  let width = display.context2.canvas.width = display.context.canvas.width/game.world.map[0].length*2  
  controller.init_tiles(height, width, [[0,0],[0,0],[0,0],[0,0],[0,0],[0,0]], menu_holder) 
  controller.init_buttons(game)

  engine.start()


  window.addEventListener("keydown", keyDownUp)
  window.addEventListener("keyup",   keyDownUp)
  window.addEventListener("resize",  resize)

});
