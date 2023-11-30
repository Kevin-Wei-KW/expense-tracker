from kivy.graphics import RoundedRectangle, Color
from kivy.properties import NumericProperty, StringProperty
from kivy.uix.dropdown import DropDown
from kivy.uix.relativelayout import RelativeLayout
from kivymd.uix.boxlayout import MDBoxLayout
from kivymd.uix.button import MDIconButton, MDRoundFlatButton

from generics import *

class YearDropdown(MyButton):
    options = ListProperty([])

    def __init__(self, **kwargs):
        self.in_text = "2023"
        self.in_text_colour = [1, 1, 1, 0.8]
        super(YearDropdown, self).__init__(**kwargs)

        self.size_hint = (0.45, 0.1)
        self.pos_hint = ({"center_x": 0.25, "center_y": 0.93})

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


class MonthDropdown(MyButton):
    options = ListProperty([])

    def __init__(self, **kwargs):
        self.in_text = "June"
        self.in_text_colour = [1, 1, 1, 0.8]
        super(MonthDropdown, self).__init__(**kwargs)

        self.size_hint = (0.45, 0.1)
        self.pos_hint = ({"center_x": 0.75, "center_y": 0.93})

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

class StatBox(MDBoxLayout):
    """
    box that contains a single stat
    """
    x = NumericProperty(0)
    y = NumericProperty(0)
    in_title = StringProperty(0)
    in_value = NumericProperty(0)

    def __init__(self, **kwargs):
        super(StatBox, self).__init__(**kwargs)

        # print(self.data)

        self.adaptive_height = False
        # self.md_bg_color = (0.3, 0.3, 0.3, 0.3)
        self.orientation = "vertical"
        self.padding = [10, 10]
        self.size_hint = (0.45, 0.18)
        self.pos_hint = ({"center_x": self.x, "center_y": self.y})

        parsed_value = "-$"+str(self.in_value) if self.in_title != "Earnings" else "$"+str(self.in_value)
        title = MyLabel(text=self.in_title,
                        bold=True,
                        font_size="16sp",
                        size_hint_x=1,
                        valign="top")
        value = MyLabel(text=parsed_value,
                        bold=True,
                        font_size="18sp",
                        size_hint_x=1,
                        halign="center",
                        valign="center")

        self.add_widget(title)
        self.add_widget(value)
        # self.add_widget(TxnBoxTop(in_title=self.data["title"], in_date=self.data["date"]))
        # self.add_widget(TxnBoxBottom(in_details=self.data["details"], in_value=format_value))

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


class StatsFrame(RelativeLayout):
    def __init__(self, **kwargs):
        super(StatsFrame, self).__init__(**kwargs)

        # background
        self.add_widget(CanvasWidget())

        self.add_widget(YearDropdown())
        self.add_widget(MonthDropdown())

        self.add_widget(StatBox(x=0.25, y=0.775, in_title="Food", in_value=578.61))
        self.add_widget(StatBox(x=0.75, y=0.775, in_title="Rec.", in_value=17.88))
        self.add_widget(StatBox(x=0.25, y=0.575, in_title="School", in_value=51.19))
        self.add_widget(StatBox(x=0.75, y=0.575, in_title="Misc.", in_value=27.64))
        self.add_widget(StatBox(x=0.25, y=0.375, in_title="Grocery", in_value=219.03))
        self.add_widget(StatBox(x=0.75, y=0.375, in_title="Earnings", in_value=2098.72))

        self.add_widget(MyButton(in_text="+ New Transaction"))

        self.add_widget(NavBar(page_index=2))




