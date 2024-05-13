from datetime import datetime

import pandas as pd
import gspread

from gspread import Worksheet
from gspread_dataframe import set_with_dataframe

scopes = ['https://spreadsheets.google.com/feeds', 'https://www.googleapis.com/auth/drive']

header_name = {
    "date": "Date",
    "txn": "Transaction",
    "desc": "Description",
    "dr": "Dr",
    "cr": "Cr",
}

type_name = {
    "food": "Food",
    "recreation": "Recreation",
    "school": "School",
    "misc": "Misc",
    "grocery": "Grocery",
    "housing": "Housing",
    "earning": "Earning",
}

txn_dict_format = {
    "date": datetime.date,
    "txn": str,
    "desc": str,
    "dr": float,
    "cr": float,
}

test_txn: txn_dict_format = {
    "date": datetime.now(),
    "txn": "food",
    "desc": "details",
    "dr": 0,
    "cr": 100.11,
}

#
# Setup
#

sheet: Worksheet = None


def connect_client(credentials, sheet_name, worksheet_title):

    gc = gspread.authorize(credentials)
    sh = gc.open(sheet_name)

    global sheet
    sheet = sh.worksheet(worksheet_title)

    if sheet is not None:
        setup_sheet()

    return "Connected"


def setup_sheet():
    """
    Sets up a new spreadsheet
    """

    df = pd.DataFrame(sheet.get_all_values())

    headers = ["Date", "Transaction", "Description", "Dr", "Cr"]

    # Clear content and headers if first line doesn't match
    if df.loc[0].values.tolist() != headers:
        sheet.clear()
        blank_df = pd.DataFrame([headers])
        blank_df.columns = blank_df.iloc[0]
        blank_df = blank_df.drop(blank_df.index[0])
        set_with_dataframe(sheet, blank_df)


def get_dataframe() -> pd.DataFrame:
    """
    Retrieve dataframe from spreadsheet
    :return: pandas dataframe object
    """

    df = pd.DataFrame(sheet.get_all_values())
    df.columns = df.iloc[0]
    df = df.drop(df.index[0])
    return df


def is_float(num: int) -> bool:
    """
    check if num is float
    :param num: num to be checked
    :return: true/false
    """
    try:
        float(num)
        return True
    except ValueError:
        return False


def dataframe_to_json_list(df: pd.DataFrame) -> list[txn_dict_format]:
    """
    Converts dataframe to a list of json
    :param df:
    :return: list of transaction in dict format
    """
    dict_list = []
    for i, row in df.iterrows():
        new_dict = {
            "date": row["Date"],
            "txn": row["Transaction"],
            "desc": row["Description"],
            "dr": row["Dr"].replace(",", ""),
            "cr": row["Cr"].replace(",", ""),
        }

        dict_list.insert(0, new_dict)

    return dict_list

#
# Post
#


def create_row(data: txn_dict_format) -> list:
    """
    create new row (not dependent on column headers)
    :param data: data to be placed into the row, dict typing defined above
    :return: new row as a list
    """
    date = data["date"] if data["date"] is not None else datetime.now().strftime('%Y-%m-%d')
    return [date, data["txn"], data["desc"], data["dr"], data["cr"]]


def push_to_spreadsheet(row: list, df: pd.DataFrame):
    """
    Add row to dataframe, push to spreadsheet
    :param row: the row to be added to dataframe
    :param df: the dataframe
    :return: nothing
    """

    # track dates
    prev_date = datetime.strptime(df.loc[len(df)]["Date"], "%Y-%m-%d") if len(df) > 1 else None
    cur_date = datetime.strptime(row[0], "%Y-%m-%d")

    # insert new row
    df.loc[len(df)+1] = row

    # sort if new transaction has earlier date
    if prev_date is not None and cur_date < prev_date:
        df = df.sort_values(df.columns[0])  # sort first column (date)

    set_with_dataframe(sheet, df)


#
# Analytical
#

# filter definition
time_filter = {
    "year": int,  # default current year
    "month": int,  # default 0, no selected month
}


def get_column_sum(df: pd.DataFrame, need_cr: bool = True, txn_type: str = "", cur_filter: time_filter = {}) -> float:
    """
    gets the sum of a column
    :param df: dataframe
    :param need_cr: whether to get cr or dr
    :param txn_type: header of transaction to add up
    :param cur_filter: filtering what to add up
    :return:
    """

    total: float = 0.0
    header_pos = header_name["cr"] if need_cr else header_name["dr"]
    header_neg = header_name["dr"] if need_cr else header_name["cr"]
    year = cur_filter["year"] if "year" in cur_filter else datetime.now().year
    month = cur_filter["month"] if "month" in cur_filter else 0

    for row_idx, row in df.iterrows():
        date = datetime.strptime(row[header_name["date"]], "%Y-%m-%d")
        cur_header = row[header_name["txn"]]
        value_pos = row[header_pos].replace(",", "")
        value_neg = row[header_neg].replace(",", "")

        if date.year != year:
            continue

        if month != 0 and date.month != month:
            continue

        if txn_type != "" and cur_header != txn_type:
            continue

        if is_float(value_pos) and is_float(value_neg):
            total += float(value_pos) - float(value_neg)
    return total


def get_all_stats(df: pd.DataFrame,
                  cur_filter: time_filter = {"year": datetime.now().year, "month": 0}) -> dict[str, float]:
    """
    return all needed stats for stats page
    :param df: dataframe
    :param cur_filter: filtering what to add up
    :return:
    """

    stats: dict[str, float] = {"Food": get_column_sum(df, True, "Food", cur_filter),
                               "Recreation": get_column_sum(df, True, "Recreation", cur_filter),
                               "School": get_column_sum(df, True, "School", cur_filter),
                               "Misc": get_column_sum(df, True, "Misc", cur_filter),
                               "Grocery": get_column_sum(df, True, "Grocery", cur_filter),
                               "Housing": get_column_sum(df, True, "Housing", cur_filter),
                               "Earning": get_column_sum(df, False, "Earning", cur_filter)}

    return stats
