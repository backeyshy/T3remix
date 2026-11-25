# 安装 Remix Workbench

## 电脑或个人服务器

使用 Node 26.13.1 和 pnpm 12.14.0。从此 fork 获取源码后，在仓库根目录运行以下命令。

```sh
git clone https://github.com/backeyshy/T3remix.git
cd T3remix
pnpm install --frozen-lockfile
pnpm exec vp run dev
```

本机打开终端打印的配对链接即可。配对凭据可以授权访问对应的工作环境，请只交给自己的设备。持久数据可使用 `T3REMIX_HOME` 指定位置。局域网、反向代理和直接配对见[远程接入](./remote-access.md)。

## 手机

手机浏览器直接打开自己主机生成的可达配对地址，即可使用网页版。原生应用在 `apps/mobile` 中。准备对应的 Xcode 与 CocoaPods 或 Android SDK 后，在已完成依赖安装的仓库中运行对应平台命令。

```sh
pnpm --filter @t3tools/mobile run ios:dev
# 或
pnpm --filter @t3tools/mobile run android:dev
```

这些开发命令会重新生成原生工程。要安装到自己的 iPhone 或打包分发，还需使用自己的 Apple 签名。Android 发布版同样使用自己的签名。生成的应用打开后可扫码或手动配对。原版商店应用及官方 npm 安装器分发上游程序。
