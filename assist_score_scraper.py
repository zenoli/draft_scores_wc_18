# coding: utf-8
import requests
from bs4 import BeautifulSoup

import pandas as pd
import unicodedata

def create_json_entry(name, assists):
    return '{"name":"' + name + '", "assists": "' + assists +'"}'


headers = {'User-Agent': 
           'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/47.0.2526.106 Safari/537.36'}

page = "http://www.worldfootball.net/assists/wm-2018-in-russland/"
pageTree = requests.get(page, headers=headers)
pageSoup = BeautifulSoup(pageTree.content, 'html.parser')

Values = pageSoup.find_all("td", {"class": ["hell", "dunkel"]})

json_string = '['

for i in range(len(Values) // 6):
    player = Values[6*i+1].text
    player = unicodedata.normalize('NFKD', player).encode('ascii','ignore').decode("utf-8").strip()
    assists = Values[6*i+5].text
    json_string += create_json_entry(player, assists) + ','

json_string = json_string[:-1] + ']'
print(json_string)

assistsFile = open("assists.json","w")
assistsFile.write(json_string)
assistsFile.close()


