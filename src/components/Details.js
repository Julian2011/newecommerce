import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { db } from '../firebase';
import { doc, getDoc, collection, addDoc, getDocs, updateDoc } from 'firebase/firestore';
import { auth } from '../firebase'; 
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faUser } from '@fortawesome/free-solid-svg-icons';
import { Oval } from 'react-loader-spinner';
import Navbar from './Navbar';
import Footer from './Footer';

function Details() {
  const { id } = useParams(); 
  const [producto, setProducto] = useState(null);
  const [cantidad, setCantidad] = useState(1); 
  const [comentarios, setComentarios] = useState([]); 
  const [nuevoComentario, setNuevoComentario] = useState(''); 
  const [user, setUser] = useState(null); 
  const [showAlert, setShowAlert] = useState(false);

  useEffect(() => {
    // Obtener los detalles del producto
    const fetchProducto = async () => {
      const productoDoc = doc(db, 'productos', id);
      const productoSnapshot = await getDoc(productoDoc);

      if (productoSnapshot.exists()) {
        setProducto({ id: productoSnapshot.id, ...productoSnapshot.data() });
      } else {
        console.log('Producto no encontrado');
      }
    };

    // Obtener los comentarios
    const fetchComentarios = async () => {
      const comentariosCollection = collection(db, 'comentarios');
      const comentariosSnapshot = await getDocs(comentariosCollection);
      const comentariosList = comentariosSnapshot.docs
        .map((doc) => ({ id: doc.id, ...doc.data() }))
        .filter((comentario) => comentario.productoId === id);
      setComentarios(comentariosList);
    };

    // Obtener el usuario actual
    const fetchUser = () => {
      const currentUser = auth.currentUser;
      if (currentUser) {
        setUser(currentUser);
      }
    };

    fetchProducto();
    fetchComentarios();
    fetchUser();
  }, [id]);

  const handleAgregarComentario = async () => {
    if (nuevoComentario.trim() === '') {
      return; 
    }
  
    try {
      const userDoc = await getDoc(doc(db, 'usuarios', user.uid));
      const nombreUsuario = userDoc.exists() ? userDoc.data().nombre : 'Anónimo';
  
      const comentario = {
        productoId: id,
        nombreUsuario: nombreUsuario,
        userId: user.uid,
        comentario: nuevoComentario,
        timestamp: new Date(),
      };
  
      await addDoc(collection(db, 'comentarios'), comentario);
      setNuevoComentario(''); 
  
      // Actualizar la lista de comentarios
      setComentarios((prevComentarios) => [...prevComentarios, comentario]);
    } catch (error) {
      console.error('Error al agregar el comentario:', error);
    }
  };

  // Función para agregar el producto al carrito
  const handleAgregarAlCarrito = async () => {
    if (cantidad < 1 || !producto) {
      return; 
    }

    try {
      const userDoc = await getDoc(doc(db, 'usuarios', user.uid));
      const nombreUsuario = userDoc.exists() ? userDoc.data().nombre : 'Anónimo';

      const productoCarrito = {
        productoId: id,
        nombre: producto.nombre,
        userId: user.uid,
        nombreUsuario: nombreUsuario,
        precio: producto.precio,
        cantidad: cantidad,
        imagen: producto.imagenUrl, 
      };

      // Guardar en la colección 'Carrito'
      await addDoc(collection(db, 'Carrito'), productoCarrito);

      // Actualizar el stock del producto
      const productoRef = doc(db, 'productos', id);
      await updateDoc(productoRef, {
        stock: producto.stock - cantidad,
      });

      // Mostrar la alerta de éxito
      setShowAlert(true);

      // Ocultar la alerta después de 3 segundos
      setTimeout(() => {
        setShowAlert(false);
      }, 3000);
    } catch (error) {
      console.error('Error al agregar al carrito:', error);
    }
  };

  if (!producto) {
    return (
      <div className="d-flex justify-content-center align-items-center" style={{ height: '100vh' }}>
        <Oval height={80} width={80} color="#4fa94d" visible={true} ariaLabel="oval-loading" />
      </div>
    );
  }

  return (
    <div>
      <Navbar />

      {/* Alerta de Bootstrap */}
      {showAlert && (
        <div className="alert alert-success alert-dismissible fade show" role="alert">
          ¡Producto agregado al carrito con éxito!
          <button type="button" className="btn-close" onClick={() => setShowAlert(false)}></button>
        </div>
      )}

      <div className="container mt-5">
        <div className="row">
          {/* Imagen del producto */}
          <div className="col-md-6">
            <img src={producto.imagenUrl} alt={producto.nombre} style={{ width: '100%', maxHeight: '400px', objectFit: 'contain' }} />
          </div>

          {/* Detalles del producto */}
          <div className="col-md-6">
            <h1>{producto.nombre}</h1>
            <p>{producto.descripcion}</p>
            <p><strong>Precio: ${producto.precio}</strong></p>

            {/* Selección de cantidad */}
            <div className="d-flex align-items-center mb-3">
              <label htmlFor="cantidad" className="me-3">Cantidad:</label>
              <input
                id="cantidad"
                type="number"
                value={cantidad}
                onChange={(e) => setCantidad(Number(e.target.value))}
                min="1"
                className="form-control"
                style={{ width: '100px' }}
              />
            </div>

            {/* Botón de agregar al carrito */}
            <button className="btn btn-primary mb-4" onClick={handleAgregarAlCarrito}>Agregar al Carrito</button>
          </div>
        </div>

        {/* Sección de comentarios dentro de una card centrada */}
        <div className="d-flex justify-content-center mt-5">
          <div className="card" style={{ width: '80%', maxWidth: '800px' }}>
            <div className="card-body">
              <h2 className="card-title">Comentarios</h2>

              {/* Lista de comentarios */}
              {comentarios.length > 0 ? (
                comentarios.map((comentario) => (
                  <div key={comentario.id} className="card mb-3">
                    <div className="card-body">
                      <div className="d-flex align-items-center">
                        <FontAwesomeIcon icon={faUser} className="me-2" />
                        <h5 className="card-title mb-1">{comentario.nombreUsuario}</h5>
                      </div>
                      <p className="card-text">{comentario.comentario}</p>
                    </div>
                  </div>
                ))
              ) : (
                <p>No hay comentarios todavía.</p>
              )}

              {/* Campo para agregar un nuevo comentario */}
              {user && (
                <div className="mt-4">
                  <h4>Agregar un comentario</h4>
                  <textarea
                    value={nuevoComentario}
                    onChange={(e) => setNuevoComentario(e.target.value)}
                    className="form-control"
                    rows="3"
                    placeholder="Escribe tu comentario..."
                  />
                  <button className="btn btn-primary mt-2" onClick={handleAgregarComentario}>
                    Enviar comentario
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
      <Footer />
    </div>
  );
}

export default Details;








