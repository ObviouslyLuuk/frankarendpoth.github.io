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

    if (rendering) {
      display.drawMap(game.world.map);
      display.drawPlayer(game.world.player, game.world.player.color1, game.world.player.color2);

      display.render();   
    }
 
    p.innerHTML = "Score: " + Math.floor(game.world.score)

  };

  var update = function() {

    // Manual controls ----------------------------------------------
    if (controller.left.active)  { game.world.player.turnLeft();  }
    if (controller.right.active) { game.world.player.turnRight(); }
    if (controller.up.active)    { game.world.player.moveForward(); }
    if (controller.down.active)  { game.world.player.moveBackward(); }

    if (controller.T.active)     { netController.epsilon = 1 }
    if (controller.B.active)     { netController.epsilon = 0 }
    // --------------------------------------------------------------

    score = game.world.score

    if (game.world.player.dead || last_score_increase > 150 /* || timeCounter % 30000 == 0*/) {
      high_score = Math.max(high_score, game.world.score)
      p2.innerHTML = "________________High Score: " + Math.floor(high_score)
      console.log("-------------------- steps: ", timeCounter)
      console.log("Episode: ", episode)
      console.log("eta: ", netController.eta)
      console.log("epsilon: ", netController.epsilon)

      last_score_increase = 0
      netController.update()
      episode++

      game = new Game()
    }

    netController.update_target_network()
    let action = netController.get_policy(get_net_input())
    do_action(action)
    
    game.update();

    // if (game.world.score > game.world.lap_length*3) {netController.eta = .0001}

    let done = game.world.player.dead
    // if (!done) {game.world.score += .1}
    let reward = game.world.score - score

    netController.store_in_memory(reward, get_net_input(), done)
    netController.SGD()

    if (score >= game.world.score) {
      last_score_increase++
    } else {
      last_score_increase = 0
    }

    timeCounter++

  };

  var update_2 = function() {

    if (controller.left.active)  { game.world.player.turnLeft();  }
    if (controller.right.active) { game.world.player.turnRight(); }
    if (controller.up.active)    { game.world.player.moveForward(); }
    if (controller.down.active)  { game.world.player.moveBackward(); }

    game.update();
  };  

  function fill_replay_memory() {
    game = new Game()
    console.log("Filling replay memory:")

    changeRender(false)
    let pre_episodes = 0
    for (let i = 0; i < netController.max_memory/5; i++) {
      if (game.world.player.dead) {
        game = new Game()
        pre_episodes++
      }

      let action = netController.get_policy(get_net_input())
      do_action(action)

      let score = game.world.score
      game.update();
      let done = game.world.player.dead
      // if (!done) {game.world.score += 1}
      let reward = game.world.score - score
  
      netController.store_in_memory(reward, get_net_input(), done) 
    }
    changeRender(true)
    console.log("Pre Episodes: ", pre_episodes)
  }

  function do_action(a) {
    for (let action of actions[a]) {
      game.world.player[action]()
    }      
    return
  }

  function get_net_input() {
    let net_input = [
      // game.world.player.velocity.x,
      // game.world.player.velocity.y,
      Math.sqrt(Math.pow(game.world.player.velocity.x, 2) + Math.pow(game.world.player.velocity.y, 2))/50,
      // (game.world.player.sensors.frontLeft.straight.distance * game.world.player.sensors.frontRight.straight.distance),
      game.world.player.sensors.frontLeft.straight.distance/1000,
      game.world.player.sensors.frontRight.straight.distance/1000,
      game.world.player.sensors.frontLeft.side.distance/1000,
      game.world.player.sensors.frontRight.side.distance/1000,
      game.world.player.sensors.frontLeft.diag.distance/1000,
      game.world.player.sensors.frontRight.diag.distance/1000,      
      // game.world.player.sensors.backLeft.straight.distance/1000,
      // game.world.player.sensors.backRight.straight.distance/1000,
    ]
    return net_input
  }

  window.changeEngineSpeed = function changeEngineSpeed(time_step) {
    engine.time_step = 1000/time_step
    document.getElementById("engineSpeed").innerHTML = `1000/${time_step}`
  }    
  window.changeRender = function changeRender(checked) {
    rendering = checked
    if (!checked) {ori_time_step = engine.time_step; engine.time_step = 10}
    else          {engine.time_step = ori_time_step}
  }  

    /////////////////
   //// OBJECTS ////
  /////////////////

  var controller = new Controller();
  var display    = new Display();
  var game       = new Game();
  var engine     = new Engine(1000/50, render, update);

  var actions = [
    // ["moveForward", "turnLeft"],
    // ["moveForward", "turnRight"],      
    ["turnLeft"],
    ["turnRight"],
    ["moveForward"],
    // ["moveBackward"],
    // [],
  ]

  // friction: .93, lap length: 40, walldeath: -10
  // For w/out backward, in: [vel, front, side, diag]       arg: {eta: .01,   batch_size: 1000, max_mem: 50000, ep_decay: 0}    Episode65
  // For w/    backward, in: [vel, front, side, diag, back] arg: {eta: .001,  batch_size: 1000, max_mem: 15000, ep_decay: .995} Episode800
  // walldeath: 0
  // For w/    backward, in: [vel, front, side, diag, back] arg: {eta: .001,  batch_size: 1000, max_mem: 50000, ep_decay: .995} Episode716
  var netController = new NetController(
    [{x: get_net_input(), y: actions}],                   // io shape
    [{type: "Dense", size:16}, {type: "Dense", size:16}], // layers
    .01,                                                 // eta
    .99, // gamma
    1000,                                                   // batch_size
    50000,                                                // max_memory
    1,                                                    // epsilon
    .01,                                                   // epsilon_end
    .0,                                                // epsilon_decay
    true,                                                 // double_dqn
    1000                                                  // target_update_time
  )
  fill_replay_memory()
  var timeCounter = 0
  var episode = 0
  var score = 0
  var last_score_increase = 0

  var ori_time_step = engine.time_step

  var rendering = true

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
  display.buffer.player.canvas.height = game.world.height;
  display.buffer.player.canvas.width = game.world.width;  


  resize();

  engine.start();  


  window.addEventListener("keydown", keyDownUp);
  window.addEventListener("keyup",   keyDownUp);
  window.addEventListener("resize",  resize);

});
