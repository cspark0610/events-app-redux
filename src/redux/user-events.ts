import { Action } from 'redux';
import { ThunkAction } from 'redux-thunk';
import { RootState } from './store';
import { selectDateStart } from './recorder';
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
const CREATE_REQUEST = 'userEvents/create_request';
const CREATE_SUCCESS = 'userEvents/create_success';
const CREATE_FAILURE = 'userEvents/create_failure';
const DELETE_REQUEST = 'userEvents/delete_request';
const DELETE_SUCCESS = 'userEvents/delete_success';
const DELETE_FAILURE = 'userEvents/delete_failure';
const UPDATE_REQUEST = 'userEvents/update_request';
const UPDATE_SUCCESS = 'userEvents/update_success';
const UPDATE_FAILURE = 'userEvents/update_failure';

//INTERFACES TO describe action CONSTANTS DEFINED EARLIER
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
interface CreateRequestAction extends Action<typeof CREATE_REQUEST> {}
interface CreateSuccessAction extends Action<typeof CREATE_SUCCESS> {
  //has a "payload" property which is the created events that is passed to the reducer
  payload: {
    event: UserEvent;
  };
}
interface CreateFailureAction extends Action<typeof CREATE_FAILURE> {
  error: string;
}
interface DeleteRequestAction extends Action<typeof DELETE_REQUEST> {}
interface DeleteSuccessAction extends Action<typeof DELETE_SUCCESS> {
  payload: {
    id: UserEvent['id'];
  };
}
interface DeleteFailureAction extends Action<typeof DELETE_FAILURE> {
  error: string;
}
interface UpdateRequestAction extends Action<typeof UPDATE_REQUEST> {}
interface UpdateSuccessAction extends Action<typeof UPDATE_SUCCESS> {
  payload: {
    event: UserEvent;
  };
}
interface UpdateFailureAction extends Action<typeof UPDATE_FAILURE> {
  error: string;
}
//-----------------ACTION CREATORS-----------------
//create user asynchronous actions here (function that returns a ThunkAction)
//ThunkAction<void, UserEventsState, unknown, AnyAction> REQUIERES 4 GENERIC TYPES ARGUMENTS
//<Return value of our thunk action, State, Extra argument, Actions that can be dispatched>

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

export const createUserEvent =
  (): ThunkAction<
    Promise<void>,
    RootState,
    undefined,
    CreateRequestAction | CreateSuccessAction | CreateFailureAction
  > =>
  async (dispatch, getState) => {
    dispatch({ type: CREATE_REQUEST });
    //primero se dispatchea la action y luego se ejecuta el fetch try/catch
    try {
      const dateStart = selectDateStart(getState());
      //aca hago uso del 2do argumento getState()
      const event: Omit<UserEvent, 'id'> = {
        title: 'New Event name',
        dateStart,
        dateEnd: new Date().toISOString()
      };
      const response = await fetch('http://localhost:3001/events', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(event)
      });
      const createdEvent: UserEvent = await response.json();
      //en este punto si todo fue bien debo dispatchear CREATE_SUCCESS action
      dispatch({ type: CREATE_SUCCESS, payload: { event: createdEvent } });
    } catch (error) {
      console.log(error);
      dispatch({ type: CREATE_FAILURE, error: 'failed to create event' });
    }
  };
export const deleteUserEvent =
  (
    id: UserEvent['id']
  ): ThunkAction<
    Promise<void>,
    RootState,
    undefined,
    DeleteRequestAction | DeleteSuccessAction | DeleteFailureAction
  > =>
  async dispatch => {
    dispatch({ type: DELETE_REQUEST });
    try {
      const response = await fetch(`http://localhost:3001/events/${id}`, {
        method: 'DELETE'
      });
      if (response.ok) {
        dispatch({ type: DELETE_SUCCESS, payload: { id } });
      }
    } catch (error) {
      dispatch({ type: DELETE_FAILURE, error: 'failed to delete event' });
    }
  };
//la diferencia con el delete es que en el update voy a recibir el objecto event completo
export const updateUserEvent =
  (
    event: UserEvent
  ): ThunkAction<
    Promise<void>,
    RootState,
    undefined,
    UpdateRequestAction | UpdateSuccessAction | UpdateFailureAction
  > =>
  async dispatch => {
    dispatch({ type: UPDATE_REQUEST });
    try {
      const response = await fetch(`http://localhost:3001/events/${event.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(event)
      });
      const updatedEvent: UserEvent = await response.json();
      dispatch({ type: UPDATE_SUCCESS, payload: { event: updatedEvent } });
    } catch (error) {
      dispatch({ type: UPDATE_FAILURE, error: 'failed to update event' });
    }
  };

//-----------------SELECTOR FUNCTIONS-----------------
const selectUserEvents = (rootState: RootState) => rootState.userEvents;

export const selectUserEventsArray = (rootState: RootState) => {
  const state = selectUserEvents(rootState);
  return state.allIds.map(id => state.byIds[id]);
};

//setear initialState para pasarlo como default value en el reducer
const initialState: UserEventsState = {
  byIds: {},
  allIds: []
};
//----------------- REDUCER -----------------

const userEventsReducer = (
  state: UserEventsState = initialState,
  action:
    | LoadSuccessAction
    | CreateSuccessAction
    | DeleteSuccessAction
    | UpdateSuccessAction
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
    case CREATE_SUCCESS:
      const { event } = action.payload;
      return {
        ...state,
        allIds: [...state.allIds, event.id],
        byIds: { ...state.byIds, [event.id]: event }
      };
    case DELETE_SUCCESS:
      const { id } = action.payload;
      const newState = {
        ...state,
        byIds: { ...state.byIds },
        allIds: state.allIds.filter(storedId => storedId !== id)
      };
      //delete operator to delete id event from byIds object!!
      delete newState.byIds[id];
      return newState;
    case UPDATE_SUCCESS:
      //remane event variable to updatedEvent because i was prevously used event
      const { event: updatedEvent } = action.payload;
      return {
        ...state,
        byIds: { ...state.byIds, [updatedEvent.id]: updatedEvent }
      };

    default:
      return state;
  }
};

export default userEventsReducer;
