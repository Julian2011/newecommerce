import React from 'react';

function Footer() {
  return (
    <footer className="bg-dark text-white text-center py-3">
      <div className="container">
        <p className="mb-0">© {new Date().getFullYear()} Tu E-commerce. Todos los derechos reservados.</p>
        <p className="mb-0">Desarrollado por Tu Nombre</p>
      </div>
    </footer>
  );
}

export default Footer;
