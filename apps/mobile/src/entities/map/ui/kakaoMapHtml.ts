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

    // 서울 시청을 중심으로, 확대/축소 레벨 4(기본값)의 지도를 띄움 
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

    // web -> RN 보내는 메세지 처리 함수
    function sendToRN(message) {
      if (window.ReactNativeWebView) {
        window.ReactNativeWebView.postMessage(JSON.stringify(message));
      }
    }

    // RN -> Web 메시지 수신부 (RN에서 injectJavaScript로 이 함수를 호출하여 명령 전달)
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

    // 검색 명령 함수
    function searchCategory(payload) {
      clearMarkers();
      // useMapBounds 대신 지도 중심 기준 반경 1km 검색 → 줌 레벨과 무관하게 일정 범위 보장
      var center = map.getCenter();
      var opts = {
        location: center,
        radius: 1000,
        sort: kakao.maps.services.SortBy.DISTANCE,
      };

      if (payload.keyword) {
        ps.keywordSearch(payload.keyword, placesSearchCB, opts);
      } else if (payload.code) {
        ps.categorySearch(payload.code, placesSearchCB, opts);
      }
    }

    // 검색 결과 받아서 처리 
    function placesSearchCB(data, status) {
      if (status === kakao.maps.services.Status.OK) {
        displayMarkers(data);
      } else if (status === kakao.maps.services.Status.ERROR) {
        sendToRN({ type: 'MAP_ERROR', payload: { message: '검색 중 오류가 발생했습니다.' } });
      }
    }

    // 검색 결과 마커 표시 
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

    // 마커 지우기 
    function clearMarkers() {
      markers.forEach(function(m) { m.setMap(null); });
      markers = [];
      infowindow.close();
      currentClickedPlace = null;
    }

    // 지도 중심 이동 
    function moveToLocation(lat, lng) {
      var latLng = new kakao.maps.LatLng(lat, lng);
      map.setCenter(latLng);
    }

    // libraries=services를 URL에 포함하면 SDK가 비동기 로드됨 → load() 콜백 안에서만 services 사용 가능
    kakao.maps.load(init);
  </script>
</body>
</html>
`;
