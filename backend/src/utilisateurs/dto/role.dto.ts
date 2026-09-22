import {
  IsNotEmpty,
  IsString,
} from 'class-validator';

export class RoleDto {
  @IsString()
  @IsNotEmpty()
  roleCode: string;
}
