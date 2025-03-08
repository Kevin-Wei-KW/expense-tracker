from datetime import datetime

from gspread_dataframe import set_with_dataframe
from kivy.uix.dropdown import DropDown
from kivy.uix.boxlayout import BoxLayout
from kivy.uix.relativelayout import RelativeLayout
from kivy.uix.textinput import TextInput
from kivy.graphics import Color, RoundedRectangle
from kivymd.uix.boxlayout import MDBoxLayout
from kivymd.uix.button import MDRectangleFlatIconButton
from kivymd.utils.asynckivy import sleep

from generics import *
from kivy.properties import StringProperty, ListProperty, ObjectProperty, BooleanProperty
from kivy.core.window import Window

import crud as crud


# TODO: validate input
class DateInput(TextInput):
    def __init__(self, **kwargs):
        super(DateInput, self).__init__(**kwargs)

        self.pos_hint = ({"center_x": 0.5, "center_y": 0.9})
        self.size_hint = (0.9, 0.1)
        self.hint_text = "Date:"
        self.background_color = (0.3, 0.3, 0.3, 0)
        self.foreground_color = (1, 1, 1, 1)
        self.padding_y = [self.height/7, 0]
        self.halign = "center"

        with self.canvas.before:
            Color(0.3, 0.3, 0.3, 0.4)
            self.rect = RoundedRectangle(pos=self.pos, size=self.size,
                                         radius=[10, 10, 10, 10])
            Color(1, 1, 1, 0.8)
        # self.foreground_color = (1, 1, 1, 1)

        self.bind(pos=self.update)
        self.bind(size=self.update)

    def update(self, *args):
        self.rect.pos = self.pos
        self.rect.size = self.size


class TypeDropdown(MyButton):
    options = ListProperty([])

    def __init__(self, **kwargs):
        self.in_text = "Type~"
        self.in_text_colour = [1, 1, 1, 0.8]
        super(TypeDropdown, self).__init__(**kwargs)

        self.size_hint = (0.9, 0.1)
        self.pos_hint = ({"center_x": 0.5, "center_y": 0.75})

        dropdown = DropDown()

        for option in self.options:
            item = MyButton(in_text=option, in_radius=0, in_colour=[0.1, 0.1, 0.1, 1])
            item.bind(on_release=lambda item: dropdown.select(item.in_text))
            dropdown.add_widget(item)

        self.bind(on_release=dropdown.open)

        dropdown.bind(on_select=lambda instance, x: self.choose_option(x))

    def choose_option(self, x):
        label = self.children[0]
        label.text = x


class DetailsInput(TextInput):
    def __init__(self, **kwargs):
        super(DetailsInput, self).__init__(**kwargs)

        self.pos_hint = ({"center_x": 0.5, "center_y": 0.55})
        self.size_hint = (0.9, 0.2)
        self.hint_text = "Details:"
        self.background_color = (0.3, 0.3, 0.3, 0)
        self.foreground_color = (1, 1, 1, 1)
        # self.padding_y = [self.height/7, 0]
        self.padding_x = [self.width/9, 0]
        # self.halign = "center"

        with self.canvas.before:
            Color(0.3, 0.3, 0.3, 0.4)
            self.rect = RoundedRectangle(pos=self.pos, size=self.size,
                                         radius=[10, 10, 10, 10])
            Color(1, 1, 1, 0.8)
        # self.foreground_color = (1, 1, 1, 1)

        self.bind(pos=self.update)
        self.bind(size=self.update)

    def update(self, *args):
        self.rect.pos = self.pos
        self.rect.size = self.size


class AmountInput(TextInput):
    def __init__(self, **kwargs):
        super(AmountInput, self).__init__(**kwargs)

        self.pos_hint = ({"center_x": 0.5, "center_y": 0.35})
        self.size_hint = (0.9, 0.1)
        self.hint_text = "Amount:"
        self.background_color = (0.3, 0.3, 0.3, 0)
        self.foreground_color = (1, 1, 1, 1)
        self.padding_y = [self.height/7, 0]
        self.padding_x = [self.width/9, 0]
        # self.halign = "center"

        with self.canvas.before:
            Color(0.3, 0.3, 0.3, 0.4)
            self.rect = RoundedRectangle(pos=self.pos, size=self.size,
                                         radius=[10, 10, 10, 10])
            Color(1, 1, 1, 0.8)
        # self.foreground_color = (1, 1, 1, 1)

        self.bind(pos=self.update)
        self.bind(size=self.update)

    def update(self, *args):
        self.rect.pos = self.pos
        self.rect.size = self.size


class CrudButton(MDRectangleFlatIconButton):
    """
    a single button for save/cancel
    """
    icon_name = StringProperty("")
    in_text = StringProperty("")

    def __init__(self, **kwargs):
        super(CrudButton, self).__init__(**kwargs)

        self.icon = self.icon_name
        self.text = self.in_text
        self.text_color = (1, 1, 1, 1)
        self.icon_color = (1, 1, 1, 1)
        self.theme_text_color = "Custom"
        self.line_color = (0, 0, 0, 0)
        self.size_hint = (0.5, 1.5)
        self.pos_hint = {"center_x": .5, "center_y": .5}

    def on_press(self):
        """
        detect press and behaviour
        """
        if self.text == "Save":
            self.save_click()
            pass

        if self.text == "Cancel":
            self.cancel_click()
            pass

    def save_click(self):

        pass

    def cancel_click(self):

        pass


