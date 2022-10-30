const fs = require('fs');

class Productos {
    
    constructor(){
        this.filename = 'Persistent_Files\\Products.json';
    }

    getAll(){
        try{
            let data = fs.readFileSync(this.filename, 'utf8');
            if(data == ''){
                fs.writeFileSync(this.filename, "[]")
                return this.getAll();
            }else{
                return JSON.parse(data);
            } 
        }catch(e){
            this.log(e);
        }
    }

    getById(id){
        try{
            const data = this.getAll();
            const producto = data.find((elemento) => elemento.id === id);
            if(typeof producto != 'undefined'){
                return producto;
            }else{
                return false;
            }
        }catch(e){
            this.log(e);
            return false;
        }
    }

    setProduct(new_data){
        try{
            const data = this.getAll();
            let id = 0, code = this.generateCode();
            data.map((elemento) => {
                if(id < Math.max(elemento.id)){
                    id = Math.max(elemento.id);
                }
            })
            data.map((elemento) => {
                if(elemento.id == code){
                    throw new Error
                }
            });
            new_data['code']=code;
            new_data['id']=id+1;
            new_data['timestamp']=this.setTimestamp(new Date());
            data.push(new_data);
            fs.writeFileSync(this.filename, JSON.stringify(data, null, 2))
            return true;
        }catch(e){
            this.log(e);
            return false;
        }
    }

    updateProduct(new_data, id_producto){
        try{
            const data = this.getAll();
            const data_to_update = this.getById(id_producto);
            if(typeof data_to_update === 'boolean'){throw new Error('ID_producto not exists')};
            new_data['id'] = data_to_update.id;
            new_data['timestamp']=this.setTimestamp(new Date());
            data[data.findIndex((elemento) => elemento.id == id_producto)] = new_data;
            fs.writeFileSync(this.filename, JSON.stringify(data, null, 2));
            return [true];
        }catch(e){
            if(!(e.message).includes('exists')){
                this.log(e)
                return [false, e];
            }else{
                return [false, e];
            }
        }
    }

    deleteByID(id) {
        try{
            const data = this.getAll();
            if(data.findIndex((elemento) => elemento.id == id) == -1){
                throw new Error;
            }
            const new_data = data.filter((elemento) => elemento.id != id);
            fs.writeFileSync(this.filename, JSON.stringify(new_data, null, 2));
            return true;
        }catch(e){
            if(e!='Error'){this.log(e)};
            return false;
        }
    }

    validateProduct(producto){
        try{
            if(producto.id){throw new Error}
            if(producto.timestamp){throw new Error}
            if(!producto.tittle){throw new Error}
            if(!producto.description){throw new Error}
            if(!producto.thumbnail){throw new Error}
            if(!producto.price){throw new Error}
            if(!producto.stock){throw new Error}
            return true;
        }catch(e){
            if(e!='Error'){this.log(e)};
            return false;
        }
    }

    setTimestamp(date) {
        return date.getDate()+'/'+(date.getMonth()+1)+'/'+date.getFullYear();
    }

    generateCode(){
        return Math.floor((Math.random() * (99 - 10 + 1)) + 10)+
            '-'+Math.floor((Math.random() * (999 - 100 + 1)) + 100)+
            '-'+Math.floor((Math.random() * (9999 - 1000 + 1)) + 1000);
    }

    log(e){
        let date = new Date();
        let current_time = date.getHours()+":"+date.getMinutes()+":"+ date.getSeconds();
        fs.appendFileSync("log.txt", "\n\n"+current_time.toString()+"\n");
        fs.appendFileSync("log.txt", e.toString());
    }
}

class Carrito{

    constructor(){
        this.filename = 'Persistent_Files\\Carrito.json';
        this.Productos = new Productos();
    }

    getAll(){
        try{
            let data = fs.readFileSync(this.filename, 'utf8');
            if(data == ''){
                fs.writeFileSync(this.filename, "[]")
                return this.getAll();
            }else{
                return JSON.parse(data);
            } 
        }catch(e){
            this.log(e);
        }
    }

    getById(id){
        try{
            const data = this.getAll();
            const producto = data.find((elemento) => elemento.id === id);
            if(typeof producto == 'undefined'){
                throw new Error('ID_carrito not exists')
            }
            return [producto];
        }catch(e){
            this.log(e);
            return [false, e];
        }
    }

