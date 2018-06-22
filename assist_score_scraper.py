# coding: utf-8
import requests
from bs4 import BeautifulSoup

import pandas as pd
import unicodedata


headers = {'User-Agent': 
           'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/47.0.2526.106 Safari/537.36'}

page = "http://www.worldfootball.net/assists/wm-2018-in-russland/"
pageTree = requests.get(page, headers=headers)
pageSoup = BeautifulSoup(pageTree.content, 'html.parser')

Values = pageSoup.find_all("td", {"class": ["hell", "dunkel"]})

for i in range(len(Values) // 6):
    player = Values[6*i+1].text
    player = unicodedata.normalize('NFKD', player).encode('ascii','ignore').decode("utf-8").strip()
    assists = Values[6*i+5].text
    print(player + ", " + assists)