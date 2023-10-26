import React from 'react';
import routes from './router';
import { store } from './store';
import { Provider } from 'react-redux';
import styled from 'styled-components';
import { MIRROR_COLOR } from './store/slices/defaultSlices'
import { BrowserRouter, Route, Routes } from 'react-router-dom'

function App() {
  return (
    <>
      <Provider store={store}>
        <Main>
          <BrowserRouter>
            <Routes>
              {routes.map((e) => (
                <Route key={e.path} path={e.path} element={<e.Component/>}/>
              ))}
            </Routes>
          </BrowserRouter>
        </Main>
      </Provider>
    </>
  );
}

const Main = styled.div`
  background-color: ${MIRROR_COLOR}};
`

export default App;