    createCarrito(){
        try{
            const data = this.getAll();
            const timestamp = this.setTimestamp(new Date());//verificar su funcionamiento
            let id = 0, new_data = {};
            data.map((elemento) => {
                if(id < Math.max(elemento.id)){
                    id = Math.max(elemento.id);
                }
            })
            new_data['id']=id+1;
            new_data['timestamp']=timestamp;
            new_data['productos']=[];
            data.push(new_data);
            fs.writeFileSync(this.filename, JSON.stringify(data, null, 2))
            return id+1;
        }catch(e){
            this.log(e);
            return false;
        }
    }

    setProduct(id_carrito, id_producto){
        try{
            const data = this.getAll();
            const index = data.findIndex((elemento) => elemento.id == id_carrito);
            if(index == -1){throw new Error('ID_carrito not exists')}
            const product = this.Productos.getById(id_producto);
            if(typeof product != 'boolean'){
                data[index].productos.push(id_producto)
            }else{
                throw new Error('ID_producto not exists');
            }
            fs.writeFileSync(this.filename, JSON.stringify(data, null, 2))
            return [true];
        }catch(e){
            if(!(e.message).includes('exists')){
                this.log(e)
                return [false, e];
            }else{
                return [false, e];
            }
        }
    }

    deleteProduct(id_carrito, id_producto){
        try{
            const data = this.getAll();
            const index = data.findIndex((elemento) => elemento.id == id_carrito);
            if(index == -1){throw new Error('ID_carrito not exists');};
            const index_product = data[index].productos.findIndex((elemento) => elemento.id == id_producto);
            if(index_product == -1){throw new Error('ID_producto not exists in carrito');};
            data[index].productos = data[index].productos.filter(producto => producto.id != id_producto);//FALTA APLICAR LAS VALIDACIONES CORRESPONDIENTES Y RETORNAR ARRAY
            fs.writeFileSync(this.filename, JSON.stringify(data, null, 2));
            return [true];
        }catch(e){
            if(!(e.message).includes('exists')){
                this.log(e)
                return [false, e];
            }else{
                return [false, e];
            }
        }
    }

    /**
     * It deletes a row from a JSON file
     * @param id - The id of the cart to be deleted
     * @returns an array with two elements. The first element is a boolean that indicates if the
     * operation was successful or not. The second element is the error message if the operation was
     * not successful.
     */
    deleteByID(id) {
        try{
            const data = this.getAll();
            if(data.findIndex((elemento) => elemento.id == id) == -1){
                throw new Error('ID carrito not exists');
            }
            const new_data = data.filter((elemento) => elemento.id != id);
            fs.writeFileSync(this.filename, JSON.stringify(new_data, null, 2));
            return [true];
        }catch(e){
            if(!(e.message).includes('exists')){
                this.log(e)
                return [false, e];
            }else{
                return [false, e];
            }
        }
    }

    /**
     * It validates a product object, and returns true if it's valid, or false if it's not.
     * @param producto - The product object to be validated.
     * @returns A boolean value.
     */
    validateProduct(producto){
        try{
            if(producto.id){throw new Error('invalid structure')}
            if(producto.timestamp){throw new Error('invalid structure')}
            if(!producto.tittle){throw new Error('Product tittle is required')}
            if(!producto.description){throw new Error('Product description is required')}
            if(!producto.thumbnail){throw new Error('Product thumbnail is required')}
            if(!producto.price){throw new Error('Product price is required')}
            if(!producto.stock){throw new Error('Product stock is required')}
            return true;
        }catch(e){
            this.log(e);
            return false;
        }
    }

    /**
     * It takes a date object and returns a string in the format dd/mm/yyyy.
     * @param date - The date object to be formatted.
     * @returns The date in the format dd/mm/yyyy
     */
    setTimestamp(date) {
        return date.getDate()+'/'+(date.getMonth()+1)+'/'+date.getFullYear();
    }

    /**
     * It generates a random number between 10 and 99, then adds a dash, then generates a random number
     * between 100 and 999, then adds a dash, then generates a random number between 1000 and 9999.
     * @returns A string of numbers separated by dashes.
     */
    generateCode(){
        return Math.floor((Math.random() * (99 - 10 + 1)) + 10)+
            '-'+Math.floor((Math.random() * (999 - 100 + 1)) + 100)+
            '-'+Math.floor((Math.random() * (9999 - 1000 + 1)) + 1000);
    }

    log(e){
        let date = new Date();
        let current_time = date.getHours()+":"+date.getMinutes()+":"+ date.getSeconds();
        fs.appendFileSync("log.txt", "\n\n"+current_time.toString()+"\n");
        fs.appendFileSync("log.txt", e.toString());
    }
}

module.exports = {Productos, Carrito};