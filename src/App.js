import { BrowserRouter as Router, Route, Routes, Navigate } from 'react-router-dom';
import Register from './components/Register';
import Login from './components/Login';
import Home from './components/Home';
import Admin from './components/Admin';
import Accesorios from './components/Accesorios';
import Calzado from './components/Calzado';
import Camisetas from './components/Camisetas';
import Jeans from './components/Jeans';
import Bermudas from './components/Bermudas';
import Details from './components/Details';
import Carrito from './components/Carrito';


function App() {
  return (
    <Router>
      <Routes>
        
        <Route path="/" element={<Navigate to="/Home" />} />
        
        {/* Otras rutas */}
        <Route path="/register" element={<Register />} />
        <Route path="/login" element={<Login />} />
        <Route path="/Home" element={<Home />} />
        <Route path="/admin" element={<Admin />} />
        <Route path="/camisetas" element={<Camisetas />} />
        <Route path="/jeans" element={<Jeans />} />
        <Route path="/calzado" element={<Calzado />} />
        <Route path="/accesorios" element={<Accesorios />} />
        <Route path="/bermudas" element={<Bermudas />} />
        <Route path="/productos/:id" element={<Details />} />
        <Route path="/carrito" element={<Carrito />} />
        
        
      </Routes>
    </Router>
  );
}

export default App;


