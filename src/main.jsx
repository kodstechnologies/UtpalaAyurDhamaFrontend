import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import Approuter from "./router/App.jsx";
import "./index.css";

// import { App } from "./app";
import 'bootstrap/dist/css/bootstrap.min.css';
import "./assets/css/bootstrap.min.css";
//CSS & Bootstrap
import "./assets/css/style.css";
//  import "./assets/js/bootstrap.bundle.min.js";
import "./assets/css/select2.min.css";
//Font Awesome
// import "./assets/plugins/fontawesome/css/fontawesome.min.css";
// import "./assets/plugins/fontawesome/css/all.min.css";
import '../node_modules/@fortawesome/fontawesome-free/css/all.min.css';
import '../node_modules/@fortawesome/fontawesome-free/css/fontawesome.min.css';
import '../node_modules/bootstrap/dist/css/bootstrap.min.css';
import '../node_modules/bootstrap/dist/js/bootstrap.bundle.js';
import { Provider } from 'react-redux';
import { store } from './redux/store.js';
import { HelmetProvider } from 'react-helmet-async';

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <HelmetProvider>
      <Provider store={store}>
        <Approuter />
      </Provider>
    </HelmetProvider>
  </StrictMode>,
)
