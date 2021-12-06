import { useEffect, useRef, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { selectDateStart, start, stop } from '../../redux/recorder';
import './Recorder.css';
import cx from 'classnames';
import { createUserEvent } from '../../redux/user-events';

export const addZero = (num: number) => (num < 10 ? `0${num}` : `${num}`);

const Recorder = () => {
  // use useDispatch hook
  const dispatch = useDispatch();
  // use useSelector hook to read the dateStart inital state
  const dateStart = useSelector(selectDateStart);
  //define a boolean variable to control the button
  const started: boolean = dateStart !== '';

  // variable "interval" q la voy a ir "pisando" para guardar el ultimo estado del timer en el que se encuentra
  //porque la funcioon setinterval retorna un type number, le paso como valor por default 0
  let interval = useRef<number>(0);
  //local state count
  const [, setCount] = useState<number>(0);
  const handleClick = () => {
    if (started) {
      window.clearInterval(interval.current);
      //disptach stop action!!, ACA TB CUANDO HAGO CLICK EN EL BOTON DE STOP DISPATCH createUserEvent (action creator)
      dispatch(createUserEvent());
      dispatch(stop());
    } else {
      dispatch(start());
      interval.current = window.setInterval(() => {
        // aca debo re-renderizar el estado local "count" con el useState hook
        // el nuevo estado de count depende del estado anterior, pasar una cb function
        setCount(prevCount => prevCount + 1);
      }, 1000);
    }
  };
  //useEffect hook para limpiar el interval cuando se detenga el timer

  useEffect(() => {
    //only return a cleanup function, which executes only when component unmounts
    //https://developer.mozilla.org/en-US/docs/Web/API/clearInterval
    return () => {
      window.clearInterval(interval.current);
    };
  }, []);
  //UPDATE THE STATE OF THE TIMER IN EACH TICK, use dateStart variable to calcule time difference (seconds)
  //diferencia en segundos entre Date.now y dateStart
  let seconds = started
    ? Math.floor((Date.now() - new Date(dateStart).getTime()) / 1000)
    : 0;
  //calcule the  hours , second first divide by 60 to get minutes and then divide by 60 to get hours
  const hours = seconds ? Math.floor(seconds / 60 / 60) : 0;
  //substract the hours from seconds to get the remaining seconds
  seconds -= hours * 60 * 60;

  //calcule the minutes
  const minutes = seconds ? Math.floor(seconds / 60) : 0;
  //substract the minutes from seconds to get the remaining seconds
  seconds -= minutes * 60;

  return (
    <div className={cx('recorder', { 'recorder-started': started })}>
      <button className="recorder-record" onClick={handleClick}>
        <span></span>
      </button>
      <div className="recorder-counter">
        {addZero(hours)}:{addZero(minutes)}:{addZero(seconds)}
      </div>
    </div>
  );
};

export default Recorder;
