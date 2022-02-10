import { FiniteStateMachine } from 'FiniteStateMachine';
import { Transition } from 'Transition';

export = () => {
	enum State {
		A,
		B,
		C,
	}

	enum Event {
		A,
		B,
		C,
	}

	const transitions: Transition<State, Event>[] = [
		{ event: Event.A, from: State.A, to: State.B },
		{ event: Event.B, from: State.B, to: State.C },
		{ event: Event.C, from: State.C, to: State.A },
	];

	const machine = new FiniteStateMachine(State.A, ...transitions);

	it('should be able to process an event', () => {
		machine.processEvent(Event.A);
		expect(machine.getState()).to.equal(State.B);
	});

	it('should be able to process multiple events', () => {
		machine.processEvent(Event.A);
		machine.processEvent(Event.B);
		expect(machine.getState()).to.equal(State.C);
	});

	it('should not change if there is no transition for the event', () => {
		machine.processEvent(Event.B);
		expect(machine.getState()).to.equal(State.C);
	});

	it('should not change if the next state is disabled', () => {
		machine.setStateEnabled(State.A, false);
		machine.processEvent(Event.C);
		expect(machine.getState()).to.equal(State.C);
	});

	it('should alert specific state listeners', () => {
		machine.setStateEnabled(State.A, true);

		let called = false;
		machine.onState(State.A, (prevState) => {
			called = true;
			expect(prevState).to.equal(State.C);
		});

		machine.processEvent(Event.C);
		expect(called).to.equal(true);
	});

	it('should alert global listeners', () => {
		let called = false;
		machine.onAnyState((nState, pState) => {
			called = true;
			expect(nState).to.equal(State.B);
			expect(pState).to.equal(State.A);
		});

		machine.processEvent(Event.A);
		expect(called).to.equal(true);
	});
};
