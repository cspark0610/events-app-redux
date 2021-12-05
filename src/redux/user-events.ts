import { Action } from 'redux';
import { ThunkAction } from 'redux-thunk';
import { RootState } from './store';
// AnyAction from redux is of type Action<T>

export interface UserEvent {
  id: number;
  title: string;
  dateStart: string;
  dateEnd: string;
}

interface UserEventsState {
  byIds: Record<UserEvent['id'], UserEvent>;
  allIds: UserEvent['id'][];
}

//-----------------ACTION CONSTANS-----------------

const LOAD_REQUEST = 'userEvents/load_request';
const LOAD_SUCCESS = 'userEvents/load_success';
const LOAD_FAILURE = 'userEvents/load_failure';

//INERFACES TO describe action type
interface LoadRequestAction extends Action<typeof LOAD_REQUEST> {}
interface LoadSuccessAction extends Action<typeof LOAD_SUCCESS> {
  //has a "payload" property which is the array of user events
  payload: {
    events: UserEvent[];
  };
}
interface LoadFailureAction extends Action<typeof LOAD_FAILURE> {
  error: string;
}

//-----------------ACTION CREATORS-----------------
//create user asynchronous actions here (function that returns a ThunkAction)
//ThunkAction<void, UserEventsState, unknown, AnyAction> REQUIERES 4 GENERIC TYPES ARGUMENTS
//<R, S, E, A>

export const loadUserEvents =
  (): ThunkAction<
    void,
    RootState,
    undefined,
    LoadRequestAction | LoadSuccessAction | LoadFailureAction
  > =>
  async (dispatch, getState) => {
    //should return a "thunk" type action called ThunkAction
    dispatch({ type: LOAD_REQUEST });
    try {
      const response = await fetch('http://localhost:3001/events');
      //.json() returns always any type
      const events: UserEvent[] = await response.json();
      console.log('events' + events);
      //at this point we want to dispatch a "LOAD_SUCCESS" action
      dispatch({ type: LOAD_SUCCESS, payload: { events } });
    } catch (error) {
      dispatch({ type: LOAD_FAILURE, error: 'failed to load events' });
    }
  };

//setear initialState para pasarlo como default value en el reducer
const initialState: UserEventsState = {
  byIds: {},
  allIds: []
};
//-----------------SELECTOR FUNCTIONS-----------------
const selectUserEvents = (rootState: RootState) => rootState.userEvents;

export const selectUserEventsArray = (rootState: RootState) => {
  const state = selectUserEvents(rootState);
  return state.allIds.map(id => state.byIds[id]);
};

//----------------- REDUCER -----------------

const userEventsReducer = (
  state: UserEventsState = initialState,
  action: LoadSuccessAction
) => {
  switch (action.type) {
    case LOAD_SUCCESS:
      const { events } = action.payload;
      return {
        ...state,
        allIds: events.map(event => event.id),
        byIds: events.reduce<UserEventsState['byIds']>((byIds, event) => {
          byIds[event.id] = event;
          return byIds;
        }, {})
      };
    default:
      return state;
  }
};

export default userEventsReducer;
