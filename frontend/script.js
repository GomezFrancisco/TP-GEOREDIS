const backendUrl = window.location.host.includes('8080')
  ? 'http://localhost:5000'
  : 'http://backend:5000';

let map;
let markers = [];

// Inicia el mapa en el obelisco
function inicializarMapa() {
  const obelisco = [-34.6037, -58.3816];
  map = L.map('map').setView(obelisco, 14);

  L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    attribution: '© OpenStreetMap contributors'
  }).addTo(map);

  L.marker(obelisco).addTo(map)
    .bindPopup("Centro de búsqueda (Obelisco)")
    .openPopup();
}

function limpiarMapa() {
  markers.forEach(m => map.removeLayer(m));
  markers = [];
}

document.getElementById('formLugar').addEventListener('submit', async function (e) {
  e.preventDefault();

  const formData = new FormData(this);
  const data = {
    nombre: formData.get('nombre'),
    lat: parseFloat(formData.get('lat')),
    lon: parseFloat(formData.get('lon')),
    grupo: formData.get('grupo')
  };

  try {
    const res = await fetch(`${backendUrl}/add_place`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    });

    if (res.ok) {
      alert("Lugar agregado correctamente.");
      this.reset();

      const marker = L.marker([data.lat, data.lon])
        .addTo(map)
        .bindPopup(`<b>${data.nombre}</b><br>Grupo: ${data.grupo}<br>Recién agregado`);
      markers.push(marker);

      map.setView([data.lat, data.lon], 15);

    } else {
      const result = await res.json();
      alert("Error al agregar lugar: " + (result.error || "Error desconocido"));
    }
  } catch (error) {
    alert("Error de red: " + error.message);
  }
});

async function obtenerCercanos() {
  try {
    const grupo = document.getElementById('grupo').value;
    const lat = -34.6037;
    const lon = -58.3816;

    if (!grupo) {
      alert("Por favor selecciona un grupo.");
      return;
    }

    console.log("Intentando conectar a:", `${backendUrl}/nearby?grupo=${grupo}&lat=${lat}&lon=${lon}`);

    const res = await fetch(`${backendUrl}/nearby?grupo=${grupo}&lat=${lat}&lon=${lon}`);

    if (!res.ok) throw new Error(`HTTP error! status: ${res.status}`);

    const lugares = await res.json();
    console.log("Lugares recibidos:", lugares);

    limpiarMapa();

    if (lugares && lugares.length > 0) {
      lugares.forEach(lugar => {
        const marker = L.marker([lugar.lat, lugar.lon])
          .addTo(map)
          .bindPopup(`<b>${lugar.nombre}</b><br>Grupo: ${lugar.grupo}<br>Distancia: ${lugar.distancia} km`);
        markers.push(marker);
      });

      alert(`Se encontraron ${lugares.length} lugares cercanos.`);
    } else {
      alert("No se encontraron lugares cercanos en este grupo.");
    }

  } catch (error) {
    console.error("Error detallado:", error);
    alert(`Error al obtener lugares: ${error.message}`);
  }
}

async function cargarDatosEjemplo() {
  const datos = [
    { nombre: "Cerveza Palermo", lat: -34.602, lon: -58.382, grupo: "cervecerias" },
    { nombre: "Farmacia Constitución", lat: -34.607, lon: -58.375, grupo: "farmacias" },
    { nombre: "Emergencias Norte", lat: -34.609, lon: -58.387, grupo: "emergencias" },
    { nombre: "Universidad de Buenos Aires", lat: -34.599, lon: -58.392, grupo: "universidades" },
    { nombre: "Carrefour San Telmo", lat: -34.61, lon: -58.378, grupo: "supermercados" }
  ];

  try {
    for (const lugar of datos) {
      await fetch(`${backendUrl}/add_place`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(lugar)
      });
    }
    alert("Lugares de ejemplo cargados.");
  } catch (error) {
    alert("Error cargando ejemplos: " + error.message);
  }
}

document.addEventListener('DOMContentLoaded', () => {
  inicializarMapa();
  document.getElementById('btnBuscar').addEventListener('click', obtenerCercanos);

  if (!document.getElementById('btnCargarDatos')) {
    const btnCargarDatos = document.createElement('button');
    btnCargarDatos.id = 'btnCargarDatos';
    btnCargarDatos.textContent = 'Cargar Datos de Ejemplo';
    btnCargarDatos.style.cssText = 'padding: 10px; background: orange; color: white; border: none; margin: 10px;';
    btnCargarDatos.addEventListener('click', cargarDatosEjemplo);

    const btnRefrescar = document.createElement('button');
    btnRefrescar.id = 'btnRefrescar';
    btnRefrescar.textContent = 'Refrescar Búsqueda';
    btnRefrescar.style.cssText = 'padding: 10px; background: #28a745; color: white; border: none; margin: 10px;';
    btnRefrescar.addEventListener('click', () => {
      const grupo = document.getElementById('grupo').value;
      if (grupo) {
        obtenerCercanos();
      } else {
        alert("Selecciona un grupo primero");
      }
    });

    const main = document.querySelector('main');
    main.appendChild(btnCargarDatos);
    main.appendChild(btnRefrescar);
  }
});