const FORMATIONS = {
  defensive_0: [
    [11,06,02,04,02,04,02,03,06,11],
    [03,02,08,07,06,05,02,11,05,02],
    [09,06,01,04,05,02,10,05,11,07],
    [04,02,03,07,08,03,03,11,00,11],
  ],
  balanced_0: [
    [06,02,04,09,06,02,02,10,02,06],
    [05,02,07,05,11,02,07,07,08,03],
    [04,08,01,03,11,02,06,05,05,11],
    [03,11,04,11,04,02,03,03,11,00],
  ],
  aggressive_0: [
    [02,09,04,02,10,05,04,05,05,08],
    [08,01,11,06,04,02,02,11,05,06],
    [11,07,03,03,02,07,02,07,04,11],
    [00,11,03,03,03,06,11,02,06,02],
  ],
  defensive_1: [
    [06,02,02,05,02,06,03,06,02,06],
    [05,04,11,05,09,02,07,07,08,02],
    [04,11,04,07,01,08,11,05,11,04],
    [02,03,10,02,03,11,00,11,03,03],
  ],
  balanced_1: [
    [02,08,05,02,06,02,09,03,02,06],
    [10,02,07,08,02,06,11,05,11,05],
    [06,04,07,01,07,05,11,04,11,04],
    [03,02,03,03,04,11,00,11,03,02],
  ],
  aggressive_1: [
    [09,02,11,00,11,11,04,02,02,07],
    [01,02,08,11,10,07,06,03,08,07],
    [05,04,06,06,03,03,11,02,06,05],
    [02,04,03,05,02,02,04,11,05,03],
  ],        
}

const PIECES_COUNTS = {
  standard: [
    1, // Flag
    1, // Spy
    8, // Scout
    5, // Minor
    4, // Sergeant
    4, // Lieutenant
    4, // Captain
    3, // Major
    2, // Colonel
    1, // General
    1, // Marshal
    6, // Bomb
  ],
  tiny: [
    1, // Flag
    1, // Spy
    2, // Scout
    3, // Minor
    0, // Sergeant
    2, // Lieutenant
    1, // Captain
    1, // Major
    0, // Colonel
    1, // General
    1, // Marshal
    3, // Bomb
  ]
}

const MAPS = {
  standard: {
    map: [
      [' ',' ',' ',' ',' ',' ',' ',' ',' ',' '],
      [' ',' ',' ',' ',' ',' ',' ',' ',' ',' '],
      [' ',' ',' ',' ',' ',' ',' ',' ',' ',' '],
      [' ',' ',' ',' ',' ',' ',' ',' ',' ',' '],
      [' ',' ','X','X',' ',' ','X','X',' ',' '],
      [' ',' ','X','X',' ',' ','X','X',' ',' '],
      [' ',' ',' ',' ',' ',' ',' ',' ',' ',' '],
      [' ',' ',' ',' ',' ',' ',' ',' ',' ',' '],
      [' ',' ',' ',' ',' ',' ',' ',' ',' ',' '],
      [' ',' ',' ',' ',' ',' ',' ',' ',' ',' '],
    ],
    setup_height: [4,4]
  },
  small: {
    map: [
      [' ',' ',' ',' ',' ',' ',' ',' '],
      [' ',' ',' ',' ',' ',' ',' ',' '],
      [' ',' ',' ',' ',' ',' ',' ',' '],
      [' ',' ','X',' ',' ','X',' ',' '],
      [' ',' ','X',' ',' ','X',' ',' '],
      [' ',' ',' ',' ',' ',' ',' ',' '],
      [' ',' ',' ',' ',' ',' ',' ',' '],
      [' ',' ',' ',' ',' ',' ',' ',' '],
    ],
    setup_height: [3,3]
  },
  tiny: {
    map: "same as small",
    setup_height: [2,2]
  },  
}


class Game {
  constructor() {

    this.world = new Game.World(this);
    this.state = "setup"

    this.animation = true
    this.animation_steps = 0
    this.animation_duration = 20
    this.animation_map = []

  }

  update() {

    if (this.world.update()) {
      this.world.game_won()
      this.state = "done"
    }

  }

  start() {
    for (let player of this.world.players) {
      // player.setup
    }
    this.state = 'active'
    this.world.update()
    this.world.player_turn = this.world.players[0]
  }

