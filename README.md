# Modular Behavior Tree

A JavaScript implementation of modular behavior trees, similar to [Lumberyard engine's MBTs](https://docs.aws.amazon.com/lumberyard/latest/userguide/ai-scripting-mbt.html). This library has been highly inspired by these two existing libs: [BehaviorTree.js](https://www.npmjs.com/package/behaviortree) and [BEHAVIOR3JS](https://www.npmjs.com/package/behavior3js).

## Features

- Load trees from XML files
- Basic composite, decorator and action nodes included
- Blackboard to access global data
- Create your own nodes

## Installation

`npm install --save modular-behavior-tree`

## Example

subtree1.xml

``` xml
<BehaviorTree>
   <MemSequence>
      <Wait ms="3000" />
      <LogMessage text="Waited 3 seconds" />
   </MemSequence>
</BehaviorTree>
```

subtree2.xml

``` xml
<BehaviorTree>
   <MemSequence>
      <Wait ms="5000" />
      <LogMessage text="Waited 5 seconds" />
   </MemSequence>
</BehaviorTree>
```

maintree.xml

``` xml
<BehaviorTree>
   <MemSequence>
      <Subtree1 />
      <Subtree2 />
   </MemSequence>
</BehaviorTree>
```

index.js
``` js
import { BehaviorTree, Action, SUCCESS } from 'modular-behavior-tree';

// defining custom action
class LogMessage extends Action {

   constructor({properties = { text: null }} = {}) {
      super({properties})
   }

   start(blackboard, tick) {}

   run(blackboard) {
      if(this.properties.text) {
         console.log(this.properties.text)
      }
      return SUCCESS
   }

   end(blackboard, tick) {}

}

// loading trees from XML files
let subtree1 = BehaviorTree.parseFileXML('./subtree1.xml', {LogMessage})
let subtree2 = BehaviorTree.parseFileXML('./subtree2.xml', {LogMessage})
let mainTree = BehaviorTree.parseFileXML('./maintree.xml', {Subtree1: subtree1, Subtree2: subtree2})

// create behavior tree instance
var bt = new BehaviorTree({tree: mainTree, blackboard: {someVariable: 123}})

// call bt.tick() for tree execution
setInterval(() => {
    console.info("tick")
    bt.tick()
}, 500)

```

## Manual trees mixed with parsed trees

You can create your trees directly without parsing a XML file and even mix them together with XML parsed trees.

```js
let subtree = BehaviorTree.parseFileXML('./subtree.xml')

let tree = new Sequence({
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

```

## Register custom nodes and trees

To make the tree loader aware of subtrees or custom nodes you have to pass them as second argument into the parse function.

```js
// custom node
class MyCustomAction extends Action {
   // ...
}

// subtree
let subtree = BehaviorTree.parseFileXML('./subtree.xml')

// main tree with passed custom node and subtree
let maintree = BehaviorTree.parseFileXML('./maintree.xml', { MyCustomAction, Subtree: subtree })
```

## Basic Nodes

This library ships with some basic nodes to get your started.

``` js
import {Sequence, Selector, MemSequence, MemSelector, Inverter, MaxTime, Wait} from 'modular-behavior-tree'
```

### Sequence, Selector, MemSequence, MemSelector

Composite nodes with children. Mem* does remember the last executed child which returned RUNNING and will not executed the previous children.

``` xml
<MemSequence>
   <MyCustomAction1 />
   <MyCustomAction2 />
</MemSequence>
```

### Inverter

`SUCCESS -> FAILURE, FAILURE -> SUCCESS`

``` xml
<Inverter>
   <MyCustomAction />
</Inverter>
```

### MaxTime

Returns FAILURE if the child takes too long. Makes sure that the child returns RUNNING as long as it's computation is still running.

``` xml
<MaxTime ms="10000">
   <MyCustomAction />
</MaxTime>
```

### Wait

A simple wait action, which returns RUNNING as long the time is not over yet.

``` xml
<Wait ms="3000" />
```

## Constants

Use following constants as return value for the run method

``` js
import {SUCCESS, FAILURE, RUNNING} from 'modular-behavior-tree'
```

- SUCCESS: computation succeeded
- FAILURE: computation failed
- RUNNING: computation still running

## Methods

   - `start` - called before run is called, but not if node is resuming after ending with RUNNING
   - `end` - called after run finishes with SUCCES or FAILURE
   - `run` - main computation function


## Defining own nodes

You have to inherit from one of these 4 classes, if you want to create your own node:
`Action, Composite, Decorator, Condition`

Mostly you will be fine to go with inheritance of Action

### Action

``` js
import { Action, SUCCESS } from 'modular-behavior-tree'

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

```

In case you are planing to create additional composites or decorators you can have a look how the basic ones are implemented, ...

### Sequence

``` js
import { Composite, SUCCESS } from 'modular-behavior-tree'

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
```

### Selector

``` js
import { Composite, FAILURE } from 'modular-behavior-tree'

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
```

### MemSequence

```js
import { Composite, SUCCESS, RUNNING } from 'modular-behavior-tree'

class MemSequence extends Composite {

   constructor({children = []} = {}) {
      super({
         children
      })
      this._openNodeIndex = null
   }

   run(blackboard, tick) {

      for (let i=0; i<this.children.length; i++) {
         if(!this._openNodeIndex || (this._openNodeIndex && this._openNodeIndex === i) ) {
            let status = this.children[i]._execute(blackboard, tick);
            this._openNodeIndex = (status === RUNNING) ? i : null
            if (status !== SUCCESS) return status;
         }
      }

      return SUCCESS;

   }

}
```

### MemSelector

```js
import { Composite, FAILURE } from 'modular-behavior-tree'

class MemSelector extends Composite {

   constructor({children = []} = {}) {
      super({
         children
      })
      this._openNodeIndex = null
   }

   run(blackboard, tick) {

      for (let i=0; i<this.children.length; i++) {
         if(!this._openNodeIndex || (this._openNodeIndex && this._openNodeIndex === i) ) {
            let status = this.children[i]._execute(blackboard, tick);
            this._openNodeIndex = (status === RUNNING) ? i : null
            if (status !== FAILURE) return status;
         }
      }

      return FAILURE;

   }

}
```

### Inverter

```js
import { Decorator, SUCCESS, FAILURE } from 'modular-behavior-tree'

class Inverter extends Decorator {

   constructor({child = null} = {}) {
      super({
         child
      })
   }

   run(blackboard, tick) {

      if (!this.child) throw new Error("No child defined for Inverter")

      let status = this.child._execute(blackboard, tick)

      switch(status) {
         case SUCCESS: return FAILURE
         case FAILURE: return SUCCESS
         default: return status
      }

   }

}
```

## Version history

- 1.0.4 - async/await support
- 1.0.3 - updated dependencies
- 1.0.2 - add links, update readme
- 1.0.1 - new bundle
- 1.0.0 - initial release
