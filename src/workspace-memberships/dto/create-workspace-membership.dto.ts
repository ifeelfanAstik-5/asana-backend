import { IsString, IsNotEmpty, IsOptional, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';

export class CreateWorkspaceMembershipDto {
  @IsString()
  @IsOptional()
  gid?: string;

  @IsString()
  @IsNotEmpty()
  userGid: string;

  @IsString()
  @IsNotEmpty()
  workspaceGid: string;

  @IsString()
  @IsOptional()
  role?: string;
}

export class CreateWorkspaceMembershipRequestDto {
  @ValidateNested()
  @Type(() => CreateWorkspaceMembershipDto)
  data: CreateWorkspaceMembershipDto;
}
