from kivymd.app import MDApp
from kivy.uix.screenmanager import ScreenManager, Screen, CardTransition, NoTransition
from kivy.core.window import Window

from frame_home import *
from frame_add_txn import *
from frame_stats import *

import pandas as pd
import gspread
from oauth2client.service_account import ServiceAccountCredentials

import crud as crud

import datetime

scope = ['https://spreadsheets.google.com/feeds', 'https://www.googleapis.com/auth/drive']

creds = ServiceAccountCredentials.from_json_keyfile_name('../expensetracker.json', scope)

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
model_dict: crud.data_dict_format = {
    "date": datetime.datetime.now(),
    "txn": "",
    "desc": "",
    "dr": 0,
    "cr": 0,
}

# # construct new row
# new_row = crud.create_row(model_dict)

# insert new row
# df.loc[len(df)+1] = new_row
# set_with_dataframe(sheet, df)

# add row at bottom
# sheet.append_row(new_row)

# get column sum
# crud.get_column_sum(df, "Cr", "")


class MainApp(MDApp):
    sm = ScreenManager(transition=CardTransition(direction="up"))
    cur_page = NumericProperty(1)  # tracks page number 1-3

    def build(self):
        self.home = Screen(name="home")
        self.sm.add_widget(self.home)
        # home.add_widget(HomeFrame(dataframe = df))
        self.home_page = HomeFrame(dataframe=df)
        # self.home_page.add_widget(NavBar(page_index=1))
        self.home.add_widget(self.home_page)

        add_txn = Screen(name="add_txn")
        self.sm.add_widget(add_txn)
        self.add_txn_page = AddTxnFrame(dataframe=df, sheet=sheet)
        add_txn.add_widget(self.add_txn_page)

        stats = Screen(name="stats")
        self.sm.add_widget(stats)
        self.stats_page = StatsFrame()
        # self.stats_page.add_widget(NavBar(page_index=2))
        stats.add_widget(self.stats_page)
        # self.sm.current = "stats"

        self.home.children[0].children[1].bind(on_release=lambda add: self.to_add_txn())

        self.add_txn_page.children[0].children[1].bind(on_release=lambda back: self.to_home())
        self.add_txn_page.bind(confirmed= self.to_home)

        # Nav Bars
        self.home_page.children[0].children[2].bind(on_release=lambda add: self.to_home())
        self.home_page.children[0].children[1].bind(on_release=lambda add: self.to_stats())

        self.stats_page.children[0].children[2].bind(on_release=lambda add: self.stats_to_home())
        self.stats_page.children[0].children[1].bind(on_release=lambda add: self.to_stats())


        return self.sm

    def to_stats(self):
        self.sm.transition = NoTransition()
        self.sm.current = "stats"

    def stats_to_home(self):
        self.sm.transition = NoTransition()
        self.sm.current = "home"

    def to_add_txn(self):
        self.sm.transition = CardTransition(direction="up")

        self.sm.transition.direction = "up"
        self.sm.transition.mode = "push"
        self.sm.current = "add_txn"

    def to_home(self, *args):
        self.sm.transition = CardTransition(direction="up")

        self.home_page.__init__()
        self.sm.transition.direction = "down"
        self.sm.transition.mode = "pop"
        self.sm.current = "home"

        self.home.children[0].children[1].bind(on_release=lambda add: self.to_add_txn())
        self.home_page.children[0].children[2].bind(on_release=lambda add: self.to_home())
        self.home_page.children[0].children[1].bind(on_release=lambda add: self.to_stats())


        self.add_txn_page.confirmed = False
        self.add_txn_page.__init__()
        self.add_txn_page.children[0].children[1].bind(on_release=lambda back: self.to_home())



if __name__ == "__main__":
    Window.size = [390 * 0.6, 844 * 0.55]

    MainApp().run()

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
# test_dict: crud.data_dict_format = {
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
