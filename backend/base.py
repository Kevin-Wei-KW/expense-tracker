import json
import flask
import requests
from dotenv import load_dotenv

import google_auth_oauthlib
import google.oauth2.credentials
import googleapiclient
from google_auth_oauthlib.flow import Flow, InstalledAppFlow

from flask import Flask, request, jsonify, redirect, session
from flask_cors import CORS, cross_origin
import sys, os

sys.path.append(os.getcwd())

api = flask.Flask(__name__)
CORS(api)

load_dotenv()
CLIENT_ID = os.environ.get('CLIENT_ID')
CLIENT_SECRET = os.environ.get('CLIENT_SECRET')
REDIRECT_URI = os.environ.get('REDIRECT_URI')

TOKEN_ENDPOINT = 'https://oauth2.googleapis.com/token'
REFRESH_GRANT = 'refresh_token'
AUTH_GRANT = 'authorization_code'


def get_new_access_token():
    # with open('api_client_secret.json', 'r') as file:
    #     secret_obj = json.load(file)["web"]
    #     client_id = secret_obj.get('client_id', None)
    #     client_secret = secret_obj.get('client_secret', None)

    data = {
        'grant_type': REFRESH_GRANT,
        'refresh_token': "1//051qbj3FsXLqfCgYIARAAGAUSNwF-L9IribW0hbriLVOGw3UVcNSIPcGqKKiwxY4j3ivroJTuxdkXZKaqdeU9fzUBs18wrUMFlR4",
        'client_id': CLIENT_ID,
        'client_secret': CLIENT_SECRET
    }

    response = requests.post(TOKEN_ENDPOINT, data=data)
    if response.status_code == 200:
        new_token_data = response.json()
        new_access_token = new_token_data.get('access_token')
        print(f'New Access Token: {new_access_token}')
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
    tokens = response.json()
    return tokens


@api.route('/login', methods=['POST'])
def login():
    import crud as c
    auth_code = request.get_json()["code"]

    print(exchange_auth_for_tokens(auth_code))

    try:
        # get_new_access_token()
        c.connect_client()

        return " "
    except Exception as error:
        print('Token exchange error:', error)
        return jsonify({'error': 'Internal Server Error'}), 500

    return "done"


@api.route('/txns', methods=['GET', 'POST'])
def txns():
    """
    Retrieve or Upload transactions
    """
    import crud as c

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








# @api.route('/login', methods=['POST'])
# def login():
#     auth_code = request.get_json()["code"]
#
#     with open('api_client_secret.json', 'r') as file:
#         secret_obj = json.load(file)["web"]
#         client_id = secret_obj.get('client_id', None)
#         client_secret = secret_obj.get('client_secret', None)
#         redirect_uri = secret_obj.get('redirect_uri', None)
#
#     print(client_id)
#     print(client_secret)
#     flow = Flow.from_client_config(
#         client_config={"web": {'client_id': client_id, 'client_secret': client_secret, "redirect_uris": ["http://localhost:5173/"]}},
#         scopes=['openid', 'https://spreadsheets.google.com/feeds', 'https://www.googleapis.com/auth/drive'],
#     )
#
#     authorization_url, _ = flow.authorization_url(prompt='consent')
#     print(authorization_url)
#     authorization_response = input('Enter')
#
#     flow.fetch_token(authorization_response=authorization_response)
#
#     # flow.fetch_token(code=auth_code)
#     access_token = flow.credentials.token
#     refresh_token = flow.credentials.refresh_token
#
#     print(access_token)
#     print(refresh_token)
#
#     return "done"

# @api.route('/login', methods=['POST'])
# def login():
#     """
#     Login to client google account and connect to Google Sheet API
#     """
#     import crud as c
#
#     # Get token
#     auth_code = request.get_json()["code"]
#
#     token_url = 'https://accounts.google.com/o/oauth2/token'
#     token_data = {
#         'code': auth_code,
#         'client_id': 'YOUR_GOOGLE_CLIENT_ID',
#         'client_secret': 'YOUR_GOOGLE_CLIENT_SECRET',
#         'redirect_uri': 'YOUR_REDIRECT_URI',
#         'grant_type': 'authorization_code',
#     }
#
#     with open('api_client_secret.json', 'r') as file:
#         key = json.load(file)["web"].get('client_secret', None)
#         print(key)
#
#     return ""




