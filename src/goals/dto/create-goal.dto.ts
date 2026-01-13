import { IsString, IsNotEmpty, IsOptional } from 'class-validator';

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
