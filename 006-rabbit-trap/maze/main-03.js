// Frank Poth 03/23/2017

window.addEventListener("load", function(event) {

  "use strict";

      ///////////////////
    //// FUNCTIONS ////
  ///////////////////

  var keyDownUp = function(event) {

    controller.keyDownUp(event.type, event.keyCode);

  };

  var resize = function(event) {

    display.resize(document.documentElement.clientWidth - 32, document.documentElement.clientHeight - 32, game.world.height / game.world.width);
    display.render();

  };

  var render = function() {

    game.world.map_qs = []
    for (let r in game.world.map) {
      let row = game.world.map[r]
      game.world.map_qs.push([])
      for (let t in row) {
        game.world.map_qs[r].push({})

        let tile = row[t]
        if (tile == 1) {continue}

        // let qs = netController.get_qs([t,r])
        let qs = netController.get_qs(get_net_input(t,r))

        for (let a in actions) {
          let action = actions[a]
          game.world.map_qs[r][t][action] = qs[a].toFixed(2)
          // game.world.map_qs[r][t][action] = get_net_input(t,r)[a]
        }
      }
    }
    display.drawMap(game.world.height, game.world.width, game.world.map_height, game.world.map_width, game.world.map, game.world.map_qs, game.world.player);
    // display.drawPlayer(game.world.player, game.world.player.color1, game.world.player.color2);

    p.innerHTML = "Score: " + Math.floor(game.world.score)
    
    display.render();    

  };

  var update = function() {

    // Manual controls --------------------------------------------------
    if (controller.up.active)       { game.world.player.moveUp(); }
    if (controller.down.active)     { game.world.player.moveDown(); }
    if (controller.left.active)     { game.world.player.moveLeft(); }
    if (controller.right.active)    { game.world.player.moveRight(); }

    if (controller.T.active)     { netController.epsilon = 1 }
    if (controller.B.active)     { netController.epsilon -= .1 }
    // ------------------------------------------------------------------

    if (game.world.player.done) {
      high_score = Math.max(high_score, game.world.score)
      p2.innerHTML = "________________High Score: " + Math.floor(high_score)
      console.log("Episode: ", episode)
      console.log("epsilon: ", netController.epsilon)

      netController.update()
      episode++
      game = new Game() 
    }

    netController.update_target_network()
    let action = netController.get_policy(get_net_input())
    game.world.player[actions[action]]()
    
    let score = game.world.score

    game.update();

    timeCounter++
    if (timeCounter > 100) {game.world.player.done = true; game.world.score--; timeCounter = 0}

    let reward = game.world.score - score

    netController.store_in_memory(reward, get_net_input(), game.world.player.done) 
    netController.SGD()

  };

  var update_manual = function() {

    if (controller.up.active || controller.down.active || controller.left.active || controller.right.active) { 
      if (controller.up.active)       { game.world.player.moveUp(); controller.up.active = false }
      if (controller.down.active)     { game.world.player.moveDown(); controller.down.active = false }
      if (controller.left.active)     { game.world.player.moveLeft(); controller.left.active = false }
      if (controller.right.active)    { game.world.player.moveRight(); controller.right.active = false }

      game.update();

      if (game.world.player.done) {
        high_score = Math.max(high_score, game.world.score)
        p2.innerHTML = "________________High Score: " + Math.floor(high_score)
        console.log("Episode: ", episode)

        episode++
        game = new Game()
      }    
    }
  };  

  function fill_replay_memory() {
    game = new Game()
    console.log("Filling replay memory:")

    for (let i = 0; i < netController.max_memory/5; i++) {
      if (game.world.player.done) {
        game = new Game()
      }

      let action = netController.get_policy(get_net_input())
      game.world.player[actions[action]]()

      let score = game.world.score

      game.update();

      let reward = game.world.score - score
  
      netController.store_in_memory(reward, get_net_input(), game.world.player.done) 
    }
  }

  function get_net_input_1() {
    let net_input = [
      game.world.player.x,
      game.world.player.y,
    ]
    return net_input
  }

  function get_net_input_2(x=game.world.player.x, y=game.world.player.y) {
    let net_input = []

    x = parseInt(x)
    y = parseInt(y)

    net_input.push(x)
    net_input.push(y)

    if (!game.world.map[y-1])           {net_input.push(1)}
    else                                {net_input.push(game.world.map[y-1][x])}
    if (!game.world.map[y+1])           {net_input.push(1)}
    else                                {net_input.push(game.world.map[y+1][x])}
    if (isNaN(game.world.map[y][x-1]))  {net_input.push(1)}
    else                                {net_input.push(game.world.map[y][x-1])}
    if (isNaN(game.world.map[y][x+1]))  {net_input.push(1)}
    else                                {net_input.push(game.world.map[y][x+1])}

    return net_input
  }  

  function get_net_input(x=game.world.player.x, y=game.world.player.y) {
    let net_input = []

    x = parseInt(x)
    y = parseInt(y)

    if (!game.world.map[y-1])             {net_input.push(1);net_input.push(0);net_input.push(0)}
    else if (game.world.map[y-1][x] == 1) {net_input.push(1);net_input.push(0);net_input.push(0)}
    else if (game.world.map[y-1][x] == 2) {net_input.push(0);net_input.push(1);net_input.push(0)}    
    else if (game.world.map[y-1][x] == 3) {net_input.push(0);net_input.push(0);net_input.push(1)}    
    else                                  {net_input.push(0);net_input.push(0);net_input.push(0)}
    if (!game.world.map[y+1])             {net_input.push(1);net_input.push(0);net_input.push(0)}
    else if (game.world.map[y+1][x] == 1) {net_input.push(1);net_input.push(0);net_input.push(0)}
    else if (game.world.map[y+1][x] == 2) {net_input.push(0);net_input.push(1);net_input.push(0)}    
    else if (game.world.map[y+1][x] == 3) {net_input.push(0);net_input.push(0);net_input.push(1)}    
    else                                  {net_input.push(0);net_input.push(0);net_input.push(0)}
    if (isNaN(game.world.map[y][x-1]))    {net_input.push(1);net_input.push(0);net_input.push(0)}
    else if (game.world.map[y][x-1] == 1) {net_input.push(1);net_input.push(0);net_input.push(0)}
    else if (game.world.map[y][x-1] == 2) {net_input.push(0);net_input.push(1);net_input.push(0)}    
    else if (game.world.map[y][x-1] == 3) {net_input.push(0);net_input.push(0);net_input.push(1)}    
    else                                  {net_input.push(0);net_input.push(0);net_input.push(0)}
    if (isNaN(game.world.map[y][x+1]))    {net_input.push(1);net_input.push(0);net_input.push(0)}
    else if (game.world.map[y][x+1] == 1) {net_input.push(1);net_input.push(0);net_input.push(0)}
    else if (game.world.map[y][x+1] == 2) {net_input.push(0);net_input.push(1);net_input.push(0)}    
    else if (game.world.map[y][x+1] == 3) {net_input.push(0);net_input.push(0);net_input.push(1)}    
    else                                  {net_input.push(0);net_input.push(0);net_input.push(0)}

    return net_input
  }  

  window.changeEngineSpeed = function changeEngineSpeed(time_step) {
    engine.time_step = 1000/time_step
    document.getElementById("engineSpeed").innerHTML = `1000/${time_step}`
  }  

    /////////////////
   //// OBJECTS ////
  /////////////////

  var controller = new Controller();
  var display    = new Display();
  var game       = new Game();
  var engine     = new Engine(1000/300, render, update);

  var timeCounter = 0

  var actions = [
    "moveUp",
    "moveDown",
    "moveLeft",
    "moveRight",
  ]

  var netController = new NetController(
    [{x: get_net_input(), y: actions}],                   // io shape
    [{type: "Dense", size:16}, {type: "Dense", size:16}], // layers
    .01,                                                    // eta
    .99, // gamma
    64,                                                 // batch_size
    50000,                                               // max_memory
    1,                                                    // epsilon
    .1,                                                   // epsilon_end
    .0001,                                                  // epsilon_decay
    true,                                                 // double_dqn
    1000                                                  // target_update_time
  )
  fill_replay_memory()
  var episode = 0

  var p              = document.createElement("p");
  p.setAttribute("style", "color:#c07000; font-size:2.0em; position:fixed;");
  p.innerHTML = "Score: 0";
  document.body.appendChild(p);

  var high_score = -Infinity
  var p2              = document.createElement("p");
  p2.setAttribute("style", "color:#c07000; font-size:2.0em; position:fixed;");
  p2.innerHTML = "________________High Score: 0";
  document.body.appendChild(p2);  

    ////////////////////
   //// INITIALIZE ////
  ////////////////////

  display.buffer.map.canvas.height = game.world.height;
  display.buffer.map.canvas.width = game.world.width;  


  resize();

  engine.start()

  window.addEventListener("keydown", keyDownUp);
  window.addEventListener("keyup",   keyDownUp);
  window.addEventListener("resize",  resize);

});
