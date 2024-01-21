import { useState, useEffect } from 'react'
import axios from "axios";
import './App.css'

import { GoogleLogin, useGoogleLogin } from '@react-oauth/google';

import Page from "./components/Page.jsx"


export default function App() {
  const [txnDataList, setTxnDataList] = useState([])
  const [loadingTxns, setLoadingTxns] = useState(false)

  const [statsDict, setStatsDict] = useState({})
  const [loadingStats, setLoadingStats] = useState(false)

  const [login, setLogin] = useState(false)
  const [loginError, setLoginError] = useState(false)

  function getTxns() {
    setLoadingTxns(true)
    axios.get(
      API_URL+"/txns"
    )
    .then((response) => {
      const res = response.data
      setLoadingTxns(false)
      setTxnDataList([...res])
    })
    .catch((error) => logError(error))
  }

  function pushTxns(data) {
    axios.post(
      API_URL+"/txns", data
    )
    .then(() => {
      getTxns()
      getStats()
    })
    .catch((error) => logError(error))
  }

  function getStats(data = {"year": 2023, "month": 0}) {
    setLoadingStats(true)
    axios.get(
      API_URL+"/stats", { params: {
        year: data["year"],
        month: data["month"],
      }}
    )
    .then((response) => {
      const res = response.data
      setLoadingStats(false)
      setStatsDict(res)
    })
    .catch((error) => logError(error))
  }

  function getStatus() {
    axios.get(
      API_URL+"/status"
    )
    .then((response) => {
      const res = response.data
      if(res == "login") {
        googleLogin()
        setLogin(false);
      } else {
        googleLogin();
      }
    })
  }

  function setupLogin(response) {
    const authorizationCode = response.code;
    setLogin(true);
    
    axios.post(
      API_URL+"/login",
      { code: authorizationCode },
      { headers: {'Content-Type': 'application/json'} },
    )
    .then(() => {
      setLogin(true);
      getTxns();
    })
    .catch((error) => logError(error))
  }

  const googleLogin = useGoogleLogin({
    onSuccess: (codeResponse) => {
      setupLogin(codeResponse);
    },
    onError: ()=> {
      console.log("error");
    },
    flow: 'auth-code',
    scope: "https://www.googleapis.com/auth/spreadsheets https://www.googleapis.com/auth/spreadsheets.readonly https://www.googleapis.com/auth/drive.readonly"
  })

  function logError(error) {
    if (error.response) {
      console.log(error.response)
      console.log(error.response.status)
      console.log(error.response.headers)
    }
  }


  // const API_URL = "https://expense-tracker-85pc.onrender.com"
  const API_URL = "http://localhost:5000"

  useEffect(() => getStatus(), []);

  return (
    <div className="App">
      {/* {!login && 
      <GoogleLogin
        onSuccess={(credentialResponse) => setupLogin(credentialResponse)}
        onError={() => setLoginError(true)}
        useOneTap
        flow="auth-code"
      />} */}

      {!login &&
      <button onClick={() => googleLogin()}>
        Sign in with Google
      </button>
      }

      {login && 
      <Page
        txns={txnDataList}
        stats={statsDict}
        getTxns={getTxns}
        getStats={getStats}
        pushTxns={pushTxns} 
        loadingStats={loadingStats} 
        loadingTxns={loadingTxns}
      />}

      {!login && loginError &&
      <div>
        ERROR! Try logging in again.
      </div>
      }

      {/* <Page
        txns={txnDataList}
        stats={statsDict}
        getTxns={getTxns}
        getStats={getStats}
        pushTxns={pushTxns} 
        loadingStats={loadingStats} 
        loadingTxns={loadingTxns}
      /> */}
    </div>
  );
}
