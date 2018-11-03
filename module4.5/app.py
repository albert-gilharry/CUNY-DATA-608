# -*- coding: utf-8 -*-
"""
@author: Albert Gilharry
"""

from flask import Flask, render_template
import json
from requests import get

app = Flask(__name__)


# this rout will return trees where one of the sidewalk flags immediately adjacent to the tree was damaged, cracked, or lifted.
# you may pass "Damage" to get trees that may have damaged the sidewalk flags, or "NoDamage" trees having no damage to their adjacent sidewalk structure.
# this function will page through the entire result up to the value of the optional "limit" parameter, the default is 1000 records

@app.route('/trees/sidewalk/<string:sidewalkDamage>', defaults={'limit': 1000})
@app.route('/trees/sidewalk/<string:sidewalkDamage>/<int:limit>')
def socrata_sidewalkDamage(sidewalkDamage,limit = ""):

    # Read in raw data
    offset = 0 # pagination 
    next_batch = [] # temp storage
    json_output = [] # final output
    init = True # just an initial controll
    
    #page through the entire set without the use of Pandas, we will use a single list to avoid the extra overhead
    while(  len(next_batch) != 0 or  init == True ):
        soql_url = ('https://data.cityofnewyork.us/resource/nwxe-4ae8.json?' +
                '$select=tree_id,sidewalk,zipcode,boroname,latitude,longitude' + 
                '&$where=sidewalk=\"' + sidewalkDamage + '"' + 
                '&$limit=1000&$offset=' + str(offset)).replace(' ', '%20')
        
        response = get(soql_url)
        next_batch = json.loads(response.text)
        json_output = json_output  + next_batch
        init = False
        offset = offset +  1000
        if( len(json_output) >= limit ):
            break
        
    return json.dumps(json_output[0:limit], indent=4, separators=(',', ': '))
   
# The default rout provides a brief description of the data  and explames of accessing the API
@app.route('/')
def index():
    return render_template('index.html')

if __name__ == '__main__':
    app.run(host='0.0.0.0', port=5000)