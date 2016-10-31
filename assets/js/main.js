var MapsCorps = (function($) {

  var $header = $('.site-header'),
      $nav = $('.site-nav'),
      $document = $(document),
      loadingTimer,
      $paymentForm = $('#payment-form');

  function _init() {
    // Touch-friendly fast clicks
    FastClick.attach(document.body);

    $('body').addClass('loaded');

    // Inject all svgs onto page so they can be pulled with xlinks and can be styled as if inline.
    _injectSvgSprite();

    // Handle interactivity for map search menu
    _initMapSearchMenu();

    _initExpandables();
    _initMobileNav();
    _initScrollspy();
    _stickyNav();
    _initDonate();
    _initPartnersTabs();

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
      e.stopPropagation();
      var $group = $(this).closest('.expandable-group');
      $group.toggleClass('collapsed');
      $(this).next('.fields').velocity(($group.hasClass('collapsed')) ? 'slideUp' : 'slideDown',{duration: 250});
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

  function _initPartnersTabs() {
    $document.on('click', '.maps-list a', function(e) {
      e.preventDefault();

      var $target = $($(this).attr('href'));

      $('.maps li.-active').removeClass('-active');
      $(this).closest('li').addClass('-active');
      $target.addClass('-active');
    });
  }

  function _initMaps() {
    var parterMaps = [];

    var chicago = {
      partnerLat: 41.7837192,
      partnerLng: -87.6325996,
      partnerLocations: [
        //host sites (blue)
        ['Centers For New Horizons (Altgeld Gardens)', '975 E. 132nd St. Chicago, IL 60827', '773-373-5700', 'undefined', 'http://cnh.org', 41.6556662, -87.59818199999999, 'undefined', 'undefined'],
        ['Centers For New Horizons (Bronzville)', '4150 S King Dr, Chicago, IL 60653', '773-373-5700', 'undefined', 'http://cnh.org', 41.8186204, -87.61735729999998, 'undefined', 'undefined'],
        ['Claretian Associates', '9108 South Brandon Avenue, Chicago, IL', '773-734-9181', 'portera@claretianassociates.org', 'https://www.claretianassociates.org', 41.7296735, -87.54732000000001, 'undefined', 'undefined'],
        ['Greater Auburn-Gresham Development Corporation', '1159 West 79th Street, Chicago, IL', '773-483-3696', 'undefined', 'http://www.gagdc.org/', 41.7503217, -87.65356170000001, 'undefined', 'undefined'],
        ['Hyde Park Neighborhood Club', '5480 S. Kenwood Avenue, Chicago, IL 60615', '773-643-4062', 'info@hpnclub.org', 'http://hpnclub.org', 41.7958986, -87.59401860000003, 'undefined', 'undefined'],
        ['Demoiselle 2 Femme', '10924 S. Halsted Street, Suite 7, Chicago IL, 60628', '773-660-1677', 'undefined', 'http://demoiselle2femme.org', 41.69521719999999, -87.6426738, 'undefined', 'undefined'],
        ['Sinai Community Institute', '2653 West Ogden Avenue, Chicago, Illinois 60608', '773-257-6508', 'undefined', 'http://www.sinai.org/content/sinai-community-institute-0', 41.8621073, -87.6927976, 'undefined', 'undefined'],
        ['Near West Side Community Development Corporation', '216 South Hoyne Avenue, Chicago, IL 60612', '312-738-2280', 'undefined', 'http://nearwestsidecdc.org/', 41.8781545, -87.67924619999997, 'undefined', 'undefined'],
        ['Enlace Chicago', '2756 S. Harding Avenue, Chicago, IL 60623', '773-542-9233', 'info@enlacechicago.org', 'http://www.enlacechicago.org/', 41.8407009, -87.7234694, 'undefined', 'undefined'],
        ['BUILD Chicago', '5100 W. Harrison, Chicago IL 60644', '773-227-2880', 'undefined', 'http://www.buildchicago.org/', 41.8731717, -87.75370459999999, 'undefined', 'undefined'],

        //partners (yellow)
        ['University of Chicago Lindau Lab', '860 E. 59st St. Chicago, IL 60637', 'undefined', 'undefined', 'http://obg.bsd.uchicago.edu/FacultyResearch/Lindaulab/Lindaulab.html', 41.7878853, -87.6040539, '/Content/Images/pin-blue-sm.png', 'undefined'],
        ['After School Matters', '66 East Randolph Street, Chicago, IL 60601', '312-742-4182', 'undefined', 'http://www.afterschoolmatters.org/', 41.8848207, -87.6276737, '/Content/Images/pin-blue-sm.png', 'undefined'],
        ['University of Chicago Metcalf Internship Program', '1212 E. 59th Street, Chicago, IL 60637', '773-702-7040', 'undefined', 'https://careeradvancement.uchicago.edu/jobs-internships-research/metcalf-internship', 41.7882112, -87.5977685, '/Content/Images/pin-blue-sm.png', 'undefined'],
        ['City Colleges of Chicago', '226 W. Jackson, Chicago, IL 60606', '312-553-2500', 'undefined', 'http://www.ccc.edu/', 41.8784226, -87.6370685, '/Content/Images/pin-blue-sm.png', 'undefined']
      ],
      elementID: 'chicago-partners',
      partnerZoom: 11
    };

    var nyc = {
      partnerLat: 40.7993063,
      partnerLng: -73.937144,
      partnerLocations: [
        //partner
        ['New York State Health Foundation', '1385 Broadway, New York, NY 10018', 'undefined', 'undefined', 'undefined', 40.7528622, -73.98786299999999, '/Content/Images/pin-blue-sm.png', 'undefined'],

        //champion/hub
        ['Mount Sinai Adolescent Health Center', '320 East 94th Street, New York, NY 10128', '212-423-3000', 'undefined', 'http://www.mountsinai.org/patient-care/service-areas/adolescent-health-center', 40.7823722, -73.94719570000001, '/Content/Images/pin-pink-sm.png', 'MAPSCorps Hub & Champion'],

        //host site
        ['Claremont Neighborhood Center', '489 E. 169th St, Bronx, NY 10456', ' 718-901-8297', 'undefined', 'http://www.claremontcenter.org/', 40.8330233, -73.907439, 'undefined', 'undefined'],
        ['Urban Health Plan, Inc', '1065 Southern Boulevard, Bronx, New York 10459', '718-589-2440', 'info@urbanhealthplan.org', 'http://www.urbanhealthplan.org/', 40.825011, -73.89228300000002, 'undefined', 'undefined'],
        ['Two Bridges Neighborhood Council', '275 Cherry Street, New York, NY 10002', '212-566-2729  ', 'info@twobridges.org', 'http://www.twobridges.org/', 40.71093169999999, -73.98848079999999, 'undefined', 'undefined'],
        ['Cypress Hills Local Development Corporation', '2930 Fulton Street, Brooklyn, NY 11207', 'undefined', 'undefined', 'undefined', 40.6792311, -73.88656410000002, 'undefined', 'undefined']

        //TBD
        //El Barrio
        //New York City Mission Society
        //Chinatown ManPower
        //Police Athletic League
        //BronxWorks

        ],
      elementID: 'nyc-partners',
      partnerZoom: 11
    };

    var niagara = {
      partnerLat: 43.1132875,
      partnerLng: -79.0355104,
      partnerLocations: [
        //Champion (pink)
        ['Create a Healthier Niagara Falls Collaborative ', 'Niagara Falls, NY', 'undefined', 'undefined', 'undefined', 43.1320551, -78.9421621, '/Content/Images/pin-pink-sm.png', 'MAPSCorp Champion'],

        //host (blue)
        ['Planned Parenthood of Central and Western New York', '1700 Main Street, Niagara Falls, NY 14305', '716-831-2200', 'undefined', 'https://www.plannedparenthood.org/planned-parenthood-central-western-new-york', 43.104703, -79.0554837, 'undefined', 'undefined'],

        //partners (yellow)
        ['Niagara University Levesque Institute', '443 Roosevelt Avenue Niagara Falls, NY 14305', 'undefined', 'undefined', 'undefined', 43.1352639, -79.0404061, '/Content/Images/pin-blue-sm.png', 'undefined'],
        ['Niagara County Employment & Training Center Summer Youth Employment Program', '1001 11th Street Niagara Falls, NY 14301', 'undefined', 'undefined', 'undefined', 43.098766, -79.04935499999999, '/Content/Images/pin-blue-sm.png', 'undefined'],
        ['Community Health Center of Niagara', '2715 Highland Avenue Niagara Falls, NY 14305', 'undefined', 'undefined', 'undefined', 43.113036, -79.048565, '/Content/Images/pin-blue-sm.png', 'undefined'],
        ['Mr. Saint Mary’s Hospital & Neighborhood Health Center', '3101 9th Street Niagara Falls, NY 14305', 'undefined', 'undefined', 'undefined', 43.1158566, -79.0503702, '/Content/Images/pin-blue-sm.png', 'undefined'],
        ['Niagara Falls Memorial Medical Center', '621 10th Street Niagara Falls, NY 14301', 'undefined', 'undefined', 'undefined', 43.0946238, -79.048743, '/Content/Images/pin-blue-sm.png', 'undefined']

      ],
      elementID: 'niagara-partners',
      partnerZoom: 12
    };

    var nashEdgecombe = {
        partnerLat: 35.9451536,
        partnerLng: -78.11193449999999,
        //partnerLat: 35.9424136,
        //partnerLng: -77.7970862,
        partnerLocations: [
        //Host (blue)
        ['Project Momentum', '107 SE Main Street, Rocky Mount, NC 27801', 'undefined', 'undefined', 'undefined', 35.9424136, -77.7970862, 'undefined', 'undefined'],

        //Partners (yellow)
        ['Project Grace', 'Rocky Mount, NC', 'undefined', 'undefined', 'undefined', 36.0673691, -77.73560809999999, '/Content/Images/pin-blue-sm.png', 'undefined'],
        ['Resourceful Communities', 'Rocky Mount, NC', 'undefined', 'undefined', 'undefined', 36.0673691, -77.73560809999999, '/Content/Images/pin-blue-sm.png', 'undefined'],
        ['Opportunities Industrialization Center', '402 E. Virginia Street, P. O. BOX 2723, Rocky Mount, NC 27802', 'undefined', 'undefined', 'undefined', 35.9509943, -77.7866018, '/Content/Images/pin-blue-sm.png', 'undefined'],

        //Champion
        ['University of North Carolina at Chapel Hill, Center for Health Equity Research', '333 South Columbia Street, Chapel Hill, NC 27599-7240', 'undefined', 'undefined', 'undefined', 35.9080741, -79.05281119999999, '/Content/Images/pin-pink-sm.png', 'MAPSCorps Champion']

      ],
      elementID: 'nash-edgecombe-partners',
      partnerZoom: 9
    };

    partnerMaps = [chicago, nyc, niagara, nashEdgecombe];


    $.each(partnerMaps, function(i) {
     google.maps.event.addDomListener(window, 'load', init(this.partnerLat, this.partnerLng, this.elementID, this.partnerZoom, this.partnerLocations));
    });

    var map;
    var infowindow = new google.maps.InfoWindow({
      content: 'content!',
      maxWidth: 260
    });
    function init(partnerLat, partnerLng, id, partnerZoom, partnerLocations) {
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
          styles: [
              { "featureType": "administrative", "elementType": "labels.text.fill", "stylers": [{ "color": "#444444" }] }, { "featureType": "landscape", "elementType": "all", "stylers": [{ "color": "#f2f2f2" }] }, { "featureType": "landscape.man_made", "elementType": "geometry.fill", "stylers": [{ "color": "#d8d8d8" }] }, { "featureType": "poi", "elementType": "all", "stylers": [{ "visibility": "off" }] }, { "featureType": "road", "elementType": "all", "stylers": [{ "saturation": -100 }, { "lightness": 45 }] }, { "featureType": "road.highway", "elementType": "all", "stylers": [{ "visibility": "simplified" }] }, { "featureType": "road.highway", "elementType": "geometry.fill", "stylers": [{ "color": "#ff3566" }] }, { "featureType": "road.highway", "elementType": "labels", "stylers": [{ "visibility": "off" }] }, { "featureType": "road.arterial", "elementType": "geometry.fill", "stylers": [{ "color": "#f2ff3d" }] }, { "featureType": "road.arterial", "elementType": "geometry.stroke", "stylers": [{ "visibility": "off" }] }, { "featureType": "road.arterial", "elementType": "labels", "stylers": [{ "visibility": "off" }] }, { "featureType": "road.arterial", "elementType": "labels.icon", "stylers": [{ "visibility": "off" }] }, { "featureType": "road.local", "elementType": "geometry.fill", "stylers": [{ "color": "#f2ff3d" }] }, { "featureType": "road.local", "elementType": "geometry.stroke", "stylers": [{ "visibility": "off" }] }, { "featureType": "road.local", "elementType": "labels", "stylers": [{ "visibility": "off" }] }, { "featureType": "transit", "elementType": "all", "stylers": [{ "visibility": "off" }] }, { "featureType": "water", "elementType": "all", "stylers": [{ "color": "#46bcec" }, { "visibility": "on" }] }, { "featureType": "water", "elementType": "geometry.fill", "stylers": [{ "color": "#51c9ea" }] }, { "featureType": "water", "elementType": "labels", "stylers": [{ "visibility": "off" }] }]
      };
      var mapElement = document.getElementById(id);
      var map = new google.maps.Map(mapElement, mapOptions);
      var locations = partnerLocations;
      for (i = 0; i < locations.length; i++) {
        // if (locations[i][1] == 'undefined'){ description ='';} else { description = locations[i][1];}
        if (locations[i][1] === 'undefined'){ address ='';} else { address = locations[i][1];}
        if (locations[i][2] === 'undefined'){ telephone ='';} else { telephone = locations[i][2];}
        if (locations[i][3] === 'undefined'){ email ='';} else { email = locations[i][3];}
        if (locations[i][4] === 'undefined'){ web ='';} else { web = locations[i][4];}
        if (locations[i][7] === 'undefined') { markericon = '/Content/Images/pin-sm.png'; } else { markericon = locations[i][7]; }
        if (locations[i][8] === 'undefined') {subtitle = '';} else { subtitle = locations[i][8];}
        marker = new google.maps.Marker({
            icon: markericon,
            position: new google.maps.LatLng(locations[i][5], locations[i][6]),
            map: map,
            title: locations[i][0],
            subtitle: subtitle,
            // desc: description,
            address: address,
            tel: telephone,
            email: email,
            web: web
        });

        google.maps.event.addListener(marker, 'click', function () {
            var localTitle = "<h4>" + this.title + "</h4>";
            if (this.subtitle !== "")
                localTitle = "<h4 class=\"hub-or-champion\">" + this.subtitle + "</h3>" + localTitle;

          var partnerDetails = localTitle +
            '<p>'+this.address+'</p><br>'+
            '<p><a href="'+this.web+'" target="_blank">'+this.web+'</a></p>'+
            '<p><a href="mailto:'+this.email+'">'+this.email+'</a></p>'+
            '<p>' + this.tel + '</p>';

            //console.log(partnerDetails);
          infowindow.setContent(partnerDetails);
          infowindow.open(map, this);
        });
      }

      google.maps.event.addDomListener(window, 'resize', function() {
          map.setCenter(new google.maps.LatLng(partnerLat, partnerLng));
      });

    }

  }

  // Inject all svgs onto page so they can be pulled with xlinks and can be styled as if inline.
  function _injectSvgSprite() {
    boomsvgloader.load('/assets/svgs/build/svgs-defs.svg');
  }

  // Track ajax pages in Analytics
  function _trackPage() {
    if (typeof ga !== 'undefined') { ga('send', 'pageview', document.location.href); }
  }

  // Track events in Analytics
  function _trackEvent(category, action) {
    if (typeof ga !== 'undefined') { ga('send', 'event', category, action); }
  }

  // Handle interactivity for map search menu
  function _initMapSearchMenu() {
    // Add svg toggles to categories
    $('.category').prepend('<svg class="icon-triangle toggle-category" role="img"><use xlink:href="#icon-triangle"></use></svg>');

    // Alphabetize services within category
    // Adapted from: http://stackoverflow.com/questions/304396/what-is-the-easiest-way-to-order-a-ul-ol-in-jquery
    $('.services').each(function() {
      var $ul = $(this);
      var $items = $ul.find('li');
      $items.sort(function(a,b){
        var keyA = $(a).text();
        var keyB = $(b).text();

        if (keyA < keyB) return -1;
        if (keyA > keyB) return 1;
        return 0;
      });
      $.each($items, function(i, $li){
        $ul.append($li);
      });
    });


    // Make categories open and close via Velocity.js
    $('.toggle-category').each(function() {
      var $category = $(this).closest('.category');
      var $services = $category.find('.services');
      $(this).click(function() {
        if ($category.hasClass('open')) {
          $category.removeClass('open');
          $services.velocity('slideUp',{duration: 250});
        } else {
          $category.addClass('open');
          $services.velocity('slideDown',{duration: 250});
        }
      });
    });

    // Make services selectable
    $('.service').click(function(){
      $(this).toggleClass('selected');
    });
  } // end _initMapSearchMenu

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
      // Show success notice
      $('#donate').addClass('-success');

      // Reset form
      $paymentForm[0].reset();
      $('#formFeedback').text('').removeClass('-active');
      $paymentForm.find('input.submit').prop('disabled', false);

      // Scroll #donate up to show success notice (in case we're on mobile)
      $('#donate')[0].scrollTop = 0;

      // Build object of donation fields
      var params = {
        'firstName': $('#inFirstName').val(),
        'lastName': $('#inLastName').val(),
        'comp': $('#inComp').val(),
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
            // url: 'http://mapscorps-nodeapi.azurewebsites.net/node/payment?token=' + token + '&amount=' + amount,
            url: 'http://localhost:1337/node/payment?token=' + token + '&amount=' + amount,
            type: 'GET',
            dataType: 'jsonp',
            jsonp: 'callback',
            jsonpCallback: 'myCallback',
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

  // Public functions
  return {
    init: _init,
    initMaps: _initMaps,
    stripeCallback: function(json) {
      _stripeCallback(json);
    },
    stripeResponseHandler: function(status, response) {
      _stripeResponseHandler(status, response);
    }
  };

})(jQuery);

// Stripe hardcoded callback from node app
function myCallback(response) {
  MapsCorps.stripeCallback(response);
}

// Fire up the mothership
jQuery(document).ready(MapsCorps.init);
