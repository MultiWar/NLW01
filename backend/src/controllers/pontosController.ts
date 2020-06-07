import connection from '../database/connection';
import {Request, Response, response} from 'express'

class pontosController {

    async index (request: Request, response: Response) {
        const { cidade, uf, itens } = request.query;
        const parsedItens = String(itens).split(',').map(item => Number(item.trim()));

        const pontos = await connection('tblPontosDeColeta')
            .join('tblPonto_Itens', 'tblPontosDeColeta.id', '=', 'tblPonto_Itens.pontoDeColeta_id')
            .whereIn('tblPonto_Itens.item_id', parsedItens)
            .where('cidade', String(cidade))
            .where('uf', String(uf))
            .distinct()
            .select('tblPontosDeColeta.*');

        const serializedPoints = pontos.map(ponto => {
            return {
                ...ponto,
                imagem_url: `http://localhost:3333/uploads/${ponto.imagem}`
            }
        })

        return response.json(serializedPoints);
    }

    async create (request: Request, response: Response) {
        const {
            nome,
            email,
            whatsapp,
            latitude,
            longitude,
            cidade,
            uf,
            itens
        } = request.body;

        const data = {
            imagem: request.file.filename,
            nome,
            email,
            whatsapp,
            latitude,
            longitude,
            cidade,
            uf
        }

        const trx = await connection.transaction();

        try {

            const insertedIDs: Number[] = await trx('tblPontosDeColeta').insert(data);

            const pontoDeColeta_id = insertedIDs[0];

            const itensDoPonto = itens
                .split(',')
                .map((item: string) => Number(item.trim()))
                .map((item_id:Number) => {
                    return {
                        pontoDeColeta_id,
                        item_id
                    }
            })
            
            await trx('tblPonto_Itens').insert(itensDoPonto);
            
            await trx.commit();

            return response.json({
                id: pontoDeColeta_id,
                ...data
            })
        }
        catch(err) {
            await trx.rollback();
        }
    }

    async show (request: Request, response: Response) {
        const id = Number(request.params.id);
        const ponto = await connection('tblPontosDeColeta').where('id', id).first();
        if(!ponto) {
            return response.status(404).json('não tem esse registro aí não');
        }

        const serializedPoint = {
            ...ponto,
            imagem_url: `http://localhost:3333/uploads/${ponto.imagem}`
        }

        const itens = await connection('tblItens')
            .join('tblPonto_Itens', 'tblItens.id', '=', 'tblPonto_Itens.item_id')
            .where('tblPonto_Itens.pontoDeColeta_id', id)
            .select('tblItens.nome');
        return response.json({ponto: serializedPoint, itens});
    }
}

export default pontosController;