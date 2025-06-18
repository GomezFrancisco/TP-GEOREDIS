from flask import Flask, request, jsonify
from flask_cors import CORS
import redis

app = Flask(__name__)
CORS(app)

# Acá te conectás a Redis
r = redis.Redis(host='redis', port=6379, decode_responses=True)

# Carga algunos datos al iniciar si la base está vacía
if r.dbsize() == 0:
    r.geoadd("cervecerias", (-58.3816, -34.6037, "Antares Centro"))
    r.geoadd("cervecerias", (-58.4243, -34.5886, "Buller Palermo"))
    r.geoadd("universidades", (-58.3929, -34.6003, "UBA FADU"))
    r.geoadd("farmacias", (-58.3902, -34.6030, "Farmacity Centro"))
    r.geoadd("emergencias", (-58.4089, -34.6039, "Hospital Ramos Mejia"))
    r.geoadd("supermercados", (-58.3840, -34.6012, "Coto Constitucion"))
    print("Datos cargados")

# Ruta para agregar un nuevo lugar
@app.route('/add_place', methods=['POST'])
def add_place():
    data = request.get_json()
    r.geoadd(data['grupo'], (data['lon'], data['lat'], data['nombre']))
    return {"message": "Lugar agregado"}

# Ruta para buscar lugares cercanos
@app.route('/nearby', methods=['GET'])
def nearby():
    lat = float(request.args['lat'])
    lon = float(request.args['lon'])
    grupo = request.args['grupo']

    lugares = r.georadius(grupo, lon, lat, 5, unit='km', withdist=True, withcoord=True)

    resultados = []
    for lugar in lugares:
        resultados.append({
            "nombre": lugar[0],
            "distancia": round(float(lugar[1]), 2),
            "lat": lugar[2][1],
            "lon": lugar[2][0],
            "grupo": grupo
        })

    return jsonify(resultados)

if __name__ == '__main__':
    app.run(host='0.0.0.0')