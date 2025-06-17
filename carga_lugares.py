import requests

backend_url = "http://localhost:5000/add_place"

lugares = [
    {"nombre": "Cerveza Patagonia", "lat": -34.6001, "lon": -58.3822, "grupo": "cervecerias"},
    {"nombre": "Temple Bar", "lat": -34.6022, "lon": -58.3841, "grupo": "cervecerias"},
    {"nombre": "UBA Medicina", "lat": -34.5971, "lon": -58.3816, "grupo": "universidades"},
    {"nombre": "Farmacity", "lat": -34.6019, "lon": -58.3791, "grupo": "farmacias"},
    {"nombre": "Hospital Rivadavia", "lat": -34.5891, "lon": -58.3911, "grupo": "emergencias"},
    {"nombre": "Disco Recoleta", "lat": -34.5933, "lon": -58.3892, "grupo": "supermercados"},
    {"nombre": "Carrefour Express", "lat": -34.6030, "lon": -58.3800, "grupo": "supermercados"},
]

for lugar in lugares:
    response = requests.post(backend_url, json=lugar)
    print(f"Agregando {lugar['nombre']}: {response.status_code}")