  start_animation(last_move) {
    if (!this.animation) {return}

    this.world.last_move = last_move
    this.state = 'animate'
    this.animation_steps = 0

    this.animation_map = []
    for (let row of this.world.map) {
      this.animation_map.push([...row])
    }
  }

  animate() {
    if (this.animation_steps > .9) {
      this.state = 'active'
      return
    }
    this.animation_steps += 1/this.animation_duration
  }

}

Game.World = class {
  constructor(game, map="standard") {
    
    this.game = game
    this.pixel_height = 2000
    this.pixel_width  = 2000
    this.map_type = map
    this.choose_map(map)
    this.players = [
      new Game.World.Player(this, 0),
      new Game.World.Player(this, 1),
    ]
    this.player_turn = this.players[0]

    this.reset()

    console.log("================\nSTART\n================")

    this.last_move = null
  }

  choose_map(map) {
    switch(map) {
      case "small": this.map = MAPS.small.map
        this.setup_height = MAPS.small.setup_height
        break
      case "tiny":  this.map = MAPS.small.map
        this.setup_height = MAPS.tiny.setup_height
        break        
      default:      this.map = MAPS.standard.map
        this.setup_height = MAPS.standard.setup_height
        break
    }
    this.height = this.map.length
    this.width =  this.map[0].length    
  }

  check_pos(pos) {
    if (pos.x < 0             || 
        pos.x > this.width-1  || 
        pos.y < 0             || 
        pos.y > this.height-1) {return 'X'}

    return this.map[pos.y][pos.x]
  }

  set_pos(pos, value=' ') {
    this.map[pos.y][pos.x] = value
  }

  update() {
    switch (this.player_turn.id) {
      case 0: this.player_turn = this.players[1]; break;
      case 1: this.player_turn = this.players[0]; break;
    }      

    for (let player of this.players) {

      let no_moves_left = true
      for (let piece of player.pieces) {
        piece.moves = piece.get_moves()
        if (piece.moves.length > 0) {no_moves_left = false}
        piece.forbidden_move = null
      }
      if (no_moves_left) {
        console.log(`Player ${player.id} has lost; there are no more moves`)
        return true        
      }

      if (player.won) {
        console.log(`Player ${player.id} has won`)
        return true
      }
    }

    this.check_repeat_moves()

    console.log("BOARD UPDATED ==========")
    return false
  }

  check_repeat_moves() {
    for (let player of this.players) {
      let move0 = player.last_moves[0]
      let move1 = player.last_moves[1]
      let piece = move0.piece
      if (!move1 || piece != move1.piece) {continue}    
      
      let ori_pos = move1.move.pos
      if (piece.pos.x == ori_pos.x && piece.pos.y == ori_pos.y) {
        for (let m in piece.moves) {
          let move = piece.moves[m]
          let pos = move0.move.pos
          if (pos.x == move.x && pos.y == move.y) {
            piece.forbidden_move = move
            piece.moves.splice(m, 1)
            break
          }
        }        
      }
    }
  }

  reset() {
    let player0 = this.players[0]
    let player1 = this.players[1]

    // player0
    for (let row = 0; row < this.setup_height[0]; row++) {
      for (let tile = 0; tile < this.width; tile++) {
        let piece = new Game.World.Piece(
          player0, 
          player0.setup.map[row][tile],
          {
            x: tile, 
            y: this.height-this.setup_height[0]+row
          }      
        )
        player0.pieces.push(piece)
      }
    }
    // player1
    for (let row = 0; row < this.setup_height[1]; row++) {
      for (let tile = 0; tile < this.width; tile++) {
        let piece = new Game.World.Piece(
          player1, 
          player1.setup.map[row][tile],
          {
            x: this.width-1-tile, 
            y: this.setup_height[1]-1-row
          }
        )
        player1.pieces.push(piece)
      }
    }
  }

  game_won() {
    for (let player of this.players) {
      player.selected_piece = null
      for (let piece of player.pieces) {
        piece.scouted = true
      }
    }


  }

}

