import React, { useState, useEffect } from 'react';
import { db } from '../firebase';
import { collection, addDoc, getDocs, deleteDoc, doc, updateDoc } from 'firebase/firestore';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';  
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faUser, faChevronDown, faEdit, faTrash } from '@fortawesome/free-solid-svg-icons';
import { useNavigate } from 'react-router-dom';

function Admin() {
    const [showModal, setShowModal] = useState(false);
    const [formData, setFormData] = useState({
        nombre: '',
        subtitulo: '',
        descripcion: '',
        imagenUrl: '',
        categoria: '',
        stock: '',
        talla: '',
        precio: ''
    });
    const [productos, setProductos] = useState([]);
    const [currentPage, setCurrentPage] = useState(1);
    const productsPerPage = 7; 
    const [menuVisible, setMenuVisible] = useState(false); 
    const [editingProductId, setEditingProductId] = useState(null); // Para almacenar el ID del producto en edición
    const navigate = useNavigate();

    const fetchProductos = async () => {
        const productosCollection = collection(db, 'productos');
        const productosSnapshot = await getDocs(productosCollection);
        const productosList = productosSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        setProductos(productosList);
    };

    useEffect(() => {
        fetchProductos();
    }, []);

    const handleChange = (e) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value
        });
    };

    const handleShowModal = () => setShowModal(true);

    const handleCloseModal = () => {
        setShowModal(false);
        setEditingProductId(null); // Limpiar la variable de edición
    };

    const notifySuccess = (message) => toast.success(message);

    const handleSubmit = async (e) => {
        e.preventDefault();
    
        try {
            if (editingProductId) {
                // Editar el producto
                const productRef = doc(db, 'productos', editingProductId);
                await updateDoc(productRef, {
                    ...formData,
                    stock: parseInt(formData.stock), 
                    precio: parseFloat(formData.precio)
                });
                notifySuccess("Producto editado exitosamente!");
            } else {
                // Añadir el producto
                await addDoc(collection(db, 'productos'), {
                    ...formData,
                    stock: parseInt(formData.stock), 
                    precio: parseFloat(formData.precio)
                });
                notifySuccess("Producto agregado exitosamente!");
            }
    
            setFormData({
                nombre: '',
                subtitulo: '',
                descripcion: '',
                imagenUrl: '',
                categoria: '',
                stock: '',
                talla: '',
                precio: ''
            });
    
            handleCloseModal();
            fetchProductos();
        } catch (error) {
            console.error("Error al agregar/editar producto: ", error);
        }
    };

    const handleEdit = (producto) => {
        setFormData({
            nombre: producto.nombre,
            subtitulo: producto.subtitulo,
            descripcion: producto.descripcion,
            imagenUrl: producto.imagenUrl,
            categoria: producto.categoria,
            stock: producto.stock,
            talla: producto.talla,
            precio: producto.precio
        });
        setEditingProductId(producto.id);
        setShowModal(true);
    };

    const handleDelete = async (id) => {
        try {
            await deleteDoc(doc(db, 'productos', id));
            notifySuccess("Producto eliminado exitosamente!");
            fetchProductos();
        } catch (error) {
            console.error("Error al eliminar producto: ", error);
        }
    };

    const paginate = (pageNumber) => setCurrentPage(pageNumber);

    const indexOfLastProduct = currentPage * productsPerPage;
    const indexOfFirstProduct = indexOfLastProduct - productsPerPage;
    const currentProducts = productos.slice(indexOfFirstProduct, indexOfLastProduct);

    const totalPages = Math.ceil(productos.length / productsPerPage);

    const handlePrevious = () => {
        if (currentPage > 1) {
            setCurrentPage(currentPage - 1);
        }
    };

    const handleNext = () => {
        if (currentPage < totalPages) {
            setCurrentPage(currentPage + 1);
        }
    };

    const handleLogout = () => {
        navigate('/');
    };

    return (
        <div className="container mt-5">
            <div className="d-flex justify-content-between align-items-center">
                <h1 className="text-center">Bienvenido Administrador</h1>
                <div className="dropdown">
                    <span
                        className="d-flex align-items-center"
                        onClick={() => setMenuVisible(!menuVisible)}
                        style={{ cursor: 'pointer' }}
                    >
                        <FontAwesomeIcon icon={faUser} size="lg" className="me-2" />
                        <FontAwesomeIcon icon={faChevronDown} />
                    </span>
                    {menuVisible && (
                        <div className="dropdown-menu show" style={{ position: 'absolute', right: 0 }}>
                            <button className="dropdown-item btn btn-sm" onClick={handleLogout}>Cerrar sesión</button>
                        </div>
                    )}
                </div>
            </div>

            <div className="d-flex justify-content-between align-items-center mt-4">
                <h3 className="text-left">Lista de productos</h3>
                <button className="btn btn-primary" onClick={handleShowModal}>
                    {editingProductId ? 'Editar Producto' : 'Agregar Producto'}
                </button>
            </div>

            <table className="table table-striped mt-4">
                <thead>
                    <tr>
                        <th>Nombre</th>
                        <th>Subtítulo</th>
                        <th>Descripción</th>
                        <th>URL de la Imagen</th>
                        <th>Categoría</th>
                        <th>Stock</th>
                        <th>Talla</th>
                        <th>Precio</th>
                        <th>Acciones</th> {/* Nueva columna de acciones */}
                    </tr>
                </thead>
                <tbody>
                    {currentProducts.length > 0 ? (
                        currentProducts.map((producto) => (
                            <tr key={producto.id}>
                                <td>{producto.nombre}</td>
                                <td>{producto.subtitulo}</td>
                                <td>{producto.descripcion}</td>
                                <td><a href={producto.imagenUrl} target="_blank" rel="noopener noreferrer">Ver Imagen</a></td>
                                <td>{producto.categoria}</td>
                                <td>{producto.stock}</td>
                                <td>{producto.talla}</td>
                                <td>${producto.precio}</td>
                                <td>
                                    <button className="btn btn-sm btn-warning me-2" onClick={() => handleEdit(producto)}>
                                        <FontAwesomeIcon icon={faEdit} /> Editar
                                    </button>
                                    <button className="btn btn-sm btn-danger" onClick={() => handleDelete(producto.id)}>
                                        <FontAwesomeIcon icon={faTrash} /> Eliminar
                                    </button>
                                </td>
                            </tr>
                        ))
                    ) : (
                        <tr>
                            <td colSpan="9" className="text-center">No hay productos</td>
                        </tr>
                    )}
                </tbody>
            </table>

            <nav aria-label="Page navigation example" className="d-flex justify-content-center">
                <ul className="pagination">
                    <li className="page-item">
                        <button className="page-link" onClick={handlePrevious} aria-label="Previous" disabled={currentPage === 1}>
                            <span aria-hidden="true">&laquo;</span>
                        </button>
                    </li>
                    {[...Array(totalPages)].map((_, index) => (
                        <li key={index} className={`page-item ${index + 1 === currentPage ? 'active' : ''}`}>
                            <button className="page-link" onClick={() => paginate(index + 1)}>
                                {index + 1}
                            </button>
                        </li>
                    ))}
                    <li className="page-item">
                        <button className="page-link" onClick={handleNext} aria-label="Next" disabled={currentPage === totalPages}>
                            <span aria-hidden="true">&raquo;</span>
                        </button>
                    </li>
                </ul>
            </nav>

            <div className={`modal fade ${showModal ? 'show' : ''}`} style={{ display: showModal ? 'block' : 'none' }}>
                <div className="modal-dialog">
                    <div className="modal-content">
                        <div className="modal-header">
                            <h5 className="modal-title">{editingProductId ? 'Editar Producto' : 'Agregar Producto'}</h5>
                            <button type="button" className="close" onClick={handleCloseModal}>
                                <span>&times;</span>
                            </button>
                        </div>
                        <form onSubmit={handleSubmit}>
                            <div className="modal-body">
                                {/* Formulario */}
                                <div className="form-group">
                                    <label>Nombre</label>
                                    <input
                                        type="text"
                                        className="form-control"
                                        name="nombre"
                                        value={formData.nombre}
                                        onChange={handleChange}
                                        required
                                    />
                                </div>
                                <div className="form-group">
                                    <label>Subtítulo</label>
                                    <input
                                        type="text"
                                        className="form-control"
                                        name="subtitulo"
                                        value={formData.subtitulo}
                                        onChange={handleChange}
                                        required
                                    />
                                </div>
                                <div className="form-group">
                                    <label>Descripción</label>
                                    <textarea
                                        className="form-control"
                                        name="descripcion"
                                        value={formData.descripcion}
                                        onChange={handleChange}
                                        required
                                    ></textarea>
                                </div>
                                <div className="form-group">
                                    <label>URL de la Imagen</label>
                                    <input
                                        type="url"
                                        className="form-control"
                                        name="imagenUrl"
                                        value={formData.imagenUrl}
                                        onChange={handleChange}
                                        required
                                    />
                                </div>
                                <div className="form-group">
                                    <label>Categoría</label>
                                    <input
                                        type="text"
                                        className="form-control"
                                        name="categoria"
                                        value={formData.categoria}
                                        onChange={handleChange}
                                        required
                                    />
                                </div>
                                <div className="form-group">
                                    <label>Stock</label>
                                    <input
                                        type="number"
                                        className="form-control"
                                        name="stock"
                                        value={formData.stock}
                                        onChange={handleChange}
                                        required
                                    />
                                </div>
                                <div className="form-group">
                                    <label>Talla</label>
                                    <input
                                        type="text"
                                        className="form-control"
                                        name="talla"
                                        value={formData.talla}
                                        onChange={handleChange}
                                        required
                                    />
                                </div>
                                <div className="form-group">
                                    <label>Precio</label>
                                    <input
                                        type="number"
                                        step="0.01"
                                        className="form-control"
                                        name="precio"
                                        value={formData.precio}
                                        onChange={handleChange}
                                        required
                                    />
                                </div>
                            </div>
                            <div className="modal-footer">
                                <button type="button" className="btn btn-secondary" onClick={handleCloseModal}>
                                    Cerrar
                                </button>
                                <button type="submit" className="btn btn-primary">
                                    {editingProductId ? 'Guardar Cambios' : 'Agregar Producto'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            </div>

            <ToastContainer position="top-right" autoClose={3000} />
        </div>
    );
}

export default Admin;






