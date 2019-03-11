function updateArrivals() {
  $('.arrivals-list').removeClass('new').addClass('old');
	$.ajax({
    url: '/s/' + $('.station').data('station-id') + '/update',
		dataType: 'json',
    success: function(data, textStatus, jqXHR) {
			$('.direction-1 .arrivals-list.old:first').before('<div class="arrivals-list new">' + data.markup.dir1 + '</div>');
			$('.direction-5 .arrivals-list.old:first').before('<div class="arrivals-list new">' + data.markup.dir5 + '</div>');
			$('.time-refresh-content').html(data.markup.timeUpdate);

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
			url: '/s/' + $('.station').data('station-id') + '/alerts',
			dataType: 'json',
	    success: function(data, textStatus, jqXHR) {
				if (data.markup) {
					$('header').after(data.markup);
					$('h1').append('<div class="alert-toggle"></div>').promise().done(function() {
						$('.alert-toggle').click(function() {
							$('.alerts').toggleClass('active');
						});
					});
				}
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
