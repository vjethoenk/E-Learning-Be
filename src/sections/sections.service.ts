import { BadRequestException, Injectable } from '@nestjs/common';
import { CreateSectionDto } from './dto/create-section.dto';
import { UpdateSectionDto } from './dto/update-section.dto';
import { InjectModel } from '@nestjs/mongoose';
import { Section, SectionDocument } from './schemas/section.schema';
import { SoftDeleteModel } from 'soft-delete-plugin-mongoose';
import { IUser } from 'src/users/user.interface';
import mongoose from 'mongoose';

@Injectable()
export class SectionsService {
  constructor(
    @InjectModel(Section.name)
    private sectionModel: SoftDeleteModel<SectionDocument>,
  ) {}

  async create(createSectionDto: CreateSectionDto, user: IUser) {
    return await this.sectionModel.create({
      ...createSectionDto,
      createBy: {
        _id: user._id,
        email: user.email,
      },
    });
  }

  findAll(id: string) {
    const result = this.sectionModel
      .find()
      .where({ courseId: id })
      .sort({ order: 1 })
      .exec();
    return result;
  }

  findOne(id: string) {
    if (!mongoose.Types.ObjectId.isValid(id)) {
      throw new BadRequestException('Invalid ID');
    }
    return this.sectionModel.findOne({ _id: id });
  }

  async update(id: string, updateSectionDto: UpdateSectionDto) {
    if (!mongoose.Types.ObjectId.isValid(id)) {
      throw new BadRequestException('Invalid ID');
    }
    return await this.sectionModel.updateOne(
      { _id: id },
      { ...updateSectionDto },
    );
  }

  remove(id: string) {
    if (!mongoose.Types.ObjectId.isValid(id)) {
      throw new BadRequestException('Invalid ID');
    }
    return this.sectionModel.softDelete({ _id: id });
  }
}
