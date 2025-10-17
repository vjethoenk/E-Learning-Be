import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Query,
  Put,
} from '@nestjs/common';
import { PostService } from './post.service';
import { Post as PostEntity } from './schemas/post.schema';
import { CreatePostDto } from './dto/createpost.dto';
import { IUser } from 'src/users/user.interface';
import { Public, ResponseMessage, User } from 'src/decorator/customize';

@Controller('posts')
export class PostController {
  constructor(private readonly postService: PostService) {}

  @Get()
  @Public()
  @ResponseMessage('Show pagination ')
  findAll(
    @Query('current') current: string,
    @Query('pageSize') pageSize: string,
    @Query() qs,
  ) {
    return this.postService.findAll(+current, +pageSize, qs);
  }


  @Get(':id')
  async findOne(@Param('id') id: string): Promise<PostEntity> {
    return this.postService.findOne(id);
  }

  @Post()
  create(@Body() createpostDto: CreatePostDto, @User() user: IUser) {
    return this.postService.create(createpostDto, user);
  }

  @Patch(':id')
  async update(
    @Param('id') id: string,
    @Body() body: Partial<PostEntity>,
  ): Promise<PostEntity> {
    return this.postService.update(id, body);
  }

  @Delete(':id')
  async remove(@Param('id') id: string): Promise<PostEntity> {
    return this.postService.remove(id);
  }
}
