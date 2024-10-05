import React, { useState, useEffect } from 'react';
import { db } from '../firebase';
import { collection, query, where, getDocs } from 'firebase/firestore';
import { Oval } from 'react-loader-spinner';
import Navbar from './Navbar';
import Footer from './Footer';
import { Link } from 'react-router-dom';

function Jeans() {
    const [productos, setProductos] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const obtenerProductosJeans = async () => {
            try {
                const q = query(collection(db, 'productos'), where('categoria', '==', 'jeans'));
                const querySnapshot = await getDocs(q);
                const productosJeans = querySnapshot.docs.map((doc) => ({
                    id: doc.id,
                    ...doc.data(),
                }));

                setProductos(productosJeans);
                setLoading(false);
            } catch (error) {
                console.error('Error al obtener productos:', error);
                setLoading(false);
            }
        };

        obtenerProductosJeans();
    }, []);

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
            <div className="container mt-5 text-center">
                <h2>Productos - Jeans</h2>
                <div className="row">
                    {productos.length > 0 ? (
                        productos.map((producto) => (
                            <div key={producto.id} className="col-md-4 mb-4">
                                <div className="card" style={{ maxWidth: '200px', margin: '0 auto', height: "430px" }}>
                                    <img src={producto.imagenUrl} className="card-img-top" alt={producto.nombre} style={{ height: '200px', width: '100%', objectFit: 'contain' }} />
                                    <div className="card-body">
                                        <h5 className="card-title" style={{ fontSize: '1rem' }}>{producto.nombre}</h5>
                                        <p className="card-text" style={{ fontSize: '0.9rem' }}>{producto.descripcion}</p>
                                        <p className="card-text"><strong>${producto.precio}</strong></p>
                                        <Link to={`/productos/${producto.id}`} className="btn btn-primary btn-sm">Ver Detalles</Link>
                                    </div>
                                </div>
                            </div>
                        ))
                    ) : (
                        <p>No hay productos disponibles en esta categoría.</p>
                    )}
                </div>
            </div>
            <Footer />
        </div>
    );
}

export default Jeans;

