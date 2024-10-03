import React, { useState, useEffect } from 'react';
import { db } from '../firebase'; // Importar la instancia de Firestore
import { collection, addDoc, getDocs } from 'firebase/firestore';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';  // Importar estilos de react-toastify
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faUser, faChevronDown } from '@fortawesome/free-solid-svg-icons';
import { useNavigate } from 'react-router-dom'; // Cambiado a useNavigate

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
    const productsPerPage = 7; // Número de productos por página
    const [menuVisible, setMenuVisible] = useState(false); // Controlar la visibilidad del menú
    const navigate = useNavigate(); // Cambiado a useNavigate

    // Función para obtener productos de Firebase
    const fetchProductos = async () => {
        const productosCollection = collection(db, 'productos');
        const productosSnapshot = await getDocs(productosCollection);
        const productosList = productosSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        setProductos(productosList);
    };

    // Cargar productos cuando el componente se monta
    useEffect(() => {
        fetchProductos();
    }, []);

    // Maneja el cambio de los inputs
    const handleChange = (e) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value
        });
    };

    // Abre el modal
    const handleShowModal = () => setShowModal(true);

    // Cierra el modal
    const handleCloseModal = () => setShowModal(false);

    // Muestra la notificación de éxito
    const notifySuccess = () => toast.success("Producto agregado exitosamente!");

    // Maneja el submit del formulario y guarda en Firestore
    const handleSubmit = async (e) => {
        e.preventDefault();

        try {
            // Añadir el producto a la colección 'productos'
            await addDoc(collection(db, 'productos'), {
                nombre: formData.nombre,
                subtitulo: formData.subtitulo,
                descripcion: formData.descripcion,
                imagenUrl: formData.imagenUrl,
                categoria: formData.categoria,
                stock: parseInt(formData.stock), // Asegurarse de que el stock sea un número
                talla: formData.talla,
                precio: parseFloat(formData.precio) // Convertir precio a número flotante
            });

            notifySuccess(); // Mostrar la notificación
            handleCloseModal(); // Cierra el modal después de agregar
            fetchProductos(); // Refresca la lista de productos
        } catch (error) {
            console.error("Error al agregar producto: ", error);
        }
    };

    // Maneja el cambio de página
    const paginate = (pageNumber) => setCurrentPage(pageNumber);

    // Calcular los productos a mostrar en la página actual
    const indexOfLastProduct = currentPage * productsPerPage;
    const indexOfFirstProduct = indexOfLastProduct - productsPerPage;
    const currentProducts = productos.slice(indexOfFirstProduct, indexOfLastProduct);

    // Calcular el número de páginas
    const totalPages = Math.ceil(productos.length / productsPerPage);

    // Cambiar de página anterior
    const handlePrevious = () => {
        if (currentPage > 1) {
            setCurrentPage(currentPage - 1);
        }
    };

    // Cambiar de página siguiente
    const handleNext = () => {
        if (currentPage < totalPages) {
            setCurrentPage(currentPage + 1);
        }
    };

    // Manejar el cierre de sesión
    const handleLogout = () => {
        // Aquí debes agregar la lógica de cierre de sesión (si usas Firebase, llama a firebase.auth().signOut())
        navigate('/'); // Redirigir al home
    };

    return (
        <div className="container mt-5">
            <div className="d-flex justify-content-between align-items-center">
                {/* Título centrado */}
                <h1 className="text-center">Bienvenido Administrador</h1>

                {/* Icono de perfil y menú desplegable */}
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

            {/* Sección de la lista de productos y botón de agregar */}
            <div className="d-flex justify-content-between align-items-center mt-4">
                <h3 className="text-left">Lista de productos</h3>
                <button className="btn btn-primary" onClick={handleShowModal}>
                    Agregar Producto
                </button>
            </div>

            {/* Tabla de productos */}
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
                            </tr>
                        ))
                    ) : (
                        <tr>
                            <td colSpan="8" className="text-center">No hay productos</td>
                        </tr>
                    )}
                </tbody>
            </table>

            {/* Controles de paginación */}
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

            {/* Modal para agregar producto */}
            <div className={`modal fade ${showModal ? 'show' : ''}`} style={{ display: showModal ? 'block' : 'none' }} tabIndex="-1" role="dialog">
                <div className="modal-dialog" role="document">
                    <div className="modal-content">
                        <div className="modal-header">
                            <h5 className="modal-title">Agregar Producto</h5>
                            <button type="button" className="close" onClick={handleCloseModal}>
                                <span>&times;</span>
                            </button>
                        </div>
                        <div className="modal-body">
                            <form onSubmit={handleSubmit}>
                                <div className="form-group">
                                    <label>Nombre</label>
                                    <input type="text" name="nombre" className="form-control" value={formData.nombre} onChange={handleChange} required />
                                </div>
                                <div className="form-group">
                                    <label>Subtítulo</label>
                                    <input type="text" name="subtitulo" className="form-control" value={formData.subtitulo} onChange={handleChange} required />
                                </div>
                                <div className="form-group">
                                    <label>Descripción</label>
                                    <textarea name="descripcion" className="form-control" value={formData.descripcion} onChange={handleChange} required></textarea>
                                </div>
                                <div className="form-group">
                                    <label>URL de la Imagen</label>
                                    <input type="text" name="imagenUrl" className="form-control" value={formData.imagenUrl} onChange={handleChange} required />
                                </div>
                                <div className="form-group">
                                    <label>Categoría</label>
                                    <select name="categoria" className="form-control" value={formData.categoria} onChange={handleChange} required>
                                        <option value="">Selecciona una categoría</option>
                                        <option value="camisetas">Camisetas</option>
                                        <option value="calzado">Calzado</option>
                                        <option value="accesorios">Accesorios</option>
                                        <option value="jeans">Jeans</option>
                                        <option value="bermudas">Bermudas</option>
                                    </select>
                                </div>
                                <div className="form-group">
                                    <label>Stock</label>
                                    <input type="number" name="stock" className="form-control" value={formData.stock} onChange={handleChange} required />
                                </div>
                                <div className="form-group">
                                    <label>Talla</label>
                                    <input type="text" name="talla" className="form-control" value={formData.talla} onChange={handleChange} required />
                                </div>
                                <div className="form-group">
                                    <label>Precio</label>
                                    <input type="number" name="precio" className="form-control" value={formData.precio} onChange={handleChange} required />
                                </div>
                                <button type="submit" className="btn btn-primary">Agregar Producto</button>
                            </form>
                        </div>
                    </div>
                </div>
            </div>


            {/* Contenedor de notificaciones */}
            <ToastContainer />
        </div>
    );
}

export default Admin;






