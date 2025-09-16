import { BadRequestException, Injectable } from '@nestjs/common';
import { CreateCategoryDto } from './dto/create-category.dto';
import { UpdateCategoryDto } from './dto/update-category.dto';
import { IUser } from 'src/users/user.interface';
import { Category, CategoryDocument } from './schemas/category.schema';
import { InjectModel } from '@nestjs/mongoose';
import { SoftDeleteModel } from 'soft-delete-plugin-mongoose';
import aqp from 'api-query-params';
import mongoose, { Mongoose } from 'mongoose';

@Injectable()
export class CategoriesService {
  constructor(
    @InjectModel(Category.name)
    private categoryModel: SoftDeleteModel<CategoryDocument>,
  ) {}
  async create(createCategoryDto: CreateCategoryDto, user: IUser) {
    const category = await this.categoryModel.create({
      ...createCategoryDto,
      createBy: {
        _id: user._id,
        email: user.email,
      },
    });
    return category;
  }

  async findAll(current: number, pageSize: number, qs: string) {
    const { filter, sort, projection, population } = aqp(qs);
    delete filter.current;
    delete filter.pageSize;

    const limitDefault = pageSize && pageSize > 0 ? pageSize : 10;
    const totalItems = await this.categoryModel.countDocuments({
      ...filter,
      isDeleted: false,
    });

    const totalPage = Math.ceil(totalItems / limitDefault);
    const offset = limitDefault * (current - 1);

    const result = await this.categoryModel
      .find(filter)
      .skip(offset)
      .limit(limitDefault)
      .sort(sort as any)
      .select(projection)
      .populate(population)
      .exec();

    return {
      meta: {
        current,
        pageSize: limitDefault,
        pages: totalPage,
        total: totalItems,
      },
      result,
    };
  }

  findOne(id: string) {
    return this.categoryModel.findById({ _id: id });
  }

  async update(id: string, updateCategoryDto: UpdateCategoryDto, user: IUser) {
    if (!mongoose.Types.ObjectId.isValid(id)) {
      throw new BadRequestException('Invalid ID');
    }
    return await this.categoryModel.updateOne(
      { _id: id },
      {
        ...updateCategoryDto,
        updateBy: {
          _id: user._id,
          email: user.email,
        },
      },
    );
  }

  remove(id: string) {
    return this.categoryModel.softDelete({ _id: id });
  }
}
