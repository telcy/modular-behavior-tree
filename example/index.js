import {
    BehaviorTree,
    MemSequence,
    MemSelector,
    Action,
    Composite,
    Decorator,
    Condition,
    Sequence,
    Selector,
    Wait,
    Inverter,
    SUCCESS,
    FAILURE,
    RUNNING,
    MaxTime
} from '../src';


class LogMessage extends Action {

    constructor({properties = { text: null }} = {}) {
        super({properties})
    }

    run(blackboard) {
        if(this.properties.text) {
            console.log(this.properties.text)
        }
        return SUCCESS
    }

}


let subtree1 = BehaviorTree.parseFileXML('./example/subtree1.xml', {LogMessage})
let subtree2 = BehaviorTree.parseFileXML('./example/subtree2.xml', {LogMessage})
let mainTree = BehaviorTree.parseFileXML('./example/maintree.xml', {Subtree1: subtree1, Subtree2: subtree2})

var bt = new BehaviorTree({tree: mainTree, blackboard: {someVariable: 123}})

setInterval(() => {
    console.info("tick")
    bt.tick()
}, 500)

/*
var maintree = new Sequence({
    nodes: [
        new Action({
            run: function() {
                console.log("another test")
                return FAILURE
            }
        }),
        subtree
    ]
})

*/
