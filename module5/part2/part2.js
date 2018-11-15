$(document).ready(function(){
	
	var data = []
	//Question 1
	Plotly.d3.csv('./data/presidents.csv', function(rows) {
		
		var table = "<table class = 'table table-bordered'><tr><th>Name</th><th>Height</th><th>Weight</th></tr>";
		
		rows.forEach(function(row) {
			table += ("<tr><td>" + row['Name'] + "</td><td>" + row['Height'] + "</td><td>" + row['Weight'] + "</td></tr>");
		});
		
		table += "</table>";
		
		$("#tbl").html(table);
		
		data = rows;
	});
	
	//Question 2
	$("#search").click(function(){
		if($("#name").val() == ""){
			
			$.alert({
				theme: 'bootstrap',
				title: 'Error',
				content: '<div style="color:red;">Please enter a name.</div>',
				type: 'failure',
				escapeKey: true,
				backgroundDismiss: true,
				closeIcon: true,
			});
			
			return;
		}
		
		
		var name = $("#name").val();
		for( i = 0; i < data.length; i++ ){
			if( data[i]['Name'].toLowerCase() == name.trim().toLowerCase()){ 
				$.alert({
					theme: 'bootstrap',
					title: 'Result:',
					content: "President " + data[i]['Name'] + "'s height is " + data[i]['Height'] + " and his weight is " + data[i]['Weight'],
					escapeKey: true,
					backgroundDismiss: true,
				});
				return; 
			}
		}
		
		$.alert({
			theme: 'bootstrap',
			title: 'Sorry',
			content: 'No matching result for your input.',
			escapeKey: true,
			backgroundDismiss: true,
		});
	});

});