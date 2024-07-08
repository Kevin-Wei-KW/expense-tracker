import json
import secrets
from datetime import timedelta, datetime

import requests
from dotenv import load_dotenv

import flask
from flask import Flask, request, jsonify, redirect, session
from flask_cors import CORS
import sys, os
import jwt

from google.oauth2.credentials import Credentials


sys.path.append(os.getcwd())

api = flask.Flask(__name__)
api.permanent_session_lifetime = timedelta(days=7)
api.config['SESSION_COOKIE_SAMESITE'] = 'Strict'

load_dotenv()
CLIENT_ID = os.environ.get('CLIENT_ID')
CLIENT_SECRET = os.environ.get('CLIENT_SECRET')
REDIRECT_URI = os.environ.get('REDIRECT_URI')
api.secret_key = os.environ.get('SECRET_KEY')
FRONTEND = os.environ.get('FRONTEND')

CORS(api, supports_credentials=True, resources={r"/*": {"origins": FRONTEND}})


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


def generate_jwt(value, token_type="access_token"):
    """
    generates jwt for tokens
    """
    expiration = datetime.utcnow()
    if token_type == "access_token":
        expiration += timedelta(minutes=60)
    else:
        expiration += timedelta(days=30)

    payload = {
        token_type: value,
        "exp": expiration
    }
    jwt_token = jwt.encode(payload, api.secret_key, algorithm="HS256")
    return jwt_token


def decode_jwt(token_jwt, token_type="access_token"):
    """
    decodes jwt into token
    """
    try:
        result = jwt.decode(token_jwt, api.secret_key, algorithms=["HS256"])
        return result[token_type]
    except jwt.exceptions.InvalidTokenError as e:
        return None
    except Exception as e:
        return None


@api.route('/login', methods=['GET'])
def login():

    auth_code = request.args.get("code")

    try:
        tokens = exchange_auth_for_tokens(auth_code)
        return {
            "access_token": generate_jwt(tokens["access_token"], "access_token"),
            "refresh_token": generate_jwt(tokens["refresh_token"], "refresh_token")
        }
    except Exception:
        return "Login Authentication Failed"


@api.route('/new_access', methods=['GET'])
def new_access():
    sheet_link = request.args.get("sheetLink")
    worksheet_title = request.args.get("worksheetTitle")
    refresh_token = decode_jwt(request.args.get("refreshJwt"), "refresh_token")

    response = establish_access(sheet_link, worksheet_title, "", refresh_token)

    return response


def establish_access(sheet_link, worksheet_title, access_token, refresh_token):
    import crud as c

    scopes = ["https://www.googleapis.com/auth/spreadsheets", "https://www.googleapis.com/auth/drive.file", 'https://spreadsheets.google.com/feeds']

    # token_valid = verify_access(access_token)
    verified_access_token = access_token
    if not access_token or not verify_access(access_token):
        try:
            verified_access_token = get_new_access_token(refresh_token)
        except Exception:
            return "Reauthenticate", 403

    credentials = Credentials(
        client_id=CLIENT_ID,
        client_secret=CLIENT_SECRET,
        token_uri='https://oauth2.googleapis.com/token',
        scopes=scopes,
        token=verified_access_token,
        refresh_token=refresh_token
    )

    try:
        c.connect_client(credentials, sheet_link, worksheet_title)
        return {
            "access_token": generate_jwt(verified_access_token, "access_token"),
            "refresh_token": generate_jwt(refresh_token, "refresh_token")
        }, 200
    except Exception:
        return "Connection Unsuccessful", 403


@api.route('/txns', methods=['GET', 'POST'])
def txns():
    """
    Retrieve or Upload transactions
    """
    import crud as c

    sheet_link = request.args.get("sheetLink")
    worksheet_title = request.args.get("worksheetTitle")
    access_token = decode_jwt(request.args.get("accessJwt"), "access_token")
    refresh_token = decode_jwt(request.args.get("refreshJwt"), "refresh_token")

    try:
        response = establish_access(sheet_link, worksheet_title, access_token, refresh_token)

        if request.method == "GET":
            df = c.get_dataframe()

            try:
                return {
                    "txns": c.dataframe_to_json_list(df),
                    "jwts": response
                }
            except:
                raise Exception("Failed to get transactions")

        elif request.method == "POST":
            data = request.json.get("txn")
            new_row = c.create_row(data)
            df = c.get_dataframe()

            try:
                c.push_to_spreadsheet(new_row, df)
                return response
            except Exception:
                raise Exception("Failed to add new transaction")

    except Exception:
        return "Reauthenticate (txn)", 403


@api.route('/stats', methods=['GET'])
def stats():
    """
    Retrieve transactions stats
    """
    import crud as c

    sheet_link = request.args.get("sheetLink")
    worksheet_title = request.args.get("worksheetTitle")
    access_token = decode_jwt(request.args.get("accessJwt"), "access_token")
    refresh_token = decode_jwt(request.args.get("refreshJwt"), "refresh_token")

    try:
        response = establish_access(sheet_link, worksheet_title, access_token, refresh_token)
        if request.method == "GET":
            df = c.get_dataframe()

            sum_filter = {
                "year": int(request.args.get("year")),
                "month": int(request.args.get("month")),
            }

            try:
                return {
                    "stats": json.dumps(c.get_all_stats(df, sum_filter)),
                    "jwts": response
                }
            except:
                raise Exception("Failed to get stats")

    except Exception:
        return "Reauthenticate (stats)"


def get_new_access_token(refresh_token):

    data = {
        'grant_type': REFRESH_GRANT,
        'refresh_token': refresh_token,
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


def verify_access(access_token):
    """
    Verify whether access_token is valid
    """
    verification_url = 'https://www.googleapis.com/oauth2/v3/tokeninfo'
    if requests.get(verification_url, params={'access_token': access_token}).status_code == 200:
        return True
    else:
        return False
