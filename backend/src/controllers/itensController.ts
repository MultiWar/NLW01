import {Request, Response} from 'express';
import connection from '../database/connection';

class itensController {
    async index (request: Request, response: Response) {
        const itens = await connection('tblItens').select('*');

        const serializedItems = itens.map(item => {
            return {
                id: item.id,
                nome: item.nome,
                imagem_url: `http://localhost:3333/uploads/${item.imagem}`
            }
        })
        return response.json(serializedItems);
    }
}

export default itensController;