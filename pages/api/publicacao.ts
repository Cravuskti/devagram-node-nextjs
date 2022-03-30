import type {NextApiResponse} from 'next';
import type {respostaPadraoMsg} from '../../types/respostaPadraoMsg';
import nc from 'next-connect';
import {upload, uploadImagemCosmic} from '../../services/uploadImagemCosmic';
import {conectarMongoDB} from '../../middlewares/conectarMongoDB';
import {validarTokenJWT} from  '../../middlewares/validarTokenJWT';
import { PublicacaoModel } from '../../models/PublicacaoModel';
import { usuarioModel } from '../../models/usuarioModel';

const handler = nc()
    .use(upload.single('file'))
    .post(async (req : any, res : NextApiResponse<respostaPadraoMsg>) => {

        try{

            const {userId} = req.query;
            const usuario = await usuarioModel.findById(userId);

            if(!usuario){
                return res.status(400).json({erro : 'Usuario nao encontrado.'});
            };

            if(!req || !req.body){
                return res.status(400).json({erro : 'Parametros de entrada nao informado.'});
            }

            const {descricao} = req?.body;     
           // const file = req.body;      

                if(!descricao || descricao.length < 2){
                return res.status(400).json({erro : 'Descriçao nao é valida.'});
                }

                if (!req.file || !req.file.originalname){
                return res.status(400).json({erro : 'Imagem é obrigatorio'});
                }

                const image = await uploadImagemCosmic(req);
                const publicacao = {
                    idUsuario : usuario.id,
                    descricao,
                    foto : image.media.url,
                    data : new Date()
                }

                await PublicacaoModel.create(publicacao);

    return res.status(200).json({msg : 'Publicacao criada com sucesso.'});

        }catch(e){
            console.log(e);
            return res.status(400).json({erro : 'Erro ao cadastrar pulicacao.'});
        }

}); 

export const config = {
    api : {
        bodyParse : false
    }
}

export default validarTokenJWT(conectarMongoDB(handler));