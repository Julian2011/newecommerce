import React, { useState, useEffect } from 'react';
import { db } from '../firebase';
import { collection, query, where, getDocs } from 'firebase/firestore';
import { Oval } from 'react-loader-spinner';
import Navbar from './Navbar';
import Footer from './Footer';

function Calzado() {
    const [productos, setProductos] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const obtenerProductosCalzado = async () => {
            try {
                const q = query(collection(db, 'productos'), where('categoria', '==', 'calzado'));
                const querySnapshot = await getDocs(q);
                const productosCalzado = querySnapshot.docs.map((doc) => ({
                    id: doc.id,
                    ...doc.data(),
                }));

                setProductos(productosCalzado);
                setLoading(false);
            } catch (error) {
                console.error('Error al obtener productos:', error);
                setLoading(false);
            }
        };

        obtenerProductosCalzado();
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
            <div className="container mt-5">
                <h2>Productos - Calzado</h2>
                <div className="row">
                    {productos.length > 0 ? (
                        productos.map((producto) => (
                            <div key={producto.id} className="col-md-4 mb-4">
                                <div className="card">
                                    <img src={producto.imagenUrl} className="card-img-top" alt={producto.nombre} />
                                    <div className="card-body">
                                        <h5 className="card-title">{producto.nombre}</h5>
                                        <p className="card-text">{producto.descripcion}</p>
                                        <p className="card-text">Precio: ${producto.precio}</p>
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

export default Calzado;
