import ReactDOM from 'react-dom/client';
import App from './App.tsx';
import './models/actions';
import './models/animations';
import './models/maps';
import './models/pizzas';
import './styles/global.css';

ReactDOM.createRoot(document.getElementById('root') as HTMLElement).render(
	<App />
);