class CrudBar(MDBoxLayout):
    """
    the entire navbar
    """

    def __init__(self, **kwargs):
        super(CrudBar, self).__init__(**kwargs)

        self.adaptive_height = False
        self.size_hint_y = 0.1
        self.md_bg_color = (0.3, 0.3, 0.3, 0.3)
        self.orientation = "horizontal"
        self.padding = [10, 10]
        self.pos = (0, 0)

        cancel = CrudButton(icon_name="close", in_text="Cancel")
        save = CrudButton(icon_name="check", in_text="Save")

        self.add_widget(cancel)
        self.add_widget(save)

        # home = NavButton(page_num=1, icon_name="home")
        # stats = NavButton(page_num=2, icon_name="poll")
        # search = NavButton(page_num=3, icon_name="magnify")

        # self.add_widget(home)
        # self.add_widget(stats)
        # self.add_widget(search)

    def push_data(self, *args):
        pass

# class DatePicker(MyButton):
#     def __init__(self, **kwargs):
#         self.in_text = "Date"
#         super(DatePicker, self).__init__(**kwargs)
#
#         self.pos_hint = ({"center_x": 0.5, "center_y": 0.65})
#
#         date_dialog = MDDatePicker()
#
#         self.bind(on_release=date_dialog.open)
#         date_dialog.bind(on_save=self.on_save, on_cancel=self.on_cancel)
#
#
#         # self.bind(on_release=lambda x: self.show_date_picker())
#
#     def on_save(self, instance, value, date_range):
#         '''
#         Events called when the "OK" dialog box button is clicked.
#
#         :type instance: <kivymd.uix.picker.MDDatePicker object>;
#
#         :param value: selected date;
#         :type value: <class 'datetime.date'>;
#
#         :param date_range: list of 'datetime.date' objects in the selected range;
#         :type date_range: <class 'list'>;
#         '''
#
#         print(instance, value, date_range)
#
#     def on_cancel(self, instance, value):
#         '''Events called when the "CANCEL" dialog box button is clicked.'''
#
#     def show_date_picker(self, *args):
#         date_dialog = MDDatePicker(size_hint=(0.9, 0.5))
#         date_dialog.bind(on_save=self.on_save, on_cancel=self.on_cancel)
#         date_dialog.open()


class AddTxnFrame(RelativeLayout):
    dataframe = ObjectProperty()
    sheet = ObjectProperty()
    confirmed = BooleanProperty(False)

    def __init__(self, **kwargs):
        super(AddTxnFrame, self).__init__(**kwargs)

        # background
        self.add_widget(CanvasWidget())

        # date picker
        self.date = DateInput()
        self.add_widget(self.date)

        # type dropdown
        self.dropdown = TypeDropdown(options=["Food", "Rec", "Grocery", "Rec", "Misc"])
        self.add_widget(self.dropdown)

        # details input
        self.details = DetailsInput()
        self.add_widget(self.details)

        # amount input
        self.amount = AmountInput()
        self.add_widget(self.amount)

        # transaction box
        # item = {"title": "Food", "date": "2019-01-30", "details": "First", "value": -1378.23}
        # self.txn_box = TxnScrollView(txn_list=[item])
        # self.txn_box.do_scroll_y = False
        # self.txn_box.pos_hint = {"center_x": 0.5, "center_y": 0.24}
        # self.txn_box.height = Window.size[1] * 0.2
        # self.add_widget(self.txn_box)

        # grid = self.txn_box.children[0].children[0]
        # self.txn_top = grid.children[1]
        # self.txn_bottom = grid.children[0]
        # print(txn_top.in_title)

        # self.update_txn_box()

        # crud bar
        self.crud = CrudBar()
        self.add_widget(self.crud)

        self.crud.children[0].bind(on_release=lambda back: self.add_txn_to_df())

    def add_txn_to_df(self):
        out_date = datetime.strptime(self.date.text, '%Y-%m-%d') if self.date.text != "" else datetime.now()
        out_txn = self.dropdown.children[0].text if self.dropdown.children[0].text != "Type~" else "Misc"
        out_desc = self.details.text
        #TODO: fix dr/cr
        out_dr = 0
        out_cr = int(self.amount.text)


        new_dict:crud.data_dict_format = {
            "date": out_date,
            "txn": out_txn,
            "desc": out_desc,
            "dr": out_dr,
            "cr": out_cr,
        }

        new_row = crud.create_row(new_dict)

        self.dataframe.loc[len(self.dataframe)+1] = new_row

        self.push_to_sheet()

    def push_to_sheet(self):
        set_with_dataframe(self.sheet, self.dataframe)
        self.confirmed = True

    # def update_txn_box(self, *args):
    #     self.txn_box.txn_list = [{"title": "Food", "date": "2019-01-30", "details": "Second", "value": -1378.23}]
    #     print("here")

    # def update_txn_box(self):
    #     item = {"title": "Food", "date": "2019-01-30", "details": self.details.text, "value": -1378.23}
    #     return [item]



