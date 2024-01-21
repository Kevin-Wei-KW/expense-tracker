import { useState, useEffect } from 'react'
import axios from "axios";
import './App.css'

import { GoogleLogin, useGoogleLogin } from '@react-oauth/google';

import Page from "./components/Page.jsx"
import LoginPage from "./components/LoginPage.jsx"


export default function App() {
  const [txnDataList, setTxnDataList] = useState([])
  const [loadingTxns, setLoadingTxns] = useState(false)

  const [statsDict, setStatsDict] = useState({})
  const [loadingStats, setLoadingStats] = useState(false)

  const [loginMessage, setLoginMessage] = useState("Connect to Your Google Sheet")
  const [login, setLogin] = useState(false)
  const [loginError, setLoginError] = useState(false)
  const [sheetName, setSheetName] = useState()
  const [worksheetTitle, setWorksheetTitle] = useState()

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
        setLogin(false);
      } else {
        setLogin(true);
      }
    })
  }

  function setupLogin(response) {
    const authorizationCode = response.code;
    
    axios.post(
      API_URL+"/login",
      { code: authorizationCode,
        sheetName: sheetName,
        worksheetTitle: worksheetTitle },
      { headers: {'Content-Type': 'application/json'} },
    )
    .then((response) => {
      if(response.status == 200) {
        setLogin(true);
        getTxns();
      }
    })
    .catch((error) => {
      logError(error)
      setLoginMessage("Sheet not found: check name/title")
    })
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
      <LoginPage
        loginMessage={loginMessage}
        setSheetName={setSheetName}
        setWorksheetTitle={setWorksheetTitle}
        login={googleLogin}
      />
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
