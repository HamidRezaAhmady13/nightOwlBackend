import { NestFactory } from '@nestjs/core';
import * as fs from 'fs';
import * as path from 'path';
import { AppModule } from 'src/app/app.module';
import { PostService } from 'src/modules/post/post.service';
import { UserService } from 'src/modules/user/user.service';

function copyFromSrcToTemp(filename: string): string {
  const src = path.resolve(process.cwd(), 'uploads', filename);
  const tempDir = path.resolve(process.cwd(), 'uploads', '_seed_temp');
  fs.mkdirSync(tempDir, { recursive: true });
  const dest = path.join(tempDir, filename);
  fs.copyFileSync(src, dest);
  return dest;
}

function makeMedia(filename: string): Express.Multer.File {
  const tempPath = copyFromSrcToTemp(filename);
  return {
    fieldname: 'media',
    originalname: filename,
    encoding: '7bit',
    mimetype: filename.endsWith('.png') ? 'image/png' : 'image/jpeg',
    destination: path.dirname(tempPath),
    filename,
    path: tempPath,
    size: fs.statSync(tempPath).size,
  } as any;
}

async function bootstrap() {
  const app = await NestFactory.createApplicationContext(AppModule);
  const userSvc = app.get(UserService);
  const postSvc = app.get(PostService);
  const testEmail = 'testshowcase@social.app';

  let testUser = await userSvc.findByEmail(testEmail);
  if (!testUser) {
    testUser = await userSvc.createUser({
      email: testEmail,
      username: 'ShowcaseUser',
      password: 'ShowcasePass123',
    });

    await postSvc.createPost(
      { content: '🌅 Sunrise over the mountains. A test post by dev team' },
      testUser,
      makeMedia('sunrise.jpg'),
    );
    await postSvc.createPost(
      {
        content:
          '🚀 Just launched my new project! Look at these leaves and moon!. A test post by dev team',
      },
      testUser,
      makeMedia('moon1.jpg'),
    );
    await postSvc.createPost(
      {
        content:
          '☕ Coffee & code – perfect morning. Look at this road at this desert!. A test post by dev team',
      },
      testUser,
      makeMedia('road.jpg'),
    );
    await postSvc.createPost(
      {
        content:
          '🌄 Evening vibes with my setup. Look at the moon!. A test post by dev team',
      },
      testUser,
      makeMedia('moon2.jpg'),
    );
  }
  await app.close();
  console.log('Seed complete');
}
bootstrap().catch((err) => {
  console.error('Seed failed:', err);
  process.exit(1);
});
