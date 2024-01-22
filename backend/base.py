import json
import secrets
import requests
from dotenv import load_dotenv

import flask
from flask import Flask, request, jsonify, redirect, session
from flask_cors import CORS, cross_origin
import sys, os

from google.oauth2.credentials import Credentials


sys.path.append(os.getcwd())

api = flask.Flask(__name__)
CORS(api, supports_credentials=True)

load_dotenv()
CLIENT_ID = os.environ.get('CLIENT_ID')
CLIENT_SECRET = os.environ.get('CLIENT_SECRET')
REDIRECT_URI = os.environ.get('REDIRECT_URI')
api.secret_key = os.environ.get('SECRET_KEY')

TOKEN_ENDPOINT = 'https://oauth2.googleapis.com/token'
REFRESH_GRANT = 'refresh_token'
AUTH_GRANT = 'authorization_code'


@api.route('/status', methods=['GET'])
def auth_status():
    """
    Check whether session is authenticated
    True: authenticated
    False: requires login
    """
    if 'access_token' in session or 'refresh_token' in session:
        return "authenticated"
    else:
        return "login"

@api.route('/login', methods=['POST'])
def login():
    import crud as c
    body = request.get_json()
    auth_code = body["code"]
    sheet_name = body["sheetName"]
    worksheet_title = body["worksheetTitle"]

    token_established = establish_session(auth_code)
    scopes = ['https://spreadsheets.google.com/feeds', 'https://www.googleapis.com/auth/drive']

    if token_established:
        credentials = Credentials(
            client_id=CLIENT_ID,
            client_secret=CLIENT_SECRET,
            token_uri='https://oauth2.googleapis.com/token',
            scopes=scopes,
            token=session['access_token'],
            refresh_token=session['refresh_token']
        )
        try:
            return c.connect_client(credentials, sheet_name, worksheet_title)
        except:
            return "Connection Unsuccessful", 500
    else:
        return "Login Error", 500


@api.route('/txns', methods=['GET', 'POST'])
def txns():
    """
    Retrieve or Upload transactions
    """
    import crud as c

    if('access_token' not in session and 'refresh_token' in session):
        establish_session(session['auth_code'])

    if request.method == "GET":
        df = c.get_dataframe()

        try:
            return c.dataframe_to_json_list(df)
        except:
            raise Exception("Failed to get transactions")

    elif request.method == "POST":
        data = request.get_json()
        new_row = c.create_row(data)
        df = c.get_dataframe()

        try:
            c.push_to_spreadsheet(new_row, df)
            return new_row
        except:
            raise Exception("Failed to add new transaction")


@api.route('/stats', methods=['GET'])
def stats():
    import crud as c

    if request.method == "GET":
        df = c.get_dataframe()
        sum_filter = {
            "year": int(request.args.get("year")),
            "month": int(request.args.get("month")),
        }

        try:
            return json.dumps(c.get_all_stats(df, sum_filter))
        except:
            raise Exception("Failed to get stats")


def get_new_access_token():

    data = {
        'grant_type': REFRESH_GRANT,
        'refresh_token': session['refresh_token'],
        'client_id': CLIENT_ID,
        'client_secret': CLIENT_SECRET
    }

    response = requests.post(TOKEN_ENDPOINT, data=data)
    if response.status_code == 200:
        new_token_data = response.json()
        new_access_token = new_token_data.get('access_token')
        return new_access_token
    else:
        print(f'Error: {response.status_code}, {response.text}')


def exchange_auth_for_tokens(auth_code: str):
    """
    Exchange received authorization code for access/refresh tokens
    """
    headers = {
        'Content-Type': 'application/x-www-form-urlencoded',
    }
    payload = {
        'code': auth_code,
        'client_id': CLIENT_ID,
        'client_secret': CLIENT_SECRET,
        'redirect_uri': REDIRECT_URI,
        'grant_type': AUTH_GRANT,
    }

    response = requests.post(TOKEN_ENDPOINT, headers=headers, data=payload)

    if response.status_code == 200:
        return response.json()
    else:
        return None


def establish_session(auth_code):
    # Check if user has access token
    if 'access_token' in session:
        return True
    elif 'refresh_token' in session:
        session['access_token'] = get_new_access_token()
        return True
    elif auth_code:
        token_response = exchange_auth_for_tokens(auth_code)
        session['access_token'] = token_response['access_token']
        session['refresh_token'] = token_response['refresh_token']
        return True
    else:
        return False
