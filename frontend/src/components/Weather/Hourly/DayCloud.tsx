import React from 'react';
import { WeatherDataCustom } from '../types';
import SkyIcon from './SkyIcon';
import styled from 'styled-components';

type DayCloudProps = {
  dailySky: WeatherDataCustom;
  index: number;
};

const DayCloud: React.FC<DayCloudProps> = ({ dailySky, index }) => {
  // 첫 번째 요소인 경우 "오늘"을 표시
  if (index === 0) {
    return (
      <TodayLabel>
        <span className="label">오늘</span>
      </TodayLabel>
    );
  }

  // fcstTime에서 시간 부분만 추출
  const hour = dailySky.fcstTime.slice(0, 2);

  return (
    <TimeSkyWrap id={`hourly-${dailySky.fcstDate}${hour}`}>
      {hour === '00' ? (
        <span className="label">{dailySky.fcstDate === '내일' ? '내일' : '모레'}</span>
      ) : (
        <span className="time">{hour}시</span>
      )}
      <SkyIcon dailySky={dailySky} />
    </TimeSkyWrap>
  );
};

// 그리드 컨테이너에 맞게 스타일링된 컴포넌트
const TimeSkyWrap = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 0 8px ; // 필요에 따라 조정
`;

const TodayLabel = styled.div`
  position: relative; 
  top: 0%; 
  left: 50%;
`

export default DayCloud;
