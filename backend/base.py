import json

from flask import Flask, request, jsonify
from flask_cors import CORS
import sys, os

sys.path.append(os.getcwd())

api = Flask(__name__)
CORS(api)


@api.route('/txns', methods=['GET', 'POST'])
def txns():
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
