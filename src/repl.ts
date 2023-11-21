import { repl } from "@nestjs/core";
import { AppModule } from "./app.module";

// npm script当中将入口文件从main.ts更改为repl.ts
// --entryfile repl

// repl允许用户输入命令, 并且立刻看到结果
// 用户能够实验和测试代码片段而无需运行整个应用程序
async function bootstrap() {
  // 启动一个repl服务器
  // repl服务器能够访问应用程序上下文
  const replServer = await repl(AppModule);
  replServer.setupHistory(".nestjs_repl_history", (err) => {
    if (err) {
      console.error(err);
    }
  });
}
bootstrap();
