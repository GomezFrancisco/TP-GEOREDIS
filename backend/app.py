# app.py
from flask import Flask, request, jsonify
from flask_cors import CORS
import redis

app = Flask(__name__)
r = redis.Redis(
    host='redis',
    port=6379,
    decode_responses=True,
    socket_connect_timeout=5  # Timeout para evitar bloqueos
)
CORS(app, resources={r"/*": {"origins": "*"}})

GRUPOS_VALIDOS = ['cervecerias', 'universidades', 'farmacias', 'emergencias', 'supermercados']

with app.app_context():
    if r.dbsize() == 0:
        r.geoadd("cervecerias", 
            (-58.3816, -34.6037, "Antares Centro"),
            (-58.4243, -34.5886, "Buller Palermo")
        )
        r.geoadd("universidades",
            (-58.3929, -34.6003, "UBA FADU"),
            (-58.4219, -34.6124, "UTN Medrano")
        )
        r.geoadd("farmacias",
            (-58.3902, -34.6030, "Farmacity Centro"),
            (-58.4320, -34.5897, "Farmacia Palermo")
        )
        r.geoadd("emergencias", 
            (-58.4089, -34.6039, "Hospital Ramos Mejía")
        )
        r.geoadd("supermercados",
            (-58.3840, -34.6012, "Coto Constitución"),
            (-58.4262, -34.5956, "Carrefour Palermo")
        )
        print("✅ Datos iniciales cargados en Redis")

@app.route('/add_place', methods=['POST'])
def add_place():
    data = request.get_json()
    nombre = data.get("nombre")
    lat = data.get("lat")
    lon = data.get("lon")
    grupo = data.get("grupo")
    if not all([nombre, lat, lon, grupo]):
        return jsonify({"error": "Faltan datos"}), 400
    # Agrega el lugar al grupo geo
    r.geoadd(grupo, lon, lat, nombre)
    return jsonify({"message": "Lugar agregado"}), 200

@app.route('/nearby', methods=['GET'])
def nearby():
    lat = float(request.args['lat'])
    lon = float(request.args['lon'])
    grupo = request.args['grupo']
    if grupo not in GRUPOS_VALIDOS:
        return {'error': 'Grupo inválido'}, 400
    lugares = r.georadius(grupo, lon, lat, 5, unit='km', withdist=True, withcoord=True)
    resultados = [[nombre, distancia, coord[0], coord[1]] for nombre, distancia, _, coord in lugares]
    return jsonify(resultados)

@app.route('/distance', methods=['GET'])
def distance():
    grupo = request.args['grupo']
    lugar1 = request.args['lugar1']
    lugar2 = request.args['lugar2']
    if grupo not in GRUPOS_VALIDOS:
        return {'error': 'Grupo inválido'}, 400
    dist = r.geodist(grupo, lugar1, lugar2, unit='km')
    return {'distancia_km': dist}

if __name__ == '__main__':
    app.run(host='0.0.0.0')