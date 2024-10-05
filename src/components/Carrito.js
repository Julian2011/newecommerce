import React, { useEffect, useState } from 'react';
import { db, auth } from '../firebase';
import { collection, getDocs, query, where, deleteDoc, doc, addDoc } from 'firebase/firestore';
import './Carrito.css';
import Navbar from './Navbar';

const Carrito = () => {
    const [carrito, setCarrito] = useState([]);
    const [subtotal, setSubtotal] = useState(0);
    const [total, setTotal] = useState(0);
    const [discount, setDiscount] = useState(0);
    const [discountCode, setDiscountCode] = useState('');
    const [discountMessage, setDiscountMessage] = useState('');
    const [showAlert, setShowAlert] = useState(false);
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
            setTotal(newSubtotal - discount);
        };

        calcularTotales();
    }, [carrito, discount]);

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
            const comprasRef = collection(db, 'Compras');

            // Crear objeto de compra con detalles
            const compraData = {
                userId,
                subtotal,
                discount,
                total,
                fecha: new Date(),
                productos: carrito.map(item => ({
                    nombre: item.nombre,
                    precio: item.precio,
                    cantidad: item.cantidad,
                    imagen: item.imagen,
                    totalProducto: item.precio * item.cantidad // Guardar total por producto
                })),
            };

            // Guardar la compra en Firestore
            await addDoc(comprasRef, compraData);

            // Eliminar los productos del carrito
            await Promise.all(carrito.map(async (item) => {
                await deleteDoc(doc(db, 'Carrito', item.id));
            }));

            // Limpiar el carrito en el estado
            setCarrito([]);
            setSubtotal(0);
            setTotal(0);
            setDiscount(0);
            setDiscountCode('');
            setDiscountMessage('');
            setShowAlert(true);
            setTimeout(() => {
                setShowAlert(false);
            }, 3000);
        } catch (error) {
            console.error("Error al finalizar la compra:", error);
        }
    };

    const aplicarDescuento = () => {
        if (discountCode === 'DESCUENTO10') {
            const descuento = subtotal * 0.10; 
            setDiscount(descuento);
            setDiscountMessage(`¡Descuento del 10% aplicado!`); 
        } else {
            alert('Código de descuento no válido');
            setDiscount(0); 
            setDiscountMessage(''); 
        }
    };

    return (
        <div>
            <Navbar />
            <div className="container">
                <p className="text-center text-info">Ingresando el código <strong>DESCUENTO10</strong> podrás obtener un 10% en tu compra.</p>
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
                                <p>Descuento: ${discount}</p>
                                {discountMessage && <p className="text-success">{discountMessage}</p>}
                                <p>Total: ${total}</p>
                                <div className="mb-3">
                                    <input 
                                        type="text" 
                                        className="form-control" 
                                        placeholder="Código de descuento" 
                                        value={discountCode}
                                        onChange={(e) => setDiscountCode(e.target.value)}
                                    />
                                    <button onClick={aplicarDescuento} className="btn btn-secondary mt-2">Aplicar</button>
                                </div>
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





