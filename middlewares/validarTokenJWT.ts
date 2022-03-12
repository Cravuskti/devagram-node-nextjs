import type { NextApiRequest, NextApiResponse, NextApiHandler } from 'next';
import type { respostaPadraoMsg } from '../types/respostaPadraoMsg';
import jwt, { JwtPayload } from 'jsonwebtoken';

export const validarTokenJWT = (handle : NextApiHandler) => 
    (req : NextApiRequest, res : NextApiResponse<respostaPadraoMsg>) => {

        try{

            const {MINHA_CHAVE_JWT} = process.env;
            if(!MINHA_CHAVE_JWT){
                return res.status(500).json({erro : 'ENV de chave JWT nao informada na execuçao do projeto'})
            }
    
            if(!req || !req.headers){
                return res.status(401).json({erro : 'Nao foi possivel validar o Token de acesso'});
            }
    
            if(req.method !== 'OPTIONS'){
                const authorization = req.headers['authorization'];
                if(!authorization){
                    return res.status(401).json({erro : 'Nao foi posssivel validar o Token de acesso.'});
                }
    
                const token = authorization.substring(7);
                if(!token){
                    return res.status(401).json({erro : 'Nao foi possivel validar o Token de acesso.'})
                }
    
                const decoder = jwt.verify(token, MINHA_CHAVE_JWT) as JwtPayload;
                if(!decoder){
                    return res.status(401).json({erro : 'Nao foi possivel validar o Token de acesso.'})
                }
    
                if(!req.query){
                    req.query = {}; 
                }
    
                req.query.userId = decoder._id;
            }
    
        }catch(e){
            console.log(e)
            return res.status(401).json({erro : 'Nao foi possivel validar o Token de acesso'});
        }

        return handle(req, res);
}

