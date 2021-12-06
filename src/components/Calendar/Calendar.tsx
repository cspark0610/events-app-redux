import React, { useEffect } from 'react';
import { connect, ConnectedProps } from 'react-redux';
import { RootState } from '../../redux/store';
import './Calendar.css';
import {
  selectUserEventsArray,
  loadUserEvents,
  UserEvent
} from '../../redux/user-events';
import { addZero } from '../Recorder/Recorder';
import EventItem from './EventItem';

const mapState = (state: RootState) => ({
  events: selectUserEventsArray(state)
});
const mapDispatch = {
  loadUserEvents
};
const connector = connect(mapState, mapDispatch);
//
type PropsFromRedux = ConnectedProps<typeof connector>;
interface Props extends PropsFromRedux {}
// return a string in the format of "yyyy-mm-dd"
const createDateKey = (date: Date) => {
  const year = date.getUTCFullYear();
  const month = date.getUTCMonth() + 1;
  const day = date.getUTCDate();
  return `${year}-${addZero(month)}-${addZero(day)}`;
};
// i need a function to groups events by day
const groupEventsByDay = (events: UserEvent[]) => {
  const groups: Record<string, UserEvent[]> = {};
  const addToGroup = (dateKey: string, event: UserEvent): void => {
    if (!groups[dateKey]) {
      groups[dateKey] = [];
    }
    groups[dateKey].push(event);
  };
  events.forEach(event => {
    const dateStartKey = createDateKey(new Date(event.dateStart));
    const dateEndKey = createDateKey(new Date(event.dateEnd));
    addToGroup(dateStartKey, event);
    if (dateStartKey !== dateEndKey) {
      addToGroup(dateEndKey, event);
    }
  });
  return groups;
};

const Calendar: React.FC<Props> = ({ events, loadUserEvents }) => {
  useEffect(() => {
    loadUserEvents();
  }, []);

  let groupedEvents: ReturnType<typeof groupEventsByDay> | undefined;
  let sortedGroupKeys: string[] | undefined;
  // [2020-01-01, 2020-01-02, 2020-01-03] example
  if (events.length) {
    //si existen eventos los vamos a agrupar con la funcion groupEventsByDay
    groupedEvents = groupEventsByDay(events);
    //unix timestamp
    sortedGroupKeys = Object.keys(groupedEvents).sort(
      (date1, date2) => Number(new Date(date2)) - Number(new Date(date1))
    );
  }

  return groupedEvents && sortedGroupKeys ? (
    <div className="calendar">
      {sortedGroupKeys.map(dayKey => {
        // const events = groupedEvents![day];
        // OR we can do ternary operator
        const events = groupedEvents ? groupedEvents[dayKey] : [];
        const groupDate = new Date(dayKey);
        const day = groupDate.getDate();
        const month = groupDate.toLocaleDateString(undefined, {
          month: 'long'
        });
        return (
          <div className="calendar-day">
            <div className="calendar-day-label">
              <span>
                {day} {month}
              </span>
            </div>
            <div className="calendar-events">
              {events.map(event => (
                <EventItem event={event} key={event.id} />
              ))}
            </div>
          </div>
        );
      })}
    </div>
  ) : (
    <p>Loading....</p>
  );
};

export default connector(Calendar);
