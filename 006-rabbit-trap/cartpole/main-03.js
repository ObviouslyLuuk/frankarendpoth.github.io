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
      display.drawWorld(game.world) 
      display.render()      
    }

    p.innerHTML = "Score: " + Math.floor(game.world.score)

  };

  var update = function() {

    // Manual controls --------------------------------------------------
    if (controller.right.active) { game.world.update("moveRight"); }
    if (controller.left.active)  { game.world.update("moveLeft"); }

    if (controller.T.active)     { netController.epsilon = 1 }
    if (controller.B.active)     { netController.epsilon -= .1; controller.B.active = false }
    // ------------------------------------------------------------------

    if (done) {
      high_score = Math.max(high_score, game.world.score)
      p2.innerHTML = "________________High Score: " + Math.floor(high_score)
      score_log_add(game.world.score)
      p2.innerHTML += "<br>Avg Score: " + Math.floor(score_log.reduce((a, b) => a + b, 0) / score_log.length)
      console.log("--------------------")
      console.log("Episode: ", episode)
      console.log("eta: ", netController.eta)
      console.log("epsilon: ", netController.epsilon)      

      netController.update()
      episode++

      game.world.reset()
      done = false      
    }

    netController.update_target_network()
    let action = netController.get_policy(state)
    
    let res = game.world.update(actions[action])
    state = Object.values(res.state)
    done = res.done

    if (game.world.score > 1000) {netController.eta = 0} // Stop learning when > 1000

    netController.store_in_memory(res.reward, state, done)
    netController.SGD()

  };

  function fill_replay_memory() {
    console.log("Filling replay memory:")

    for (let i = 0; i < netController.max_memory; i++) {
      if (done) {
        score_log_add(game.world.score)
        game.world.reset()
        done = false
      }

      let action = netController.get_policy(state)

      let res = game.world.update(actions[action])
      state = Object.values(res.state)
      done = res.done

      netController.store_in_memory(res.reward, state, done) 
    }
  }

  window.changeEngineSpeed = function changeEngineSpeed(time_step) {
    engine.time_step = 1000/time_step
    document.getElementById("engineSpeed").innerHTML = `1000/${time_step}`
  }    
  window.changeRender = function changeRender(checked) {
    rendering = checked
  }

  function score_log_add(score) {
    if (score_log.length > 100) {score_log.splice(0)}
    score_log.push(score)
  }

    /////////////////
   //// OBJECTS ////
  /////////////////

  var controller = new Controller();
  var game       = new Game();
  var display    = new Display(game.world);
  var engine     = new Engine(1000/300, render, update);

  var actions = [
    "moveRight",
    "moveLeft",
  ]
  var state = Object.values(game.world.state)

  var netController = new NetController(
    [{x: state, y: actions}], // io shape
    [{type: "Dense", size:16}, {type: "Dense", size:16}], // layers
    .001,  // eta
    .99, // gamma
    64,    // batch_size
    15000, // max_memory
    1,     // epsilon
    .01,   // epsilon_end
    .995, // epsilon_decay
    true, // double_dqn
    1000 // target_update_time
  )

  var score_log = []
  fill_replay_memory()
  var episode = 0
  var done = false
  
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

  display.buffer.canvas.height = game.world.height
  display.buffer.canvas.width  = game.world.width

  resize();
  display.init(game.world)

  engine.start();  


  window.addEventListener("keydown", keyDownUp);
  window.addEventListener("keyup",   keyDownUp);
  window.addEventListener("resize",  resize);

});
