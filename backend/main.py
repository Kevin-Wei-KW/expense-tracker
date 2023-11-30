import pandas as pd
import gspread
from oauth2client.service_account import ServiceAccountCredentials

import crud as crud

import datetime

scope = ['https://spreadsheets.google.com/feeds', 'https://www.googleapis.com/auth/drive']

creds = ServiceAccountCredentials.from_json_keyfile_name('expensetracker.json', scope)

client = gspread.authorize(creds)

sheet = client.open('ExpenseTracker Test').worksheet("Sheet2")

# create dataframe
df = pd.DataFrame(sheet.get_all_values())
df.columns = df.iloc[0]
df = df.drop(df.index[0])
#
# print(df.iloc[0]["Date"])
# print(df.iloc[1])
#
# data dict
model_dict: crud.txn_dict_format = {
    "date": datetime.datetime.now(),
    "txn": "",
    "desc": "",
    "dr": 0,
    "cr": 0,
}

model_dict_test: crud.txn_dict_format = {
    "date": datetime.datetime.now(),
    "txn": "food",
    "desc": "details",
    "dr": 0,
    "cr": 100.11,
}

def get_model() -> crud.txn_dict_format:
    return model_dict_test


def dataframe_to_json_list() -> list[crud.txn_dict_format]:
    dict_list = []
    for i, row in df.iterrows():
        new_dict = {
            "date": row["Date"],
            "txn": row["Transaction"],
            "desc": row["Description"],
            "dr": row["Dr"],
            "cr": row["Cr"],
        }

        dict_list.insert(0, new_dict)

    return dict_list

# # construct new row
# new_row = crud.create_row(model_dict)

# insert new row
# df.loc[len(df)+1] = new_row
# set_with_dataframe(sheet, df)

# add row at bottom
# sheet.append_row(new_row)

# get column sum
# crud.get_column_sum(df, "Cr", "")

if __name__ == "__main__":
    print("Hello World")

# scope = ['https://spreadsheets.google.com/feeds', 'https://www.googleapis.com/auth/drive']
#
# creds = ServiceAccountCredentials.from_json_keyfile_name('expensetracker.json', scope)
#
# client = gspread.authorize(creds)
#
# sheet = client.open('ExpenseTracker Test').worksheet("Sheet2")
#
# # create dataframe
# df = pd.DataFrame(sheet.get_all_values())
# df.columns = df.iloc[0]
# df = df.drop(df.index[0])
#
# # data dict
# test_dict: crud.txn_dict_format = {
#     "date": datetime.datetime.now(),
#     "txn": "Food",
#     "desc": "Ramen",
#     "dr": 0,
#     "cr": 20,
# }
# print(test_dict)

# construct new row
# new_row = crud.create_row(test_dict)

# insert new row
# df.loc[len(df)+1] = new_row
# set_with_dataframe(sheet, df)

# add row at bottom
# sheet.append_row(new_row)

# get column sum
# crud.get_column_sum(df, "Cr", "")


# test
# for i in range(1, 5000):
#     df.loc[i] = new_row

# print(df)
