import { IsString, IsNotEmpty, IsOptional, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';

export class CreateStoryDto {
  @IsString()
  @IsOptional()
  gid?: string;

  @IsString()
  @IsNotEmpty()
  text: string;

  @IsString()
  @IsOptional()
  taskGid?: string;

  @IsString()
  @IsOptional()
  projectGid?: string;

  @IsString()
  @IsOptional()
  createdById?: string;
}

export class CreateStoryRequestDto {
  @ValidateNested()
  @Type(() => CreateStoryDto)
  data: CreateStoryDto;
}
