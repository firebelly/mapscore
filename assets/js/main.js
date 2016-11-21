var MapsCorps = (function($) {

  var $header = $('.site-header'),
      $nav = $('.site-nav'),
      $document = $(document),
      loadingTimer,
      $paymentForm = $('#payment-form'),
      map,
      markers = [],
      shadowMarkers = [],
      customIcons = [],
      statusColors = [],
      infoWindow,
      currentCity = {},
      currentCommunity = '',
      markerZ = 0,
      images_dir = '/Content/Images/',
      svgs_dir = '/Content/Svgs/';
      // images_dir = '/assets/images/',
      // svgs_dir = '/assets/svgs/';

  function _init() {
    // Touch-friendly fast clicks
    FastClick.attach(document.body);

    $('body').addClass('loaded');

    // Inject all svgs onto page so they can be pulled with xlinks and can be styled as if inline.
    _injectSvgSprite();

    // Map page behavior
    if ($('body.map-page').length) {
      // Handle interactivity for map search menu
      _initMapPage();
      google.maps.event.addDomListener(window, 'load', MapsCorps.initMapPageMap);
    }

    // Homepage-only behavior
    if ($('body.home').length) {
      // Update several links to one-scolling-page-of-sections behavior
      $('h1.logo a').attr('href', '#top').addClass('smoothscroll');
      $('.site-nav a:not(.donate-toggle)').each(function() {
        // remove / from href, add .smoothscroll
        $(this).attr('href', $(this).attr('href').replace('/','')).addClass('smoothscroll');
      });
      _initScrollspy();
      _initHomepageMapsTabs();
      google.maps.event.addDomListener(window, 'load', MapsCorps.initMaps);
    }

    _initExpandables();
    _initMobileNav();
    _stickyNav();
    _initDonate();

    // Esc handlers
    $(document).keyup(function(e) {
      if (e.keyCode === 27) {
        if($('body').is('.nav-active')) {
          _hideNav();
        }
        _hideDonateForm();
      }
    });

    // Smoothscroll links
    $('a.smoothscroll, .smoothscroll a').click(function(e) {
      e.preventDefault();
      var href = $(this).attr('href');
      if ($(this).attr('data-offset') !== '') {
        var offset = $(this).data('offset');
        _scrollBody($(href), 250, 0, offset);
      } else {
        _scrollBody($(href), 250, 0);
      }
    });

    // Scroll down to hash afer page load
    $(window).load(function() {
      if (window.location.hash) {
        _scrollBody($(window.location.hash));
      }
    });

    _initStripe();

  } // end init()

  // Expandable field groups
  function _initExpandables() {
    $('.expandable-group').addClass('collapsed').find('.fields').slideUp(0);
    $('.expandable-group h2').on('click', function(e) {
      var $group = $(this).closest('.expandable-group');
      $group.toggleClass('collapsed');
      $(this).next('.fields').velocity($group.hasClass('collapsed') ? 'slideUp' : 'slideDown', {duration: 250});
    });
  }

  function _scrollBody(element, duration, delay, offset) {
    if (offset || offset !== undefined) {
      setOffset = offset;
    } else {
      setOffset = $header.outerHeight();
    }
    element.velocity('scroll', {
      duration: duration,
      delay: delay,
      offset: -setOffset
    }, 'easeOutSine');
  }

  function _initMobileNav() {
    $('.menu-toggle').on('click', function() {

      if ($nav.is('.-active')) {
        _hideNav();
      } else {
        _showNav();
      }

      $document.on('click', function(e) {
        if (!$(e.target).is('.menu-toggle') && !$(e.target).is('.site-nav') && $('.site-nav').is('.-active')) {
          _hideNav();
        }
      });

    });
  }

  function _showNav() {
    $('.menu-toggle').addClass('menu-open');
    $('body').addClass('nav-active');
    $nav.addClass('-active');
  }

  function _hideNav() {
    $('.menu-toggle').removeClass('menu-open');
    $nav.removeClass('-active');
    $('body').removeClass('nav-active');
  }

  function _stickyNav() {
    var $introSection = $('.intro-section');

    if($(window).scrollTop() >= $introSection.offset().top + $introSection.outerHeight()) {
      $header.addClass('-sticky');
    }

    $(window).on('scroll', function() {
      if($(window).scrollTop() >= $introSection.offset().top + $introSection.outerHeight()) {
        $header.addClass('-sticky');
      } else {
        $header.removeClass('-sticky');
      }
    });
  }

  // Scrollspy
  function _initScrollspy() {
    // Cache selectors
    var lastId,
        headerHeight = $header.outerHeight(),
        // All list items
        menuItems = $header.find(".site-nav ul a:not(.no-scrollspy)"),
        // Anchors corresponding to menu items
        scrollItems = menuItems.map(function(){
          var item = $($(this).attr("href"));
          if (item.length) { return item; }
        });

    // Bind to scroll
    $(window).scroll(function(){
       // Get container scroll position
       var fromTop = $(this).scrollTop()+headerHeight;

       // Get id of current scroll item
       var cur = scrollItems.map(function(){
         if ($(this).offset().top < fromTop + $header.outerHeight())
           return this;
       });
       // Get the id of the current element
       cur = cur[cur.length-1];
       var id = cur && cur.length ? cur[0].id : "";

       if (lastId !== id) {
           lastId = id;
           // Set/remove active class
           menuItems
             .parent().removeClass("-active")
             .end().filter("[href='#"+id+"']").parent().addClass("-active");
       }
    });
  }

  // Init donation form buttons
  function _initDonate() {
    // Donate togglers
    $document.on('click', '.donate-toggle', function(e) {
      e.preventDefault();
      _showDonateForm();
    });
    $document.on('click', '.donate-close', function(e) {
      e.preventDefault();
      _hideDonateForm();
    });
  }

  // Show/hide donation overlay
  function _showDonateForm() {
    $('body').addClass('donation-form-active');
    $('#donate').addClass('-active');
  }
  function _hideDonateForm() {
    $('body').removeClass('donation-form-active');
    $('#donate').removeClass('-active -success');
  }

  // Nav to swap out maps
  function _initHomepageMapsTabs() {
    $document.on('click', '.maps-list a', function(e) {
      e.preventDefault();
      var $target = $($(this).attr('href'));
      var $mapsGroup = $(this).closest('.maps');
      $mapsGroup.find('li.-active').removeClass('-active');
      var $li = $(this).closest('li').addClass('-active');
      $target.addClass('-active');
      // Swap out large map link if available
      if ($(this).attr('data-map-link')) {
        $mapsGroup.find('.map-link').attr('href', $(this).attr('data-map-link')).find('span').text($(this).text());
      }
    });
  }

  // Get PartnerMaps json and populate map data
  function _initMaps() {
    $.getJSON('../partnerMaps.json', {_: new Date().getTime()}, function(data) {
      $.each(data.partnerMaps, function(i) {
       _initPartnerMap(this.partnerLat, this.partnerLng, this.elementID, this.partnerZoom, this.partnerLocations);
      });
    }).fail(function(a,b,c) {
      console.log('partner map init failed: ',a,b,c);
    });

    $.getJSON('../communityMaps.json', {_: new Date().getTime()}, function(data) {
      statusColors = data.statusColors;
      $.each(data.communityMaps, function(i) {
       _initCommunityMap(this.lat, this.lng, this.elementID, this.zoom, this.communities);
      });
    }).fail(function(a,b,c) {
      console.log('community map init failed: ',a,b,c);
    });
  }

  function _initCommunityMap(lat,lng,id,zoom,communities) {
    var communityInfoWindow = new google.maps.InfoWindow({maxWidth: 260});
    var mapOptions = {
        center: new google.maps.LatLng(lat, lng),
        zoom: zoom,
        zoomControl: true,
        zoomControlOptions: {
            style: google.maps.ZoomControlStyle.DEFAULT,
        },
        disableDoubleClickZoom: true,
        mapTypeControl: false,
        scaleControl: false,
        scrollwheel: false,
        panControl: true,
        streetViewControl: false,
        draggable : true,
        overviewMapControl: true,
        overviewMapControlOptions: {
            opened: false,
        },
        mapTypeId: google.maps.MapTypeId.ROADMAP,
        styles: [{"featureType":"administrative","elementType":"labels.text.fill","stylers":[{"color":"#444444"}]},{"featureType":"landscape","stylers":[{"color":"#f2f2f2"}]},{"featureType":"landscape.man_made","elementType":"geometry.fill","stylers":[{"color":"#d8d8d8"}]},{"featureType":"poi","stylers":[{"visibility":"off"}]},{"featureType":"road","stylers":[{"saturation":-100},{"lightness":45}]},{"featureType":"road.arterial","elementType":"geometry.fill","stylers":[{"color":"#CECFD1"}]},{"featureType":"road.arterial","elementType":"geometry.stroke","stylers":[{"visibility":"off"}]},{"featureType":"road.arterial","elementType":"labels","stylers":[{"visibility":"off"}]},{"featureType":"road.arterial","elementType":"labels.icon","stylers":[{"visibility":"off"}]},{"featureType":"road.highway","stylers":[{"visibility":"simplified"}]},{"featureType":"road.highway","elementType":"geometry.fill","stylers":[{"color":"#bbbbbb"}]},{"featureType":"road.highway","elementType":"labels","stylers":[{"visibility":"off"}]},{"featureType":"road.local","elementType":"geometry.fill","stylers":[{"color":"#CECFD1"}]},{"featureType":"road.local","elementType":"geometry.stroke","stylers":[{"visibility":"off"}]},{"featureType":"road.local","elementType":"labels","stylers":[{"visibility":"off"}]},{"featureType":"transit","stylers":[{"visibility":"off"}]},{"featureType":"water","stylers":[{"color":"#c5c5c5"},{"visibility":"on"}]},{"featureType":"water","elementType":"labels","stylers":[{"visibility":"off"}]}]
    };
    var mapElement = document.getElementById(id);
    var communityMap = new google.maps.Map(mapElement, mapOptions);
    var communityOutlines = [];
    for (i = 0; i < communities.length; i++) {
      var communityOutline = new google.maps.Polygon({
        paths: communities[i].path,
        strokeColor: '#eeeeee',
        strokeOpacity: 0.8,
        strokeWeight: 2,
        fillColor: statusColors[communities[i].status],
        fillOpacity: 0.5,
        name: communities[i].name,
        url: communities[i].url,
        selected: false
      });
      communityOutline.setMap(communityMap);

      google.maps.event.addListener(communityOutline, 'click', function(e) {
        var communityDetails = "<h4>" + this.name + "</h4>"+
          '<p><a href="'+this.url+'">View Resources</a></p>';
        communityInfoWindow.setContent(communityDetails);
        communityInfoWindow.setPosition(e.latLng);
        communityInfoWindow.open(communityMap);
        communityOutlines.forEach(function(el) {
          el.setOptions({ fillOpacity: 0.5, selected: false });
        });
        this.setOptions({fillOpacity: 0.8, selected: true});
      });
      google.maps.event.addListener(communityOutline, 'mouseover', function(e) {
        this.setOptions({fillOpacity: 0.8});
      });
      google.maps.event.addListener(communityOutline, 'mouseout', function(e) {
        if (!this.get('selected')) {
          this.setOptions({fillOpacity: 0.5});
        }
      });
      communityOutlines.push(communityOutline);
    }


  }

  function _initPartnerMap(partnerLat, partnerLng, id, partnerZoom, partnerLocations) {
    var partnerInfoWindow = new google.maps.InfoWindow({maxWidth: 260});
    var mapOptions = {
        center: new google.maps.LatLng(partnerLat, partnerLng),
        zoom: partnerZoom,
        zoomControl: true,
        zoomControlOptions: {
          style: google.maps.ZoomControlStyle.DEFAULT,
        },
        disableDoubleClickZoom: true,
        mapTypeControl: false,
        scaleControl: false,
        scrollwheel: false,
        panControl: true,
        streetViewControl: false,
        draggable : true,
        overviewMapControl: true,
        overviewMapControlOptions: {
          opened: false,
        },
        mapTypeId: google.maps.MapTypeId.ROADMAP,
        styles: [{ "featureType": "administrative", "elementType": "labels.text.fill", "stylers": [{ "color": "#444444" }] }, { "featureType": "landscape", "elementType": "all", "stylers": [{ "color": "#f2f2f2" }] }, { "featureType": "landscape.man_made", "elementType": "geometry.fill", "stylers": [{ "color": "#d8d8d8" }] }, { "featureType": "poi", "elementType": "all", "stylers": [{ "visibility": "off" }] }, { "featureType": "road", "elementType": "all", "stylers": [{ "saturation": -100 }, { "lightness": 45 }] }, { "featureType": "road.highway", "elementType": "all", "stylers": [{ "visibility": "simplified" }] }, { "featureType": "road.highway", "elementType": "geometry.fill", "stylers": [{ "color": "#ff3566" }] }, { "featureType": "road.highway", "elementType": "labels", "stylers": [{ "visibility": "off" }] }, { "featureType": "road.arterial", "elementType": "geometry.fill", "stylers": [{ "color": "#f2ff3d" }] }, { "featureType": "road.arterial", "elementType": "geometry.stroke", "stylers": [{ "visibility": "off" }] }, { "featureType": "road.arterial", "elementType": "labels", "stylers": [{ "visibility": "off" }] }, { "featureType": "road.arterial", "elementType": "labels.icon", "stylers": [{ "visibility": "off" }] }, { "featureType": "road.local", "elementType": "geometry.fill", "stylers": [{ "color": "#f2ff3d" }] }, { "featureType": "road.local", "elementType": "geometry.stroke", "stylers": [{ "visibility": "off" }] }, { "featureType": "road.local", "elementType": "labels", "stylers": [{ "visibility": "off" }] }, { "featureType": "transit", "elementType": "all", "stylers": [{ "visibility": "off" }] }, { "featureType": "water", "elementType": "all", "stylers": [{ "color": "#46bcec" }, { "visibility": "on" }] }, { "featureType": "water", "elementType": "geometry.fill", "stylers": [{ "color": "#51c9ea" }] }, { "featureType": "water", "elementType": "labels", "stylers": [{ "visibility": "off" }] }]
    };
    var mapElement = document.getElementById(id);
    var partnerMap = new google.maps.Map(mapElement, mapOptions);
    var locations = partnerLocations;
    var address,telephone,email,web,markericon,subtitle;

    for (i = 0; i < locations.length; i++) {
      if (locations[i][1] === 'undefined') { address = '';} else { address = locations[i][1]; }
      if (locations[i][2] === 'undefined') { telephone = ''; } else { telephone = locations[i][2]; }
      if (locations[i][3] === 'undefined') { email = ''; } else { email = locations[i][3]; }
      if (locations[i][4] === 'undefined') { web = ''; } else { web = locations[i][4]; }
      if (locations[i][7] === 'undefined') { markericon = images_dir + 'pin-sm.png'; } else { markericon = locations[i][7]; }
      if (locations[i][8] === 'undefined') {subtitle = ''; } else { subtitle = locations[i][8]; }
      marker = new google.maps.Marker({
          icon: markericon,
          position: new google.maps.LatLng(locations[i][5], locations[i][6]),
          map: partnerMap,
          title: locations[i][0],
          subtitle: subtitle,
          address: address,
          tel: telephone,
          email: email,
          web: web
      });

      google.maps.event.addListener(marker, 'click', function() {
          var localTitle = '<h4>' + this.title + '</h4>';
          if (this.subtitle !== '')
              localTitle = '<p style="font-weight:bold">' + this.subtitle + '</p>' + localTitle;

        var partnerDetails = localTitle +
          '<p>'+this.address+'</p><br>'+
          '<p><a href="'+this.web+'" target="_blank">'+this.web+'</a></p>'+
          '<p><a href="mailto:'+this.email+'">'+this.email+'</a></p>'+
          '<p>' + this.tel + '</p>';

        partnerInfoWindow.setContent(partnerDetails);
        partnerInfoWindow.open(partnerMap, this);
      });
    }

    google.maps.event.addDomListener(window, 'resize', function() {
        partnerMap.setCenter(new google.maps.LatLng(partnerLat, partnerLng));
    });
  }

  // Inject all svgs onto page so they can be pulled with xlinks and can be styled as if inline.
  function _injectSvgSprite() {
    boomsvgloader.load(svgs_dir + 'build/svgs-defs.svg');
  }

  // Track ajax pages in Analytics
  function _trackPage() {
    if (typeof ga !== 'undefined') { ga('send', 'pageview', document.location.href); }
  }

  // Track events in Analytics
  function _trackEvent(category, action) {
    if (typeof ga !== 'undefined') { ga('send', 'event', category, action); }
  }

  // Quickie email check
  function _isValidEmail(email) {
    var pattern = /^([a-z\d!#$%&'*+\-\/=?^_`{|}~\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF]+(\.[a-z\d!#$%&'*+\-\/=?^_`{|}~\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF]+)*|"((([ \t]*\r\n)?[ \t]+)?([\x01-\x08\x0b\x0c\x0e-\x1f\x7f\x21\x23-\x5b\x5d-\x7e\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF]|\\[\x01-\x09\x0b\x0c\x0d-\x7f\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF]))*(([ \t]*\r\n)?[ \t]+)?")@(([a-z\d\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF]|[a-z\d\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF][a-z\d\-._~\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF]*[a-z\d\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])\.)+([a-z\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF]|[a-z\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF][a-z\d\-._~\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF]*[a-z\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])\.?$/i;
    return pattern.test(email);
  }

  function _initStripe() {
    // Test Key
    Stripe.setPublishableKey('pk_test_QUYqxyP4xtV4vsBbhb1WylV3'); // nate's stripe test key
    // Stripe.setPublishableKey('pk_test_fchY3vnT8N63k3zcpGKKBFbu');
    // Live Key
    // Stripe.setPublishableKey('pk_live_FGOFvyNZ1AFNuvDvYAq6KOIG');

    // Add * next to required input labels
    $paymentForm.find('input[required]').each(function() {
      var l = $(this).siblings('label:first');
      $('<span class="req">*</span>').appendTo(l);
    });

    // Init jquery.payment field types
    $('#ccNum').payment('formatCardNumber');
    $('#ccExp').payment('formatCardExpiry');

    $paymentForm.on('submit', function(e) {
      e.preventDefault();
      // Clear out error classes
      $paymentForm.find('input,textarea').removeClass('error');
      // Activate form feedback div and
      $('#formFeedback').text('Processing...').addClass('-active');
      var error = '';

      if (!_verifyDonateInfo()) {
        error = 'Please complete all required fields';
      } else if (!_isValidEmail($('#inEmail').val())) {
        $('#inEmail').addClass('error');
        error = 'Please enter a valid email';
      }
      if (!error) {
        error = _verifyDonateAmount();
      }
      if (!error) {
        error = _verifyDonateCardNumber();
      }

      if (!error) {
        Stripe.card.createToken($paymentForm, MapsCorps.stripeResponseHandler);
      } else {
        _donationError(error);
      }
    });
  }

  function _verifyDonateInfo() {
    var num_errors = 0;
    $paymentForm.find('input[required]').each(function() {
      if ($(this).val()==='') {
        $(this).addClass('error');
        num_errors++;
      }
    });
    return (num_errors===0);
  }

  function _verifyDonateCardNumber() {
    var error = '';
    var cardNumValid = $.payment.validateCardNumber($('#ccNum').val());

    if (cardNumValid) {
      var exp = $('#ccExp').payment('cardExpiryVal');
      var cardExpValid = $.payment.validateCardExpiry(exp.month, exp.year);
      if (cardExpValid) {
        var cardType = $.payment.cardType($('#ccNum').val());
        var cardCVCValid = false;
        if (cardType !== null) {
          switch (cardType) {
            case 'amex':
              cardCVCValid = $.payment.validateCardCVC($('#ccCvc').val(), 'amex');
              break;
            default:
              cardCVCValid = $.payment.validateCardCVC($('#ccCvc').val());
          }
          if (!cardCVCValid) {
            error = 'CVV invalid';
          }
        } else {
          error = 'Card is not recognized';
        }
      } else {
        $('#ccExp').addClass('error');
        error = 'Expiration date invalid';
      }
    } else {
      $('#ccNum').addClass('error');
      error = 'Card Number Invalid';
    }

    return error;
  }

  function _verifyDonateAmount() {
    var selectedAmount = $paymentForm.find('.radios input[type=radio]:checked').val();
    var result = '';
    if (typeof selectedAmount !== "undefined" && selectedAmount !== null) {
      if (selectedAmount === 'other') {
        var enteredAmount = $('#inOther').val();
        if (enteredAmount === null || enteredAmount === '') {
          result = 'Please enter an amount';
          $('#inOther').addClass('error');
        } else {
          if (!$.isNumeric(enteredAmount)) {
            result = 'Amount must be numeric.';
          } else {
            $('#hidAmount').val(enteredAmount);
          }
        }
      } else {
        $('#hidAmount').val(selectedAmount);
      }
    } else {
      result = 'Please select an amount';
    }

    return result;
  }

  // Submit donation details to backend
  function _stripeCallback(response) {
    if (response.error) {
      if (response.error.message.match(/no such token/i)) {
        _donationError('Invalid payment token. Please try again.');
      } else {
        _donationError(response.error.message);
      }

    } else {

      // Build object of donation fields
      var params = {
        'firstName': $('#inFirstName').val(),
        'lastName': $('#inLastName').val(),
        'company': $('#inComp').val(),
        'email': $('#inEmail').val(),
        'comments': $('#txtMessage').val(),
        'amount': $('#hidAmount').val(),
        'address1': $('#inAddress1').val(),
        'address2': $('#inAddress2').val(),
        'city': $('#inCity').val(),
        'state': $('#inState').val(),
        'zip': $('#inZip').val(),
        'message': $('#txtMessage').val(),
        'partner_firstName': $('#inFirstNamePartner').val(),
        'partner_lastName': $('#inLastNamePartner').val(),
        'special_firstName': $('#inFirstNameSpecial').val(),
        'special_lastName': $('#inLastNameSpecial').val(),
        'recipient_firstName': $('#inFirstNameRecipient').val(),
        'recipient_lastName': $('#inLastNameRecipient').val(),
        'recipient_address1': $('#inAddress1Recipient').val(),
        'recipient_address2': $('#inAddress2Recipient').val(),
        'recipient_city': $('#inCityRecipient').val(),
        'recipient_state': $('#inStateRecipient').val(),
        'recipient_zip': $('#inZipRecipient').val()
      };

      // Send donation info to backend for emails
      $.ajax({
        url: '/Tool/SendPaymentInfo/',
        type: 'POST',
        data: JSON.stringify(params),
        dataType: 'json',
        contentType: 'application/json'
      });

        // Show success notice
      $('#donate').addClass('-success');

        // Reset form
      $paymentForm[0].reset();
      $('#formFeedback').text('').removeClass('-active');
      $paymentForm.find('input.submit').prop('disabled', false);

        // Scroll #donate up to show success notice (in case we're on mobile)
      $('#donate')[0].scrollTop = 0;
    }
  }

  // This is called after Stripe creates the payment token
  function _stripeResponseHandler(status, response) {
    if (response.error) {
      // Show the errors on the form:
      _donationError(response.error.message);
      $paymentForm.find('input.submit').prop('disabled', false); // Re-enable submission

    } else { // Token was created!

      var token = response.id;
      var amount = $('#hidAmount').val();
      // Submit the form to process payment in backend
      if (token !== null && token !== '') {

        // Disable submit button to avoid multiple submits
        $paymentForm.find('input.submit').prop('disabled', true);

        // Send payment to backend to handle Stripe transaction
        $.ajax({
            //url: 'https://gentle-temple-97638.herokuapp.com/node/payment?token=' + token + '&amount=' + amount,
            // url: 'http://mapscorps-nodeapi-dev.mapscorps.org/node/payment?token=' + token + '&amount=' + amount,
            // url: 'http://mapscorps-nodeapi.mapscorps.org/node/payment?token=' + token + '&amount=' + amount,
            url: 'http://mapscorps-nodeapi.azurewebsites.net/node/payment?token=' + token + '&amount=' + amount,
            // url: 'http://localhost:1337/node/payment?token=' + token + '&amount=' + amount,
            type: 'GET',
            dataType: 'jsonp',
            jsonp: 'callback',
            jsonpCallback: 'MapsCorps.stripeCallback',
            contentType: 'application/json',
            crossDomain: true,
            timeout: 5000,
            error: function() {
              // Request timed out
              _donationError('Error processing payment. Please try again.');
            }
          });
      } else {
        _donationError('Error processing payment. Please try again.');
      }
    }
  }

  // Show donation error message and re-enable submit button
  function _donationError(error) {
    if (typeof error !== 'undefined' && error !== '') {
      $('#formFeedback').text(error);
    }
    $paymentForm.find('input.submit').prop('disabled', false);
  }

  function _initStickyMap() {
    // Sticky map on desktop
    var $map = $('#map').css('margin-top','');
    var mapTop = $map.offset().top;
    $(window).off('scroll.map').on('scroll.map', function() {
      _checkStickyMap($map, mapTop);
    });
    _checkStickyMap($map, mapTop);
  }
  function _checkStickyMap($map, mapTop) {
    if(document.documentElement.clientWidth > 900 && $(window).scrollTop() >= mapTop - 100) {
      var mt = $(window).scrollTop() - mapTop + 120;
      if (mt > $('#mapSearch').height() - 500) {
        mt = $('#mapSearch').height() - 500;
      }
      $map.css('margin-top', mt);
    } else {
      $map.css('margin-top', '');
    }
  }

  function _initMapPage() {
    _initStickyMap();
    $(window).on('resize', function() {
      _initStickyMap();
    });

    // Add svg toggles to categories
    $('.categories>li').prepend('<svg class="icon-triangle toggle-category" role="img"><use xlink:href="#icon-triangle"></use></svg>');

    // Make categories open and close via Velocity.js
    $('.toggle-category').each(function() {
      var $category = $(this).closest('li');
      var $services = $category.find('.services');
      $(this).click(function() {
        $category.toggleClass('open');
        $services.velocity($category.hasClass('open') ? 'slideDown' : 'slideUp', { duration: 250 });
      });
    });

    // Make services selectable
    $('ul.services li').click(function(){
      var typeId = $(this).attr('typeid');
      var subtypeId = $(this).attr('subtypeid');
      $(this).toggleClass('selected');
      if ($(this).hasClass("selected")) {
        _getMarkers(typeId, subtypeId);
      }
      else {
        _clearMarkers(typeId, subtypeId, null);
      }
    });

    // Change community/zipcode when submitted
    $('#mapSearch').on('submit', function(e) {
      e.preventDefault();
      var zip = $('input[name="zip"]').val();
      if (zip !== '') {
        var geocoder = new google.maps.Geocoder();
        geocoder.geocode({address: zip}, function(results, status) {
          if (status === google.maps.GeocoderStatus.OK) {
            map.setZoom(12);
            map.setCenter(results[0].geometry.location);
            currentCommunity = '0';
          } else {
            console.log("ZIP geocode failed: " + status);
          }
        });
      } else {
        var $opt = $('#communities option:selected');
        if ($opt.length) {
          var lat = $opt.attr('data-lat');
          var lng = $opt.attr('data-lng');
          var point = new google.maps.LatLng(parseFloat(lat), parseFloat(lng));
          map.setZoom(12);
          map.setCenter(point);
          currentCommunity = $opt.val();
        }
      }
    });
    // When selecting a community from dropdown, clear zipcode field and submit mapsearch
    $('#communities').on('change', function() {
      $('input[name="zip"]').val('');
      $('#mapSearch').trigger('submit');
    });

    // Determine city we're on, set starting position and json filename
    currentCity.name = $('.map-section').attr('data-city');
    switch (currentCity.name) {
      case 'CHICAGO':
        currentCity.startLat = '41.8541605';
        currentCity.startLng = '-87.6632838';
        currentCity.jsonFile = '../chicago.json';
        break;
      case 'NEWYORK':
        currentCity.startLat = '40.7058316';
        currentCity.startLng = '-74.0480853';
        currentCity.jsonFile = '../ny.json';
        break;
      case 'NIAGARAFALLS':
        currentCity.startLat = '43.0996095';
        currentCity.startLng = '-79.0787823';
        currentCity.jsonFile = '../niagara.json';
        break;
      case 'NASHVILLEEDGECOMBE':
        currentCity.startLat = '35.9221321';
        currentCity.startLng = '-77.8831092';
        currentCity.jsonFile = '../nash.json';
        break;
      default:
        currentCity.startLat = '41.8541605';
        currentCity.startLng = '-87.6632838';
        currentCity.jsonFile = '../chicago.json';
    }

    // Pull in city's community options
    $.getJSON(currentCity.jsonFile, function (data) {
      $('#communities').append('<option value="0" data-lat="' + currentCity.startLat + '" data-lng="' + currentCity.startLng + '">Select Your Community</option>');
      $.each(data, function () {
        $('#communities').append('<option value="' + this.id + '" data-lat="' + this.lat + '" data-lng="' + this.lng + '">' + this.geoarea + '</option>');
      });
      _checkInitialCommunity();
    }).fail(function(xhr, textStatus, error) {
      console.log('City JSON request failed: ' + textStatus + ', ' + error);
    });
  }

  // Init the Map page
  function _initMapPageMap() {
    var myOptions = {
        zoom: 12,
        center: new google.maps.LatLng(currentCity.startLat, currentCity.startLng),
        mapTypeId: google.maps.MapTypeId.ROADMAP,
        streetViewControl: false,
        mapTypeControl: false,
        styles: [{"featureType":"administrative","elementType":"labels.text.fill","stylers":[{"color":"#444444"}]},{"featureType":"administrative.land_parcel","elementType":"labels","stylers":[{"visibility":"off"}]},{"featureType":"landscape","stylers":[{"color":"#f2f2f2"}]},{"featureType":"landscape.man_made","elementType":"geometry.fill","stylers":[{"color":"#d8d8d8"}]},{"featureType":"poi","stylers":[{"visibility":"off"}]},{"featureType":"poi","elementType":"labels.text","stylers":[{"visibility":"off"}]},{"featureType":"poi.business","stylers":[{"visibility":"off"}]},{"featureType":"poi.park","elementType":"labels.text","stylers":[{"visibility":"off"}]},{"featureType":"road","stylers":[{"saturation":55},{"lightness":45}]},{"featureType":"road.highway","stylers":[{"saturation":-100}]},{"featureType":"road.highway","elementType":"geometry.fill","stylers":[{"color":"#fbfffd"}]},{"featureType":"transit","stylers":[{"visibility":"off"}]},{"featureType":"water","stylers":[{"color":"#46bcec"},{"visibility":"on"}]},{"featureType":"water","elementType":"geometry.fill","stylers":[{"color":"#c5c5c5"}]},{"featureType":"water","elementType":"labels","stylers":[{"visibility":"off"}]}]
    };
    map = new google.maps.Map(document.getElementById('gmap-canvas'), myOptions);
    infoWindow = new google.maps.InfoWindow({maxWidth: 260});

    // Init custom icons
    var catColors = [
      { 'typeId': 1, 'color': '#eb2832' },
      { 'typeId': 2, 'color': '#3cb95f' },
      { 'typeId': 3, 'color': '#ffdc2d' },
      { 'typeId': 4, 'color': '#b43ccd' },
      { 'typeId': 5, 'color': '#50f5d7' },
      { 'typeId': 6, 'color': '#8c145a' },
      { 'typeId': 7, 'color': '#51c8eb' },
      { 'typeId': 8, 'color': '#1f1c57' },
      { 'typeId': 8, 'color': '#ff733a' },
      { 'typeId': 9, 'color': '#aaeb32' },
      { 'typeId': 10, 'color': '#055a41' },
      { 'typeId': 11, 'color': '#1449c9' },
      { 'typeId': 12, 'color': '#e1f514' },
      { 'typeId': 13, 'color': '#307efc' },
      { 'typeId': 14, 'color': '#ff3566' },
      { 'typeId': 15, 'color': '#f555c8' },
      { 'typeId': 16, 'color': '#733ca0' }
    ];
    for (var i = catColors.length - 1; i >= 0; i--) {
      customIcons[catColors[i].typeId] = {
        path: "M16,6.93,8,22,0,6.93,4,0h8Z",
        fillColor: catColors[i].color,
        fillOpacity: 1,
        size: new google.maps.Size(16, 22),
        anchor: new google.maps.Point(8, 23),
        strokeWeight: 0,
        scale: 1
      };
    }
    // Shadow png that is shown behind svgs
    shadowIcon = {
      url: images_dir + 'pin-shadow.png',
      size: new google.maps.Size(20, 26),
      anchor: new google.maps.Point(10, 24),
      strokeWeight: 0,
      scale: 1
    };
  }

  // Add a new shadow to map behind a point
  function _shadowMarker(marker) {
    var markerShadow = new google.maps.Marker({
        clickable: false,
        position: marker.position,
        map: map,
        icon: shadowIcon,
        optimized: false,
        zIndex: marker.getZIndex() - 1
    });
    shadowMarkers.push(markerShadow);
  }

  // Clear out all shadows and reinit from markers array
  function _resetShadows() {
    var i;
    for (i = 0; i < shadowMarkers.length; i++) {
      shadowMarkers[i].setMap(null);
    }
    shadowMarkers = [];
    for (i = 0; i < markers.length; i++) {
      _shadowMarker(markers[i]);
    }
  }

  // Pull markers for type/subtype
  function _getMarkers(typeId, subtypeId) {
    $.ajax({
     // url: 'https://gentle-temple-97638.herokuapp.com/node/places?typeid=' + typeId + '&subtypeid=' + subtypeId + '&city=' + currentCity.name + '&community=' + currentCommunity,
        //url: 'http://mapscorps-nodeapi.azurewebsites.net/node/places?typeid=' + typeId + '&subtypeid=' + subtypeId + '&city=' + currentCity.name + '&community=' + currentCommunity,
        url: 'http://mapscorps-nodeapi.azurewebsites.net/node/places?typeid=' + typeId + '&subtypeid=' + subtypeId + '&city=' + currentCity.name + '&geoareaId=' + currentCommunity,
        //url: 'http://localhost:1337/node/places?typeid=' + typeId + '&subtypeid=' + subtypeId + '&city=' + currentCity.name + '&geoareaId=' + currentCommunity,

        type: 'GET',
      dataType: 'jsonp',
      jsonp: 'callback',
      jsonpCallback: 'MapsCorps.placesCallback',
      contentType: 'application/json',
      crossDomain: true
    });
  }

  // Clear markers from map when deselecting
  function _clearMarkers(typeid, subtypeId, geoareaId) {
    var markersKeep = [];
    if (typeid !== null && subtypeId !== null) {
      for (var i = 0; i < markers.length; i++) {
        if (markers[i].typeid.toString() === typeid && markers[i].subtypeId.toString() === subtypeId) {
          markers[i].setMap(null);
        } else {
          markersKeep.push(markers[i]);
        }
      }
    }
    markers = markersKeep;
    // _resetBounds();
    // Reset shadows behind markers
    _resetShadows();
  }

  // Reset bounds to markers (not currently used)
  function _resetBounds() {
    var bounds = new google.maps.LatLngBounds();
    for (var i = 0; i < markers.length; i++) {
      bounds.extend(markers[i].position);
    }
    map.fitBounds(bounds);
  }

  function _placesCallback(json) {
    $.each(json, function() {
      var lat = this.lat.toString();
      var lng = this.lng.toString();
      var point = new google.maps.LatLng(parseFloat(lat), parseFloat(lng));
      markerZ += 2;
      var marker = new google.maps.Marker({
        position: point,
        map: map,
        typeid: this.typeId,
        subtypeId: this.subtypeId,
        geoareaId: this.geoareaId,
        icon: customIcons[this.typeId],
        optimized: false,
        zIndex: markerZ
      });
      _shadowMarker(marker);
      var html =
        '<h4>' + this.name.toString() + '</h4>' +
        '<p style="font-weight: bold;"> ' + this.subtype.toString() + '</p><br>' +
        '<p>' + (this.buildingNum !== null ? this.buildingNum.toString() : "") + ' ' + this.street.toString() + '</p>' +
        '<p>' + (this.zip !== null ? this.zip.toString() : '') + ' ' + (this.city !== null ? this.city.toString() : '') + '</p>' +
        '<p>Phone: ' + (this.phone !== null ? this.phone.toString() : 'N/A') + '</p>' +
        '<p>Email: ' + (this.email !== null ? this.email.toString() : 'N/A') + '</p>';
      google.maps.event.addListener(marker, 'click', function () {
        infoWindow.setContent(html);
        infoWindow.open(map, marker);
      });
      markers.push(marker);
    });
    // _resetBounds();
  }

  // Check if GET var is sent from homepage and preselect community if so
  function _checkInitialCommunity() {
    var community = _getVar('community');
    if (community) {
      $('#communities option').each(function(){
        if($(this).text().toLowerCase() == community.toLowerCase()) {
          $(this).attr('selected',true);
          google.maps.event.addDomListener(window, 'load', function() {
            $('#mapSearch').trigger('submit');
          });
        }
      });
    }
  }

  // Simple function to retrieve GET var (from http://stackoverflow.com/a/439578/1001675)
  function _getVar(q) {
    var $_GET = {};
    document.location.search.replace(/\??(?:([^=]+)=([^&]*)&?)/g, function () {
      function decode(s) {
        return decodeURIComponent(s.split("+").join(" "));
      }
      $_GET[decode(arguments[1])] = decode(arguments[2]);
    });
    return $_GET[q];
  }

  // Public functions
  return {
    init: _init,
    initMaps: _initMaps,
    initMapPageMap: _initMapPageMap,
    stripeCallback: function(json) {
      _stripeCallback(json);
    },
    stripeResponseHandler: function(status, response) {
      _stripeResponseHandler(status, response);
    },
    placesCallback: function(json) {
      _placesCallback(json);
    }
  };

})(jQuery);

// Fire up the mothership
jQuery(document).ready(MapsCorps.init);
