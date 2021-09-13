import logo from './logo.svg';
import './App.css';

import { Hello } from './second-file'

function App() {
  return (
    <div className="App">
      <header className="App-header">
        <img src={logo} className="App-logo" alt="logo" />
        <Hello />
        <p>
          Hold Alt and click to open in VSCode
        </p>
      </header>
    </div >
  );
}

export default App;
