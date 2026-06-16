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
    var markerPlaces = []; // [{marker, place}] — FOCUS_MARKER에서 마커 찾기용
    var infowindow;
    var ps;
    var currentClickedPlace = null;
    var currentSearchKeyword = '';
    var isKeywordSearch = false; // 키워드 검색 시 결과 중심으로 지도 이동 (줌은 유지)
    var locationMarker = null; // 내 위치 마커 — clearMarkers()로 제거되지 않음

    // 서울 시청을 중심으로, 확대/축소 레벨 4(기본값)의 지도를 띄움
    function init() {
      var container = document.getElementById('map');
      var options = {
        center: new kakao.maps.LatLng(37.5665, 126.9780),
        level: 3,
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
        case 'SEARCH_KEYWORD':
          searchKeyword(message.payload.keyword);
          break;
        case 'FOCUS_MARKER':
          focusMarker(message.payload.x, message.payload.y);
          break;
        case 'CLEAR_MARKERS':
          clearMarkers();
          break;
        case 'MOVE_TO_LOCATION':
          moveToLocation(message.payload.lat, message.payload.lng);
          break;
      }
    };

    // 카테고리 검색 — 지도 위치/줌 그대로, 현재 중심 기준 1km 반경
    function searchCategory(payload) {
      clearMarkers();
      isKeywordSearch = false;
      currentSearchKeyword = payload.keyword || payload.code || '';
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

    // 키워드 검색 — 결과 첫 번째 장소로 중심 이동 (줌은 유지)
    // radius를 지정하면 지도 중심 반경 내 결과만 반환되어 "논현 약국"처럼 키워드에 지역명이 포함된 경우 0건 발생
    function searchKeyword(keyword) {
      clearMarkers();
      isKeywordSearch = true;
      currentSearchKeyword = keyword;
      var center = map.getCenter();
      var opts = {
        location: center,
        sort: kakao.maps.services.SortBy.DISTANCE,
      };
      ps.keywordSearch(keyword, placesSearchCB, opts);
    }

    // 특정 마커 포커스 (리스트 아이템 탭 시)
    function focusMarker(x, y) {
      var lat = parseFloat(y);
      var lng = parseFloat(x);
      map.setCenter(new kakao.maps.LatLng(lat, lng));

      for (var i = 0; i < markerPlaces.length; i++) {
        var mp = markerPlaces[i];
        var pos = mp.marker.getPosition();
        if (Math.abs(pos.getLat() - lat) < 0.00001 && Math.abs(pos.getLng() - lng) < 0.00001) {
          infowindow.setContent('<div class="infowindow">' + mp.place.place_name + '</div>');
          infowindow.open(map, mp.marker);
          break;
        }
      }
    }

    // 검색 결과 받아서 처리
    function placesSearchCB(data, status) {
      if (status === kakao.maps.services.Status.OK) {
        displayMarkers(data);
        if (isKeywordSearch && data.length > 0) {
          map.setCenter(new kakao.maps.LatLng(parseFloat(data[0].y), parseFloat(data[0].x)));
        }
        var places = data.map(function(p) {
          return {
            id: p.id,
            place_name: p.place_name,
            address_name: p.address_name,
            road_address_name: p.road_address_name,
            phone: p.phone,
            place_url: p.place_url,
            x: p.x,
            y: p.y,
            distance: p.distance,
          };
        });
        sendToRN({ type: 'SEARCH_RESULT', payload: { places: places } });
      } else if (status === kakao.maps.services.Status.ZERO_RESULT) {
        sendToRN({ type: 'SEARCH_ZERO_RESULT', payload: { keyword: currentSearchKeyword } });
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

        markerPlaces.push({ marker: marker, place: place });

        kakao.maps.event.addListener(marker, 'click', function() {
          var content = '<div class="infowindow">' + place.place_name + '</div>';
          infowindow.setContent(content);
          infowindow.open(map, marker);

          currentClickedPlace = place;

          sendToRN({
            type: 'MARKER_CLICK',
            payload: {
              id: place.id,
              place_name: place.place_name,
              address_name: place.address_name,
              road_address_name: place.road_address_name,
              phone: place.phone,
              place_url: place.place_url,
              x: place.x,
              y: place.y,
              distance: place.distance,
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
      markerPlaces = [];
      infowindow.close();
      currentClickedPlace = null;
    }

    // 지도 중심 이동 + 내 위치 마커 표시
    function moveToLocation(lat, lng) {
      var latLng = new kakao.maps.LatLng(lat, lng);
      map.setCenter(latLng);

      if (locationMarker) locationMarker.setMap(null);

      var svg = '<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20">'
        + '<circle cx="10" cy="10" r="8" fill="#EF7722" stroke="white" stroke-width="2.5"/>'
        + '</svg>';
      var markerImage = new kakao.maps.MarkerImage(
        'data:image/svg+xml;charset=UTF-8,' + encodeURIComponent(svg),
        new kakao.maps.Size(20, 20),
        { offset: new kakao.maps.Point(10, 10) }
      );
      locationMarker = new kakao.maps.Marker({
        map: map,
        position: latLng,
        image: markerImage,
        zIndex: 10,
      });
    }

    // libraries=services를 URL에 포함하면 SDK가 비동기 로드됨 → load() 콜백 안에서만 services 사용 가능
    kakao.maps.load(init);
  </script>
</body>
</html>
`;
