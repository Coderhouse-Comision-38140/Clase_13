import fs from 'fs'

class Mensajes {

    async getAll() {
        try {
            return JSON.parse(await fs.promises.readFile('mensajes.txt','utf-8'))
        }
        catch {
            return []
        }
    }

    async guardar(mensaje) {
        try {
            let mensajes = await this.getAll()
            mensaje.fyh = new Date().toLocaleString()
            mensajes.push(mensaje)
            await fs.promises.writeFile('mensajes.txt', JSON.stringify(mensajes, null, '\t') )
        }
        catch(error) {
            console.log('Error en guardar mensaje', error)
        }
    }
}

export default Mensajes
