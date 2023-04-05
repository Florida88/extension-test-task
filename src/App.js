import React, { useState, useEffect } from "react";
import CryptoJS from "crypto-js";
import "./App.css";

const App = () => {
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loggedIn, setLoggedIn] = useState(false);
  const [initialized, setInitialized] = useState(false);
  const [initPage, setInitPage] = useState(true);
  const [secret, setSecret] = useState("");
  
  useEffect(() => {
    chrome.storage.local.get(["initialized"], (result) => {
      if (result.initialized) {
        setInitialized(true);
        chrome.storage.local.get(["secret"], (result) => {
          setSecret(result.secret);
        });
      } else {
        setSecret(genSecret());
        setInitialized(false);
        setLoggedIn(false);
      }
    });
  }, []);

  const genSecret = () => {
    const len = 16;
    const symbols =
      "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
    let result = "";
    for (let i = 0; i < len; i++) {
      result += symbols.charAt(Math.floor(Math.random() * symbols.length));
    }
    if (password) {
      chrome.storage.local.set({
        secret: result,
        initialized: true,
      });
      const encryptedSecret = encryptSecret(result, password);
      localStorage.setItem("secret", encryptedSecret);
    }

    return result;
  };

  const handleSetPassword = () => {
    if (password === confirmPassword) {
      const encryptedSecret = encryptSecret(secret, password);
      chrome.storage.local.set({ secret: secret, initialized: true });
      localStorage.setItem("secret", encryptedSecret);
      setInitialized(true);
    } else {
      alert("Passwords do not match.");
    }
  };

    const decryptSecret = (encSecret, password) => {
      const byte = CryptoJS.AES.decrypt(encSecret, password);
      return byte.toString(CryptoJS.enc.Utf8);
    };

  const onSignIn = () => {
    chrome.storage.local.get(["secret"], (result) => {
      const decryptedSecret = decryptSecret(
        localStorage.getItem("secret"),
        password
      );


      if (result.secret === decryptedSecret) {
        setLoggedIn(true);
      } else {
        alert("Invalid password.");
      }
    });
  };

  const onLogout = () => {
    setLoggedIn(false);
  };

  const handleReset = () => {
    chrome.storage.local.remove(["initialized", "secret"]);
    localStorage.clear();
    setInitialized(false);
    setInitPage(true);
    setSecret(genSecret());
    setPassword("");
    setConfirmPassword("");
    setLoggedIn(false);
  };

  const encryptSecret = (secret, password) => {
    const encrypted = CryptoJS.AES.encrypt(secret, password).toString();
    return encrypted;
  };

  if (!initialized && initPage) {
    return (
      <div className="App">
        <p>{secret}</p>
        <button onClick={() => setInitPage(false)}>Next</button>
      </div>
    );
  } else if (!initialized && !initPage) {
    return (
      <div className="App">
        <h1>Extension</h1>
        <p>Set a password</p>
        <input
          type="password"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />
        <br />
        <input
          type="password"
          placeholder="Confirm Password"
          value={confirmPassword}
          onChange={(e) => setConfirmPassword(e.target.value)}
        />
        <br />
        <button onClick={handleSetPassword}>Set Password</button>
      </div>
    );
  } else if (!loggedIn) {
    return (
      <div className="App">
        <h1>Extension Login</h1>
        <p>Please enter your password:</p>
        <input
          type="password"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />
        <br />
        <button onClick={onSignIn}>Sign In</button>
        <button onClick={handleReset}>Reset Extension</button>
      </div>
    );
  } else {
    return (
      <div className="App">
        <h1>Extension</h1>
        <button onClick={onLogout}>Log Out</button>
        <button onClick={() => setSecret(genSecret())}>
          Regenerate Secret
        </button>
        <p>Secret</p>
        <p>{secret}</p>
        <br />
        <br />
      </div>
    );
  }
};

export default App;
