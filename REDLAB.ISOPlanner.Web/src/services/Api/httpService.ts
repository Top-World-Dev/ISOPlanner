import axios, { AxiosRequestConfig } from 'axios';
import Config from '../Config/configService';
import logger from '../Logging/logService';

const instance = axios.create(
    {
        baseURL: Config.get('Api.BaseURL'),
    }
)

instance.interceptors.response.use(undefined, error => {
    const expectedError = 
        error.response &&
        error.response.status >= 400 &&
        error.response.status < 500;
    
    if (!expectedError) {
        logger.error(error);
    }

    return Promise.reject(error);
})

function getRequestConfig(accessToken : string) : AxiosRequestConfig {

    return {'headers': {'Authorization': 'Bearer ' + accessToken} }

}

const httpService = 
{
    get: instance.get,
    put: instance.put,
    post: instance.post,
    delete: instance.delete,
    getRequestConfig
};

export default httpService;