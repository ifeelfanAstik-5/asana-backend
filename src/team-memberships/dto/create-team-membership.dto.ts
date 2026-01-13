import { IsString, IsNotEmpty, IsOptional } from 'class-validator';

export class CreateTeamMembershipDto {
  @IsString()
  @IsOptional()
  gid?: string;

  @IsString()
  @IsNotEmpty()
  userGid: string;

  @IsString()
  @IsNotEmpty()
  teamGid: string;

  @IsString()
  @IsOptional()
  role?: string;
}
