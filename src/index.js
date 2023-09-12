import React from 'react';
import ReactDOM from 'react-dom';
import './index.css';

class ReacTeaTimer extends React.Component {
  componentDidMount() {
    document.title = 'ReacTeaTimer';
  }

  render() {
    return (
      <div className='outer_frame'>
        <div className='display_frame'>
          <div className='timer_display'>{this.state.time}</div>
        </div>

        <div className='key_panel'>
          <div className='min_sec'>
            <button className='lean_button' onClick={() => this.incMins()}>
              Min
            </button>
            <button className='lean_button' onClick={() => this.incSecs()}>
              Sec
            </button>
          </div>

          <button className='wide_button' onClick={() => this.startStopTimer()}>
            Start/Stop
          </button>
          <button className='wide_button' onClick={() => this.reset()}>
            Reset
          </button>
        </div>
      </div>
    );
  }

  constructor(props) {
    super(props);
    this.state = {
      time: '05:00',
      lastTime: '05:00',
      timerRunning: 0,
      alarmRunning: 0,
    };
    this.ac = new AudioContext();
  }

  parseTime() {
    const [minStr, secsStr] = this.state.time.split(':');
    const mins = parseInt(minStr, 10);
    const secs = parseInt(secsStr, 10);
    return [mins, secs];
  }

  incMins() {
    let [mins, secs] = this.parseTime();
    mins += 1;
    const time = this.padZeros(mins) + ':' + this.padZeros(secs);
    this.setState({ time: time, lastTime: time });
  }

  incSecs() {
    let [mins, secs] = this.parseTime();
    secs = (secs + 1) % 60;
    const time = this.padZeros(mins) + ':' + this.padZeros(secs);
    this.setState({ time: time, lastTime: time });
  }

  reset() {
    this.setState({ time: '00:00', lastTime: '00:00', timer: 0 });
    if (this.state.timerRunning === 1) {
      this.setState({ timerRunning: 0 });
      clearInterval(this.state.timer);
    }
  }

  decTimer() {
    let [mins, secs] = this.parseTime();
    if (secs > 0) {
      secs -= 1;
    } else if (secs === 0) {
      if (mins > 0) {
        secs = 59;
        mins -= 1;
      } else {
        this.stopTimer();
        this.beepOneMinute();
      }
    }
    const time = this.padZeros(mins) + ':' + this.padZeros(secs);
    this.setState({ time: time });
  }

  startTimer() {
    this.setState({ timerRunning: 1 });
    this.setState({ timer: setInterval(this.decTimer.bind(this), 1000) });
  }

  stopTimer() {
    clearInterval(this.state.timer);
    this.setState({ timerRunning: 0 });
  }

  startStopTimer() {
    if (this.state.alarmRunning) {
      this.setState({ alarmRunning: 0, time: this.state.lastTime });
    } else if (this.state.timerRunning === 0) {
      this.startTimer();
    } else {
      this.stopTimer();
    }
  }

  padZeros(number) {
    let result = String(number);
    result = result.padStart(2, '0');
    return result;
  }

  beepOneMinute() {
    function beep() {
      let v = this.ac.createOscillator();
      let u = this.ac.createGain();
      v.connect(u);
      v.frequency.value = 1760;
      v.type = 'square';
      u.connect(this.ac.destination);
      u.gain.value = 0.5;
      v.start(this.ac.currentTime);
      v.stop(this.ac.currentTime + 0.2);
    }

    let interval;
    let startTime = new Date().getTime();
    this.setState({ alarmRunning: 1 });
    function beepBody() {
      beep.bind(this)();
      let currTime = new Date().getTime();

      if (currTime - startTime > 60000 || this.state.alarmRunning === 0) {
        clearInterval(interval);
      }
    }
    interval = setInterval(beepBody.bind(this), 400);
  }
}

ReactDOM.render(<ReacTeaTimer />, document.getElementById('root'));
