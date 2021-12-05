import { Action } from 'redux';
import { RootState } from './store';

//armar una interface para descripbir el state
interface RecorderState {
  dateStart: string;
}
//crear los actions types STRINGS
//case START o case STOP dentro del switch del reducer
const START = 'recorder/start';
const STOP = 'recorder/stop';

//describir los actions objects
type StartAction = Action<typeof START>;
type StopAction = Action<typeof STOP>;

//crear los actions types creators, son funciones que retornan un objeto , con key "type" y value= string actions definido anteriormente
export const start = (): StartAction => ({
  type: START
});
export const stop = (): StopAction => ({
  type: STOP
});
// de acuerdo a como se definio el combine reducers en store.ts
export const selectRecorderState = (rootState: RootState) => rootState.recorder;
//selector dateStart function se lo pasa como cb al hook useSelector
export const selectDateStart = (rootState: RootState) =>
  selectRecorderState(rootState).dateStart;

//setear el initialState object para pasarlo como defualt value del state
const initialState: RecorderState = {
  dateStart: ''
};

const recorderReducer = (
  state: RecorderState = initialState,
  action: StartAction | StopAction
) => {
  switch (action.type) {
    case START:
      return { ...state, dateStart: new Date().toISOString() };
    case STOP:
      return { ...state, dateStart: '' };
    default:
      return state;
  }
};
export default recorderReducer;
