import { BadRequestException, Injectable, InternalServerErrorException } from '@nestjs/common';
import { isValidObjectId, Model } from 'mongoose';
import { CreatePokemonDto } from './dto/create-pokemon.dto';
import { UpdatePokemonDto } from './dto/update-pokemon.dto';
import { Pokemon } from './entities/pokemon.entity';
import { InjectModel } from '@nestjs/mongoose';
import { PaginationDto } from '../common/dto/pagination.dto';


@Injectable()
export class PokemonService {

    constructor(
        @InjectModel(Pokemon.name) private readonly pokemonModel: Model<Pokemon>
    ) { }

    public async findAll(paginationDto : PaginationDto) : Promise<Pokemon[]> {
        const { limit = 10, offset = 0 } = paginationDto;
        const pokemons: Pokemon[] = await this.pokemonModel.find().limit(limit).skip(offset).sort({ no: 1 }).select('-__v');
        return pokemons;
    }

    public async findOne(term: string): Promise<Pokemon> {
        let pokemon: Pokemon;
        if (!isNaN(+term)) {
            pokemon = await this.pokemonModel.findOne({ no: term });
        } else if (isValidObjectId(term)) {
            pokemon = await this.pokemonModel.findById(term);
        } else {
            pokemon = await this.pokemonModel.findOne({ name: term.toLowerCase() });
        }

        if (!pokemon) throw new BadRequestException(`Pokemon not found with term ${term}`);

        return pokemon;

    }

    public async create(createPokemonDto: CreatePokemonDto): Promise<Pokemon> {
        try {
            createPokemonDto.name = createPokemonDto.name.toLowerCase();
            const pokemon = await this.pokemonModel.create(createPokemonDto);
            return pokemon;
        }
        catch (e) {
            this.handleExection(e);
        }
    }

    public async update(term: string, updatePokemonDto: UpdatePokemonDto): Promise<Pokemon> {
        try {
            const pokemon: Pokemon = await this.findOne(term);
            if (updatePokemonDto.name) 
                updatePokemonDto.name ?? updatePokemonDto.name.toLowerCase();

            await pokemon.updateOne(updatePokemonDto);
            return { ...pokemon.toJSON(), ...updatePokemonDto };
        }
        catch (e) {
            this.handleExection(e);
        }
    }

    public async remove(id: string): Promise<boolean> {
        const { deletedCount } = await this.pokemonModel.deleteOne({_id: id });
        if (deletedCount === 0) 
            throw new BadRequestException(`Pokemon not found with id ${id}`);

        return deletedCount > 0;
    }

    private handleExection(e: any) {
        if (e.code === 11000) {
            throw new BadRequestException(`Pokemon exists in db ${JSON.stringify(e.keyValue)}`);
        }
        throw new InternalServerErrorException(`Can't create pokemon - Check server logs`);
    }

}
