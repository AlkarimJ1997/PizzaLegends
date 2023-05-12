import ReactDOM from 'react-dom/client';
import App from './App.tsx';
import './models/maps.ts';
import './models/pizzas.ts';
import './models/actions.ts';
import './styles/global.css';

ReactDOM.createRoot(document.getElementById('root') as HTMLElement).render(<App />);
