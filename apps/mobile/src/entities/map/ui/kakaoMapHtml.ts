export const getKakaoMapHtml = (apiKey: string): string => `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8"/>
  <meta name="viewport" content="width=device-width, initial-scale=1.0, user-scalable=no"/>
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    html, body, #map { width: 100%; height: 100%; overflow: hidden; }
    .infowindow {
      padding: 6px 10px;
      font-size: 13px;
      font-weight: 600;
      color: #1a1a1a;
      background: #fff;
      border-radius: 8px;
      white-space: nowrap;
      cursor: pointer;
    }
  </style>
</head>
<body>
  <div id="map"></div>
  <script src="//dapi.kakao.com/v2/maps/sdk.js?appkey=${apiKey}&libraries=services"></script>
  <script>
    var map;
    var markers = [];
    var infowindow;
    var ps;
    var currentClickedPlace = null;

    function init() {
      var container = document.getElementById('map');
      var options = {
        center: new kakao.maps.LatLng(37.5665, 126.9780),
        level: 4,
      };
      map = new kakao.maps.Map(container, options);
      infowindow = new kakao.maps.InfoWindow({ zIndex: 1 });
      ps = new kakao.maps.services.Places();

      sendToRN({ type: 'MAP_READY' });
    }

    function sendToRN(message) {
      if (window.ReactNativeWebView) {
        window.ReactNativeWebView.postMessage(JSON.stringify(message));
      }
    }

    window.handleRNMessage = function(message) {
      switch (message.type) {
        case 'SEARCH_CATEGORY':
          searchCategory(message.payload);
          break;
        case 'CLEAR_MARKERS':
          clearMarkers();
          break;
        case 'MOVE_TO_LOCATION':
          moveToLocation(message.payload.lat, message.payload.lng);
          break;
      }
    };

    function searchCategory(payload) {
      clearMarkers();
      var opts = { useMapBounds: true };

      if (payload.keyword) {
        ps.keywordSearch(payload.keyword, placesSearchCB, opts);
      } else if (payload.code) {
        ps.categorySearch(payload.code, placesSearchCB, opts);
      }
    }

    function placesSearchCB(data, status) {
      if (status === kakao.maps.services.Status.OK) {
        displayMarkers(data);
      } else if (status === kakao.maps.services.Status.ERROR) {
        sendToRN({ type: 'MAP_ERROR', payload: { message: '검색 중 오류가 발생했습니다.' } });
      }
    }

    function displayMarkers(places) {
      places.forEach(function(place) {
        var marker = new kakao.maps.Marker({
          map: map,
          position: new kakao.maps.LatLng(place.y, place.x),
        });

        kakao.maps.event.addListener(marker, 'click', function() {
          var content = '<div class="infowindow">' + place.place_name + '</div>';
          infowindow.setContent(content);
          infowindow.open(map, marker);

          currentClickedPlace = place;

          sendToRN({
            type: 'MARKER_CLICK',
            payload: {
              place_name: place.place_name,
              address_name: place.address_name,
              road_address_name: place.road_address_name,
              phone: place.phone,
              place_url: place.place_url,
              x: place.x,
              y: place.y,
            },
          });
        });

        markers.push(marker);
      });
    }

    function clearMarkers() {
      markers.forEach(function(m) { m.setMap(null); });
      markers = [];
      infowindow.close();
      currentClickedPlace = null;
    }

    function moveToLocation(lat, lng) {
      var latLng = new kakao.maps.LatLng(lat, lng);
      map.setCenter(latLng);
    }

    kakao.maps.load(init);
  </script>
</body>
</html>
`;
