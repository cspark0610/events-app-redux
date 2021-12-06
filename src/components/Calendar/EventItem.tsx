import React, { useEffect, useRef, useState } from 'react';
import { useDispatch } from 'react-redux';
import {
  deleteUserEvent,
  UserEvent,
  updateUserEvent
} from '../../redux/user-events';

interface Props {
  event: UserEvent;
}

const EventItem: React.FC<Props> = ({ event }) => {
  const dispatch = useDispatch();
  const handleDeleteClick = () => {
    dispatch(deleteUserEvent(event.id));
  };
  const handleTitleClick = () => {
    setEditable(true);
  };
  //----------------------------------------------------------------------------
  const [title, setTitle] = useState<string>(event.title);
  //necesito un handleChange para poder escribir sobre el input, necesito al mismo tiempo un estado local para guardar el valor del input la cual llamo [title, setTitle], la variable title esta asociada siempre a la prop value del input, y en onChange paso la funcion handleChange.
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setTitle(e.target.value);
  };
  //------------------------------------------------------------------------------------
  const [editable, setEditable] = useState<boolean>(false);
  //necesito una referencia al input para poder editarlo
  const inputRef = useRef<HTMLInputElement>(null);
  useEffect(() => {
    if (editable) {
      inputRef.current?.focus();
    }
  }, [editable]);
  //------------------------------------------------------------------------------------
  const handleBlur = () => {
    //dispatch create action creator to update title updateUserEvent() only if title has changed
    if (title !== event.title) {
      dispatch(
        updateUserEvent({
          ...event,
          title: title
        })
      );
    }
    setEditable(false);
  };

  return (
    <>
      <div className="calendar-event" key={event.id}>
        <div className="calendar-event-info">
          <div className="calendar-event-time">10:00-12:00</div>
          <div className="calendar-event-title">
            {editable ? (
              <input
                type="text"
                value={title}
                ref={inputRef}
                onChange={handleChange}
                onBlur={handleBlur}
              />
            ) : (
              <span onClick={handleTitleClick}>{event.title}</span>
            )}
          </div>
        </div>
        <button
          className="calendar-event-delete-button"
          onClick={handleDeleteClick}>
          &times;
        </button>
      </div>
    </>
  );
};

export default EventItem;
