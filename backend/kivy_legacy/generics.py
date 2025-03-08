from kivy.graphics import Color, Rectangle, RoundedRectangle
from kivy.properties import NumericProperty, StringProperty, ListProperty
from kivy.uix.button import Button
from kivy.uix.label import Label
from kivy.uix.widget import Widget
from kivymd.uix.boxlayout import MDBoxLayout
from kivymd.uix.button import MDRaisedButton, MDRoundFlatButton, MDFlatButton, MDIconButton


class CanvasWidget(Widget):
    """
    set background colour
    """

    def __init__(self, **kwargs):
        super(CanvasWidget, self).__init__(**kwargs)

        # Arranging Canvas
        with self.canvas:
            Color(0, 0, 0, 1)  # set the colour

            # Setting the size and position of canvas
            self.rect = Rectangle(pos=self.center,
                                  size=(self.width / 2.,
                                        self.height / 2.))

            # Update the canvas as the screen size change
            self.bind(pos=self.update_rect,
                      size=self.update_rect)

    # update function which makes the canvas adjustable.
    def update_rect(self, *args):
        self.rect.pos = self.pos
        self.rect.size = self.size


class MyLabel(Label):
    """
    custom label for styling
    """
    radius = NumericProperty(10)

    def on_size(self, *args):
        self.text_size = self.size

    def __init__(self, **kwargs):
        super().__init__(**kwargs)
        with self.canvas.before:
            rgba = [1, 1, 1, 0]
            # print(self.text)
            if len(self.text) != 0:
                if self.text[0] == "$":
                    rgba = [80 / 255, 138 / 255, 55 / 255, 0.5]
                elif self.text[0] == "-":
                    rgba = [95 / 255, 33 / 255, 33 / 255, 0.5]
            Color(*rgba)
            self.rect = RoundedRectangle(pos=self.pos, size=self.size, radius=[self.radius, self.radius, self.radius, self.radius])
        self.bind(pos=self.update)
        self.bind(size=self.update)

    def update(self, *args):
        self.rect.pos = self.pos
        self.rect.size = self.size


class MyButton(MDFlatButton):
    """
    Custom button
    """
    in_radius = NumericProperty(10)
    in_text = StringProperty("")
    in_size = ListProperty([0.8, 0.1])
    in_colour = ListProperty([0.3, 0.3, 0.3, 0.4])

    def __init__(self, **kwargs):
        super().__init__(**kwargs)

        self.text_color = (1, 1, 1, 1)
        self.theme_text_color = "Custom"
        # self.font_style = "H5"
        self.size_hint = (self.in_size[0], self.in_size[1])
        self.pos_hint = ({"center_x": 0.5, "center_y": 0.2})
        # self.outline_color = (0, 0, 0, 1)
        # self.md_bg_color = (75/255, 75/255, 75/255, 0.4)
        # self.shadow_radius = 20
        # self.radius = 20
        # self.md_bg_color = (0,0,0,1)
        # self.background_color = (0, 0, 0, 0)

        label = MyLabel(text=self.in_text,
                        bold=True,
                        halign="center",
                        valign="center")
        self.add_widget(label)


        # self.text = self.in_text
        # self.bold = True
        self.font_size = "18sp"
        self.font_style = "Subtitle2"

        with self.canvas.before:
            c = self.in_colour
            Color(c[0], c[1], c[2], c[3])
            self.rect = RoundedRectangle(pos=self.pos, size=self.size,
                                         radius=[self.in_radius, self.in_radius, self.in_radius, self.in_radius])
        self.bind(pos=self.update)
        self.bind(size=self.update)

    def update(self, *args):
        self.rect.pos = self.pos
        self.rect.size = self.size


class NavButton(MDIconButton):
    """
    a single button on navbar
    """
    page_num = NumericProperty(0)
    icon_name = StringProperty("")
    cur_page = NumericProperty(0)

    def __init__(self, **kwargs):
        super(NavButton, self).__init__(**kwargs)

        self.icon = self.icon_name
        self.text_color = (1, 1, 1, 1)
        self.theme_text_color = "Custom"
        self.size_hint = (0.3333, 1.5)
        self.pos_hint = {"center_x": .5, "center_y": .5}

        if self.page_num == self.cur_page:
            self.md_bg_color = (1, 1, 1, 0.2)

    # def on_press(self):
    #     """
    #     add background and sets cur_page
    #     """
    #     self.md_bg_color = (1, 1, 1, 0.2)
    #
    #     # global cur_page
    #     # cur_page = self.page_num
    #     self.parent.page_index = self.page_num
    #
    #     self.parent.update_btns()  # updates all buttons
    #
    # def update(self):
    #     """
    #     removes button background if page not selected
    #     """
    #     if self.parent.page_index != self.page_num:
    #         self.md_bg_color = (1, 1, 1, 0)


class NavBar(MDBoxLayout):
    """
    the entire navbar
    """
    page_index = NumericProperty(0)

    def __init__(self, **kwargs):
        super(NavBar, self).__init__(**kwargs)

        self.adaptive_height = False
        self.size_hint_y = 0.1
        self.md_bg_color = (0.3, 0.3, 0.3, 0.3)
        self.orientation = "horizontal"
        self.padding = [10, 10]
        self.pos = (0, 0)

        home = NavButton(page_num=1, icon_name="home", cur_page=self.page_index)
        stats = NavButton(page_num=2, icon_name="poll", cur_page=self.page_index)
        search = NavButton(page_num=3, icon_name="magnify", cur_page=self.page_index)

        self.add_widget(home)
        self.add_widget(stats)
        self.add_widget(search)


    # def update_btns(self, *args):
    #     """
    #     call the update function for all children
    #     """
    #     for child in self.children:
    #         child.update()