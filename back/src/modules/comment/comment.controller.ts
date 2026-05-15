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
import { CurrentUser } from 'src/common/decorators/current-user.decorator';
import { JwtAuthGuard } from 'src/modules/auth/guards/jwt-auth.guard';
import { CommentService } from 'src/modules/comment/comment.service';
import { CreateCommentDto } from 'src/modules/comment/dto/CreateCommentDto';
import { User } from 'src/modules/user/entity/user.entity';

@UseGuards(JwtAuthGuard)
@Controller('comments')
export class CommentController {
  constructor(private readonly commentService: CommentService) {}

  @Get('post/:postId')
  getCommentsForPost(
    @Param('postId') postId: string,
    @CurrentUser() user: { id: string },
    @Query('page') page = 1,
    @Query('limit') limit = 10,
  ) {
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
    return this.commentService.likeComment(id, user.id);
  }

  @Delete(':id/like')
  async unlikeComment(@Param('id') id: string, @CurrentUser() user: User) {
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
