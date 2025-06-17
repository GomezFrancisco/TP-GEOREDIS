const backendUrl = window.location.hostname === 'localhost' 
  ? 'http://localhost:5000'  // Para desarrollo fuera de Docker
  : 'http://backend:5000';

let map;
let markers = [];

// Inicializa el mapa centrado en el Obelisco (Buenos Aires)
function inicializarMapa() {
  const obelisco = [-34.6037, -58.3816];
  map = L.map('map').setView(obelisco, 14);

  // Capa de OpenStreetMap
  L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    attribution: '© OpenStreetMap contributors'
  }).addTo(map);

  // Marcador de referencia del usuario
  L.marker(obelisco).addTo(map).bindPopup("Tu ubicación base (Obelisco)").openPopup();
}

// Elimina todos los marcadores del mapa
function limpiarMapa() {
  markers.forEach(m => map.removeLayer(m));
  markers = [];
}

// Maneja el formulario para agregar lugar
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
    } else {
      const result = await res.json();
      alert("Error al agregar lugar: " + (result.error || "Error desconocido"));
    }
  } catch (error) {
    alert("Error de red: " + error.message);
  }
});

// Busca lugares cercanos en el backend y los muestra en el mapa
async function obtenerCercanos() {
  const grupo = document.getElementById('grupo').value;
  const lat = -34.6037;
  const lon = -58.3816;

  try {
    const res = await fetch(`${backendUrl}/nearby?grupo=${grupo}&lat=${lat}&lon=${lon}`);
    const lugares = await res.json();

    limpiarMapa();

    if (!Array.isArray(lugares) || lugares.length === 0) {
      alert("No se encontraron lugares cercanos.");
      return;
    }

    lugares.forEach(([nombre, distancia]) => {
      const marker = L.marker([
        lat + (Math.random() - 0.5) * 0.01, // coordenadas simuladas para demo
        lon + (Math.random() - 0.5) * 0.01
      ]).addTo(map).bindPopup(`${nombre}<br>Distancia: ${distancia.toFixed(2)} km`);
      markers.push(marker);
    });
  } catch (error) {
    alert("Error al obtener lugares: " + error.message);
  }
}

document.addEventListener('DOMContentLoaded', () => {
  inicializarMapa();
  document.getElementById('btnBuscar').addEventListener('click', obtenerCercanos);
});

document.getElementById('btnCargarDatos').addEventListener('click', async () => {
  const datos = [
    { nombre: "Cerveza Palermo", lat: -34.602, lon: -58.382, grupo: "cervecerias" },
    { nombre: "Farmacia Constitución", lat: -34.607, lon: -58.375, grupo: "farmacias" },
    { nombre: "Emergencias Norte", lat: -34.609, lon: -58.387, grupo: "emergencias" },
    { nombre: "Universidad de Buenos Aires", lat: -34.599, lon: -58.392, grupo: "universidades" },
    { nombre: "Carrefour San Telmo", lat: -34.61, lon: -58.378, grupo: "supermercados" }
  ];

  for (const lugar of datos) {
    await fetch(`${backendUrl}/add_place`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(lugar)
    });
  }

  alert("Lugares de ejemplo cargados.");
});
