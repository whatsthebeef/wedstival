var initMaps = function(google) {

   var larchfieldLongLat = new google.maps.LatLng(53.819068, -1.254719);

   var larchfieldMap;
   var initLarchfieldMap = function() {
      var mapCanvas = document.getElementById('map_canvas_larchfield');
      var mapOptions = {
         center: larchfieldLongLat,
         zoom: 10,
         mapTypeId: google.maps.MapTypeId.ROADMAP
      }
      larchfieldMap = new google.maps.Map(mapCanvas, mapOptions)
   }
   google.maps.event.addDomListener(window, 'load', function(){
      initLarchfieldMap();
      var marker = new google.maps.Marker({
         position: larchfieldLongLat,
         map: larchfieldMap,
         url: "https://www.google.com/maps/place/Larchfield+House,+Church+St,+Barkston+Ash,+Tadcaster,+North+Yorkshire+LS24+9PJ,+UK/@53.8190678,-1.2547195,17z/data=!3m1!4b1!4m2!3m1!1s0x4879474d1d751c89:0x284963a9e971207e?hl=en-419"
      });
      google.maps.event.addListener(marker, 'click', function() {
         window.location.href = this.url;
      })
   });

   var hotelMap;
   var hotels = [
      ['Station Farm Guesthouse', 53.826546, -1.224861, 'http://www.stationfarmguesthouse.co.uk']
   ];

   var initHotels = function() {
      var mapCanvas = document.getElementById('map_canvas_hotels');
      var mapOptions = {
         center: larchfieldLongLat,
         zoom: 10,
         mapTypeId: google.maps.MapTypeId.ROADMAP
      }
      hotelMap = new google.maps.Map(mapCanvas, mapOptions)
   }
   google.maps.event.addDomListener(window, 'load', function(){
      initHotels();
      hotels.forEach(function(hotel){
         var hotelLatLng = new google.maps.LatLng(hotel[1], hotel[2]);
         var marker = new google.maps.Marker({
            position: hotelLatLng,
            url: hotel[3],
            map: hotelMap,
            title: "hotel"
         });
      });
   });

}
