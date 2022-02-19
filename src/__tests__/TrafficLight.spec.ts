import { FiniteStateMachine } from 'FiniteStateMachine';
import { Transition } from 'Transition';

export = () => {
	enum State {
		OFF,
		RED,
		YELLOW,
		GREEN,
	}

	enum Event {
		TICK,
		KILL,
	}

	const transitions: Transition<State, Event>[] = [
		{ event: Event.TICK, from: State.OFF, to: State.RED },
		{ event: Event.TICK, from: State.RED, to: State.YELLOW },
		{ event: Event.TICK, from: State.YELLOW, to: State.GREEN },
		{ event: Event.TICK, from: State.GREEN, to: State.RED },

		{ event: Event.KILL, from: State.RED, to: State.OFF },
		{ event: Event.KILL, from: State.YELLOW, to: State.OFF },
		{ event: Event.KILL, from: State.GREEN, to: State.OFF },
	];

	const trafficLight = new FiniteStateMachine(State.OFF, ...transitions);

	let stateChanges = 0;
	trafficLight.onAnyState(() => stateChanges++);

	it('should be off when starting', () => expect(trafficLight.getState()).to.equal(State.OFF));

	it('should only be able to move to red after off', () => {
		trafficLight.processEvent(Event.KILL);
		expect(stateChanges).to.equal(0);

		trafficLight.processEvent(Event.TICK);
		expect(stateChanges).to.equal(1);
		expect(trafficLight.getState()).to.equal(State.RED);
	});

	it('should only be able to move to yellow after red', () => {
		trafficLight.processEvent(Event.TICK);
		expect(stateChanges).to.equal(2);
		expect(trafficLight.getState()).to.equal(State.YELLOW);
	});

	it('should only be able to move to green after yellow', () => {
		trafficLight.processEvent(Event.TICK);
		expect(stateChanges).to.equal(3);
		expect(trafficLight.getState()).to.equal(State.GREEN);
	});

	it('should only be able to move to red after green', () => {
		trafficLight.processEvent(Event.TICK);
		expect(stateChanges).to.equal(4);
		expect(trafficLight.getState()).to.equal(State.RED);
	});

	it('should be able to die at any time', () => {
		trafficLight.processEvent(Event.KILL);
		expect(stateChanges).to.equal(5);
		expect(trafficLight.getState()).to.equal(State.OFF);

		for (let i = 0; i < new Random().NextInteger(5, 25); i++) {
			trafficLight.processEvent(Event.TICK);
		}

		trafficLight.processEvent(Event.KILL);
		expect(trafficLight.getState()).to.equal(State.OFF);
	});
};
