import type { NextApiRequest, NextApiResponse, NextApiHandler} from 'next';
import mongoose from 'mongoose';
import type {respostaPadraoMsg} from '../types/respostaPadraoMsg';


export const conectarMongoDB = (handler : NextApiHandler) => 
    async (req: NextApiRequest, res: NextApiResponse<respostaPadraoMsg>) => {

    // verificar se o banco ja esta conectado.
    // Se estiver seguir para o endpoint ou o proximmo middleware
    if(mongoose.connections[0].readyState){
        return handler(req,res);
    }

    // Se nao estiver conectado
    // Obter a variavel de ambiente preenchida do env
    const {DB_CONEXAO_STRING} = process.env;

    //se a env estiver vazia abortar o us do sistema e avisar o programador
    if(!DB_CONEXAO_STRING){
        return res.status(500).json({ erro : 'ENV de configuraçao do banco, nao informado'});
    }


    mongoose.connection.on('connected', () => console.log('Banco de dados conectado'));
    mongoose.connection.on('error', error => console.log(`Ocorreu erro ao conectar no Banco de Dados: ${error}`));
    await mongoose.connect(DB_CONEXAO_STRING);
    
    // Agora posso seguir para o endpoint, pois estou conectado no Banco
    return handler(req, res);

    

    


    }

