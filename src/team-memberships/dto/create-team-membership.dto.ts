import { IsString, IsNotEmpty, IsOptional, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';

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

export class CreateTeamMembershipRequestDto {
  @ValidateNested()
  @Type(() => CreateTeamMembershipDto)
  data: CreateTeamMembershipDto;
}
