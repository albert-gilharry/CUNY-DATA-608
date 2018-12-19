$(document).ready(function(){
	$("#loading,#loading-overlay").show(); //show working indicator
	
	var aidData = []; // store large aid data set
	var Recipients = []; // store transformed data of recipients
	var RecipientKeys = [];
	var country_codes = []; // store country codes for map
	var GDPs = []; // store GDP data
	var Percapitas = []; // store GDP percapita
	
	
	//load main data file with aid data
	$(".progress-bar").css("width","25%");
	Plotly.d3.csv('data/data.csv', function(rows) {
		aidData = rows;
		preProcess();
	});
	
	// load country codes for maps
	$(".progress-bar").css("width","50%");
	Plotly.d3.csv('data/country_codes.csv', function(rows) {
		country_codes = rows;
	});
	
	//load GDP data
	Plotly.d3.csv('data/gdp.csv', function(rows) {
		GDPs = rows;
	});
	
	// load percapita data
	Plotly.d3.csv('data/percapita.csv', function(rows) {
		Percapitas = rows;
	});
	
	// pre process data set
	// the main data set contains 299,988 records

	function preProcess(){
		$(".progress-bar").css("width","75%");
		
		// group data by recipients
		Recipients = d3.group(aidData, d => d.Recipient);
		RecipientKeys = Array.from(Recipients.keys());
		
		// update recipient dropdown list
		Plotly.d3
			.select('#recipient')
			.selectAll('option')
			.data(RecipientKeys)
			.enter()
			.append('option')
			.text(function(d) {return d;})
			.attr('value', function(d) {return d;});	
		
		// set default recipient to the first
		$("#recipient").val(RecipientKeys[1]);
	
		Recipients = Array.from(Recipients);
		
		// initialize dashboard based on default recipient
		recipientPlots( $("#recipient").val(), $("#aidType").val(), $("#year").val());
		
	}
	
	// create plots based on recipient data
	function recipientPlots(recipient, aidType, year){
		$("#loading,#loading-overlay").show();
			
			//update interface based on selected recipeint
			$(".recipientLabel").text(recipient);
			
			// caclulate total aid
			var total_aid = 0
			
			// load and update data for each donor country for the selected recipient
			for(i=0;i<country_codes.length;i++){
				
				aid = Recipients[RecipientKeys.indexOf(recipient)][1].filter(recs => recs['Donor'] == country_codes[i]['COUNTRY'] && recs['Year'] == year && recs['Aid type'] == aidType);
				
				if( aid.length != 0 ){
					country_codes[i]['VALUE'] = parseFloat(aid[0]['Value']);
					total_aid += parseFloat(aid[0]['Value']); 
				}
				else{
					country_codes[i]['VALUE'] = 0;
				}
			}
			
			// create map for distribution of aid from donor countries 
			var data = [{
				type: 'choropleth',
				locations: country_codes.map(function(row) { return row['CODE']; }),
				z: country_codes.map(function(row) { return row['VALUE']; }),
				text: country_codes.map(function(row) { return row['COUNTRY']; }),
				colorscale: [
					[0,'rgb(5, 10, 172)'],
					[0.35,'rgb(40, 60, 190)'],
					[0.5,'rgb(70, 100, 245)'], 
					[0.6,'rgb(90, 120, 245)'],
					[0.7,'rgb(106, 137, 247)'],
					[1,'rgb(220, 220, 220)']],
				autocolorscale: false,
				reversescale: true,
				marker: {
					line: {
						color: 'rgb(180,180,180)',
						width: 0.5
					}
				},
				colorbar: {
					autotic: false,
					tickprefix: '$',
					ticksuffix: 'M',
					title: 'US$'
				}
			}];

			var layout = {
			  geo:{
				  showframe: false,
				  showcoastlines: false,
				  projection:{
					  type: 'mercator'
				  }
				},
				margin: {
					l: 0,
					r: 0,
					b: 0,
					t: 0,
					pad: 0.5
				}
			};
			Plotly.newPlot('donorMap', data, layout, {showLink: false});  
		
		
		// Historical plot
		// function to sum years
		function count(array, key) {
			return array.reduce(function (r, a) {
				return r + parseFloat(a[key]);
			}, 0);
		}
			
		trendX = [];
		trendY = [];
		// extract historical data and sort
		filterRecipient = Recipients[RecipientKeys.indexOf(recipient)][1].filter(recs => recs['Aid type'] == aidType);
		filterGroupings = Array.from(d3.group(filterRecipient, d => d.Year));
		filterGroupings.sort(function(a, b){return a[0] - b[0]});
		
		//populate x and y axis
		for(i=0;i<filterGroupings.length;i++){
			trendX.push(parseInt(filterGroupings[i][0]));
			trendY.push(count(filterGroupings[i][1], "Value"));
		}
		
		
		var historicalData = {
		  type: 'scatter',
		  x: trendX,
		  y: trendY,
		  mode: 'lines',
		  name: 'Red',
		  line: {
			color: 'rgb(219, 64, 82)',
			width: 3,
			dash: 'solid',
		  }
		};

		var layout = {
			xaxis: {
				tickangle: 60,
				autotick: false,
				title: "Year",
			},
			yaxis: {
				title: "Aid (Millions USD)",
			},
			height: 450
		};

		Plotly.newPlot('historicalPlot', [historicalData], layout);


		// plot top 30 donor countries to this recipient
		var distribution = country_codes.filter(recs => recs['VALUE'] != 0)	;
		//sort donor aid by recipient country
		distribution.sort(function (a, b) {
			return a.VALUE - b.VALUE;
		});
		
		
		var trace1 = {
			x: distribution.map(function(row) { return row['COUNTRY']; }).slice(-30),
			y: distribution.map(function(row) { return row['VALUE']; }).slice(-30),
			transforms: [{
				type: 'sort',
				target: 'y',
				order: 'descending'
				}],
			type: 'bar',
			marker: {
				color: 'rgb(142,124,195)'
			},
			};

			var data = [trace1];

			var layout = {
				font:{
					family: 'Raleway, sans-serif'
				},
				showlegend: false,
				xaxis: {tickangle: 60},
				yaxis: {
					title: "Aid (Millions USD)",
					zeroline: false,
					gridwidth: 1
				},
				bargap :0.05,
				height:500,
				margin: {
					b:170,
					t:25,
					l:50,
					r:50,
					pad:0,
				}
				
			};
		
		Plotly.newPlot('distributionPlot', data, layout);
		
		
		//update total aid widget
		var recipientCode = country_codes.filter(recs => recs['COUNTRY'] == recipient)[0]["CODE"];
		var recipientGDP = GDPs.filter(recs => recs["Country.Code"] == recipientCode )[0][year]/1000000;
		var gdpPercentage = (total_aid*100/recipientGDP).toFixed(2) + "%";
		
		
		$("#totalRecipientAid").text(total_aid.toLocaleString("en", {maximumFractionDigits: 2}));
		$("#recipientAIDProgress").css("width",gdpPercentage);
		$("#gdpProgressText").text(gdpPercentage);
		
		
		//Update recipient countries widget
		var countriesPecentage = (distribution.length*100/Recipients.length).toFixed(2) + "%";
		$("#donorCountries").text(distribution.length);
		
		
		//update GDP widget
		$("#recipientGDP").text(recipientGDP.toLocaleString("en", {maximumFractionDigits: 2}));
		
		////update Percapita widget
		var recipientPercapita = (total_aid*1000000)/((recipientGDP*1000000)/(Percapitas.filter(recs => recs["Country.Code"] == recipientCode )[0][year]));
		$("#recipientPercapta").text(recipientPercapita.toLocaleString("en", {maximumFractionDigits: 2}));
					
		$("#loading,#loading-overlay").hide();
	}
	
	// update plots and visuals when other selections are made
	$("#recipient, #aidType, #year").change(function(){
		recipientPlots( $("#recipient").val(), $("#aidType").val(), $("#year").val());
	});
	 
	

});