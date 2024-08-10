import { Injectable } from '@nestjs/common';
import { HttpAdapter } from '../interfaces/http-adapter.interface';
import axios, { AxiosInstance } from 'axios';

@Injectable()
export class AxiosAdapter implements HttpAdapter {
    
    private readonly axios: AxiosInstance = axios;

    public async get<T>(url: string): Promise<T> {
        try{
            const { data } = await this.axios.get<T>(url);
            return data;
        }catch(error){ 
            throw new Error('This is an error - Check logs');
        }
       
    }
    
}