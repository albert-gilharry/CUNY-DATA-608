# -*- coding: utf-8 -*-
"""
Created on Fri Oct 19 14:07:21 2018

@author: Albert Giilharry
"""
import dash
import dash_core_components as dcc
import dash_html_components as html
import pandas as pd
import plotly.plotly as py
import plotly.graph_objs as go
from dash.dependencies import Input, Output

external_stylesheets = ['https://codepen.io/chriddyp/pen/bWLwgP.css']

app = dash.Dash(__name__, external_stylesheets=external_stylesheets)

# no need to run an extra request for static boroughs
boros = ['Manhattan', 'Bronx', 'Brooklyn', 'Queens', 'Staten Island']


# get common species
soql_url = ('https://data.cityofnewyork.us/resource/nwxe-4ae8.json?' +\
        '$select=spc_common,count(tree_id)' +\
        '&$group=spc_common').replace(' ', '%20')

spc_commons = pd.read_json(soql_url)

# layout for the application
app.layout = html.Div([
    html.Div([
            
         html.Div([
                 
         html.H3('Question I: The Health of Trees', className = "six columns", style = {"text-align": "center"} ), 
         
         html.H3('Question II: The Impact of Stewards', className = "six columns", style = {"text-align": "center"} ), 
         
         ], className="row"),

         
         html.Div([
                    
            html.Div(dcc.Input(id='label-1', type='text', value='Species:', disabled=True, style={'border':'none', 'color':'blue'}),
                     className="one columns"),   
            
            html.Div(dcc.Dropdown(
                id='select-spc1',
                options=[{'label': spc_commons.loc[i]['spc_common'], 'value':  spc_commons.loc[i]['spc_common']} for i in spc_commons.index],
                value=spc_commons.loc[5]['spc_common']
            ), className="five columns"),  
              
            
            html.Div(dcc.Input(id='label-2', type='text', value='Species:', disabled=True, style={'border':'none', 'color':'blue'}),
                     className="one columns"),   
            
            html.Div(dcc.Dropdown(
                id='select-spc2',
                options=[{'label': spc_commons.loc[i]['spc_common'], 'value':  spc_commons.loc[i]['spc_common']} for i in spc_commons.index],
                value=spc_commons.loc[5]['spc_common']
            ), className="two columns"),  
            
            
            html.Div(dcc.Input(id='label-3', type='text', value='Borough:', disabled=True, style={'border':'none', 'color':'blue'}),
                     className="one columns"),   
            
            html.Div(dcc.Dropdown(
                id='select-boro',
                options=[{'label': i, 'value': i} for i in boros],
                value=boros[0]
            ), className="two columns"),  
            
        ], className="row"),

    ]),

    html.Div([
       dcc.Graph(id='q1-area'),
    ], style={'display': 'inline-block', 'width': '48%'}),

     html.Div([
        dcc.Graph(id='q2-area'),
    ], style={'display': 'inline-block', 'width': '48%'}),

     html.Div([           
         html.P('Done by: Albert Gilharry', style = {"text-align": "center", "font-weight":"bold"} ), 
    ])
])
    

@app.callback(
    dash.dependencies.Output('q1-area', 'figure'),
    [(dash.dependencies.Input('select-spc1', 'value'))])

# question 1 visualization
def update_graph(select_spc):
    
    traces = []
    soql_url = ('https://data.cityofnewyork.us/resource/nwxe-4ae8.json?' +\
        '$select=health,count(tree_id),boroname' +\
        '&$where=spc_common=\"' + select_spc + '"' +\
        '&$group=health,boroname').replace(' ', '%20')

    dfAll = pd.read_json(soql_url)
    for health in dfAll['health'].unique():
        yaxis = []
        for boro in dfAll[dfAll['health'] == health]['boroname']:
            yaxis.append(round((int(dfAll.loc[(dfAll['health'] == health) & (dfAll['boroname'] == boro)]['count_tree_id'])/dfAll[dfAll['boroname'] == boro]['count_tree_id'].sum()) * 100, 2 ) )
        
        traces.append(go.Bar(
        x = dfAll[dfAll['health'] == health]['boroname'],
        y = yaxis,
        name = health,
        ))
    
    return {
        'data': traces,
        'layout': go.Layout(
           
            title='Tree Health by Borough & Species',
            xaxis =  {'title': 'Borough'},
            yaxis= {'title': 'Health of ' + select_spc},
            barmode= 'relative',
        )
    }
 
    
@app.callback(
    dash.dependencies.Output('q2-area', 'figure'),
    [dash.dependencies.Input('select-boro', 'value'),
     dash.dependencies.Input('select-spc2', 'value')])

# question 2 visualization
def update_graph2(select_boro, select_spc):
    
    traces = []
    
    soql_url = ('https://data.cityofnewyork.us/resource/nwxe-4ae8.json?' +\
        '$select=health,count(tree_id),steward,boroname' +\
        '&$where=spc_common="' + select_spc + '" and boroname="' + select_boro + '"' +\
        '&$group=steward,health,boroname').replace(' ', '%20')
    
    dfAll = pd.read_json(soql_url)
    
    for health in dfAll['health'].unique():
        yaxis = []
        for steward in dfAll[dfAll['health'] == health]['steward']:
            yaxis.append(round((int(
        dfAll.loc[(dfAll['health'] == health) & 
                  (dfAll['steward'] == steward)]['count_tree_id'])/
           dfAll[dfAll['health'] == health]['count_tree_id'].sum()) * 100, 2 )  )
        
        traces.append(go.Bar(
        x = dfAll[dfAll['health'] == health]['steward'],
        y = yaxis,
        name = health,
        ))
    
    return {
        'data': traces,
        'layout': go.Layout(
           
            title='Tree Health by Steward: ' + select_boro,
            xaxis =  {'title': 'Steward'},
            yaxis= {'title': 'Health of ' + select_spc},
            barmode= 'group',
        )
    }

if __name__ == '__main__':
    app.run_server(host='0.0.0.0', port = 8050, threaded=True)
