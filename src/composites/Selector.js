import { FAILURE } from '../constants'
import Composite from '../core/Composite'

class Selector extends Composite {

    constructor({children = []} = {}) {
        super({
            children
        })
    }

    run(blackboard, tick) {

        for (let i=0; i<this.children.length; i++) {
            let status = this.children[i]._execute(blackboard, tick);
            if (status !== FAILURE) return status;
        }

        return FAILURE;
    } 

}

module.exports = Selector