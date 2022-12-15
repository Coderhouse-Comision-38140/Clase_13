import express from 'express'
import http from 'http'
const app = express()
const server = http.Server(app)

import { Server as Socket } from 'socket.io'
const io = new Socket(server)

import handlebars from 'express-handlebars'
import Productos from './api/productos.js'
import Mensajes from './api/mensajes.js'

let productos = new Productos()
let mensajes = new Mensajes()

//--------------------------------------------
//establecemos la configuración de handlebars
app.engine(
    "hbs",
    handlebars({
      extname: ".hbs",
      defaultLayout: 'index.hbs',
    })
);
app.set("view engine", "hbs");
app.set("views", "./views");
//--------------------------------------------

app.use(express.static('public'))

const router = express.Router()
app.use('/api', router)

router.use(express.json())
router.use(express.urlencoded({extended: true}))

router.get('/productos/listar', (req,res) => {
    res.json(productos.listarAll())
})

router.get('/productos/listar/:id', (req,res) => {
    let { id } = req.params
    res.json(productos.listar(id))
})

router.post('/productos/guardar', (req,res) => {
    let producto = req.body
    productos.guardar(producto)
    res.json(producto)
    //res.redirect('/')
})

router.put('/productos/actualizar/:id', (req,res) => {
    let { id } = req.params
    let producto = req.body
    productos.actualizar(producto,id)
    res.json(producto)
})

router.delete('/productos/borrar/:id', (req,res) => {
    let { id } = req.params
    let producto = productos.borrar(id)
    res.json(producto)
})

router.get('/productos/vista', (req, res) => {
    let prods = productos.listarAll()

    res.render("vista", {
        productos: prods,
        hayProductos: prods.length
    })
})

/* -------------------- Web Sockets ---------------------- */
io.on('connection', async socket => {
    console.log('Nuevo cliente conectado!');
    
    /* ------------------- */
    /* Info Productos (ws) */
    /* ------------------- */
    /* Envio los mensajes al cliente que se conectó */
    socket.emit('productos', productos.get());

    /* Escucho los mensajes enviado por el cliente y se los propago a todos */
    socket.on('update', data => {
        if(data = 'ok') {
            io.sockets.emit('productos',  productos.get()); 
        }
    })

    /* ----------------------- */
    /* Centro de mensajes (ws) */
    /* ----------------------- */
    socket.emit('messages', await mensajes.getAll());

    socket.on('new-message', async function(data) {
        //console.log(data)
        await mensajes.guardar(data); 
        io.sockets.emit('messages', await mensajes.getAll()); 
    })    
});
/* ------------------------------------------------------- */

const PORT = process.env.PORT || 8080;
const srv = server.listen(PORT, () => {
    console.log(`Servidor http escuchando en el puerto ${srv.address().port}`)
})
srv.on("error", error => console.log(`Error en servidor ${error}`))
