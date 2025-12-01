// import { CallHandler, ExecutionContext, Injectable, NestInterceptor } from "@nestjs/common";
// import { SocketService } from "src/socket/socket.service";

// @Injectable()
// export class AttachUnreadInterceptor implements NestInterceptor {
//   constructor(private notifSvc: NotificationsService, private socketSvc: SocketService) {}
//   async intercept(ctx: ExecutionContext, next: CallHandler) {
//     const res = await next.handle().pipe(lastValueFrom);                     // get controller result
//     if (res?.user?.id) {
//       const unread = await this.notifSvc.findUndelivered(res.user.id);       // minimal list or count
//       res.user.unreadNotifications = unread;                                 // attach to response
//       this.socketSvc.emitToUser(res.user.id, 'notifications.sync', unread);  // optional emit if sockets exist
//     }
//     return res;
//   }
// }
