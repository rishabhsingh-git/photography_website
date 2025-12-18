import { Injectable, CanActivate, ExecutionContext, ForbiddenException } from '@nestjs/common';
import { JwtAuthGuard } from './jwt-auth.guard';

@Injectable()
export class AdminGuard extends JwtAuthGuard {
  async canActivate(context: ExecutionContext): Promise<boolean> {
    const result = await super.canActivate(context);
    if (!result) return false;
    
    const request = context.switchToHttp().getRequest();
    const user = request.user;
    const isAdmin = user?.roles && user.roles.indexOf('admin') !== -1;
    if (!isAdmin) {
      throw new ForbiddenException('Admin access required');
    }
    return true;
  }
}

