import { BadRequestException, Injectable, InternalServerErrorException } from '@nestjs/common';
import { PokeResponse } from './interfaces/poke-response.interface';
import { Model } from 'mongoose';
import { Pokemon } from '../pokemon/entities/pokemon.entity';
import { InjectModel } from '@nestjs/mongoose';
import { AxiosAdapter } from '../common/adapters/axios.adapter';

@Injectable()
export class SeedService {

    constructor(
        @InjectModel(Pokemon.name) private readonly pokemonModel: Model<Pokemon>,
        private readonly http: AxiosAdapter
    ) { }

    public async execiteSeed() {

        try {
            await this.pokemonModel.deleteMany({});
            const data: PokeResponse  = await this.http.get<PokeResponse>('https://pokeapi.co/api/v2/pokemon?limit=1000')
            
            const pokemonToInsert: {name: string,no:number}[] = [];
            
            data.results.forEach(({ name, url }) => {
                const segments = url.split('/');
                const no:number = +segments[segments.length - 2];
                pokemonToInsert.push({ no, name });
            });

            this.pokemonModel.insertMany(pokemonToInsert);

            return 'Seed executed successfully';
        }
        catch (e) {
            this.handleExection(e);
        }
    }

    private handleExection(e: any) {
        if (e.code === 11000) {
            throw new BadRequestException(`Pokemon exists in db ${JSON.stringify(e.keyValue)}`);
        }
        throw new InternalServerErrorException(`Can't create pokemon - Check server logs`);
    }
    
}
