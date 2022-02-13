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

    display.drawPlayer(game.world.player, game.world.player.color1, game.world.player.color2);    
    display.render();    

    p.innerHTML = "Score: " + Math.floor(game.world.score)

  };

  var update = function() {

    // Manual controls --------------------------------------------------
    if (controller.right.active)    { game.world.player.moveForward(); }
    if (controller.left.active)  { game.world.player.moveBackward(); }

    if (controller.T.active)     { netController.epsilon = 1 }
    if (controller.B.active)     { netController.epsilon -= .1; controller.B.active = false }
    // ------------------------------------------------------------------

    if (game.world.player.dead) {
      game = new Game()

      p2.innerHTML = "________________High Score: " + Math.floor(high_score)
      console.log("Episode: ", episode)
      console.log("epsilon: ", netController.epsilon)

      netController.update()
      episode++
    }

    netController.update_target_network()
    let action = netController.get_policy(get_net_input())
    do_action(action)
    
    let score = game.world.score

    game.update();

    let done = game.world.player.dead
    let reward = game.world.score - score

    netController.store_in_memory(reward, get_net_input(), done)
    netController.SGD()

    high_score = Math.max(high_score, game.world.score)
  };

  var update_2 = function() {
    if (controller.right.active)    { game.world.player.moveForward(); }
    if (controller.left.active)  { game.world.player.moveBackward(); }

    game.update();
  };  

  function fill_replay_memory() {
    game = new Game()
    console.log("Filling replay memory:")

    for (let i = 0; i < netController.max_memory; i++) {
      if (game.world.player.dead) {
        game = new Game()
      }

      let action = netController.get_policy(get_net_input())
      do_action(action)

      let score = game.world.score
      game.update();
      let done = game.world.player.dead
      let reward = game.world.score - score
  
      netController.store_in_memory(reward, get_net_input(), done) 
    }
  }

  function do_action(a) {
    for (let action of actions[a]) {
      game.world.player[action]()
    }      
    return
  }

  function get_net_input() {
    let net_input = [
      game.world.player.pole_angle/(game.world.player.max_angle*2)+.5,
      game.world.player.turn_velocity/(game.world.player.max_turn_velocity*2)+.5,
      game.world.player.velocity.x/(game.world.player.max_velocity*2)+.5,
    ]
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
  var display    = new Display(document.querySelector("canvas"));
  var game       = new Game();
  var engine     = new Engine(1000/300, render, update);

  var actions = [
    ["moveForward"],
    ["moveBackward"],
    // [],
  ]

  var netController = new NetController(
    [{x: get_net_input(), y: actions}],                   // io shape
    [{type: "Dense", size:16}, {type: "Dense", size:16}], // layers
    .001,                                                    // eta
    .99, // gamma
    64,                                                   // batch_size
    50000,                                                // max_memory
    1,                                                    // epsilon
    .1,                                                   // epsilon_end
    .001,                                                // epsilon_decay
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

  display.buffer.player.canvas.height = game.world.height;
  display.buffer.player.canvas.width = game.world.width;  


  resize();

  engine.start();  


  window.addEventListener("keydown", keyDownUp);
  window.addEventListener("keyup",   keyDownUp);
  window.addEventListener("resize",  resize);

});
