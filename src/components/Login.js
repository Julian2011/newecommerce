import React, { useState } from 'react';
import { auth } from '../firebase'; 
import { signInWithEmailAndPassword } from "firebase/auth";
import { useNavigate, Link } from 'react-router-dom';

function Login() {
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });

  const [error, setError] = useState('');
  const [showModal, setShowModal] = useState(false);
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const { email, password } = formData;

    try {
      // Condición especial para el administrador
      if (email === "admin@example.com" && password === "admin123456") {
        navigate("/admin");  // Redirige a la vista de administrador
        return;
      }

      // Iniciar sesión con Firebase Auth
      await signInWithEmailAndPassword(auth, email, password);
      navigate("/home");  // Redirige a la página principal después del login
    } catch (error) {
      // Manejo de errores
      if (error.code === "auth/user-not-found" || error.code === "auth/invalid-credential") {
        setError("Usuario no registrado"); // Mensaje específico para usuario no registrado
        setShowModal(true); // Mostrar modal
      } else {
        setError(error.message); // Mostrar otro tipo de error
      }
    }
  };

  const handleCloseModal = () => {
    setShowModal(false);
  };

  return (
    <div className="container mt-5 d-flex justify-content-center">
      <div className="card" style={{ width: '400px' }}>
        <div className="card-body">
          <h2 className="card-title text-center">Iniciar Sesión</h2>
          {error && <div className="alert alert-danger">{error}</div>}
          <form onSubmit={handleSubmit}>
            <div className="mb-3">
              <label className="form-label">Correo Electrónico</label>
              <input
                type="email"
                className="form-control"
                name="email"
                value={formData.email}
                onChange={handleChange}
                required
              />
            </div>
            <div className="mb-3">
              <label className="form-label">Contraseña</label>
              <input
                type="password"
                className="form-control"
                name="password"
                value={formData.password}
                onChange={handleChange}
                required
              />
            </div>
            <div className="text-center">
              <button type="submit" className="btn btn-primary">Iniciar Sesión</button>
            </div>
          </form>

          <div className="mt-3 text-center">
            <p>¿No tienes cuenta? <Link to="/register">Regístrate aquí</Link></p>
          </div>
        </div>
      </div>

      {/* Modal para mostrar cuando el usuario no está registrado */}
      <div className={`modal fade ${showModal ? 'show' : ''}`} style={{ display: showModal ? 'block' : 'none' }} tabIndex="-1" role="dialog">
        <div className="modal-dialog" role="document">
          <div className="modal-content">
            <div className="modal-header">
              <h5 className="modal-title">Usuario No Registrado</h5>
            </div>
            <div className="modal-body">
              <p>No te encuentras registrado, por favor llena el formulario de registro.</p>
            </div>
            <div className="modal-footer">
              <button type="button" className="btn btn-secondary" onClick={() => { setShowModal(false); navigate("/register"); }}>
                Registrarse
              </button>
              <button type="button" className="btn btn-danger" onClick={handleCloseModal}>
                Cancelar
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Login;



