function updateArrivals() {
  $('.arrivals-list').removeClass('new').addClass('old');
	$.ajax({
    url: '/update_station_arrivals',
		data: {
			id: $('.station').data('station-id')
		},
    success: function() {
      $('.arrivals-list.old').each(function() {
        var oldHeight = $(this).outerHeight();
        $(this).parent().css('height', oldHeight);
        $(this).addClass('updating');
        var thisList = $(this);
				setTimeout(function() {
					thisList.addClass('updated');
				}, 1000);
      });
      setTimeout(function() {
				$('.arrivals-list-wrap').css('height', 'auto')
			}, 2000);
			setTimeout(function() {
				$('.arrivals-list.old').remove();
			}, 3000);
    }
  });
}

jQuery(document).ready(function($) {

  // $('.get-nearest-link').click(function() {
  //   if (navigator.geolocation) {
  //     $('.nearest-station-wrap').html('<div class="finding-nearest-station">Finding Nearest Station...</div>');
	// 		navigator.geolocation.getCurrentPosition(function(position) {
  //       $.ajax({
  //         url: '/find_nearest_station',
	// 				data: {
	// 					lat: position.coords.latitude,
	// 					lng: position.coords.longitude
	// 				}
	// 			});
  //     }, function(error) {
	// 			$('.nearest-station-wrap').html('Unable to find location.');
	// 		});
  //   }
  // });

  $('.route-title').click(function() {
    if ($(this).parent().hasClass('active')) {
			$(this).parent().removeClass('active');
    } else {
      $(this).parent().addClass('active');
			$('html, body').animate({
				scrollTop: $(this).offset().top
			}, 300);
    }
  });

  if ($('body').hasClass('station')) {
    $.ajax({
      url: '/display_alerts',
			data: {
				id: $('.station').data('station-id')
			},
			success: function() {
				setTimeout(function() {
					$('.alert-toggle').addClass('loaded');
				}, 500);
      }
    });
    setInterval(updateArrivals, 30 * 1000);
		$('.arrival').click(function() {
			$(this).toggleClass('active');
		});
  }
});
