import React, { useEffect, useState } from 'react';
import Navbar from './Navbar';
import { Link } from 'react-router-dom';
import gifUrl from '../assets/images/home.gif'; 
import { db } from '../firebase'; 
import { collection, getDocs } from 'firebase/firestore'; 
import Footer from './Footer';
import { Oval } from 'react-loader-spinner';

function Home() {
  const [productos, setProductos] = useState([]);
  const [loading, setLoading] = useState(true); 

  useEffect(() => {
    const fetchProductos = async () => {
      setLoading(true); // Iniciar carga
      const productosCollection = collection(db, 'productos');
      const productosSnapshot = await getDocs(productosCollection);
      const productosList = productosSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setProductos(productosList);
      setLoading(false); 
    };

    fetchProductos();
  }, []);

  const getRandomProducts = (num) => {
    const shuffled = productos.sort(() => 0.5 - Math.random());
    return shuffled.slice(0, num);
  };

  if (loading) {
    return (
      <div className="d-flex justify-content-center align-items-center" style={{ height: '100vh' }}>
        <Oval
          height={80}
          width={80}
          color="#4fa94d"
          visible={true}
          ariaLabel="oval-loading"
        />
      </div>
    );
  }

  return (
    <div>
      <Navbar />
      {/* GIF  */}
      <div style={{ position: 'relative', textAlign: 'center', color: 'white' }}>
        <img src={gifUrl} alt="New Arrivals" style={{ width: '100%', height: '450px' }} />
        <div style={{
          position: 'absolute',
          top: '50%',
          left: '50%',
          transform: 'translate(-50%, -50%)',
          borderRadius: 3
        }}>
          <h1 style={{ fontSize: '4rem', fontWeight: 'bold', textShadow: '2px 2px 4px rgba(0, 0, 0, 0.5)' }}>
            NEW ARRIVALS
          </h1>
          <p style={{ fontSize: '1.5rem', marginTop: '10px', textShadow: '1px 1px 3px rgba(0, 0, 0, 0.5)' }}>
            +100 referencias añadidas
          </p>
        </div>
      </div>

      {/* Título de New Arrivals */}
      <div className="container mt-5 text-center">
        <h2>New Arrivals</h2>
        <div className="row">
          {getRandomProducts(3).map(producto => (
            <div key={producto.id} className="col-md-4 mb-4">
              <div className="card" style={{ maxWidth: '200px', margin: '0 auto', height: "430px"}}> 
                <img src={producto.imagenUrl} className="card-img-top" alt={producto.nombre} style={{ height: '200px', width: '100%', objectFit: 'contain' }} />
                <div className="card-body">
                  <h5 className="card-title" style={{ fontSize: '1rem' }}>{producto.nombre}</h5> 
                  <p className="card-text" style={{ fontSize: '0.9rem' }}>{producto.descripcion}</p> 
                  <p className="card-text"><strong>${producto.precio}</strong></p>
                  <Link to={`/productos/${producto.id}`} className="btn btn-primary btn-sm">Ver Detalles</Link> 
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
      <Footer />
    </div>
  );
}

export default Home;