Game.World.Piece = class {
  constructor(player, rank, pos) {
    /*
    All act according to rank apart from the following notes:
    6*Bomb        11  can't move, beats everything except the miner
    1*Marshal     10  can be beaten by the spy if attacked
    1*General     9
    2*Colonel     8
    3*Major       7
    4*Captain     6
    4*Lieutenant  5
    4*Sergeant    4
    5*Miner       3   beats the bomb
    8*Scout       2   can move across any free lane
    1*Spy         1   beats the Marshall if attacking
    1*Flag        0   can't move, ends the game if taken
    */

    this.player = player

    this.rank = rank

    switch(rank) {
      case 0: case 11:  this.movable = 0;         break;
      case 2:           this.movable = Math.max(player.world.width-1, player.world.height-1);  break;
      default:          this.movable = 1;         break;
    }

    this.pos = {x: null, y: null}
    this.set_pos(pos)

    this.moves = []
    this.forbidden_move = null
    this.moved = false
    this.scouted = false

  }

  select() {
    this.player.selected_piece = this
  }

  get_moves(from_pos=this.pos, max=null) {
    if (!this.movable)                    {return []}
    let movable = max ? max : this.movable

    let moves = []

    function get_pos(pos, direction, step) {
      switch (direction) {
        case "up":
          return {x: pos.x,        y: pos.y - step}
        case "down":
          return {x: pos.x,        y: pos.y + step}
        case "left":
          return {x: pos.x - step, y: pos.y}
        case "right":
          return {x: pos.x + step, y: pos.y}
      }
    }

    let directions = ["up", "down", "left", "right"]

    for (let step = 0; step < movable && directions.length > 0; step++) {     
      for (let direction of directions) {

        let pos = get_pos(from_pos, direction, step+1)

        let target = this.player.world.check_pos(pos)

        switch(true) {
          case target == ' ': moves.push(pos);                break;

          case target == 'X': case target.player == this.player:   
                  directions= remove(directions, direction);  break;    

          default:            moves.push(pos);
                  directions= remove(directions, direction);  break;        
        }
      }
    }
    return moves
  }

  move(pos) {
    let target = this.player.world.check_pos(pos)
    let move_info = get_move_info(this.pos, pos)

    switch (true) {
      // Invalid move
      case target == 'X' || target.player == this.player:           
        return false

      // Move to empty tile
      case target == ' ':  
        if (move_info.dist > 1) {this.scouted = true}        
        this.player.update_last_move(this, this.pos, move_info)
        this.set_pos(pos)
        this.moved = true
        return true

      default: 
        let res = this.attack(target)
        switch (res) {
          // Loss: this piece dies, enemy is scouted
          case "LOSS": 
            console.log(`${this.rank} fell to ${target.rank}`)
            this.player.scout(target)
            target.player.scout(this)
            this.player.update_last_move(this, this.pos, move_info)
            this.die()
            this.moved = true
            return true

          // Tie: both die
          case "TIE": 
            console.log(`${this.rank} fell with ${target.rank}`)
            this.player.scout(target)
            target.player.scout(this)
            this.player.update_last_move(this, this.pos, move_info)
            this.die()
            target.die()
            this.moved = true
            return true

          // Win: enemy dies, this piece is scouted
          case "WIN":     
            console.log(`${this.rank} took ${target.rank}`)
            this.player.scout(target)
            target.player.scout(this)
            this.player.update_last_move(this, this.pos, move_info)
            target.die()
            this.set_pos(pos)
            this.moved = true
            return true

          // Flag captured
          case "FLAG": 
            this.player.won = true;
            this.player.scout(target)
            this.moved = true
            return true

          // Invalid res
          default:              
            return false
        }
    }
  }

  get_best_move(omniscient=false) {
    if (this.moves.length < 1) {return false}

    // Get defensive score from current position
    let against_moves = this.get_moves(this.pos, 1)
    let worst_score = Infinity
    for (let move of against_moves) {
      worst_score = Math.min(worst_score, this.score_move(move, false, omniscient))
    }

    let best_moves = [{score: -Infinity}]
    for (let move of this.moves) {
      let score1 = this.score_move(move, true, omniscient)
      // if (!this.moved) {score1 -= .05}
      if (!this.scouted && get_move_info(this.pos, move).dist > 1) {score1 -= .1} // Discourage scouts from revealing their rank needlessly

      let next_moves = this.get_moves(move, 1)
      let worst_next_score = Infinity

      if (score1 >= 0 && next_moves.length > 0) {
        for (let next of next_moves) {
          worst_next_score = Math.min(worst_next_score, this.score_move(next, false, omniscient))
        }
      } else {worst_next_score = 0}

      let score2 = worst_next_score
      let score = score1 + score2
      if (score > best_moves[0].score) {
        best_moves = [{pos: move, score: score, 
          score1:score1, score2:score2}]
      } else if (score == best_moves[0].score) {
        best_moves.push({pos: move, score: score,
          score1:score1, score2:score2})
      }
    }
    let best_move = best_moves[ Math.floor(Math.random()*best_moves.length) ]

    return {piece: this, pos: best_move.pos, score: best_move.score-worst_score, 
      score0:worst_score, score1:best_move.score1, score2:best_move.score2}
  }

  score_move(pos, offense=true, omniscient=false) {
    let enemy_piece = this.player.world.check_pos(pos)
    let score
    let res

    switch (true) {
      case enemy_piece == 'X' || enemy_piece.player == this.player: return false // Invalid move
      case enemy_piece == ' ':                                      score = 0;   break

      default: 
        switch (true) {
          case omniscient || enemy_piece.scouted: res = this.attack(enemy_piece, offense)
            break

          default:

            // If the amount of unknown unmoved pieces == amount of unknown bombs + flag then assume all those pieces are bombs         
            let unknown_bomb_flag = 1 + this.player.unknown_pieces[11]
            let unknown_unmoved = 0
            for (let piece of enemy_piece.player.pieces) {
              if (!piece.moved && !piece.scouted) {unknown_unmoved++}
            }
            if (unknown_bomb_flag == unknown_unmoved && !enemy_piece.moved) {
              res = this.attack({rank:11}, offense)

            }
            // Look for the worst case scenario
            else {
              res = "BEST_PIECE"
              for (let rank = this.player.unknown_pieces.length-1; rank >= 0; rank--) {
                let count = this.player.unknown_pieces[rank]
                if (count < 1) {continue}
                if ((rank == 0 || rank == 11) && enemy_piece.moved) {continue}

                let possible_res = this.attack({rank:rank}, offense)
                // When !offense it returns the result for the enemy piece so we need to switch win and loss
                if      (!offense && possible_res == "WIN")   {possible_res = "LOSS"}
                else if (!offense && possible_res == "LOSS")  {possible_res = "WIN"}

                if         (res == "BEST_PIECE" && possible_res == "TIE") {
                  res = "TIE"
                } else if ((res == "BEST_PIECE" && possible_res == "LOSS") || 
                           (res == "TIE"        && possible_res == "LOSS")) {
                  res = "UNKNOWN"
                  break
                }
              }              
            }            
            break
        }

        let attacker = this
        let target = enemy_piece
        if (!offense && res != "UNKNOWN") {attacker = enemy_piece; target = this}

        switch (res) {
          // When by process of elimination this is the best piece left
          case "BEST_PIECE":                              score = offense ? 2 : -2
            break
          // Loss: this piece dies, enemy is scouted
          case "LOSS":                                    score = -attacker.rank  
            break
          // Tie: both die            
          case "TIE":                                     score = 1               
            break
          // Win: enemy dies, this piece is scouted  
          case "WIN": let scout_penalty = 0
            if (!attacker.scouted) {scout_penalty = attacker.rank-1-target.rank}
                                                          score = target.rank - .5*scout_penalty 
            break
          // Flag captured  
          case "FLAG":                                    score = 1000            
            break
          // Unknown so assume negative  
          case "UNKNOWN":                                 score = 2 - this.rank
            if (this.rank == 1 && enemy_piece.player.lost_pieces[10] < 1) {score = -10} // is this working?                        
            break
          // Invalid res  
          default:                                        return false            
        }
    }
    return (offense || res == "UNKNOWN") ? score : -score
    // TODO: maybe add something of a bluff factor
    // TODO: this doesn't account at all for situations where you want to defend a different piece
  }

  set_pos(pos, clear_space=true) {
    if (this.pos.x != null && this.pos.y != null && clear_space) {
      this.player.world.set_pos(this.pos) // Reset pos
    }
    this.player.world.set_pos(pos, this)
    this.pos = pos
  }

  attack(enemy_piece, offense=true) {
    let attacker  = this
    let target    = enemy_piece
    if (!offense) {
      attacker  = enemy_piece
      target    = this
    }

    if (attacker.rank == 0 || attacker.rank == 11)  {return "LOSS"} // Can't be attacked by flags or bombs of course

    switch(true) {
      case target.rank == 0:                         return "FLAG";
      case target.rank == 11 &&  attacker.rank == 3: return "WIN";
      case target.rank == 10 &&  attacker.rank == 1: return "WIN";
      case target.rank <         attacker.rank:      return "WIN";
      case target.rank ==        attacker.rank:      return "TIE";

      default:                                       return "LOSS"; // If enemy rank > this.rank
    }
  }

  die() {
    this.player.world.set_pos(this.pos) // Reset pos
    // this.pos = {x:null,y:null}
    this.player.pieces = remove(this.player.pieces, this)
    if (this.player.selected_piece == this) {this.player.selected_piece = null}
    this.player.lost_pieces[this.rank]++

    // Potentially trigger an animation here by adding it to a queue in the game object?
  }

}

