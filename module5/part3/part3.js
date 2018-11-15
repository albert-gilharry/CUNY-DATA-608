function updatePlot(){
	var sidewalkStatus = document.getElementById("sidewalk-status")
	
	Plotly.d3.json('http://localhost:5000/trees/sidewalk/' + sidewalkStatus.value + '/1000', function(rows) {
  
		// Build list of unique metros
		var  boros = ['Bronx', 'Brooklyn', 'Manhattan', 'Queens', 'Staten Island']
		var trees = [0, 0, 0, 0, 0];
	  
	  
	  
		rows.forEach(function(row) {
			trees[boros.indexOf(row['boroname'])] += 1;
		});
		
		console.log(trees);
		
		var trace1 = {
			  x: boros,
			  y: trees,
			  type: 'bar',
			  text: trees.map(String),
			  textposition: 'auto',
			  hoverinfo: 'none',
			  marker: {
				color: ['red','purple', 'blue', 'green', 'yellow'],
				opacity: 0.6,
				line: {
				  color: 'rgb(8,48,107)',
				  width: 1.5
				}
			  }
		};

		var data = [trace1];

		var layout = {
		  title: sidewalkStatus.options[sidewalkStatus.selectedIndex].text + ' Sidewalks by Borough'
		};

		Plotly.newPlot('plot', data, layout);

	});
}

updatePlot();

