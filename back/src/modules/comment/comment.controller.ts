import { CurrentUser } from '@/common/decorators/current-user.decorator';
import { LineLogger } from '@/common/utils/lineLogger';
import {
  JwtAuthGuard,
  OptionalJwtAuthGuard,
} from '@/modules/auth/guards/jwt-auth.guard';
import { CommentService } from '@/modules/comment/comment.service';
import { CreateCommentDto } from '@/modules/comment/dto/CreateCommentDto';
import { User } from '@/modules/user/entity/user.entity';
import {
  BadRequestException,
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Query,
  UnauthorizedException,
  UseGuards,
} from '@nestjs/common';
import { isUUID } from 'class-validator';

const logger = new LineLogger();

@Controller('comments')
export class CommentController {
  constructor(private readonly commentService: CommentService) {}

  @UseGuards(JwtAuthGuard)
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

  @UseGuards(JwtAuthGuard)
  @Post(':id/like')
  async likeComment(@Param('id') id: string, @CurrentUser() user: User) {
    if (!isUUID(id)) throw new BadRequestException('Invalid comment id');
    if (!user) throw new UnauthorizedException();
    logger.log(user);
    return this.commentService.likeComment(id, user.id);
  }

  @Get('post/:postId')
  @UseGuards(OptionalJwtAuthGuard)
  getCommentsForPost(
    @Param('postId') postId: string,
    @CurrentUser() user?: { id: string },
    @Query('page') page = 1,
    @Query('limit') limit = 10,
  ) {
    return this.commentService.getCommentsForPost(
      postId,
      user?.id,
      Number(page),
      Number(limit),
    );
  }

  @Get(':commentId/replies')
  @UseGuards(OptionalJwtAuthGuard)
  getReplies(
    @Param('commentId') commentId: string,
    @CurrentUser() user?: { id: string },
  ) {
    return this.commentService.getReplies(commentId, user?.id);
  }

  @UseGuards(JwtAuthGuard)
  @Patch(':commentId')
  updateComment(
    @Param('commentId') commentId: string,
    @CurrentUser() user: User,
    @Body('text') text: string,
  ) {
    return this.commentService.updateComment(commentId, user.id, text);
  }

  @UseGuards(JwtAuthGuard)
  @Delete(':id/like')
  async unlikeComment(@Param('id') id: string, @CurrentUser() user: User) {
    return this.commentService.unlikeComment(id, user.id);
  }

  @UseGuards(JwtAuthGuard)
  @Delete(':commentId')
  deleteComment(
    @Param('commentId') commentId: string,
    @CurrentUser() user: User,
  ) {
    return this.commentService.deleteComment(commentId, user.id);
  }
}
