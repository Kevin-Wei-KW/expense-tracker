import { useState, useEffect } from 'react'
import axios from "axios";
import './App.css'

import { GoogleLogin} from '@react-oauth/google';

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
    axios({
      method: "GET",
      url: API_URL+"/txns",
    })
    .then((response) => {
      const res = response.data
      setLoadingTxns(false)
      setTxnDataList([...res])
    })
    .catch((error) => {
      if (error.response) {
        console.log(error.response)
        console.log(error.response.status)
        console.log(error.response.headers)
      }
    })
  }

  function pushTxns(data) {
    axios.post(
      API_URL+"/txns", data
    )
    .then(() => {
      getTxns()
      getStats()
    })
    .catch((error) => {
      if (error.response) {
        console.log(error.response)
        console.log(error.response.status)
        console.log(error.response.headers)
      }
    })
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
    .catch((error) => {
      if (error.response) {
        console.log(error.response)
        console.log(error.response.status)
        console.log(error.response.headers)
      }
    })
  }

  const [t, setT] = useState("");
  function setupLogin(response) {
    const accessToken = response.credential;
    setLogin(true);
    if(accessToken != '') {
      console.log(accessToken);
    } else {
      console.log("fail");
    }
  }


  // const API_URL = "https://expense-tracker-85pc.onrender.com"
  const API_URL = "http://localhost:5000"

  useEffect(() => getTxns(), []);

  return (
    <div className="App">
      {!login && 
      <GoogleLogin
        onSuccess={(response) => setupLogin(response)}
        onError={() => setLoginError(true)}
        scope="profile email"
      />}

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