# # @api.after_request
# # def after_request(response):
# #   response.headers.add('Access-Control-Allow-Origin', '*')
# #   response.headers.add('Access-Control-Allow-Headers', 'Content-Type,Authorization')
# #   response.headers.add('Access-Control-Allow-Methods', 'GET,PUT,POST,DELETE,OPTIONS')
# #   return response
#
#
# # with open('api_client_secret.json', 'r') as file:
# #     api.secret_key = json.load(file).get('client_secret', None)
#
# api.secret_key = "test random string REPLACE later"
#
#
# @api.route('/login', methods=['POST'])
# @cross_origin(supports_credentials=True)
# def login():
#     """
#     Login to client google account and connect to Google Sheet API
#     """
#     import crud as c
#
#     # Get token
#     auth_code = request.get_json()["code"]
#
#     print("here")
#     if 'credentials' not in flask.session:
#         return flask.redirect('authorize')
#
#     # Load credentials from the session.
#     credentials = google.oauth2.credentials.Credentials(
#         **flask.session['credentials'])
#
#     drive = googleapiclient.discovery.build(
#         'drive', 'v2', credentials=credentials)
#
#     files = drive.files().list().execute()
#
#     # Save credentials back to session in case access token was refreshed.
#     # ACTION ITEM: In a production app, you likely want to save these
#     #              credentials in a persistent database instead.
#     flask.session['credentials'] = credentials_to_dict(credentials)
#
#     return flask.jsonify(**files)
#
#     # state = flask.session['state']
#     # flow = google_auth_oauthlib.flow.Flow.from_client_secrets_file(
#     #     'api_client_secret.json',
#     #     scopes=['https://spreadsheets.google.com/feeds', 'https://www.googleapis.com/auth/drive'],
#     #     state=state
#     # )
#     # flow.redirect_uri = flask.url_for('oauth2callback', _external=True)
#     #
#     # authorization_response = flask.request.url
#     # flow.fetch_token(code=auth_code)
#     #
#     # credentials = flow.credentials
#     # flask.session['credentials'] = {
#     #     'token': credentials.token,
#     #     'refresh_token': credentials.refresh_token,
#     #     'token_uri': credentials.token_uri,
#     #     'client_id': credentials.client_id,
#     #     'client_secret': credentials.client_secret,
#     #     'scopes': credentials.scopes
#     # }
#     # print(flask.session['credentials'])
#
#     if request.method == 'POST':
#         try:
#             return c.connect_client(auth_code)
#         except:
#             raise Exception("Failed to connect client")
#
#
# @api.route('/authorize', methods=['GET'])
# def authorize():
#     import crud as c
#
#     # Create flow instance to manage the OAuth 2.0 Authorization Grant Flow steps.
#     flow = google_auth_oauthlib.flow.Flow.from_client_secrets_file(
#         'api_client_secret.json', scopes=c.scopes)
#
#     # The URI created here must exactly match one of the authorized redirect URIs
#     # for the OAuth 2.0 client, which you configured in the API Console. If this
#     # value doesn't match an authorized URI, you will get a 'redirect_uri_mismatch'
#     # error.
#     flow.redirect_uri = flask.url_for('oauth2callback', _external=True)
#
#     authorization_url, state = flow.authorization_url(
#         # Enable offline access so that you can refresh an access token without
#         # re-prompting the user for permission. Recommended for web server apps.
#         access_type='offline',
#         # Enable incremental authorization. Recommended as a best practice.
#         include_granted_scopes='true')
#
#     # Store the state so the callback can verify the auth server response.
#     flask.session['state'] = state
#
#     return flask.redirect(authorization_url)
#
#
# @api.route('/oauth2callback', methods=['GET'])
# def oauth2callback():
#     import crud as c
#     # Specify the state when creating the flow in the callback so that it can
#     # verified in the authorization server response.
#     state = flask.session['state']
#
#     flow = google_auth_oauthlib.flow.Flow.from_client_secrets_file(
#       'api_client_secret.json', scopes=c.scopes, state=state)
#     flow.redirect_uri = flask.url_for('oauth2callback', _external=True)
#
#     # Use the authorization server's response to fetch the OAuth 2.0 tokens.
#     authorization_response = flask.request.url
#     flow.fetch_token(authorization_response=authorization_response)
#
#     # Store credentials in the session.
#     # ACTION ITEM: In a production app, you likely want to save these
#     #              credentials in a persistent database instead.
#     credentials = flow.credentials
#     flask.session['credentials'] = credentials_to_dict(credentials)
#
#     return flask.redirect(flask.url_for('test_api_request'))
#
#
# def credentials_to_dict(credentials):
#   return {'token': credentials.token,
#           'refresh_token': credentials.refresh_token,
#           'token_uri': credentials.token_uri,
#           'client_id': credentials.client_id,
#           'client_secret': credentials.client_secret,
#           'scopes': credentials.scopes}
