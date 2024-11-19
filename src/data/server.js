const express = require('express');
const bodyParser = require('body-parser');
const fs = require('fs');
const path = require('path');

const app = express();
const PORT = 3000;

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// Crear la carpeta data si no existe
const dataDir = path.join(__dirname, 'data');
if (!fs.existsSync(dataDir)) {
    fs.mkdirSync(dataDir);

}

// Ruta al archivo dates.json
const dataFilePath = path.join(dataDir, 'dates.json');

// Servir archivos estáticos (opcional)
app.use(express.static(path.join(__dirname, 'public')));

// Endpoint para manejar el registro
app.post('/register', (req, res) => {
    const newUser = {
        id: generateId(), // Generar un ID único para cada usuario
        nombre: req.body.nombre,
        apePaterno: req.body.apePaterno,
        apeMaterno: req.body.apeMaterno,
        correo: req.body.correo,
        contrase: req.body.contrase
    };

    // Leer archivo JSON existente
    fs.readFile(dataFilePath, (err, data) => {
        if (err && err.code !== 'ENOENT') {
            return res.status(500).send('Error al leer archivo JSON');
        }

        let users = [];
        if (data && data.length) {
            users = JSON.parse(data);
        }

        // Añadir nuevo usuario
        users.push(newUser);

        // Escribir datos actualizados en el archivo JSON
        fs.writeFile(dataFilePath, JSON.stringify(users, null, 2), (err) => {
            if (err) {
                return res.status(500).send('Error al guardar datos');
            }
            res.status(200).send('Usuario registrado exitosamente');
        });
    });
});

// Endpoint para obtener todas las fechas (usuarios)
app.get('/dates', (req, res) => {
    fs.readFile(dataFilePath, (err, data) => {
        if (err && err.code === 'ENOENT') {
            return res.status(200).json([]);
        } else if (err) {
            return res.status(500).send('Error al leer archivo JSON');
        }

        const users = JSON.parse(data);
        res.status(200).json(users);
    });
});

// Función para generar un ID único
function generateId() {
    return new Date().getTime(); // Utilizando el timestamp como ID único (puede adaptarse según necesidades)
}

// Iniciar el servidor
app.listen(PORT, () => {
    console.log(`Servidor corriendo en http://localhost:3000`);
});
