const fs = require('fs');

class Productos {
    
    constructor(){
        this.filename = __dirname+'\\Products.json';
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

    setProduct(new_data){
        try{
            const data = this.getAll();
            data.push(new_data);
            fs.writeFileSync(this.filename, JSON.stringify(data, null, 2))
            return data;
        }catch(e){
            this.log(e);
        }
    }

    getById(id){
        try{
            const data = this.getAll();
            const producto = data.find((elemento) => elemento.id === id);
            return producto;
        }catch(e){
            this.log(e);
        }
    }

    log(e){
        let date = new Date();
        let current_time = date.getHours()+":"+date.getMinutes()+":"+ date.getSeconds();
        fs.appendFileSync("log.txt", "\n\n"+current_time.toString()+"\n");
        fs.appendFileSync("log.txt", e.toString());
    }
}

module.exports = {Productos};