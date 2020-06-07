import React from 'react';
import {Route, BrowserRouter} from 'react-router-dom';

import Home from './Pages/Home';
import CreatePoints from './Pages/CreatePoints';

const Routes = () => {
    return (
        <BrowserRouter>
            <Route exact component={Home} path="/" />
            <Route component={CreatePoints} path="/create" />
        </BrowserRouter>
    )
}

export default Routes;