import { Transition } from 'Transition';

/**
 * A type-safe finite state machine implementation.
 */
export class FiniteStateMachine<State, Event> {
	private initialState: State;
	private lastState: State;
	private currentState: State;

	/** Mapped so that you index by the `event`, index by the `from` state, and then get the `to` state. */
	private transitions = new Map<Event, Map<State, State>>();
	private stateStatuses = new Map<State, boolean>();

	private listeners = new Map<State, Set<(prevState: State) => void>>();
	private globalListeners = new Set<(newState: State, prevState: State) => void>();

	/**
	 * Construct a new finite state machine with the given initial state and transitions.
	 *
	 * @param initialState The initial state of the finite state machine.
	 * @param transitions The transitions of the finite state machine.
	 */
	public constructor(initialState: State, ...transitions: Transition<State, Event>[]) {
		this.initialState = initialState;
		this.lastState = initialState;
		this.currentState = initialState;

		this.addTransitions(...transitions);
	}

	/**
	 * Process an event and perform the first transition that
	 * matches the event and the current state. If no transition
	 * matches, the next state is disabled, or the machine is already
	 * in the next state, then nothing happens.
	 *
	 * This function will invoke any listeners that are registered globally
	 * or for the next state, if the transition is made.
	 *
	 * @param event The event to process.
	 * @returns Whether the state was entered.
	 */
	public processEvent(event: Event) {
		const transitions = this.transitions.get(event);
		if (!transitions) return false;

		const nextState = transitions.get(this.currentState);
		if (nextState === undefined || !this.getStateEnabled(nextState)) return false;

		return this.enterState(nextState);
	}

	/**
	 * Enter the given state and starts the state change process
	 * if the state is different from the current state.
	 *
	 * @param state The state to enter.
	 * @returns Whether the state was entered.
	 */
	private enterState(state: State) {
		if (this.currentState === state) return false;

		this.lastState = this.currentState;
		this.currentState = state;

		this.onStateChange(this.currentState, this.lastState);
		return true;
	}

	/**
	 * Sets the status of the given state. If a state
	 * is disabled it means that it can never be entered
	 * by the machine.
	 *
	 * @param state The state to set the status of.
	 * @param enabled Whether the state is enabled.
	 */
	public setStateEnabled(state: State, enabled: boolean) {
		this.stateStatuses.set(state, enabled);
	}

	/**
	 * Returns whether the given state is enabled, meaning
	 * that it can be entered.
	 */
	public getStateEnabled(state: State) {
		return this.stateStatuses.get(state) ?? true;
	}

	/**
	 * Adds the given transitions to the machine.
	 */
	public addTransitions(...transitions: Transition<State, Event>[]) {
		transitions.forEach((transition) => {
			const transitions = this.transitions.get(transition.event) ?? new Map();
			transitions.set(transition.from, transition.to);
			this.transitions.set(transition.event, transitions);
		});
	}

	/**
	 * Invokes all listeners that are registered globally or for the
	 * next state. This is called when the state changes.
	 *
	 * @param newState The state that was entered.
	 * @param prevState The state that was left.
	 */
	private onStateChange(newState: State, prevState: State) {
		this.globalListeners.forEach((listener) => listener(newState, prevState));
		const listeners = this.listeners.get(newState);
		if (listeners) listeners.forEach((listener) => listener(prevState));
	}

	/**
	 * Registers a listener to be called whenever the machine enters
	 * the given state.
	 *
	 * @param state The state to listen for.
	 * @param listener The listener to call.
	 */
	public onState(state: State, listener: (prevState: State) => void) {
		const listeners = this.listeners.get(state) ?? new Set();
		listeners.add(listener);
		this.listeners.set(state, listeners);
	}

	/**
	 * Registers a listener to be called whenever the machine
	 * enters a new state.
	 *
	 * @param listener The listener to call.
	 */
	public onAnyState(listener: (newState: State, prevState: State) => void) {
		this.globalListeners.add(listener);
	}

	/**
	 * Forces the machine to enter the initial state.
	 */
	public reset() {
		this.enterState(this.initialState);
	}

	/**
	 * Clears all listeners, transitions, and state statuses.
	 * Also resets the machine to the initial state.
	 */
	public clear() {
		this.stateStatuses.clear();
		this.transitions.clear();
		this.listeners.clear();
		this.globalListeners.clear();
		this.currentState = this.initialState;
		this.lastState = this.initialState;
	}

	/**
	 * Returns the current state of the machine.
	 */
	public getState() {
		return this.currentState;
	}

	/**
	 * Returns the last state of the machine.
	 */
	public getLastState() {
		return this.lastState;
	}
}
