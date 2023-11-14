import styled from 'styled-components';
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import MainButton from '../Personal/Main/MainButton';
import { useDispatch, useSelector } from 'react-redux';
import { SelectedBuses, BusButtonProps } from './types';
import { AppDispatch, RootState } from '../../store/store';
import { busRealTimeForServer, setBusSave } from './BusSlice';

const BusList = () => {
  const dispatch = useDispatch<AppDispatch>();
  const busList = useSelector((state: RootState) => state.bus.busList) || [];
  const validBusList = Array.isArray(busList)
    ? busList.filter(bus => bus !== undefined)
    : busList ? [busList] : [];
  const [selectedBuses, setSelectedBuses] = useState<SelectedBuses>({});
  const [errorMessage, setErrorMessage] = useState('');

  const navigate = useNavigate();

  const toggleBusSelection = (routeId: string) => {
    setSelectedBuses(prevSelected => ({
      ...prevSelected,
      [routeId]: !prevSelected[routeId],
    }));
  };

  const allSelect = () => {
    const newSelectedBuses: SelectedBuses = validBusList.reduce((selected, bus) => {
      selected[bus.routeId] = true;
      return selected;
    }, {} as SelectedBuses);
    setSelectedBuses(newSelectedBuses);
    setErrorMessage("");
  };

  const resetSelection = () => {
    setSelectedBuses({});
    setErrorMessage("");
  };

  const saveSelection = () => {
    const selectedRouteIds = Object.keys(selectedBuses).filter(routeid => selectedBuses[routeid]);
    if (selectedRouteIds.length === 0) {
      setErrorMessage("버스를 선택해야 합니다.");
      return;
    }
    dispatch(setBusSave(selectedRouteIds));
    dispatch(busRealTimeForServer());
    navigate('/mirror');
  };

  return (
    <BusListContainer>      
      <MainButton />
      {errorMessage && <ErrorMessage>{errorMessage}</ErrorMessage>}
      <Title>
        {validBusList.length > 0 ? '실시간 조회할 버스를 골라주세요' : '해당 정류장의 버스 정보는 제공되지 않습니다 '}
      </Title>
      {validBusList.length > 0 ? (
        <ButtonGrid>
          {validBusList.map(bus => (
            <BusButton
              key={bus.routeId}
              selected={selectedBuses[bus.routeId]}
              onClick={() => toggleBusSelection(bus.routeId)}
            >
              <BusInfo>
                <BusType>{bus.routeType.replace('버스', '')}</BusType>
                <BusNumber>{bus.routeNo}</BusNumber>
              </BusInfo>
            </BusButton>
          ))}
        </ButtonGrid>
      ) : null}
      <ButtonContainer>
        <SelectAllButton onClick={allSelect}>전부 선택</SelectAllButton>
        <ResetButton onClick={resetSelection}>초기화</ResetButton>
        <NavigationButton onClick={saveSelection}>저장</NavigationButton>
      </ButtonContainer>

    </BusListContainer>
  );
};

const BusListContainer = styled.div`
  width: 100%;
  height: 100vh;
  color: #fff;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  font-family: 'Noto Sans KR', sans-serif;
  padding: 20px;
`;

const Title = styled.h2`
  margin-bottom: 32px;
  font-size: 2.5em;
  color: #f7f7f7;
`;

const ButtonGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(150px, 1fr));
  grid-gap: 15px;
  width: 90%;
  max-width: 600px;
`;

const BusButton = styled.div<BusButtonProps>`
  padding: 20px;
  border: 2px solid #fff;
  border-radius: 15px;
  cursor: pointer;
  transition: all 0.3s ease-in-out;
  display: flex;
  justify-content: center;
  background-color: ${({ selected }) => (selected ? '#94c9e4' : 'transparent')};
  color: ${({ selected }) => (selected ? 'black' : 'white')};
`;

const BusInfo = styled.div`
  display: flex;
  flex-direction: column;
  gap: 5px;
`;

const BusType = styled.span`
  font-weight: bold;
  font-size: 1.2em;
  color: #ecf0f1;
`;

const BusNumber = styled.span`
  font-size: 1.5em;
  font-weight: bold;
  color: #ecf0f1;
`;

const NavigationButton = styled.button`
  padding: 15px 30px;
  font-size: 2em;
  border: none;
  color: white;
  background-color: #1988d2;
  border-radius: 5px;
  cursor: pointer;
`;

const SelectAllButton = styled(NavigationButton)`
    background-color: #94c9e4;
`;

const ResetButton = styled(NavigationButton)`
    background-color: #e74c3c;
`;

const ButtonContainer = styled.div`
  position: fixed;
  justify-content: center;
  right: 10%;
  display: flex;
  flex-direction: column;
  gap: 20px;
  z-index: 10;
`;

const ErrorMessage = styled.div`
  background-color: #e74c3c;
  font-size: 5em;
  color: white;
  padding: 30px;
  border-radius: 5px;
`;

export default BusList;
