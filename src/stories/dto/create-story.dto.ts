import { IsString, IsNotEmpty, IsOptional } from 'class-validator';

export class CreateStoryDto {
  @IsString()
  @IsOptional()
  gid?: string;

  @IsString()
  @IsNotEmpty()
  text: string;

  @IsString()
  @IsNotEmpty()
  taskGid: string;

  @IsString()
  @IsOptional()
  createdById?: string;
}
