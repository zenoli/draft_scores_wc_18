$(document).ready(function () {
	$('#nav-top').click(function() {
		var thisTop = $('#placeholder-top').offset().top;
		
		$('html,body').animate({ scrollTop: thisTop }, 'slow');
        return false; 
	});
	
	$('#nav-about').click(function() {
        var thisTop = $('#placeholder-about').offset().top;
		
		$('html,body').animate({ scrollTop: thisTop }, 'slow');
        return false; 
	});
	
	$('#nav-theses').click(function() {
		var thisTop = $('#placeholder-theses').offset().top;
		
		$('html,body').animate({ scrollTop: thisTop }, 'slow');
        return false; 
	});
	
	$('#nav-teaching').click(function() {
		var thisTop = $('#placeholder-teaching').offset().top;
		
		$('html,body').animate({ scrollTop: thisTop }, 'slow');
        return false; 
	});
	
	$('#nav-interests').click(function() {
		var thisTop = $('#placeholder-interests').offset().top;
		
		$('html,body').animate({ scrollTop: thisTop }, 'slow');
        return false; 
	});
	
	$('#mobile-nav-about').click(function() {
        var thisTop = $('#placeholder-about').offset().top;
		
		$('html,body').animate({ scrollTop: thisTop }, 'slow');
        return false; 
	});
	
	$('#mobile-nav-theses').click(function() {
		var thisTop = $('#placeholder-theses').offset().top;
		
		$('html,body').animate({ scrollTop: thisTop }, 'slow');
        return false; 
	});
	
	$('#mobile-nav-teaching').click(function() {
		var thisTop = $('#placeholder-teaching').offset().top;
		
		$('html,body').animate({ scrollTop: thisTop }, 'slow');
        return false; 
	});
	
	$('#mobile-nav-interests').click(function() {
		var thisTop = $('#placeholder-interests').offset().top;
		
		$('html,body').animate({ scrollTop: thisTop }, 'slow');
        return false; 
	});
});