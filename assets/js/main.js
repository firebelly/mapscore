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
        ['Greater Auburn-Gresham Development Corporation', '1159 West 79th Street Chicago, IL', '773-483-3696', 'undefined', 'http://www.gagdc.org/', 41.7503217, -87.65356170000001],
        ['Centers For New Horizons Inc', 'undefined', '773-373-5700', 'undefined', 'http://cnh.org', 41.8186204, -87.61735729999998],
        ['Claretian Associate', '9108 South Brandon Avenue, Chicago, IL', '773-734-9181', 'portera@claretianassociates.org', 'https://www.claretianassociates.org', 41.7296735, -87.54732000000001],
        ['Hyde Park Neighborhood Club', '5480 S. KENWOOD AVENUE, CHICAGO, IL 60615', '773-643-4062', 'info@hpnclub.org', 'http://hpnclub.org', 41.7958986, -87.59401860000003],
        ['Demoiselle 2 Femme', 'undefined', '773-660-1677', 'undefined', 'http://demoiselle2femme.org', 41.7224835, -87.6817249],
        ['Sinai Community Institute', '2653 West Ogden Avenue, Chicago, Illinois 60608', '773-257-6508', 'undefined', 'http://www.sinai.org/content/sinai-community-institute-0', 41.8621073, -87.6927976],
        ['Near West Side Community Development Corporation', '216 South Hoyne Avenue, Chicago, IL 60612', '312-738-2280', 'undefined', 'http://nearwestsidecdc.org/', 41.8781545, -87.67924619999997],
        ['Enlace Chicago', '773-542-9233', 'info@enlacechicago.org', 'http://www.enlacechicago.org/', -87.7234694, 41.8407009],
        ['BUILD Chicago', '5100 W. Harrison, Chicago IL 60644', '773-227-2880', 'undefined', 'http://www.buildchicago.org/', -87.75370459999999, 41.8731717]
      ],
      elementID: 'chicago-partners',
      partnerZoom: 11
    };

    var nyc = {
      partnerLat: 40.7993063,
      partnerLng: -73.937144,
      partnerLocations: [
        ['Mount Sinai Adolescent Health Center', '312-320 East 94th Street, New York, NY 10128', '212-423-3000', 'undefined', 'http://www.mountsinai.org/patient-care/service-areas/adolescent-health-center', 40.7823722, -73.94719570000001],
        ['Claremont Healthy Village', '1276 Fulton Ave., Bronx, NY 10456', ' 718-901-8297', 'undefined', 'http://www.blhfamilymed.com/Community-Involvement/CHVI', 40.8313933, -73.90273730000001],
        ['Urban Health Plan, Inc', '1065 Southern Boulevard, Bronx, New York 10459', '718-589-2440', 'info@urbanhealthplan.org', 'http://www.urbanhealthplan.org/', 40.825011, -73.89228300000002],
        ['Two Bridges Neighborhood Council', '275 Cherry Street, New York, NY 10002', '212-566-2729  ', 'info@twobridges.org', 'http://www.twobridges.org/', 40.71093169999999, -73.98848079999999]
      ],
      elementID: 'nyc-partners',
      partnerZoom: 11
    };

    var niagara = {
      partnerLat: 43.1132875,
      partnerLng: -79.0355104,
      partnerLocations: [
        ['Creat a Healthier Niagara Falls Collaborative', '1385 Broadway, 23rd Floor, New York, NY 10018', '212-664-7656', 'undefined', 'http://nyshealthfoundation.org/our-grantees/grantee-profile/create-a-healthier-niagara-falls-collaborative', 40.7528622, -73.987863],
        ['Planned Parenthood of Central and Western New York', '2697 Main Street, Buffalo 14214', '716-831-2200', 'undefined', 'https://www.plannedparenthood.org/planned-parenthood-central-western-new-york', 42.940527, -78.83722399999999],
        ['Niagara Employment &amp; Training', '1001 Eleventh Street, Niagara Falls, NY 14301', '716.278.8108', 'undefined', 'http://worksource1.com/', 43.09876599999999, -79.04935499999999],
        ['Community Health Center of Niagara Falls', '2715 Highland Avenue, Niagara Falls, New York 14305', '716-278-4418', 'undefined', 'http://www.chcb.net/outreach/read.php?id=19', 43.11303599999999, -79.048565],
        ['Mount Saint Marys Hospital', '3101 Ninth Street, Niagara Falls, NY 14305', '716-284-8917', 'undefined', 'http://www.chsbuffalo.org/Facilities/PrimaryCare/MountStMarysNeighborhoodHealthCenter', 43.1158483, -79.0525589],
        ['Niagara Falls Memorial Medical Center', '621 Tenth Street, Niagara Falls, NY 14302', '716-278-4000', 'undefined', 'http://nfmmc.org/', 43.09383820000001, -79.05033229999998],
        ['Niagara University', 'Niagara University, NY 14109', '800-462-2111', 'undefined', 'http://www.niagara.edu/', 43.1383605, -79.03766719999999]
      ],
      elementID: 'niagara-partners',
      partnerZoom: 12
    };

    var nashEdgecombe = {
      partnerLat: 35.8893318,
      partnerLng: -77.9239492,
      partnerLocations: [
        ['Resourceful Communities', '1655 N. Fort Myer Drive, Suite 1300, Arlington, Virginia 22209', '703-525-6300', 'webmaster@conservationfund.org', 'http://www.conservationfund.org/what-we-do/resourceful-communities', 38.8938808, -77.0715055],
        ['UNC Center for Health Equity Research', '323 MacNider Hall, Campus Box 7240, 333 South Columbia Street, Chapel Hill, NC 27599-7240', '919.843.8271', 'cher@unc.edu', 'http://cher.unc.edu/', 35.9049122, -79.0469134],
        ['Project Momentum', 'undefined', 'undefined', 'undefined', 35.9419921, -77.79512299999999]
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
          styles: [{"featureType": "administrative", "elementType": "labels.text.fill", "stylers": [{"color": "#444444"} ] }, {"featureType": "landscape", "elementType": "all", "stylers": [{"color": "#f2f2f2"} ] }, {"featureType": "landscape.man_made", "elementType": "geometry.fill", "stylers": [{"color": "#d8d8d8"} ] }, {"featureType": "poi", "elementType": "all", "stylers": [{"visibility": "off"} ] }, {"featureType": "road", "elementType": "all", "stylers": [{"saturation": -100 }, {"lightness": 45 } ] }, {"featureType": "road.highway", "elementType": "all", "stylers": [{"visibility": "simplified"} ] }, {"featureType": "road.highway", "elementType": "geometry.fill", "stylers": [{"color": "#ff3566"} ] }, {"featureType": "road.highway", "elementType": "labels", "stylers": [{"visibility": "off"} ] }, {"featureType": "road.arterial", "elementType": "geometry.fill", "stylers": [{"color": "#f2ff3d"} ] }, {"featureType": "road.arterial", "elementType": "geometry.stroke", "stylers": [{"visibility": "off"} ] }, {"featureType": "road.arterial", "elementType": "labels", "stylers": [{"visibility": "off"} ] }, {"featureType": "road.arterial", "elementType": "labels.icon", "stylers": [{"visibility": "off"} ] }, {"featureType": "road.local", "elementType": "geometry.fill", "stylers": [{"color": "#f2ff3d"} ] }, {"featureType": "road.local", "elementType": "geometry.stroke", "stylers": [{"visibility": "off"} ] }, {"featureType": "road.local", "elementType": "labels", "stylers": [{"visibility": "off"} ] }, {"featureType": "transit", "elementType": "all", "stylers": [{"visibility": "off"} ] }, {"featureType": "water", "elementType": "all", "stylers": [{"color": "#46bcec"}, {"visibility": "on"} ] }, {"featureType": "water", "elementType": "geometry.fill", "stylers": [{"color": "#51c9ea"} ] }, {"featureType": "water", "elementType": "labels", "stylers": [{"visibility": "off"} ] }]
      };
      var mapElement = document.getElementById(id);
      var map = new google.maps.Map(mapElement, mapOptions);
      var locations = partnerLocations;
      for (i = 0; i < locations.length; i++) {
        // if (locations[i][1] == 'undefined'){ description ='';} else { description = locations[i][1];}
        if (locations[i][1] == 'undefined'){ address ='';} else { address = locations[i][1];}
        if (locations[i][2] == 'undefined'){ telephone ='';} else { telephone = locations[i][2];}
        if (locations[i][3] == 'undefined'){ email ='';} else { email = locations[i][3];}
        if (locations[i][4] == 'undefined'){ web ='';} else { web = locations[i][4];}
        markericon ='/assets/images/pin-sm.png';
        marker = new google.maps.Marker({
            icon: markericon,
            position: new google.maps.LatLng(locations[i][5], locations[i][6]),
            map: map,
            title: locations[i][0],
            // desc: description,
            address: address,
            tel: telephone,
            email: email,
            web: web
        });

        google.maps.event.addListener(marker, 'click', function(){
          var partnerDetails = '<h4>'+this.title+'</h4>'+
            '<p>'+this.address+'</p><br>'+
            '<p><a href="'+this.web+'" target="_blank">'+this.web+'</a></p>'+
            '<p>'+this.email+'</p>'+
            '<p>'+this.tel+'</p>';
          infowindow.setContent(partnerDetails);
          infowindow.open(map, this);
        }); 
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
