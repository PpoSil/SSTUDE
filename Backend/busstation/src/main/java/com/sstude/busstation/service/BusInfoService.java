package com.sstude.busstation.service;

import com.fasterxml.jackson.core.JsonParser;
import com.fasterxml.jackson.core.JsonProcessingException;
import com.sstude.busstation.dto.request.GpsRequestDto;
import com.sstude.busstation.dto.request.StationRequestDto;
import com.sstude.busstation.dto.response.*;
import com.sstude.busstation.global.error.BusinessException;
import com.sstude.busstation.global.error.ErrorCode;
import com.sstude.busstation.utils.ApiResponseDto;
import com.sstude.busstation.utils.MapFiller;
import lombok.RequiredArgsConstructor;
import lombok.SneakyThrows;
import lombok.extern.slf4j.Slf4j;
import org.json.simple.JSONArray;
import org.json.simple.JSONObject;
import org.json.simple.parser.JSONParser;
import org.json.simple.parser.ParseException;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpEntity;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpMethod;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;

import com.fasterxml.jackson.databind.ObjectMapper;
import org.springframework.web.client.RestTemplate;
import org.springframework.web.util.UriComponentsBuilder;

import java.net.URI;
import java.net.URLEncoder;
import java.nio.charset.StandardCharsets;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;


@Slf4j
@Service
@RequiredArgsConstructor
public class BusInfoService {

    @Value("${spring.data.bus.secret}")
    private String secretKey;

    @Value("${spring.data.bus.station_inform_api}")
    private String station_inform_api;

    @Value("${spring.data.bus.bus_arrival_inform_api}")
    private String bus_arrival_inform_api;

    private final ObjectMapper objectMapper;

    public List<BusStationResponseDto> findBusStationListInform(GpsRequestDto gpsInform){

        Map<String, String> hashMap = buildHashMap(gpsInform, (map, dto) -> {
            map.put("gpsLati", dto.getLatitude());
            map.put("gpsLong", dto.getLongitude());
        });

        String jsonResponse = apiService(station_inform_api, hashMap);

        List<BusStationResponseDto> responseDto = parseResponse(jsonResponse, BusStationApiResponseDto.class);

        return responseDto;
    }

    public List<BusResponseDto> findBusListInform(StationRequestDto stationInform){

        Map<String, String> hashMap = buildHashMap(stationInform, (map, dto) -> {
            map.put("cityCode", dto.getCityCode());
            map.put("nodeId", dto.getNodeId());
        });

        String jsonResponse = apiService(bus_arrival_inform_api, hashMap);

        List<BusResponseDto> responseDto = parseResponse(jsonResponse, BusInformApiResponseDto.class);

        return responseDto;
    }


    private JSONParser parser = new JSONParser();
    private String[] jsonFindPath = new String[]{"response", "body", "items"};
    private String arrayPath = "item";

    private <T extends ApiResponseDto<T, R>, R> List<R> parseResponse(String jsonResponse, Class<T> responseApiDtoClass) {
        try {
            T responseDto = responseApiDtoClass.getDeclaredConstructor().newInstance();


            // Json 정보 파싱
            JSONObject jsonObject = (JSONObject) parser.parse(jsonResponse);

            JSONObject intermediate = getJsonObject(jsonObject, jsonFindPath);

            JSONArray jsonArray = getJsonArray(intermediate);

            List<T> itemList = new ArrayList<>();

            for (Object element : jsonArray){
                JSONObject itemJson = (JSONObject) element;

                // JSONObject를 JSON 문자열로 변환
                String json = itemJson.toString();

                // JSON 문자열을 T 클래스의 인스턴스로 변환
                T test = objectMapper.readValue(json, responseApiDtoClass);

                itemList.add(test);
            }

            List<R> responseInforms = itemList.stream()
                    .map(responseDto::of)
                    .collect(Collectors.toList());

            return responseInforms;

        } catch (JsonProcessingException e) {
            throw new BusinessException(ErrorCode.INTERNAL_SERVER_ERROR);
        } catch (ParseException e) {
            throw new RuntimeException(e);
        } catch(Exception e){
            throw new RuntimeException(e.getMessage());
        }
    }

