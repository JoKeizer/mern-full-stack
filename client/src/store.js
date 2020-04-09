import {createStore, applyMiddleware} from 'redux';

import {composeWithDevTools} from 'redux-devtools-extension';
//middleware
import thunk from 'redux-thunk';
//root reducer if you have more reducere auth profile etc
import rootReducer from './reducers';


const initialState = {};

const middleware = [thunk];

const store = createStore (
    rootReducer, 
    initialState, 
    composeWithDevTools(applyMiddleware(...middleware))
);

export default store;