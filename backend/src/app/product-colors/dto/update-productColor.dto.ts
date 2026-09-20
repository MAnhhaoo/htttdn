import { PartialType } from '@nestjs/mapped-types';
import { CreateProductColorDto } from './create-productColor.dto';

export class UpdateProductColorDto extends PartialType(CreateProductColorDto) {}
