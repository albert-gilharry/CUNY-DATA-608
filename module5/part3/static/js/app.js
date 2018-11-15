$(document).ready(function(){
	$(".alert-danger").hide();
	$(".alert-success").hide();
	
	$('#damageTable').dataTable({
		"paging":   true,
		"ordering": false,
		"info":     true,
		"lengthChange": true,
		"columns": [
                    { "data": "tree_id"},
                    { "data": "boroname"},
					{ "data": "sidewalk"},
                    { "data": "latitude"},
                    { "data": "longitude"},
					{ "data": "zipcode"},
        ],      
	});
	
	$('#nodamageTable').dataTable({
		"paging":   true,
		"ordering": false,
		"info":     true,
		"lengthChange": true,
		"columns": [
                    { "data": "tree_id"},
                    { "data": "boroname"},
					{ "data": "sidewalk"},
                    { "data": "latitude"},
                    { "data": "longitude"},
					{ "data": "zipcode"},
        ],      
	});
	
	function loadAPIDamage(){
		$(".alert-danger").hide();
		$(".alert-success").hide();
		
		$.ajax({
			url: 'trees/sidewalk/Damage',
			type: 'GET',
			beforeSend: function() {
				$("#loading,#loading-overlay").show();
			},
			complete: function(){
				loadAPINoDamage();
			},
			success: function(response){
				results = JSON.parse(response);						
				var table = $('#damageTable').DataTable();	
				table.clear();
				table.rows.add(results).draw();
			},
			error: function(error) {
				$("#mainError").show();
				$(".alert-success").hide();
				$("#mainErrorText").text("Sorry, we were unable to perform your request, please try again.");
				$("#loading,#loading-overlay").hide();
			}
		});
	}
	
	function loadAPINoDamage(){
		$(".alert-danger").hide();
		$(".alert-success").hide();
		
		$.ajax({
			url: 'trees/sidewalk/NoDamage',
			type: 'GET',
			beforeSend: function() {
				$("#loading,#loading-overlay").show();
			},
			complete: function(){
				$("#loading,#loading-overlay").hide();
			},
			success: function(response) {
				results = JSON.parse(response);						
				var table = $('#nodamageTable').DataTable();	
				table.clear();
				table.rows.add(results).draw();
			},
			error: function(error) {
				$("#mainError").show();
				$(".alert-success").hide();
				$("#mainErrorText").text("Sorry, we were unable to perform your request, please try again.");
				$("#loading,#loading-overlay").hide();
			}
		});
	}
	
	loadAPIDamage();
});