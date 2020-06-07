import express from 'express';
import connection from './database/connection';
import { celebrate, Joi } from 'celebrate';

import PontosController from './controllers/pontosController';
import ItensController from './controllers/itensController';

import multer from 'multer';
import multerConfig from './config/multer';

const pontosController = new PontosController();
const itensController = new ItensController();

const routes = express.Router();
const upload = multer(multerConfig)


routes.get('/itens', itensController.index);
//rota para filtrar por item, cidade e uf
routes.get('/pontos', pontosController.index);
routes.get('/pontos/:id', pontosController.show);
routes.post('/pontos', 
    upload.single('imagem'), 
    celebrate({
        body: Joi.object().keys({
            nome: Joi.string().required(),
            whatsapp: Joi.string().required(),
            latitude: Joi.number().required(),
            longitude: Joi.number().required(),
            cidade: Joi.string().required(),
            uf: Joi.string().required(),
            itens: Joi.string().required(),
        })
    }),
    pontosController.create);
    
export default routes;
