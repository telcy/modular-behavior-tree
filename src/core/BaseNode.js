import {createUUID} from '../functions'
import {RUNNING} from '../constants'

export default class BaseNode {

    constructor({properties, category} = {}) {
        this._uuid = createUUID()
        this.category = category || '';
        this.properties = properties || {}
    }

    _execute(blackboard, tick) {
        if(!tick.isOpen(this)) this._start(blackboard, tick)
        let status = this._run(blackboard, tick)
        if(status !== RUNNING) this._end(blackboard, tick)
        return status
    }

    _start(blackboard, tick) {
        tick.open(this)
        this.start(blackboard, tick)
    }

    _run(blackboard, tick) {
        return this.run(blackboard, tick)
    }

    _end(blackboard, tick) {
        tick.close(this)
        this.end(blackboard, tick)
    }

    start(blackboard, tick) {}

    run(blackboard, tick) {}

    end(blackboard, tick) {}

}
