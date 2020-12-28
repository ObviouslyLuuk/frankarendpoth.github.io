import { Network } from "./neural_net.js"
import { seeded_rand } from "./random.js"
import { get_max_value_index } from "./helper.js"

// credit: https://stackoverflow.com/questions/49338193/how-to-use-code-from-script-with-type-module
window.NetController = class NetController {
    constructor(batch_size=100, layers=[{type: "Dense", size:16}]) {
        this.input_length = 4
        this.output_length = 3
        let training_shape = [{x: new Array(this.input_length), y: new Array(this.output_length)}]
        this.policy_network = new Network(training_shape, layers)
        this.target_network = new Network(training_shape, [])
        this.replay_memory = []
        this.max_memory = 1000
        this.current_memory = {}
        this.batch_size = batch_size
        this.epsilon = 1

        this.target_update_timer = 0
    }

    update_target_network() {
        // Only once every so often
        if (this.target_update_timer == 0) {
            this.target_network.layers= this.policy_network.layers
            this.target_update_timer = 0 // This seems to not matter much (tried between 0 and 10000)
        } else {
            this.target_update_timer--
        }
    }

    get_policy(input) {
        this.current_memory.s0 = input

        let layer_count = this.policy_network.layers.length
        if (this.epsilon >= seeded_rand(0,0)) {
            this.current_memory.a = Math.floor( seeded_rand(0,0)*this.output_length )
        } else {
            let output_activations = this.policy_network.layers[layer_count - 1].feedforward(input, null).output
            this.current_memory.a = get_max_value_index( output_activations )
        }
        return this.current_memory.a
    }

    store_in_memory(reward, next_state) {
        // if (reward == 0) return

        let memory_length = this.replay_memory.length
        if (memory_length >= this.max_memory) this.replay_memory.splice( Math.floor(seeded_rand(0,0)*memory_length) )

        this.replay_memory.push({
            s0: this.current_memory.s0,
            a: this.current_memory.a,
            r: reward,
            s1: next_state,
        })
    }

    select_batch_from_memory() {
        // Select random batch
        let experiences = this.replay_memory
        let batch = []
        for (let i = 0; i < this.batch_size; i++) {
            if (experiences.length < 1) break
            let experience = experiences.splice( Math.floor(seeded_rand(0,0)*experiences.length) )[0]
            batch.push( experience )
        }
        return batch
    }

    SGD(eta=.5) {
        let batch = this.select_batch_from_memory()
        if (batch.length < 1) return

        let layer_count = this.policy_network.layers.length
        for (let experience of batch) {
            // Get max q value from feeding s1 of the experience into the target network
            let output_activations = this.target_network.layers[layer_count - 1].feedforward(experience.s1, null).output
            let q_value = 0
            for (let a of output_activations) {
                q_value = Math.max(q_value, a)
            }
            let expectation = experience.r + q_value
            // let expectation = q_value

            // Do feedforward on s0 of the current policy network and set the output activations as labels
            let labels = this.policy_network.layers[layer_count - 1].feedforward(experience.s0, null).output
            // Replace the label for the experience's action because that's the only one we can say anything about
            labels.splice(experience.a, 1, expectation)

            this.policy_network.layers[layer_count - 1].labels = labels
            this.policy_network.layers[1].backprop()
        }

        // Apply the total nudges from backprop to each layer
        for (let l = 1; l < layer_count; l++) { // we skip the input layer
            let layer = this.policy_network.layers[l]
            layer.apply_nudges(batch.length, eta) // we use batch.length and not this.batch_size because the batch might be smaller
        }        
    }

    update() {
        this.epsilon *= .99
    }
}