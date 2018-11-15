$(document).ready(function(){
	
	$(".alert-danger").hide();
	$(".alert-success").hide();
	
	//Question 1
	$("#reverse").click(function(){
		if($("#word").val() == ""){
			
			$.alert({
				theme: 'bootstrap',
				title: 'Error',
				content: '<div style="color:red;">Please enter a word or sentence.</div>',
				type: 'failure',
				escapeKey: true,
				backgroundDismiss: true,
				closeIcon: true,
			});
			
			return;
		}
		
		
		// code to reverse text using pure JS
		var word = $("#word").val();
		var reversed = "";
		for(i = word.length - 1; i >= 0; i--){
			reversed += word[i];
		}
		
		
		$.alert({
			theme: 'bootstrap',
			title: 'Your input reversed is:',
			content: reversed,
			escapeKey: true,
			backgroundDismiss: true,
		});
	});
	
	//Question 2
	$("#multiples").click(function(){
		var num = parseInt( $("#num").val() )
		if( (num == NaN) || !(num > 0 && num <= 100)  ){
			
			$.alert({
				theme: 'bootstrap',
				title: 'Error',
				content: '<div style="color:red;">Please ennter an integer between 1 and 100.</div>',
				type: 'failure',
				escapeKey: true,
				backgroundDismiss: true,
				closeIcon: true,
			});
			
			return;
		}
		
		table = "<table border = '1' align = 'center' >";
		row = "<tr>";
		for(i = 1; i <= 20; i++){
			
			row += ("<td>" + (num * i) + "</td>");
			
			if((i % 4) == 0){
				row += "</tr>";
				table += row;
				row = "";
			}
			
			if((i % 4) == 0 && i != 20){row += "<tr>";}			
		}
		table += "</table>";
		
		$.alert({
			theme: 'bootstrap',
			title: 'The first 20 multiples of ' + num + ' are:',
			content: table,
			escapeKey: true,
			backgroundDismiss: true,
		});
	});
	
	
	
});