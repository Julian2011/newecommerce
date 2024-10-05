import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { auth, db } from '../firebase';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faUser, faShoppingBag } from '@fortawesome/free-solid-svg-icons';
import { onAuthStateChanged, signOut } from 'firebase/auth';
import { doc, getDoc } from 'firebase/firestore';
import logo from '../assets/images/logo.png';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

function Navbar() {
  const [user, setUser] = useState(null);
  const [userName, setUserName] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      if (currentUser) {
        setUser(currentUser);
        // Obtener el nombre del usuario desde Firestore
        const userDoc = await getDoc(doc(db, 'usuarios', currentUser.uid));
        if (userDoc.exists()) {
          setUserName(userDoc.data().nombre); // Obtén el 'nombre' del documento del usuario
        }
      } else {
        setUser(null);
        setUserName('');
      }
    });

    return () => unsubscribe();
  }, []);

  // Función para cerrar sesión
  const handleLogout = async () => {
    try {
      await signOut(auth);
      navigate('/Home');
    } catch (error) {
      console.error("Error al cerrar sesión:", error);
    }
  };

  // Función para manejar el clic en Shopping Bag
  const handleShoppingBagClick = () => {
    if (!user) {
      toast.error('Debes iniciar sesión para poder ver el Shopping Bag');
    } else {
      navigate('/carrito');
    }
  };

  return (
    <>
      <nav className="navbar navbar-expand-lg navbar-light bg-light">
        <div className="container">
          <div className="navbar-nav">
            <Link to="/customer-service" className="nav-link">Servicio al Cliente</Link>
            <Link to="/fashion-news" className="nav-link">Fashion News</Link>
          </div>
          <div className="navbar-brand mx-auto">
            <Link to="/Home">
              <img src={logo} alt="Logo de la tienda" style={{ height: '50px', paddingLeft: "80px" }} />
            </Link>
          </div>
          <div className="navbar-nav ms-auto">
            {user ? (
              <div className="dropdown">
                <span
                  className="nav-link dropdown-toggle"
                  id="userDropdown"
                  role="button"
                  data-bs-toggle="dropdown"
                  aria-expanded="false"
                >
                  <FontAwesomeIcon icon={faUser} className="me-1" />
                  {userName}
                </span>
                <ul className="dropdown-menu" aria-labelledby="userDropdown">
                  <li>
                    <button className="dropdown-item" onClick={handleLogout}>
                      Cerrar Sesión
                    </button>
                  </li>
                </ul>
              </div>
            ) : (
              <Link to="/login" className="nav-link">
                <FontAwesomeIcon icon={faUser} className="me-1" />
                Iniciar Sesión
              </Link>
            )}
            <button className="nav-link" onClick={handleShoppingBagClick}>
              <FontAwesomeIcon icon={faShoppingBag} className="me-1" />
              Shopping Bag
            </button>
          </div>
        </div>
      </nav>
      {/* Fila de categorías */}
      <div className="bg-light py-2">
        <div className="container">
          <div className="row justify-content-center">
            <div className="col-auto">
              <Link to="/camisetas" className="nav-link">Camisetas</Link>
            </div>
            <div className="col-auto">
              <Link to="/jeans" className="nav-link">Jeans</Link>
            </div>
            <div className="col-auto">
              <Link to="/calzado" className="nav-link">Calzado</Link>
            </div>
            <div className="col-auto">
              <Link to="/accesorios" className="nav-link">Accesorios</Link>
            </div>
            <div className="col-auto">
              <Link to="/bermudas" className="nav-link">Bermudas</Link>
            </div>
          </div>
        </div>
      </div>
      <ToastContainer />
    </>
  );
}

export default Navbar;





