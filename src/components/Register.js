import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { auth, db } from '../firebase'; 
import { createUserWithEmailAndPassword } from 'firebase/auth';
import { doc, setDoc, getDoc } from 'firebase/firestore';
import './Register.css'; 

function Register() {
  const [formData, setFormData] = useState({
    nombre: '',
    apellido: '',
    direccion: '',
    email: '',
    password: '',
    confirmPassword: ''
  });

  const [error, setError] = useState('');
  const [showAlert, setShowAlert] = useState(false);  
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const { nombre, apellido, direccion, email, password, confirmPassword } = formData;

    if (password !== confirmPassword) {
      setError("Las contraseñas no coinciden");
      return;
    }

    try {
      const emailExists = await getDoc(doc(db, 'usuarios', email));
      if (emailExists.exists()) {
        setError("Este correo electrónico ya está registrado.");
        return;
      }

      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;

      await setDoc(doc(db, 'usuarios', user.uid), {
        nombre,
        apellido,
        direccion,
        email,
        userId: user.uid,
      });

      setShowAlert(true);  

      
      setTimeout(() => {
        setShowAlert(false);  
        navigate("/login"); 
      }, 3000); 

    } catch (error) {
      setError(error.message);
    }
  };

  return (
    <div className="register-container">
      <div className="card register-card">
        <div className="card-body">
          <h2 className="text-center">
            <img src={require('../assets/images/logo.png')} alt="Logo" className="logo" />
          </h2>
          <h2 className="card-title text-center">Registro de Usuario</h2>
          {error && <div className="alert alert-danger">{error}</div>}
          {showAlert && (
            <div className="alert alert-success" role="alert">
              Usuario registrado correctamente. Serás redirigido al login en breve.
            </div>
          )}
          <form onSubmit={handleSubmit} className="row">
            <div className="col-md-6 mb-2">
              <label className="form-label">Nombre</label>
              <input
                type="text"
                className="form-control form-control-sm"
                name="nombre"
                value={formData.nombre}
                onChange={handleChange}
                required
              />
            </div>
            <div className="col-md-6 mb-2">
              <label className="form-label">Apellido</label>
              <input
                type="text"
                className="form-control form-control-sm"
                name="apellido"
                value={formData.apellido}
                onChange={handleChange}
                required
              />
            </div>
            <div className="col-md-6 mb-2">
              <label className="form-label">Dirección</label>
              <input
                type="text"
                className="form-control form-control-sm"
                name="direccion"
                value={formData.direccion}
                onChange={handleChange}
                required
              />
            </div>
            <div className="col-md-6 mb-2">
              <label className="form-label">Correo Electrónico</label>
              <input
                type="email"
                className="form-control form-control-sm"
                name="email"
                value={formData.email}
                onChange={handleChange}
                required
              />
            </div>
            <div className="col-md-6 mb-2">
              <label className="form-label">Contraseña</label>
              <input
                type="password"
                className="form-control form-control-sm"
                name="password"
                value={formData.password}
                onChange={handleChange}
                required
              />
            </div>
            <div className="col-md-6 mb-2">
              <label className="form-label">Confirmar Contraseña</label>
              <input
                type="password"
                className="form-control form-control-sm"
                name="confirmPassword"
                value={formData.confirmPassword}
                onChange={handleChange}
                required
              />
            </div>
            <div className="col-12 text-center">
              <button type="submit" className="btn btn-primary btn-sm">Registrarse</button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}

export default Register;





