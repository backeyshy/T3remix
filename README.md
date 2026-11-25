# Remix Workbench

个人 AI 工作台，基于 T3 Code 的 MIT 源码建立。此分支由仓库所有者独立维护。网页、桌面和手机沿用原有工作区、会话、模型切换和终端的交互。

## 从源码运行

安装 Node 26.13.1 和 pnpm 12.14.0，在仓库根目录执行以下命令。

```sh
pnpm install --frozen-lockfile
pnpm exec vp run dev
```

打开终端打印的本机配对链接。第一次启动使用新的数据目录。可通过 `T3REMIX_HOME` 指定自己的位置。

## 手机和自托管

手机浏览器可以直接连接开放给它的个人主机。原生 iOS 或 Android 客户端需要从此仓库构建。桌面、移动客户端和服务器都有独立的应用标识或数据目录。直连无需官方账号、官方中继或单独租用服务器。

如果有自己的托管网页、中继和身份服务，可在 [配置样例](.env.example) 填写自己的地址和公开客户端标识。更新包和模型清单也需由自己发布或配置。私钥只放在部署环境。

[安装与手机构建](docs/user/install.md) · [连接与隐私](docs/user/telemetry.md) · [功能文档](docs/README.md) · [源码许可](LICENSE) · [上游商标声明](TRADEMARK.md)
