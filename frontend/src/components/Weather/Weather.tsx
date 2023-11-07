import React, { useState, useEffect } from 'react'
import Today from './Today'
import Week from './Week'
import Hourly from './Hourly/Hourly'
import { getWeatherData } from '../../apis/api'
import { WeatherDataResponse, WeatherDataCustom } from './types';

const Weather = () => {
  const [dailySky, setDailySky] = useState<WeatherDataResponse[]>([]);
  const [TempDatas, setTempDatas] = useState<WeatherDataResponse[]>([]);
  const [RainRateDatas, setRainRateDatas] = useState<WeatherDataResponse[]>([]);
  const [RainAmountDatas, setRainAmountDatas] = useState<WeatherDataResponse[]>([]);
  const [HumidityDatas, setHumidityDatas] = useState<WeatherDataResponse[]>([]);

  const day = new Date();
  const hour = day.getHours(); 
  const minutes = day.getMinutes();

  // 시간이 05:00를 지나지 않았다면 전날
  if (hour < 5) {
    day.setDate(day.getDate() - 1);
  }

  const year = day.getFullYear(); 
  const month = (day.getMonth() + 1).toString().padStart(2, '0'); // getMonth()는 0부터 시작하므로 1을 더한다.
  const date = day.getDate().toString().padStart(2, '0');

  const formattedDate = `${year}${month}${date}`;

  // 현재 시간을 기점으로 이후 데이터만 사용하기 위해
  const currentDate = formattedDate; // 'YYYYMMDD' 형식
  const currentTime = `${hour.toString().padStart(2, '0')}${minutes.toString().padStart(2, '0')}`;


  const fetchData = async () => {
    try {
      const response = await getWeatherData({
        numOfRows: 1000,
        pageNo: 1,
        dataType: "JSON",
        base_date: formattedDate,
        base_time: "0500",
        nx: 86,
        ny: 95
      });

      const items = response;
      const CustomData = items.map((item: WeatherDataResponse) => ({
        category: item.category,
        fcstDate: item.fcstDate,
        fcstTime: item.fcstTime,
        fcstValue: item.fcstValue
      }))
      .filter((item: WeatherDataCustom) => {
        return (item.fcstDate === currentDate && item.fcstTime >= currentTime) || (item.fcstDate > currentDate);
      });
      
      // 현재 시간 이후의 데이터만 / 하늘 정보만 필터링.
      const CloudDatas = CustomData
      .filter((item: WeatherDataCustom) => {
        return (item.category === "SKY");
      })
      setDailySky(CloudDatas);
      // console.log(CloudDatas);

      // 기온 정보만 필터링
      const TempDatas = CustomData
      .filter((item: WeatherDataCustom) => {
        return (item.category === "TMP");
      })
      setTempDatas(TempDatas);
      // console.log(TempDatas);

      // 강수확률 정보 필터링
      const RainRateDatas = CustomData
      .filter((item: WeatherDataCustom) => {
        return (item.category === "POP");
      })
      setRainRateDatas(RainRateDatas);
      // console.log(RainRateDatas);


      // 강수량 정보 필터링
      const RainAmountDatas = CustomData
      .filter((item: WeatherDataCustom) => {
        return (item.category === "PCP");
      })
      setRainAmountDatas(RainAmountDatas);
      console.log(RainAmountDatas);
      
      // 습도 정보 필터링
      const HumidityDatas = CustomData
      .filter((item: WeatherDataCustom) => {
        return (item.category === "REH");
      })
      setHumidityDatas(HumidityDatas);
      // console.log(HumidityDatas);

    } catch (error) {
      console.error("데이터를 가져오는 데 실패했습니다:", error);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  return (
    <>
      <Today></Today>
      <Hourly 
        dailySky={dailySky} 
        TempDatas={TempDatas} 
        RainRateDatas={RainRateDatas} 
        RainAmountDatas={RainAmountDatas}
        HumidityDatas={HumidityDatas}
        ></Hourly>
      <Week></Week>
    </>
  )
}

export default Weather