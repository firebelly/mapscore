var Main = (function($) {

  var screen_width = 0,
      breakpoint_small = false,
      breakpoint_medium = false,
      breakpoint_large = false,
      breakpoint_array = [480,1000,1200],
      $header = $('.site-header'),
      $nav = $('.site-nav'),
      $document,
      loadingTimer;

  function _init() {
    // touch-friendly fast clicks
    FastClick.attach(document.body);

    // Cache some common DOM queries
    $document = $(document);
    $('body').addClass('loaded');

    // Set screen size vars
    _resize();

    // Inject all svgs onto page so they can be pulled with xlinks and can be styled as if inline.
    _injectSvgSprite();

    // Handle interactivity for map search menu
    _initMapSearchMenu();

    _initMobileNav();
    _initScrollspy();
    _stickyNav();
    _initPartnersTabs();
    _initMaps();

    // Esc handlers
    $(document).keyup(function(e) {
      if (e.keyCode === 27) {

      }
    });

    // Smoothscroll links
    $('a.smoothscroll, .smoothscroll a').click(function(e) {
      e.preventDefault();
      var href = $(this).attr('href');
      if ($(this).attr('data-offset') !== '') {
        var offset = $(this).data('offset');
      }
      _scrollBody($(href), 250, 0, offset);
    });

    // Scroll down to hash afer page load
    $(window).load(function() {
      if (window.location.hash) {
        _scrollBody($(window.location.hash)); 
      }
    });

  } // end init() 

  function _scrollBody(element, duration, delay, offset) {
    if (offset || offset !== undefined) {
      setOffset = offset;
    } else {
      setOffset = $header.outerHeight(); 
    }
    element.velocity("scroll", {
      duration: duration,
      delay: delay,
      offset: -setOffset
    }, "easeOutSine");
  }

  function _initMobileNav() {
    $('.menu-toggle').on('click', function() {
      $(this).toggleClass('menu-open');
      $nav.toggleClass('-active');
    });
  }

  function _stickyNav() {
    var $visionSection = $('#vision');

    if($(window).scrollTop() >= $visionSection.offset().top + $visionSection.outerHeight()) {
      $header.addClass('-sticky');
    }

    $(window).on('scroll', function() {
      if($(window).scrollTop() >= $visionSection.offset().top + $visionSection.outerHeight()) {
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
        menuItems = $header.find(".site-nav ul a"),
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
         if ($(this).offset().top < fromTop)
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
        ['Greater Auburn-Gresham Development Corporation', 'undefined', '+1 773-483-3696', 'undefined', 'http://www.gagdc.org/', 41.7503217, -87.65356170000001, 'undefined'],
        ['Centers For New Horizons Inc', 'undefined', '+1 773-373-5700', 'undefined', 'http://cnh.org/', 41.8186204, -87.61735729999998, 'undefined'],
        ['Claretian Associate', 'undefined', 'undefined', 'undefined', 'undefined', 41.7296735, -87.54732000000001, 'undefined'],
        ['Hyde Park Neighborhood Club', 'undefined', 'undefined', 'undefined', 'undefined', 41.7958986, -87.59401860000003, 'undefined'],
        ['Demoiselle 2 Femme', 'undefined', 'undefined', 'undefined', 'undefined', 41.7224835, -87.6817249, 'undefined'],
        ['Sinai Community Institute', 'undefined', 'undefined', 'undefined', 'undefined', 41.8621073, -87.6927976, 'undefined'],
        ['Near West Side Community Development Corporation', 'undefined', 'undefined', 'undefined', 'undefined', 41.8781545, -87.67924619999997, 'undefined'],
        ['Enlace Chicago', 'undefined', 'undefined', 'undefined', 'undefined', -87.7234694, 41.8407009, 'undefined'],
        ['BUILD Chicago', 'undefined', 'undefined', 'undefined', 'undefined', -87.75370459999999, 41.8731717, 'undefined']
      ],
      elementID: 'chicago-partners'
    };

    var nyc = {
      partnerLat: 40.7993063,
      partnerLng: -73.937144,
      partnerLocations: [
        ['Mount Sinai Adolescent Health Center', 'undefined', 'undefined', 'undefined', 'undefined', 40.7823722, -73.94719570000001, 'undefined'],['Claremont Healthy Village', 'undefined', 'undefined', 'undefined', 'undefined', 40.8313933, -73.90273730000001, 'undefined'],['Urban Health Plan, Inc', 'undefined', 'undefined', 'undefined', 'undefined', 40.825011, -73.89228300000002, 'undefined'],['Two Bridges Neighborhood Council', 'undefined', 'undefined', 'undefined', 'undefined', 40.71093169999999, -73.98848079999999, 'undefined']
      ],
      elementID: 'nyc-partners'
    };

    var niagara = {
      partnerLat: 43.1132875,
      partnerLng: -79.0355104,
      partnerLocations: [
        ['Planned Parenthood of Central and Western New York', 'undefined', 'undefined', 'undefined', 'undefined', 42.940527, -78.83722399999999, 'undefined'],['Niagara Employment &amp; Training', 'undefined', 'undefined', 'undefined', 'undefined', 43.09876599999999, -79.04935499999999, 'undefined'],['Community Health Center of Niagara Falls', 'undefined', 'undefined', 'undefined', 'undefined', 43.11303599999999, -79.048565, 'undefined'],['Mount Saint Marys Hospital', 'undefined', 'undefined', 'undefined', 'undefined', 43.15394819999999, -79.03311889999998, 'undefined'],['Niagara Falls Memorial Medical Center', 'undefined', 'undefined', 'undefined', 'undefined', 43.09383820000001, -79.05033229999998, 'undefined'],['Niagara University', 'undefined', 'undefined', 'undefined', 'undefined', 43.1383605, -79.03766719999999, 'undefined']
      ],
      elementID: 'niagara-partners'
    };

    var nashEdgecombe = {
      partnerLat: 35.8893318,
      partnerLng: -77.9239492,
      partnerLocations: [
        ['Resourceful Communities', 'undefined', 'undefined', 'undefined', 'undefined', 38.8938808, -77.0715055, 'undefined'],['UNC Center for Health Equity Research', 'undefined', 'undefined', 'undefined', 'undefined', 35.9049122, -79.0469134, 'undefined'],['Project Momentum', 'undefined', 'undefined', 'undefined', 'undefined', 35.9419921, -77.79512299999999, 'undefined']
      ],
      elementID: 'nash-edgecombe-partners'
    };

    partnerMaps = [chicago, nyc, niagara, nashEdgecombe];
 

    $.each(partnerMaps, function(i) { 
     console.log(this.partnerLat, this.partnerLng, this.elementID, this.partnerLocations);
     google.maps.event.addDomListener(window, 'load', init(this.partnerLat, this.partnerLng, this.elementID, this.partnerLocations));
    });

    var map;
    function init(partnerLat, partnerLng, id, partnerLocations) {
      var mapOptions = {
          center: new google.maps.LatLng(partnerLat, partnerLng),
          zoom: 11,
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
          styles: [{"featureType": "administrative", "elementType": "labels.text.fill", "stylers": [{"color": "#444444"} ] }, {"featureType": "landscape", "elementType": "all", "stylers": [{"color": "#f2f2f2"} ] }, {"featureType": "landscape.man_made", "elementType": "geometry.fill", "stylers": [{"color": "#d8d8d8"} ] }, {"featureType": "poi", "elementType": "all", "stylers": [{"visibility": "off"} ] }, {"featureType": "road", "elementType": "all", "stylers": [{"saturation": -100 }, {"lightness": 45 } ] }, {"featureType": "road.highway", "elementType": "all", "stylers": [{"visibility": "simplified"} ] }, {"featureType": "road.highway", "elementType": "geometry.fill", "stylers": [{"color": "#ff3566"} ] }, {"featureType": "road.highway", "elementType": "labels", "stylers": [{"visibility": "off"} ] }, {"featureType": "road.arterial", "elementType": "geometry.fill", "stylers": [{"color": "#f2ff3d"} ] }, {"featureType": "road.arterial", "elementType": "geometry.stroke", "stylers": [{"visibility": "off"} ] }, {"featureType": "road.arterial", "elementType": "labels", "stylers": [{"visibility": "off"} ] }, {"featureType": "road.arterial", "elementType": "labels.icon", "stylers": [{"visibility": "off"} ] }, {"featureType": "road.local", "elementType": "geometry.fill", "stylers": [{"color": "#f2ff3d"} ] }, {"featureType": "road.local", "elementType": "geometry.stroke", "stylers": [{"visibility": "off"} ] }, {"featureType": "road.local", "elementType": "labels", "stylers": [{"visibility": "off"} ] }, {"featureType": "transit", "elementType": "all", "stylers": [{"visibility": "off"} ] }, {"featureType": "water", "elementType": "all", "stylers": [{"color": "#46bcec"}, {"visibility": "on"} ] }, {"featureType": "water", "elementType": "geometry.fill", "stylers": [{"color": "#51c9ea"} ] }, {"featureType": "water", "elementType": "labels", "stylers": [{"visibility": "off"} ] }]
      };
      var mapElement = document.getElementById(id);
      var map = new google.maps.Map(mapElement, mapOptions);
      var locations = partnerLocations;
      for (i = 0; i < locations.length; i++) {
        if (locations[i][1] =='undefined'){ description ='';} else { description = locations[i][1];}
        if (locations[i][2] =='undefined'){ telephone ='';} else { telephone = locations[i][2];}
        if (locations[i][3] =='undefined'){ email ='';} else { email = locations[i][3];}
        if (locations[i][4] =='undefined'){ web ='';} else { web = locations[i][4];}
        if (locations[i][7] =='undefined'){ markericon ='/assets/images/pin-sm.png';} else { markericon = locations[i][7];}
        marker = new google.maps.Marker({
            icon: markericon,
            position: new google.maps.LatLng(locations[i][5], locations[i][6]),
            map: map,
            title: locations[i][0],
            desc: description,
            tel: telephone,
            email: email,
            web: web
        });
        link = '';    
      }

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
      if ($(this).hasClass('selected')) {
        $(this).removeClass('selected');
      } else {
        $(this).addClass('selected');
      }
    });
  }


  // Called in quick succession as window is resized
  function _resize() {
    screenWidth = document.documentElement.clientWidth;
    breakpoint_small = (screenWidth > breakpoint_array[0]);
    breakpoint_medium = (screenWidth > breakpoint_array[1]);
    breakpoint_large = (screenWidth > breakpoint_array[2]);
  }

  // Public functions
  return {
    init: _init,
    resize: _resize,
    scrollBody: function(section, duration, delay, offset) {
      _scrollBody(section, duration, delay, offset);
    }
  };

})(jQuery);

// Fire up the mothership
jQuery(document).ready(Main.init);

// Zig-zag the mothership
jQuery(window).resize(Main.resize);
