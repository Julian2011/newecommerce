import React, { useEffect, useState } from 'react';
import { db, auth } from '../firebase';
import { collection, getDocs, query, where, deleteDoc, doc, addDoc } from 'firebase/firestore';
import './Carrito.css';
import Navbar from './Navbar';

const Carrito = () => {
    const [carrito, setCarrito] = useState([]);
    const [subtotal, setSubtotal] = useState(0);
    const [total, setTotal] = useState(0);
    const [showAlert, setShowAlert] = useState(false); // Para controlar la visibilidad de la alerta
    const userId = auth.currentUser?.uid; 

    useEffect(() => {
        const fetchCarrito = async () => {
            const carritoCollection = query(collection(db, 'Carrito'), where('userId', '==', userId));
            const carritoSnapshot = await getDocs(carritoCollection);
            const carritoList = carritoSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
            setCarrito(carritoList);
        };

        fetchCarrito();
    }, [userId]);

    useEffect(() => {
        const calcularTotales = () => {
            const newSubtotal = carrito.reduce((acc, item) => acc + (item.precio * item.cantidad), 0);
            setSubtotal(newSubtotal);
            setTotal(newSubtotal); // Aquí puedes agregar impuestos si lo deseas
        };

        calcularTotales();
    }, [carrito]);

    const handleEliminarProducto = async (id) => {
        try {
            await deleteDoc(doc(db, 'Carrito', id));
            setCarrito(carrito.filter(item => item.id !== id));
        } catch (error) {
            console.error("Error al eliminar el producto:", error);
        }
    };

    const handleFinalizarCompra = async () => {
        try {
            // Agregar cada producto de Carrito a la colección de Compras
            const comprasRef = collection(db, 'Compras');

            await Promise.all(carrito.map(async (item) => {
                await addDoc(comprasRef, {
                    userId,
                    nombre: item.nombre,
                    precio: item.precio,
                    cantidad: item.cantidad,
                    imagen: item.imagen,
                    fecha: new Date() // Guardar la fecha de compra
                });
                // Eliminar cada producto de Carrito
                await deleteDoc(doc(db, 'Carrito', item.id));
            }));

            // Vaciar el carrito localmente
            setCarrito([]);

            // Mostrar alerta de éxito
            setShowAlert(true);

            // Ocultar la alerta después de 3 segundos
            setTimeout(() => {
                setShowAlert(false);
            }, 3000);

        } catch (error) {
            console.error("Error al finalizar la compra:", error);
        }
    };

    return (
        <div>
            <Navbar />
            <div className="container">
                <h1 className="text-center">TU CARRITO</h1>
                {/* Alerta de éxito */}
                {showAlert && (
                    <div className="alert alert-success" role="alert">
                        ¡Compra registrada exitosamente!
                    </div>
                )}
                <div className="row">
                    <div className="col-8">
                        <div className="card">
                            <div className="card-body">
                                {carrito.length > 0 ? (
                                    carrito.map(item => (
                                        <div key={item.id} className="cart-item">
                                            <div className="row">
                                                <div className="col-4 d-flex align-items-center">
                                                    <img src={item.imagen} alt={item.nombre} style={{ width: '50px' }} />
                                                    <span className="ms-2">{item.nombre}</span>
                                                </div>
                                                <div className="col-4 text-center">
                                                    <span>{item.cantidad}</span>
                                                </div>
                                                <div className="col-4 text-center">
                                                    <span>${item.precio * item.cantidad}</span>
                                                    <button onClick={() => handleEliminarProducto(item.id)} className="btn btn-danger btn-sm ms-2">Eliminar</button>
                                                </div>
                                            </div>
                                            <hr />
                                        </div>
                                    ))
                                ) : (
                                    <p>No hay productos en el carrito.</p>
                                )}
                            </div>
                        </div>
                    </div>
                    <div className="col-4">
                        <div className="card">
                            <div className="card-body">
                                <h5>Resumen de la compra</h5>
                                <p>Subtotal: ${subtotal}</p>
                                <p>Total: ${total}</p>
                                <button onClick={handleFinalizarCompra} className="btn btn-primary">Finalizar compra</button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Carrito;



