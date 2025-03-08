from kivy.uix.gridlayout import GridLayout
from kivy.uix.boxlayout import BoxLayout
from kivy.uix.relativelayout import RelativeLayout
from kivy.uix.button import Button
from kivy.uix.textinput import TextInput
from kivy.uix.scrollview import ScrollView
from kivy.uix.carousel import Carousel
from kivy.uix.label import Label
from kivy.graphics import Rectangle, Color, Line, RoundedRectangle
from kivymd.uix.boxlayout import MDBoxLayout
from kivymd.uix.button import MDRoundFlatButton, MDIconButton
from kivy.uix.widget import Widget

from generics import *
from kivy.properties import StringProperty, ListProperty, DictProperty, NumericProperty, ObjectProperty
from kivy.core.window import Window

Window.size = (390 * 0.6, 844 * 0.55) # TESTING


class TxnBoxTop(MDBoxLayout):
    """
    top part of transaction box
    """
    in_title = StringProperty("")
    in_date = StringProperty("")

    def __init__(self, **kwargs):
        super(TxnBoxTop, self).__init__(**kwargs)

        self.adaptive_height = False
        self.orientation = "horizontal"

        title = MyLabel(text=self.in_title,
                        bold=True,
                        font_size="16sp",
                        size_hint_x=0.4,
                        halign="left",
                        valign="top")
        date = MyLabel(text=self.in_date,
                       bold=True,
                       color=(1, 1, 1, 0.5),
                       size_hint_x=0.6,
                       halign="right",
                       valign="top")

        self.add_widget(title)
        self.add_widget(date)


class TxnBoxBottom(MDBoxLayout):
    """
    bottom part of transaction box
    """
    in_details = StringProperty("")
    in_value = StringProperty(0)

    def __init__(self, **kwargs):
        super(TxnBoxBottom, self).__init__(**kwargs)

        self.adaptive_height = False
        self.orientation = "horizontal"

        details = MyLabel(text=self.in_details,
                          color=(1, 1, 1, 0.5),
                          font_size="12sp",
                          size_hint_x=0.5,
                          halign="left",
                          valign="top")
        value = MyLabel(text=self.in_value,
                        bold=True,
                        font_size="18sp",
                        size_hint_x=0.45,
                        halign="center",
                        valign="center")

        self.add_widget(details)
        self.add_widget(value)


class TxnBox(MDBoxLayout):
    """
    box that contains a single transaction
    """
    data = DictProperty({})

    def __init__(self, **kwargs):
        super(TxnBox, self).__init__(**kwargs)

        # print(self.data)

        self.adaptive_height = False
        # self.md_bg_color = (0.3, 0.3, 0.3, 0.3)
        self.orientation = "vertical"
        self.padding = [10, 10]

        raw_value = self.data["value"]
        format_value = ""
        if raw_value >= 0:
            format_value = "$" + "{:.2f}".format(raw_value)
        elif raw_value < 0:
            format_value = "-$" + "{:.2f}".format(raw_value)[1:]

        self.add_widget(TxnBoxTop(in_title=self.data["title"], in_date=self.data["date"]))
        self.add_widget(TxnBoxBottom(in_details=self.data["details"], in_value=format_value))

        with self.canvas.before:
            Color(0.3, 0.3, 0.3, 0.3)
            self.rect = RoundedRectangle(pos=self.pos,
                                         size=self.size,
                                         radius=[10, 10, 10, 10])
        self.bind(pos=self.update)
        self.bind(size=self.update)

    def update(self, *args):
        self.rect.pos = self.pos
        self.rect.size = self.size


class TxnScrollView(ScrollView):
    """
    entire scroll box for transactions
    """
    txn_list = ListProperty([])

    def __init__(self, **kwargs):
        super(TxnScrollView, self).__init__(**kwargs)

        self.cols = 1
        self.size_hint_y = None

        self.height = Window.size[1] * 0.75

        self.row_default_height = 50
        self.pos_hint = {"center_x": 0.5, "y": 0.27}
        self.scroll_y = 0

        grid = GridLayout(cols=1,
                          size_hint_y=None,
                          height=150,
                          spacing=10,
                          padding=10,
                          row_default_height=100)

        for txn in self.txn_list:
            grid.add_widget(TxnBox(data=txn))

        grid.bind(minimum_height=grid.setter("height"))

        self.add_widget(grid)


