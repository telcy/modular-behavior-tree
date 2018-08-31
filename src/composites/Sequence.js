import { SUCCESS, RUNNING } from '../constants'
import Composite from '../core/Composite'

class Sequence extends Composite {

    constructor({children = []} = {}) {
        super({
            children
        })
    }

    run(blackboard, tick) {

        for (let i=0; i<this.children.length; i++) {
            let status = this.children[i]._execute(blackboard, tick);
            if (status !== SUCCESS) return status;
        }

        return SUCCESS;

    } 

}

module.exports = Sequence