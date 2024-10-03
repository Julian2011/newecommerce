import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { db } from '../firebase';
import { doc, getDoc } from 'firebase/firestore';
import { Oval } from 'react-loader-spinner';

function Details() {
  const { id } = useParams(); // Obtiene el ID del producto de la URL
  const [producto, setProducto] = useState(null);

  useEffect(() => {
    const fetchProducto = async () => {
      const productoDoc = doc(db, 'productos', id);
      const productoSnapshot = await getDoc(productoDoc);

      if (productoSnapshot.exists()) {
        setProducto({ id: productoSnapshot.id, ...productoSnapshot.data() });
      } else {
        console.log('No hay producto encontrado');
      }
    };

    fetchProducto();
  }, [id]);

  if (!producto) {
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
    <div className="container mt-5">
      <h1>{producto.nombre}</h1>
      <img src={producto.imagenUrl} alt={producto.nombre} style={{ width: '300px' }} />
      <p>{producto.descripcion}</p>
      <p><strong>Precio: ${producto.precio}</strong></p>
      {/* Aquí puedes agregar más detalles sobre el producto */}
    </div>
  );
}

export default Details;