    private JSONObject getJsonObject(JSONObject jsonObject, String[] keyArray) {

        if(keyArray != null){
            for(String key : keyArray){
                try{
                    jsonObject = (JSONObject) jsonObject.get(key);
                }catch (Exception e){
                    return new JSONObject();
                }

            }
        }
        return jsonObject;
    }

    private JSONArray getJsonArray(JSONObject object) {
        Object obj = object.get(arrayPath);

        // obj가 이미 JSONArray인 경우 그대로 반환합니다.
        if (obj instanceof JSONArray) {
            return (JSONArray) obj;
        }

        // obj가 JSONObject 혹은 기타 다른 데이터 타입인 경우, 이를 JSONArray에 포함시켜 반환합니다.
        JSONArray jsonArray = new JSONArray();
        if (obj != null) {
            jsonArray.add(obj);
        }

        return jsonArray;
    }

    private String apiService(String uri, Map<String, String> queryParams) {
        RestTemplate restTemplate = new RestTemplate();

        // uri 생성
        UriComponentsBuilder uriBuilder = UriComponentsBuilder.fromHttpUrl(uri);

        String query = buildQuery(queryParams);


        // 헤더 설정
        HttpHeaders headers = new HttpHeaders();
        headers.add(HttpHeaders.ACCEPT, "application/json");

        // 헤더 삽입
        HttpEntity<String> entity = new HttpEntity<>(headers);

        // URL 생성하기
        URI apiUrl = URI.create(uriBuilder.toUriString() + "?" + query);

        // http 요청 보내기
        ResponseEntity<String> response = restTemplate.exchange(apiUrl, HttpMethod.GET, entity, String.class);

        // 로그 체크
        log.info("Request URL = " + apiUrl.toString());

        // Return the body of the response.
        return response.getBody();
    }

    private static String buildQuery(Map<String, String> params) {

        StringBuilder result = new StringBuilder();
        for (Map.Entry<String, String> entry : params.entrySet()) {
            if (result.length() > 0) {
                result.append("&");
            }
            result.append(URLEncoder.encode(entry.getKey(), StandardCharsets.UTF_8));
            result.append("=");
            result.append(URLEncoder.encode(entry.getValue(), StandardCharsets.UTF_8));
        }
        return result.toString();
    }

    private <T> Map<String, String> buildHashMap(T requestDto, MapFiller<T> filler){
        Map<String, String> params = new HashMap<>();
        // 기본 옵션
        params.put("serviceKey", secretKey);
        params.put("pageNo", "1");
        params.put("numOfRows", "10");
        params.put("_type", "json");

        // DTO에 맞게 옵션을 추가하는 로직
        // Filler의 interface 를 활용해 Type에 맞는 DTO의 정보를 가져올 수 있게 함
        // 윗단에서 람다를 사용할 예정
        filler.fill(params, requestDto);
        return params;
    }


//    private List<BusStationResponseDto> parseResponse(String jsonResponse) {
//        try {
//
//            BusListApiResponseDto apiResponse = objectMapper.readValue(jsonResponse, BusListApiResponseDto.class);
//            List<BusListApiResponseDto.Response.Body.Items.Item> busStationInforms = apiResponse.getResponse().getBody().getItems().getItem();  // 첫 번째 아이템만 가져옵니다.
//
//            return busStationInforms.stream().map(
//                    station_inform
//                            -> BusStationResponseDto.builder()
//                            .cityCode(station_inform.getCitycode())
//                            .latitude(station_inform.getGpslati())
//                            .longitude(station_inform.getGpslong())
//                            .nodeName(station_inform.getNodenm())
//                            .nodeId(station_inform.getNodeid())
//                            .nodeNo(station_inform.getNodeno())
//                            .build()
//            ).toList();
//
//        } catch (JsonProcessingException e) {
//            System.out.println(e);
//            throw new BusinessException(ErrorCode.INTERNAL_SERVER_ERROR);
//        }
//    }

}
