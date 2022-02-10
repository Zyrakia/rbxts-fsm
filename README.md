# FSM (Finite State Machine)

A super simple finite state machine pattern implementation. If you are not sure what this is, a finite state machine is a state manager that ensures a system is only in a single state out of a predefined, finite number of states at one time, and has a set of predefined paths that it can take.

## Example

In this example, this traffic light loops between each state forever. Because we defined the possible transitions in the `transitions` variable, we know that the machine can ONLY go
in the sequence we defined.

If the `ORANGE_OFF` event is fired when the light is `GREEN`, the event is just ignored since there is no transition defined for such a scenario, this way we can ensure our system always follows a predictable and predefined pattern.

```ts
enum State {
	GREEN,
	ORANGE,
    RED,
}

enum Event {
	GREEN_OFF,
	ORANGE_OFF,
	RED_OFF,
}

const transitions: Transition<State, Event>[] = [
    // When the GREEN_OFF event fires, and we're in the GREEN state, switch to ORANGE
	{ event: Event.GREEN_OFF, from: State.GREEN, to: State.ORANGE },

    // When the ORANGE_OFF event fires, and we're in the ORANGE state, switch to RED
	{ event: Event.ORANGE_OFF, from: State.ORANGE, to: State.RED },

    // When the RED_OFF event fires, and we're in the RED state, switch back to GREEN
	{ event: Event.RED_OFF, from: State.RED, to: State.GREEN },

    // Create more states, events, transitions... get as complex as you want
];

const trafficLight = new FiniteStateMachine(State.GREEN, ...transitions);

trafficLight.onState(State.GREEN, () => {
	print('THE LIGHT IS GREEN');
	task.delay(2.5, () => trafficLight.processEvent(Event.GREEN_OFF));
});

trafficLight.onState(State.ORANGE, () => {
	print('THE LIGHT IS ORANGE');
	task.delay(1, () => trafficLight.processEvent(Event.ORANGE_OFF));
});

trafficLight.onState(State.RED, () => {
	print('THE LIGHT IS RED');
	task.delay(2.5, () => trafficLight.processEvent(Event.RED_OFF));
});

// Since the initial state was defined GREEN, the system is currently
// in the GREEN state, so the only event that will do anything is GREEN_OFF
trafficLight.processEvent(Event.GREEN_OFF);
```