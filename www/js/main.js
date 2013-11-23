// JavaScript Document
$(document).ready(function(){
	
	/*Swipe Module*/
	var swipeModule = SWIPEMODULE;
		swipeModule.init();


	//display search box
	$('div#search_box').hide();  
	$('a#search_button').click(function(){
		$('div#search_box').slideToggle('fast');   	
	});
	
	//
	$('input.location').focus(function(){
		if($(this).val().toLowerCase()!="")
		$(this).val('');
	});
	
	$('a#clearDetectLocation').click(function(){
		$('input.location').val('');
	});
});

$(document).on('pagebeforeshow', function() {
	$('div.left_panel_menu ul li a').each(function(index,element){
		$(this).parent().removeClass("active");
		 var active = '#' + $.mobile.activePage[0].id;
		if ($(this).attr('href') == active) {
			$(this).parent().addClass('active');
		}
	});
});