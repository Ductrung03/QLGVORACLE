"use client"

import React, { Fragment, useState } from 'react'
import "./globals.scss";
import "react-data-table-component-extensions/dist/index.css";
import { Provider } from 'react-redux'
import { store } from '@/shared/redux/store';
import { Initialload } from '@/shared/contextapi';

const RootLayout = ({ children, }: any) => {

  const [pageloading, setpageloading] = useState(false);

  return (
    <Fragment>
      <Provider store={store}>
        <Initialload.Provider value={{ pageloading, setpageloading }}>
          {children}
        </Initialload.Provider>
      </Provider>
    </Fragment>
  )
}

export default RootLayout;
