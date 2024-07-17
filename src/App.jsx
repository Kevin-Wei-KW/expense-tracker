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

  const [loginMessage, setLoginMessage] = useState("Connect to Google Sheet")
  const [login, setLogin] = useState(false)
  const [loginError, setLoginError] = useState(false)
  const [worksheetTitle, setWorksheetTitle] = useState()
  const [sheetLink, setSheetLink] = useState()

  const [accessJwt, setAccessJwt] = useState()
  const [refreshJwt, setRefreshJwt] = useState()
  const [cookies, setCookie, removeCookie] = useCookies();

  function getTxns() {
    setLoadingTxns(true)
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
      }


      setLoadingTxns(false)
      setTxnDataList([...txns])
      modifyTokens(jwts["access_token"], jwts["refresh_token"])
    })
    .catch((error) => {
      console.log(error)
      if(error.response.status === 403) {
        // Handle Access Denied, Reauthenticate
        logout()
        setLoginMessage("Access Denied: Please Check Login Info")
        // setLogin(false);
      }
      logError(error)
    })
  }

  function pushTxns(data) {
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

      modifyTokens(response.data["access_token"], response.data["refresh_token"])

      getTxns()
      getStats()
    })
    .catch((error) => logError(error))
  }

  function editTxns(row, data) {
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

      modifyTokens(response.data["access_token"], response.data["refresh_token"])

      getTxns()
      getStats()
    })
    .catch((error) => logError(error))
  }
  
  function deleteTxns(row) {
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

      modifyTokens(response.data["access_token"], response.data["refresh_token"])

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

  function cookiesLogin() {
    // use cookies tokens if possible
    if ((cookies.accessToken || cookies.refreshToken) && cookies.sheetLink && cookies.worksheetTitle) {
      modifyTokens(cookies.accessToken, cookies.refreshToken);
      setSheetLink(cookies.sheetLink)
      setWorksheetTitle(cookies.worksheetTitle)
      setLogin(true);

      if (!cookies.accessToken) {
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
      }
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

          setCookie('sheetLink', sheetLink, { path: '/', maxAge: 2592000, secure: true, sameSite: 'strict' }); // sheetlink expires in 30 days
          setCookie('worksheetTitle', worksheetTitle, { path: '/', maxAge: 2592000, secure: true, sameSite: 'strict' }); // worksheet title expires in 30 days

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

  function logout() {
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
      console.log(refresh)
      setRefreshJwt(refresh)
      setCookie('refreshToken', refresh, { path: '/', maxAge: 2592000, secure: true, sameSite: 'strict' }); // refresh token expires in 30 days
    }
  }


  const API_URL = import.meta.env.VITE_API_URL

  useEffect(() => {
    // Only call getTxns() if both accessJwt and refreshJwt are defined
    if (accessJwt !== undefined || refreshJwt !== undefined) {
      getTxns();
      getStats();
    }
  }, [refreshJwt]); // This effect will re-run whenever accessJwt or refreshJwt change

  useEffect(() => getStatus(), []);

  return (
    <div className="App">

      {!login &&
      <LoginPage
        loginMessage={loginMessage}
        setSheetLink={setSheetLink}
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
