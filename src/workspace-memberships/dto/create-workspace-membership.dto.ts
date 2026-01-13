import { IsString, IsNotEmpty, IsOptional } from 'class-validator';

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
