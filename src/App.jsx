import { useState, useEffect } from 'react'
import axios from "axios";
import './App.css'
import { CookiesProvider, useCookies } from 'react-cookie'

import { GoogleLogin, useGoogleLogin } from '@react-oauth/google';

import Page from "./components/Page.jsx"
import LoginPage from "./components/LoginPage.jsx"


export default function App() {
  const [txnDataList, setTxnDataList] = useState([])
  const [loadingTxns, setLoadingTxns] = useState(false)

  const [statsDict, setStatsDict] = useState({})
  const [loadingStats, setLoadingStats] = useState(false)

  const [loginMessage, setLoginMessage] = useState("Connect to Google Drive")
  const [login, setLogin] = useState(false)
  const [loginError, setLoginError] = useState(false)
  const [sheetName, setSheetName] = useState()
  const [worksheetTitle, setWorksheetTitle] = useState()

  const [accessJwt, setAccessJwt] = useState()
  const [refreshJwt, setRefreshJwt] = useState()
  const [cookies, setCookie, removeCookie] = useCookies(['jwtToken']);

  function getTxns() {
    setLoadingTxns(true)
    axios.get(
      API_URL+"/txns",
      { params: {
        sheetName: sheetName,
        worksheetTitle: worksheetTitle,
        accessJwt: accessJwt,
        refreshJwt: refreshJwt,
      }
      },
    )
    .then((response) => {
      const txns = response.data["txns"]
      const jwts = response.data["jwts"]

      // setAccessJwt(jwts["access_token"])
      // setRefreshJwt(jwts["refresh_token"])
      // modifyTokens(jwts["access_token"], jwts["refresh_token"])


      setLoadingTxns(false)
      setTxnDataList([...txns])
    })
    .catch((error) => logError(error))
  }

  function pushTxns(data) {
    axios.post(
      API_URL+"/txns", {
        txn: data,
      },
      { params: {
          sheetName: sheetName,
          worksheetTitle: worksheetTitle,
          accessJwt: accessJwt,
          refreshJwt: refreshJwt
        }
      }
    )
    .then(() => {
      getTxns()
      getStats()
    })
    .catch((error) => logError(error))
  }

  function getStats(data = {"year": new Date().getFullYear(), "month": 0}) {
    setLoadingStats(true)
    axios.get(
      API_URL+"/stats",
      { params: {
        year: data["year"],
        month: data["month"],
        sheetName: sheetName,
        worksheetTitle: worksheetTitle,
        accessJwt: accessJwt,
        refreshJwt: refreshJwt,
      }}
    )
    .then((response) => {
      const stats = JSON.parse(response.data["stats"])
      const jwts = response.data["jwts"]

      setLoadingStats(false)
      setStatsDict(stats)
    })
    .catch((error) => logError(error))
  }

  function getStatus() {
    if(cookiesLogin()) {
      return
    }

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

  function cookiesLogin() {
    // use cookies tokens if possible
    if (cookies.accessToken && cookies.refreshToken) {
      modifyTokens(cookies.accessToken, cookies.refreshToken);
      setLogin(true);
      return true
    }

    return false
  }

  // sets up login process once google logged in
  function setupLogin(response) {
    const authorizationCode = response.code;
    
    axios.get(
      API_URL+"/login",
      { params: {code: authorizationCode}
      },
    )
    .then((response) => {
      if(response.status == 200) {

        const accessToken = response.data["access_token"]
        const refreshToken = response.data["refresh_token"]

        if(accessToken && refreshToken) {
          // setAccessJwt(response.data["access_token"]);
          // setRefreshJwt(response.data["refresh_token"]);
          modifyTokens(response.data["access_token"], response.data["refresh_token"])

          // getTxns();
          setLogin(true);
        } else {
          console.log("Missing Access/Refresh Tokens")
        }
        
      }
    })
    .catch((error) => {
      logError(error)
      setLoginMessage("Sheet not found: check name/title")
    })
  }


  // initiate login with google api
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
    } else {
      console.log(error)
    }
  }

  // only modify tokens when changed
  function modifyTokens(access, refresh) {
    if (access != accessJwt) {
      setAccessJwt(access)
      setCookie('accessToken', access, { path: '/', maxAge: 3600 }); // access token expires in 1 hour
    }
    if (refresh != refreshJwt) {
      setRefreshJwt(refresh)
      setCookie('refreshToken', refresh, { path: '/', maxAge: 2592000 }); // refresh token expires in 30 days
    }
  }


  const API_URL = import.meta.env.VITE_API_URL

  useEffect(() => {
    // Only call getTxns() if both accessJwt and refreshJwt are defined
    if (accessJwt !== undefined && refreshJwt !== undefined) {
      getTxns();
      getStats();
    }
  }, [accessJwt, refreshJwt]); // This effect will re-run whenever accessJwt or refreshJwt change

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
