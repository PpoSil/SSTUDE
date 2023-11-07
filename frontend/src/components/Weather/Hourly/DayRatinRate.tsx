import React from 'react';
import { WeatherDataCustom } from '../types';
import styled from 'styled-components';

type DayRatinRateProps = {
  RainRateDatas: WeatherDataCustom;
  index: number;
};

const DayRatinRate: React.FC<DayRatinRateProps> = ({ RainRateDatas, index }) => {
  // 첫 번째 요소인 경우 "오늘"을 표시
  if (index === 0) {
    return (
      <Label>
        <span className="label">강수확률
        (%)</span>
      </Label>
    );
  }

  const RainRate = RainRateDatas.fcstValue

  return (
    <Wrap>
        <span className="time">{RainRate}%</span> 
    </Wrap>
  );
};

// 그리드 컨테이너에 맞게 스타일링된 컴포넌트
const Wrap = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 0 8px ; // 필요에 따라 조정
`;

const Label = styled.div`
  position: relative; 
  top: 0%; 
  text-align: center;
  /* left: 50%; */
`

export default DayRatinRate;
