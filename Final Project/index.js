$(document).ready(function(){
	$("#loading,#loading-overlay").show(); //show working indicator
	var aidData = []; // store large aid data set
	$('#sampleTable').dataTable({
		"paging":   false,
		"ordering": false,
		"info":     true,
		"filter":     false,
		"lengthChange": false,
		"columns": [
                    { "data": "AIDTYPE"},
                    { "data": "Aid type"},
					{ "data": "Amount type"},
                    { "data": "DATATYPE"},
                    { "data": "DONOR"},
					{ "data": "Flags"},
					{ "data": "Part"},
                    { "data": "PowerCode"},
                    { "data": "Recipient"},
					{ "data": "Reference Period"},
					{ "data": "Unit"},
                    { "data": "Value"},
					{ "data": "Year"}
        ],      
	});
	
	//load main data file with aid data
	Plotly.d3.csv('data/data.csv', function(rows) {
		aidData = rows;
		preProcess();
	});
	
	function preProcess(){
		var table = $('#sampleTable').DataTable();	
		table.clear();
		table.rows.add(aidData.slice(1,10)).draw();
		$("#loading,#loading-overlay").hide();
	}
});