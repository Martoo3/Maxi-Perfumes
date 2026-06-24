const botonesAgregar = document.querySelectorAll(".btn-agregar");
const botonesFiltro = document.querySelectorAll(".filtro-btn");
const buscadorProductos = document.getElementById("buscadorProductos");
const productosFiltrables = document.querySelectorAll(".card-producto");
const sinResultados = document.getElementById("sinResultados");
const abrirCarritoBtn = document.getElementById("abrirCarrito");
const cerrarCarritoBtn = document.getElementById("cerrarCarrito");
const carrito = document.getElementById("carrito");
const overlayCarrito = document.getElementById("overlayCarrito");
const itemsCarrito = document.getElementById("itemsCarrito");
const totalCarrito = document.getElementById("totalCarrito");
const contadorCarrito = document.getElementById("contadorCarrito");
const vaciarCarritoBtn = document.getElementById("vaciarCarrito");
const finalizarCompraBtn = document.getElementById("finalizarCompra");
const formCliente = document.getElementById("formCliente");
const clienteNombre = document.getElementById("clienteNombre");
const clienteApellido = document.getElementById("clienteApellido");
const clienteDni = document.getElementById("clienteDni");
const clienteDireccion = document.getElementById("clienteDireccion");
const estadoLogin = document.getElementById("estadoLogin");

let filtroActivo = "todos";
let carritoProductos = JSON.parse(localStorage.getItem("carritoMaxi")) || [];
let datosCliente = JSON.parse(localStorage.getItem("clienteMaxi")) || {
  nombre: "",
  apellido: "",
  dni: "",
  direccion: "",
};

function formatearPrecio(valor) {
  return `$${valor.toLocaleString("es-AR")}`;
}

function guardarCarrito() {
  localStorage.setItem("carritoMaxi", JSON.stringify(carritoProductos));
}

function clienteCompleto() {
  return (
    datosCliente.nombre.trim() &&
    datosCliente.apellido.trim() &&
    datosCliente.dni.trim() &&
    datosCliente.direccion.trim()
  );
}

function guardarCliente() {
  datosCliente = {
    nombre: clienteNombre.value.trim(),
    apellido: clienteApellido.value.trim(),
    dni: clienteDni.value.trim(),
    direccion: clienteDireccion.value.trim(),
  };

  localStorage.setItem("clienteMaxi", JSON.stringify(datosCliente));
  actualizarEstadoCliente();
}

function cargarCliente() {
  clienteNombre.value = datosCliente.nombre;
  clienteApellido.value = datosCliente.apellido;
  clienteDni.value = datosCliente.dni;
  clienteDireccion.value = datosCliente.direccion;
  actualizarEstadoCliente();
}

function actualizarEstadoCliente() {
  if (clienteCompleto()) {
    estadoLogin.textContent = "Datos guardados. Ya podes finalizar tu compra.";
    estadoLogin.classList.add("completo");
  } else {
    estadoLogin.textContent = "Todavia falta completar tus datos para comprar.";
    estadoLogin.classList.remove("completo");
  }
}

function abrirCarrito() {
  carrito.classList.add("abierto");
  overlayCarrito.classList.add("activo");
}

function cerrarCarrito() {
  carrito.classList.remove("abierto");
  overlayCarrito.classList.remove("activo");
}

function renderizarCarrito() {
  itemsCarrito.innerHTML = "";

  if (carritoProductos.length === 0) {
    itemsCarrito.innerHTML = '<p class="carrito-vacio">Tu carrito esta vacio.</p>';
    totalCarrito.textContent = "$0";
    contadorCarrito.textContent = "0";
    return;
  }

  let total = 0;
  let cantidadTotal = 0;

  carritoProductos.forEach((producto, index) => {
    const subtotal = producto.precio * producto.cantidad;
    total += subtotal;
    cantidadTotal += producto.cantidad;

    const item = document.createElement("article");
    item.className = "item-carrito";
    item.innerHTML = `
      <img src="${producto.imagen}" alt="${producto.nombre}" />
      <div class="item-info">
        <h4>${producto.nombre}</h4>
        <p>${formatearPrecio(producto.precio)} c/u - ${formatearPrecio(subtotal)}</p>
        <div class="item-actions">
          <div class="qty-control" aria-label="Cantidad">
            <button class="qty-btn" type="button" data-accion="restar" data-index="${index}">-</button>
            <span>${producto.cantidad}</span>
            <button class="qty-btn" type="button" data-accion="sumar" data-index="${index}">+</button>
          </div>
          <button class="btn-eliminar" type="button" data-index="${index}">Quitar</button>
        </div>
      </div>
    `;

    itemsCarrito.appendChild(item);
  });

  totalCarrito.textContent = formatearPrecio(total);
  contadorCarrito.textContent = cantidadTotal;
}

