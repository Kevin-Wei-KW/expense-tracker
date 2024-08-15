import { useState, useEffect } from 'react'
import axios from "axios";
import './App.css'
import { CookiesProvider, useCookies } from 'react-cookie'
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';

import { GoogleLogin, useGoogleLogin } from '@react-oauth/google';

import Page from "./components/Page.jsx"
import LoginPage from "./components/LoginPage.jsx"
import HomePage from "./components/HomePage.jsx"


export default function App() {
  const [txnDataList, setTxnDataList] = useState([])
  const [loadingTxns, setLoadingTxns] = useState(false)

  const [statsDict, setStatsDict] = useState({})
  const [loadingStats, setLoadingStats] = useState(false)

  const [home, setHome] = useState(true)

  const [loginMessage, setLoginMessage] = useState("Connect to Google Sheets")
  const [login, setLogin] = useState(false)
  const [loginError, setLoginError] = useState(false)
  const [worksheetTitle, setWorksheetTitle] = useState()
  const [sheetLink, setSheetLink] = useState()
  const [overwriteConfirm, setOverwriteConfirm] = useState(false)

  const [accessJwt, setAccessJwt] = useState()
  const [refreshJwt, setRefreshJwt] = useState()
  const [cookies, setCookie, removeCookie] = useCookies();

  function getTxns() {
    setLoadingTxns(true);
    setLogin(true);
    axios.get(
      API_URL+"/txns",
      { params: {
        sheetLink: sheetLink,
        worksheetTitle: worksheetTitle,
        accessJwt: accessJwt,
        refreshJwt: refreshJwt,
      }
      },
    )
    .then((response) => {
      const txns = response.data["txns"]
      const jwts = response.data["jwts"]
      const status = response.data["jwts"][1]
      
      if (status !== 200) {
        logout();
        return
      }

      if (txns === "Overwrite") {
        setOverwriteConfirm(true)
        setLogin(false);
      } else {
        setLoadingTxns(false)
        setTxnDataList([...txns])
        setLogin(true);

        getStats()
      }

      modifyTokens(jwts["access_token"], jwts["refresh_token"])
    })
    .catch((error) => {
      if(error.response.status === 403 || error.response.status === 500) {
        // Handle Access Denied, Reauthenticate
        logout()
        setLoginMessage("Access Denied: Please Check Login Info")
        // setLogin(false);
      }
      logError(error)
    })
  }

  function pushTxns(data) {
    setLoadingTxns(true)
    axios.post(
      API_URL+"/txns", {
        txn: data,
      },
      { params: {
          sheetLink: sheetLink,
          worksheetTitle: worksheetTitle,
          accessJwt: accessJwt,
          refreshJwt: refreshJwt
        }
      }
    )
    .then((response) => {
      const txns = response.data["txns"]
      const jwts = response.data["jwts"]
      const status = response.data["jwts"][1]
      
      if (status !== 200) {
        logout();
        return
      }

      setLoadingTxns(false)
      setTxnDataList([...txns])
      modifyTokens(jwts["access_token"], jwts["refresh_token"])

      getStats()
    })
    .catch((error) => logError(error))
  }

  function editTxns(row, data) {
    setLoadingTxns(true)
    axios.put(
      API_URL+"/txns", {
        rowNum: row,
        txn: data,
      },
      { params: {
        sheetLink: sheetLink,
        worksheetTitle: worksheetTitle,
        accessJwt: accessJwt,
        refreshJwt: refreshJwt
        }
      }
    )
    .then((response) => {
      const txns = response.data["txns"]
      const jwts = response.data["jwts"]
      const status = response.data["jwts"][1]
      
      if (status !== 200) {
        logout();
        return
      }

      setLoadingTxns(false)
      setTxnDataList([...txns])
      modifyTokens(jwts["access_token"], jwts["refresh_token"])

      getStats()
    })
    .catch((error) => logError(error))
  }
  
  function deleteTxns(row) {
    setLoadingTxns(true)
    axios.delete(
      API_URL+"/txns",
      { data: {
          rowNum: row,
        }, 
        params: {
        sheetLink: sheetLink,
        worksheetTitle: worksheetTitle,
        accessJwt: accessJwt,
        refreshJwt: refreshJwt
        }
      }
    )
    .then((response) => {
      const txns = response.data["txns"]
      const jwts = response.data["jwts"]
      const status = response.data["jwts"][1]
      
      if (status !== 200) {
        logout();
        return
      }

      setLoadingTxns(false)
      setTxnDataList([...txns])
      modifyTokens(jwts["access_token"], jwts["refresh_token"])

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
        sheetLink: sheetLink,
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
      modifyTokens(jwts["access_token"], jwts["refresh_token"])
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
        logout();
      } else {
        setLogin(true);
      }
    })
  }

  function overwriteSheet(confirmed) {
    setOverwriteConfirm(false);
    if(!confirmed) {
      setLogin(false);
      return
    }
    setLogin(true);
    axios.put(
      API_URL+"/overwrite",
      { params: {
        sheetLink: sheetLink,
        worksheetTitle: worksheetTitle,
        accessJwt: accessJwt,
        refreshJwt: refreshJwt,
      }}
    )
    .then((response) => {
      getTxns();
      // getStats();
    })
    .catch((error) => {
        logout()
        setLoginMessage("Access Denied: Please Check Login Info")
        setOverwriteConfirm(false);
        logError(error)
    })
  }

  function cookiesLogin() {
    // use cookies tokens if possible
    if ((cookies.accessToken || cookies.refreshToken) && cookies.sheetLink && cookies.worksheetTitle) {
      modifyTokens(cookies.accessToken, cookies.refreshToken);
      setSheetLink(cookies.sheetLink)
      setWorksheetTitle(cookies.worksheetTitle)

      axios.get(
        API_URL+"/new_access",
        { params: {
          sheetLink: cookies.sheetLink,
          worksheetTitle: cookies.worksheetTitle,
          refreshJwt: cookies.refreshToken,
        }}
      )
      .then((response) => {
        modifyTokens(response.data["access_token"], cookies.refreshToken)
      })
      .catch((error) => {
        logError(error)
      })
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

          modifyTokens(response.data["access_token"], response.data["refresh_token"])

          setCookie('sheetLink', sheetLink, { path: '/', maxAge: 2592000, secure: true, sameSite: 'strict' }); // sheetlink expires in 30 days
          setCookie('worksheetTitle', worksheetTitle, { path: '/', maxAge: 2592000, secure: true, sameSite: 'strict' }); // worksheet title expires in 30 days

          // setLogin(true);
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

  async function logout() {
    removeCookie('sheetLink', { path: '/' });
    removeCookie('worksheetTitle', { path: '/' });
    removeCookie('accessToken', { path: '/' });
    removeCookie('refreshToken', { path: '/' });

    setAccessJwt(null)
    setRefreshJwt(null)

    setTxnDataList([])
    setLoadingTxns(false)
    setStatsDict({})
    setLoadingStats(false)

    setOverwriteConfirm(false);

    setLogin(false)
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
    scope: "https://www.googleapis.com/auth/spreadsheets https://www.googleapis.com/auth/drive.file"
  })

  function logError(error) {
    if (error.response) {
      console.log(error.response.status)
    }
    
  }

  // only modify tokens when changed
  function modifyTokens(access, refresh) {
    if (access && access != accessJwt) {
      setAccessJwt(access)
      setCookie('accessToken', access, { path: '/', maxAge: 3600, secure: true, sameSite: 'strict' }); // access token expires in 1 hour
    }
    if (refresh && refresh != refreshJwt) {
      setRefreshJwt(refresh)
      setCookie('refreshToken', refresh, { path: '/', maxAge: 2592000, secure: true, sameSite: 'strict' }); // refresh token expires in 30 days
    }
  }


  const API_URL = import.meta.env.VITE_API_URL

  useEffect(() => {
    // Only call getTxns() if either accessJwt and refreshJwt are defined
    if (accessJwt !== undefined || refreshJwt !== undefined) {
      getTxns();
    }
  }, [refreshJwt]); // This effect will re-run whenever refreshJwt change

  useEffect(() => getStatus(), []);

  return (
    <div className="App">
      {home && 
      <HomePage
        setHome={setHome}
      />
      }

      {!login && !home &&
      <LoginPage
        setHome={setHome}
        loginMessage={loginMessage}
        overwriteConfirm={overwriteConfirm}
        overwriteSheet={overwriteSheet}
        setSheetLink={setSheetLink}
        setWorksheetTitle={setWorksheetTitle}
        login={googleLogin}
      />
      }

      {login && !home &&
      <Page
        txns={txnDataList}
        stats={statsDict}
        getTxns={getTxns}
        getStats={getStats}
        pushTxns={pushTxns}
        editTxns={editTxns}
        deleteTxns={deleteTxns}
        loadingStats={loadingStats} 
        loadingTxns={loadingTxns}
        logout={logout}
      />}

      {!login && loginError &&
      <div>
        ERROR! Try logging in again.
      </div>
      }
    </div>
  );
}