cur_page = 1  # tracks the page number, 1-3


class AddTxnButton(MDRoundFlatButton):
    def __init__(self, **kwargs):
        super(AddTxnButton, self).__init__(**kwargs)

        self.font_style = "Button"
        self.text_color = (1, 1, 1, 1)
        self.size_hint = (0.8, 0.1)
        self.pos_hint = ({"center_x": 0.5, "center_y": 0.2})
        self.md_bg_color = (75 / 255, 75 / 255, 75 / 255, 0.5)
        self.line_color = (0, 0, 0, 1)

        label = MyLabel(text="+ New Transaction",
                        bold=True,
                        font_size="18sp",
                        valign="center",
                        halign="center",
                        radius = 10)
        self.add_widget(label)

    # def on_press(self):


# class NavButton(MDIconButton):
#     """
#     a single button on navbar
#     """
#     page_num = NumericProperty(0)
#     icon_name = StringProperty("")
#
#     def __init__(self, **kwargs):
#         super(NavButton, self).__init__(**kwargs)
#
#         self.icon = self.icon_name
#         self.text_color = (1, 1, 1, 1)
#         self.theme_text_color = "Custom"
#         self.size_hint = (0.3333, 1.5)
#         self.pos_hint = {"center_x": .5, "center_y": .5}
#
#         global cur_page
#         if self.page_num == cur_page:
#             self.md_bg_color = (1, 1, 1, 0.2)
#
#     def on_press(self):
#         """
#         add background and sets cur_page
#         """
#         self.md_bg_color = (1, 1, 1, 0.2)
#
#         global cur_page
#         cur_page = self.page_num
#
#         self.parent.update_btns()  # updates all buttons
#
#     def update(self):
#         """
#         removes button background if page not selected
#         """
#         global cur_page
#         if cur_page != self.page_num:
#             self.md_bg_color = (1, 1, 1, 0)
#
#
# class NavBar(MDBoxLayout):
#     """
#     the entire navbar
#     """
#     def __init__(self, **kwargs):
#         super(NavBar, self).__init__(**kwargs)
#
#         self.adaptive_height = False
#         self.size_hint_y = 0.1
#         self.md_bg_color = (0.3, 0.3, 0.3, 0.3)
#         self.orientation = "horizontal"
#         self.padding = [10, 10]
#         self.pos = (0, 0)
#
#         home = NavButton(page_num=1, icon_name="home")
#         stats = NavButton(page_num=2, icon_name="poll")
#         search = NavButton(page_num=3, icon_name="magnify")
#
#         self.add_widget(home)
#         self.add_widget(stats)
#         self.add_widget(search)
#
#     def update_btns(self, *args):
#         """
#         call the update function for all children
#         """
#         for child in self.children:
#             child.update()


class HomeFrame(RelativeLayout):
    dataframe = ObjectProperty()

    def __init__(self, **kwargs):
        super(HomeFrame, self).__init__(**kwargs)

        # background
        self.add_widget(CanvasWidget())

        txn_list = []

        for index, row in self.dataframe.iterrows():
            if index == 0 or row["Transaction"] == "":
                continue
            cr = row["Cr"]
            dr = row["Dr"]
            value = -float(cr) if float(cr) > float(dr) else float(dr)
            obj = {
                "title": row["Transaction"],
                "date": row["Date"],
                "details": row["Particulars"],
                "value": value
            }
            txn_list.append(obj)
        #
        # print(txn_list)

        # txn_list = [
        #     {"title": "Food",
        #      "date": "2019-01-30",
        #      "details": "Ramen restaurant",
        #      "value": -1378.23},
        #     {"title": "Rec",
        #      "date": "2020-09-21",
        #      "details": "Buying stuff from staples",
        #      "value": 137.23},
        #     {"title": "School",
        #      "date": "2022-01-17",
        #      "details": "School programming",
        #      "value": 78.23},
        #     {"title": "Grocery",
        #      "date": "2023-12-22",
        #      "details": "A bunch of stuff from TNT",
        #      "value": -8},
        # ]

        # transactions scroll box
        self.add_widget(TxnScrollView(txn_list=txn_list))

        # add transaction button
        self.add_widget(MyButton(in_text="+ New Transaction"))

        # nav bar
        self.add_widget(NavBar(page_index=1))