Game.World.Player = class {
  constructor(world, id) {
    this.id = id
    this.world = world
    this.won = false
    this.pieces = []
    this.lost_pieces = [0,0,0,0,0,0,0,0,0,0,0,0]
    this.selected_piece = null
    this.pieces_count = PIECES_COUNTS[this.world.map_type]
    this.setup = new Game.World.Player.Setup(this, world.setup_height[id], world.width)

    this.last_moves = [{piece: null, move: {pos: null, direction: null}}]

    this.unknown_pieces = [...PIECES_COUNTS[this.world.map_type]]
  }

  update_last_move(piece, pos, move_info) {
    let last_move = {piece: piece, move:{pos: pos, direction: move_info.dir, distance: move_info.dist}}
    this.last_moves.unshift(last_move)
    if (this.last_moves.length > 2) {
      this.last_moves = [this.last_moves[0], this.last_moves[1]]
    }
    this.world.game.start_animation(last_move)
  }    

  scout(target) {
    if (!target.scouted) {
      target.scouted = true
      this.unknown_pieces[target.rank]--      
    }
  }

  reset() {
    this.won = false
    this.pieces = []
    this.lost_pieces = []

    this.unknown_pieces = PIECES_COUNTS[this.world.map_type]
  }
}

Game.World.Player.Setup = class {
  constructor(player, height, width) {
    this.player = player
    this.height = height
    this.width  = width
    this.roster = []
    this.map    = []
    this.reset()    
    this.pick_setup()
  }

  pick_current() {

  }

  pick_setup(name="random") {
    if (name == "random") {
      let names = Object.keys(FORMATIONS)
      name = names[ Math.floor(Math.random()*names.length) ]
    }

    this.roster = []
    this.map = FORMATIONS[name]
    if (Math.random() > .5) {this.map = mirror_map(this.map)}

    return this.map
  }

  reset() {
    this.roster = [...this.player.pieces_count]
    this.map = []
  }

  randomize() {
    this.reset()

    for (let row = 0; row < this.height; row++) {
      this.map.push([])
      for (let col = 0; col < this.width; col++) {
        let rand_rank = Math.floor(Math.random()*12) // There's 12 ranks
        while (this.roster[rand_rank] < 1) {
          rand_rank = Math.floor(Math.random()*12)
        }

        this.map[row]     .push(rand_rank)
        this.roster[rand_rank]--
      }
    }
    return this.map
  }
}

function remove(array, value) { 
  return array.filter(function(ele){
      return ele != value; 
  })
}

function mirror_map(map) {
  for (let row of map) {
    row = [...row].reverse()
  }
  return map
}

function get_move_info(pos1, pos2) {
  switch (true) {
    case pos1.x > pos2.x: return {dir: "left",  dist: pos1.x-pos2.x}
    case pos1.x < pos2.x: return {dir: "right", dist: pos2.x-pos1.x}
    case pos1.y > pos2.y: return {dir: "up",    dist: pos1.y-pos2.y}
    case pos1.y < pos2.y: return {dir: "down",  dist: pos2.y-pos1.y}
    default: return false
  }
}