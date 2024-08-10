import { IsInt, IsPositive, IsString, Min, MinLength } from "class-validator";

export class CreatePokemonDto {
    
    @IsInt({message: 'El numero debe ser un numero'})
    @IsPositive({message: 'El numero debe ser positivo'})
    @Min(1, {message: 'El numero minimo es 1'})
    no: number;

    @IsString({message: 'El nombre debe ser un string'})
    @MinLength(1, {message: 'Minimo 1 caracter'})
    name: string;
}
