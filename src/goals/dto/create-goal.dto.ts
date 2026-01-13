import { IsString, IsNotEmpty, IsOptional, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';

export class CreateGoalDto {
  @IsString()
  @IsOptional()
  gid?: string;

  @IsString()
  @IsNotEmpty()
  name: string;

  @IsString()
  @IsNotEmpty()
  workspaceGid: string;
}

export class CreateGoalRequestDto {
  @ValidateNested()
  @Type(() => CreateGoalDto)
  data: CreateGoalDto;
}