import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Post, PostDocument } from './schemas/post.schema';
import { CreatePostDto } from './dto/createpost.dto';
import { IUser } from 'src/users/user.interface';
import aqp from 'api-query-params';
@Injectable()
export class PostService {
  constructor(
    @InjectModel(Post.name) private postModel: Model<PostDocument>,
  ) {}

  async findAll(current: number, pageSize: number, qs: string) {
    const { filter, sort, projection, population } = aqp(qs);
    delete filter.current;
    delete filter.pageSize;

    const limitDefault = pageSize ? pageSize : 10;
    const totalItems = await this.postModel.countDocuments();
    const totalPage = Math.ceil(totalItems / limitDefault);
    const offset = pageSize * (current - 1);

    const result = await this.postModel
      .find(filter)
      .skip(offset)
      .limit(limitDefault)
      .sort(sort as any)
      .select(projection)
      .exec();

    return {
      meta: {
        current: current,
        pageSize: pageSize,
        pages: totalPage,
        totalItem: totalItems,
      },
      result,
    };
  }

  async findOne(id: string): Promise<Post> {
    const post = await this.postModel.findById(id).exec();
    if (!post || post.isDeleted) {
      throw new NotFoundException(`Post #${id} not found`);
    }
    return post;
  }

  async create(createpost: CreatePostDto, user: IUser) {
    return await this.postModel.create({
      ...createpost,
      createBy: {
        _id: user._id,
        email: user.email,
        name: user.name,
      },
    });
  }

  async update(id: string, data: Partial<Post>): Promise<Post> {
    const updated = await this.postModel
      .findByIdAndUpdate(id, data, { new: true })
      .exec();
    if (!updated) {
      throw new NotFoundException(`Post #${id} not found`);
    }
    return updated;
  }

  async remove(id: string): Promise<Post> {
    const deleted = await this.postModel
      .findByIdAndUpdate(
        id,
        { isDeleted: true, deletedAt: new Date() },
        { new: true },
      )
      .exec();
    if (!deleted) {
      throw new NotFoundException(`Post #${id} not found`);
    }
    return deleted;
  }
}
