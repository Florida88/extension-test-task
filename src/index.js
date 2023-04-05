import React from 'react';
import ReactDOM from 'react-dom';
import App from './App';

chrome.tabs.query({ active: true, currentWindow: true }, function(tabs) {
  ReactDOM.render(<App />, document.getElementById('root'));
});
