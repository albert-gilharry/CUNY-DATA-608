

$(document).ready(function(){
	$("#loading,#loading-overlay").show(); //show working indicator
	
	var aidData = []; // store large aid data set
	var Donors = []; // store transformed data of donors
	var DonorKeys = [];
	var Recipients = []; // store transformed data of recipients
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
		
		// group data by donors to facilitate analysis
		Donors = d3.group(aidData, d => d.Donor);
		Recipients = d3.group(aidData, d => d.Recipient);
		
		DonorKeys = Array.from(Donors.keys());
		Plotly.d3
			.select('#donor')
			.selectAll('option')
			.data(DonorKeys)
			.enter()
			.append('option')
			.text(function(d) {return d;})
			.attr('value', function(d) {return d;});
			
		// set default donor
		$("#donor").val("United States");	
		Donors = Array.from(Donors);
		Recipients = Array.from(Recipients);
		
		//initialize dashboard
		donorPlots( $("#donor").val(), $("#aidType").val(), $("#year").val());
	}
	
	// create plots based on donor data
	function donorPlots(donor, aidType, year){
		$("#loading,#loading-overlay").show();
			
			//update interface based on selected recipeint
			$(".donorLabel").text(donor);
			
			var regions = ["ASIA (EX. NEAR EAST)", "EASTERN EUROPE", "NORTHERN AFRICA", 
					   "OCEANIA", "WESTERN EUROPE", "SUB-SAHARAN AFRICA", "LATIN AMER. and CARIB", 
					   "C.W. OF IND. STATES", "NEAR EAST", "NORTHERN AMERICA", "BALTICS"]
			
			var region_aid = [0,0,0,0,0,0,0,0,0,0,0]
			
			var total_aid = 0
			
			// load and update data for each recipient country and each region
			for(i=0;i<country_codes.length;i++){
				aid = Donors[DonorKeys.indexOf(donor)][1].filter(recs => recs['Recipient'] == country_codes[i]['COUNTRY'] && recs['Year'] == year && recs['Aid type'] == aidType);
				
				if( aid.length != 0 ){
					country_codes[i]['VALUE'] = parseFloat(aid[0]['Value']);
					region_aid[regions.indexOf(country_codes[i]['REGION'])] += parseFloat(country_codes[i]['VALUE']);
					total_aid += parseFloat(aid[0]['Value']); 
				}
				else{
					country_codes[i]['VALUE'] = 0;
				}
			}
			
			// create map for distribution of aid to recipient countries 
			var data = [{
				type: 'choropleth',
				locations: country_codes.map(function(row) { return row['CODE']; }),
				z: country_codes.map(function(row) { return row['VALUE']; }),
				text: country_codes.map(function(row) { return row['COUNTRY']; }),
				colorscale: [
					[0,'rgb(5, 10, 172)'],[0.35,'rgb(40, 60, 190)'],
					[0.5,'rgb(70, 100, 245)'], [0.6,'rgb(90, 120, 245)'],
					[0.7,'rgb(106, 137, 247)'],[1,'rgb(220, 220, 220)']],
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
			
			
			// create pie chart for aid shares by region
			var data = [{
			  values: region_aid,
			  labels: regions,
			  type: 'pie'
			}];

			var layout = {
				showlegend: true,
				margin: {
					l: 0,
					r: 0,
					b: 0,
					t: 0,
					pad: 0
				}
			};
		
		Plotly.newPlot('regionPlot', data, layout);
		
		// plot top 50 countries receiving aid from this donor
		var distribution = country_codes.filter(recs => recs['VALUE'] != 0)	;
		//sort donor aid by recipient country
		distribution.sort(function (a, b) {
			return a.VALUE - b.VALUE;
		});
		
		
		var trace1 = {
			x: distribution.map(function(row) { return row['COUNTRY']; }).slice(-50),
			y: distribution.map(function(row) { return row['VALUE']; }).slice(-50),
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
		var donorCode = country_codes.filter(recs => recs['COUNTRY'] == donor)[0]["CODE"];
		var donorGDP = GDPs.filter(recs => recs["Country.Code"] == donorCode )[0][year]/1000000;
		var gdpPercentage = (total_aid*100/donorGDP).toFixed(2) + "%";
		
		
		$("#totalDonorAid").text(total_aid.toLocaleString("en", {maximumFractionDigits: 2}));
		$("#donorAIDProgress").css("width",gdpPercentage);
		$("#gdpProgressText").text(gdpPercentage);
		
		
		//Update recipient countries widget
		var countriesPecentage = (distribution.length*100/Recipients.length).toFixed(2) + "%";
		$("#countriesServed").text(distribution.length);
		$("#donorCountriesProgress").css("width",countriesPecentage);
		$("#countriesProgressText").text(countriesPecentage);
		
		
		//update GDP widget
		$("#donorGDP").text(donorGDP.toLocaleString("en", {maximumFractionDigits: 2}));
		
		////update Percapita widget
		var donorPercapita = (total_aid*1000000)/((donorGDP*1000000)/(Percapitas.filter(recs => recs["Country.Code"] == donorCode )[0][year]));
		$("#donorPercapta").text(donorPercapita.toLocaleString("en", {maximumFractionDigits: 2}));
		
		$("#loading,#loading-overlay").hide();
	}
	
	// update plots and visuals when other selections are made
	$("#donor, #aidType, #year").change(function(){
		donorPlots( $("#donor").val(), $("#aidType").val(), $("#year").val());
	});
	
	

});