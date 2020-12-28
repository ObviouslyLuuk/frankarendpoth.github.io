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

    display.drawMap(game.world.map);
    display.drawPlayer(game.world.player, game.world.player.color1, game.world.player.color2);

    p.innerHTML = "Score: " + Math.floor(game.world.score)
    
    display.render();    

  };

  var update = function() {

    let score = game.world.score
    if (game.world.player.dead || timeCounter % 30000 == 0) {
      // netController.epsilon *= .95
      // netController.epsilon = .1
      netController.epsilon *= Math.pow(.999, score + 1)

      netController.epsilon *= ( high_score - score )

      game = new Game()
      p2.innerHTML = "________________High Score: " + Math.floor(high_score)
     
      console.log("Episode: ", episode)
      console.log("epsilon: ", netController.epsilon)
      episode++
    }

    if (controller.left.active)  { game.world.player.turnLeft();  }
    if (controller.right.active) { game.world.player.turnRight(); }
    if (controller.up.active)    { game.world.player.moveForward(); }
    if (controller.down.active)  { game.world.player.moveBackward(); }

    // if (controller.T.active)     { game.world.addTarget() }


    // netController.update_target_network()
    let action = netController.get_policy(get_net_input())
    switch(action) {
      // case 0: game.world.player.moveForward(); game.world.player.turnLeft();      break;
      // case 1: game.world.player.moveForward(); game.world.player.turnRight();     break;
      case 1: game.world.player.turnLeft();      break;
      case 2: game.world.player.turnRight();     break;      
      case 0: game.world.player.moveForward();   break;
      // case 3: game.world.player.moveBackward(); break;
      // case 3: break;
    }
    
    game.update();
    game.world.score -= .1

    // netController.store_in_memory(game.world.score, get_net_input())
    // netController.SGD()

    high_score = Math.max(high_score, game.world.score)

    timeCounter++

  };


  function get_net_input() {
    let net_input = [
      // game.world.player.velocity.x,
      // game.world.player.velocity.y,
      // Math.sqrt(Math.pow(game.world.player.velocity.x, 2) + Math.pow(game.world.player.velocity.y, 2)),
      // (game.world.player.sensors.frontLeft.straight.distance * game.world.player.sensors.frontRight.straight.distance),
      game.world.player.sensors.frontLeft.straight.distance,
      game.world.player.sensors.frontLeft.side.distance,
      game.world.player.sensors.frontRight.straight.distance,
      game.world.player.sensors.frontRight.side.distance,
      // game.world.player.sensors.backLeft.straight.distance,
      // game.world.player.sensors.backRight.straight.distance,
    ]
    // for (let corner of Object.values(game.world.player.sensors)) {
    //   net_input.push(corner.straight.distance)
    //   net_input.push(corner.side.distance)
    // }
    return net_input
  }

    /////////////////
   //// OBJECTS ////
  /////////////////

  var controller = new Controller();
  var display    = new Display(document.querySelector("canvas"));
  var game       = new Game();
  var engine     = new Engine(1000/300, render, update);

  var netController = new NetController()
  var timeCounter = 0
  var episode = 0

  var p              = document.createElement("p");
  p.setAttribute("style", "color:#c07000; font-size:2.0em; position:fixed;");
  p.innerHTML = "Score: 0";
  document.body.appendChild(p);

  var high_score = 0
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