function actualizarCantidad(index, accion) {
  const producto = carritoProductos[index];

  if (!producto) return;

  if (accion === "sumar") {
    producto.cantidad += 1;
  }

  if (accion === "restar") {
    producto.cantidad -= 1;
  }

  if (producto.cantidad <= 0) {
    carritoProductos.splice(index, 1);
  }

  guardarCarrito();
  renderizarCarrito();
}

function agregarProducto(boton) {
  const nombre = boton.dataset.nombre;
  const precio = Number(boton.dataset.precio);
  const imagen = boton.dataset.imagen;
  const productoExistente = carritoProductos.find((producto) => producto.nombre === nombre);

  if (productoExistente) {
    productoExistente.cantidad += 1;
  } else {
    carritoProductos.push({
      nombre,
      precio,
      imagen,
      cantidad: 1,
    });
  }

  guardarCarrito();
  renderizarCarrito();
}

function aplicarFiltros() {
  const busqueda = buscadorProductos.value.trim().toLowerCase();
  let visibles = 0;

  productosFiltrables.forEach((producto) => {
    const coincideCategoria =
      filtroActivo === "todos" || producto.dataset.categoria === filtroActivo;
    const textoProducto = `${producto.textContent} ${producto.dataset.tags}`.toLowerCase();
    const coincideBusqueda = textoProducto.includes(busqueda);
    const visible = coincideCategoria && coincideBusqueda;

    producto.style.display = visible ? "" : "none";

    if (visible) {
      visibles += 1;
    }
  });

  sinResultados.classList.toggle("visible", visibles === 0);
}

botonesAgregar.forEach((boton) => {
  boton.addEventListener("click", () => agregarProducto(boton));
});

botonesFiltro.forEach((boton) => {
  boton.addEventListener("click", () => {
    botonesFiltro.forEach((item) => item.classList.remove("activo"));
    boton.classList.add("activo");
    filtroActivo = boton.dataset.filtro;
    aplicarFiltros();
  });
});

buscadorProductos.addEventListener("input", aplicarFiltros);

formCliente.addEventListener("submit", (event) => {
  event.preventDefault();

  if (!formCliente.checkValidity()) {
    formCliente.reportValidity();
    return;
  }

  guardarCliente();
});

formCliente.addEventListener("input", guardarCliente);

clienteDni.addEventListener("input", () => {
  clienteDni.value = clienteDni.value.replace(/\D/g, "");
  guardarCliente();
});

abrirCarritoBtn.addEventListener("click", abrirCarrito);
cerrarCarritoBtn.addEventListener("click", cerrarCarrito);
overlayCarrito.addEventListener("click", cerrarCarrito);

itemsCarrito.addEventListener("click", (event) => {
  const botonCantidad = event.target.closest(".qty-btn");
  const botonEliminar = event.target.closest(".btn-eliminar");

  if (botonCantidad) {
    actualizarCantidad(Number(botonCantidad.dataset.index), botonCantidad.dataset.accion);
  }

  if (botonEliminar) {
    carritoProductos.splice(Number(botonEliminar.dataset.index), 1);
    guardarCarrito();
    renderizarCarrito();
  }
});

vaciarCarritoBtn.addEventListener("click", () => {
  carritoProductos = [];
  guardarCarrito();
  renderizarCarrito();
});

finalizarCompraBtn.addEventListener("click", () => {
  if (carritoProductos.length === 0) {
    alert("Tu carrito esta vacio.");
    return;
  }

  guardarCliente();

  if (!clienteCompleto() || !formCliente.checkValidity()) {
    alert("Para comprar, primero completa nombre, apellido, DNI y direccion.");
    cerrarCarrito();
    document.getElementById("loginCompra").scrollIntoView({ behavior: "smooth" });
    formCliente.reportValidity();
    return;
  }

  let mensaje = "Hola, quiero consultar por estos perfumes:%0A%0A";
  let total = 0;

  mensaje += `Cliente: ${datosCliente.nombre} ${datosCliente.apellido}%0A`;
  mensaje += `DNI: ${datosCliente.dni}%0A`;
  mensaje += `Direccion: ${datosCliente.direccion}%0A%0A`;

  carritoProductos.forEach((producto) => {
    const subtotal = producto.precio * producto.cantidad;
    mensaje += `- ${producto.nombre} x${producto.cantidad} - ${formatearPrecio(subtotal)}%0A`;
    total += subtotal;
  });

  mensaje += `%0ATotal: ${formatearPrecio(total)}`;

  const numero = "5491138926286";
  const url = `https://wa.me/${numero}?text=${mensaje}`;

  window.open(url, "_blank");
});

aplicarFiltros();
cargarCliente();
renderizarCarrito();
