
$('#recipeCarousel').carousel({
  interval: 5000
});

$('.carousel .carousel-item').each(function(){
    var minPerSlide = 4;
    var next = $(this).next(':first');
    if (!next.length) {
    next = $(this).siblings(':first-child');
    }
    next.children(':first-child').appendTo($(this));
    
    for (var i=1;i<minPerSlide;i++) {
        next=next.next();
        if (!next.length) {
        	next = $(this).siblings(':first');
      	}
        
        next.children(':first-child').clone().appendTo($(this));
      }
});
