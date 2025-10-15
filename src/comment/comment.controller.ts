import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Query,
  UseGuards,
} from '@nestjs/common';
import { JwtAuthGuard } from 'src/auth/guards/jwt-auth.guard';
import { CurrentUser } from 'src/common/decorators/current-user.decorator';
import { User } from 'src/user/entity/user.entity';
import { CommentService } from './comment.service';
import { CreateCommentDto } from './dto/CreateCommentDto';

@UseGuards(JwtAuthGuard)
@Controller('comments')
export class CommentController {
  constructor(private readonly commentService: CommentService) {}

  @Get('post/:postId')
  getCommentsForPost(
    @Param('postId') postId: string,
    @CurrentUser() user: User,
    @Query('page') page = 1,
    @Query('limit') limit = 10,
  ) {
    console.log('GET /comments/post/:postId called', {
      postId,
      userId: user?.id,
      page,
      limit,
    });
    return this.commentService.getCommentsForPost(
      postId,
      user.id,
      Number(page),
      Number(limit),
    );
  }

  @Post('post/:postId')
  createComment(
    @Param('postId') postId: string,
    @CurrentUser() user: User,
    @Body() dto: CreateCommentDto,
  ) {
    return this.commentService.createComment(
      dto.text,
      postId,
      user,
      dto.parentCommentId,
    );
  }

  @Post(':id/like')
  async likeComment(@Param('id') id: string, @CurrentUser() user: User) {
    console.log(id, '###########!@@@@@@@@@@');
    // console.log(user);

    return this.commentService.likeComment(id, user.id);
  }

  @Delete(':id/like')
  async unlikeComment(@Param('id') id: string, @CurrentUser() user: User) {
    console.log(id, '##########');

    return this.commentService.unlikeComment(id, user.id);
  }

  @Get(':commentId/replies')
  getReplies(@Param('commentId') commentId: string, @CurrentUser() user: User) {
    return this.commentService.getReplies(commentId, user.id);
  }

  @Patch(':commentId')
  updateComment(
    @Param('commentId') commentId: string,
    @CurrentUser() user: User,
    @Body('text') text: string,
  ) {
    return this.commentService.updateComment(commentId, user.id, text);
  }

  @Delete(':commentId')
  deleteComment(
    @Param('commentId') commentId: string,
    @CurrentUser() user: User,
  ) {
    return this.commentService.deleteComment(commentId, user.id);
  }
}
