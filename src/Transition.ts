export interface Transition<State, Event> {
	event: Event;
	from: State;
	to: State;
}
