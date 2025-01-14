// Frank Poth 02/28/2018

/* This is a fixed time step game loop. It can be used for any game and will ensure
that game state is updated at the same rate across different devices which is important
for uniform gameplay. Imagine playing your favorite game on a new phone and suddenly
it's running at a different speed. That would be a bad user experience, so we fix
it with a fixed step game loop. In addition, you can do things like frame dropping
and interpolation with a fixed step loop, which allow your game to play and look
smooth on slower devices rather than freezing or lagging to the point of unplayability. */

const Engine = class {
  constructor(time_step, update_fn, render_fn) {

    this.accumulated_time        = 0          // Amount of time that's accumulated since the last update.
    this.animation_frame_request = undefined  // reference to the AFR
    this.time                    = undefined  // The most recent timestamp of loop execution.
    this.time_step               = time_step  // 1000/30 = 30 frames per second
    this.old_time_step           = time_step  // for remembering a previous setting

    this.updated = false    // Whether or not the update function has been called since the last cycle.

    this.update = update_fn // The update function
    this.render = render_fn // The render function

    // We use an arrow function here because of the scope?
    this.handleRun = (time_stamp) => { console.log(this); this.run(time_stamp); } // time_stamp is passed by requestAnimationFrame
  }

  changeTimeStep(value, back=false) {
    this.old_time_step = this.time_step
    this.time_step = value

    if (back) {
      this.time_step = this.old_time_step
    }
  }

  start() {

    this.accumulated_time = this.time_step;
    this.time = window.performance.now(); 
    this.animation_frame_request = window.requestAnimationFrame(this.handleRun); // We use rAF because if you just called this.run and it called itself back the stack would overflow

  }

  stop() { window.cancelAnimationFrame(this.animation_frame_request) }

  run(time_stamp) {// This is one cycle of the game loop

    this.accumulated_time += time_stamp - this.time;
    this.time = time_stamp;

    /* If the device is too slow, updates may take longer than our time step. If
    this is the case, it could freeze the game and overload the cpu. To prevent this,
    we catch a memory spiral early and never allow three full frames to pass without
    an update. This is not ideal, but at least the user won't crash their cpu. */
    if (this.accumulated_time >= this.time_step * 3) {

      this.accumulated_time = this.time_step;

    }

    /* Since we can only update when the screen is ready to draw and requestAnimationFrame
    calls the run function, we need to keep track of how much time has passed. We
    store that accumulated time and test to see if enough has passed to justify
    an update. Remember, we want to update every time we have accumulated one time step's
    worth of time, and if multiple time steps have accumulated, we must update one
    time for each of them to stay up to speed. */
    while(this.accumulated_time >= this.time_step) {

      this.accumulated_time -= this.time_step;

      this.update();

      this.updated = true;// If the game has updated, we need to draw it again.

    }

    /* This allows us to only draw when the game has updated. */
    if (this.updated) {

      this.updated = false;
      this.render();

    }

    this.animation_frame_request = window.requestAnimationFrame(this.handleRun);

  }
}
