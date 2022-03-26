import type {NextApiRequest, NextApiResponse} from 'next';
import type {respostaPadraoMsg} from '../../types/respostaPadraoMsg';
import type {cadastroRequisicao} from '../../types/cadastroRequisicao';
import { usuarioModel } from '../../models/usuarioModel';
import md5 from 'md5';
import {conectarMongoDB} from '../../middlewares/conectarMongoDB';
import {upload, uploadImagemCosmic} from '../../services/uploadImagemCosmic';
import nc from 'next-connect';

const handler = nc()
    .use(upload.single('file'))
    .post(async (req : NextApiRequest, res : NextApiResponse<respostaPadraoMsg> ) => {

        try{
            console.log('cadastro endpoint', req.body);
     
            const usuario = req.body as cadastroRequisicao;
        
               if(!usuario.nome || usuario.nome.length < 2){
                return res.status(400).json({erro : 'Nome invalido'});
               }
        
                if(!usuario.email || usuario.email.length < 5 || !usuario.email.includes('@') || !usuario.email.includes('.')){
                    return res.status(400).json({erro : 'Email invalido'});
                }
        
                if(!usuario.senha || usuario.senha.length < 4){
                    return res.status(400).json({erro : 'Senha invaida'});
                }
        
            // Validaçao se ja existe usuario com o mesmo email
            const usuariosComOMesmoEmail = await usuarioModel.find({email : usuario.email});
            
            if(usuariosComOMesmoEmail && usuariosComOMesmoEmail.length > 0){
                return res.status(400).json({erro : 'Ja existe uma conta com esse email'})
            }
    
    
            // enviar a imagem do multer para o cosmic
            const image = await uploadImagemCosmic(req);
        
            // salvar no banco de dado
                const usuarioASerSaalvo = {
                    nome : usuario.nome,
                    email : usuario.email,
                    senha : md5(usuario.senha),
                    avatar : image?.media?.url
                }
                await usuarioModel.create(usuarioASerSaalvo);
                return res.status(200).json({ msg : 'Usuario criado com sucesso!'});
        }catch(e){
            console.log(e);
            return res.status(500).json({ erro : 'erro ao cadastrar usuario'});

        }

       
    });

export const config = {
    api : {
        bodyParser : false
    }
}

export default conectarMongoDB(handler) ;

// Nao é necessario este objeto "const endpointCadastro =" pois nao é preciso checar o metodo.

// if(req.method === 'POST'){
// }
// return res.status(405).json({erro : 'Metodo informado nao é valido!'});
//export default conectarMongoDB(endpointCadastro) ;

// Pois numca vai cair se nao for "POST" 