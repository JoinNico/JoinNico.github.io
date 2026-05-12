# rpi-imager / tps-imager 构建指南

本文档用于指导在 Ubuntu 开发机上构建 Raspberry Pi Imager，并在此基础上制作 Topsfuture 公司定制版 AppImage。本文重点覆盖 Linux / Ubuntu 环境下的构建、品牌化修改、默认镜像仓库替换、AppImage 打包、OS Customisation 适配和常见问题排查。

> 适用目标：
>
> - 在 Ubuntu x86_64 主机上构建 rpi-imager
> - 制作 Topsfuture 公司版 `tps-imager -*.AppImage`
> - 默认加载 Topsfuture 自研芯片镜像列表
> - 支持写盘前配置用户名、密码、SSH、Wi-Fi、hostname 等初始化参数

---

## 项目背景

rpi-imager 是 Raspberry Pi 官方开源的镜像烧录工具，主要功能包括：

- 在线加载系统镜像列表
- 下载 `.img.xz` / `.zip` 等镜像文件
- 校验镜像 SHA256
- 解压镜像
- 枚举本机 SD 卡、U 盘、eMMC 读卡器等存储设备
- 将镜像写入目标存储设备
- 可选地写入首次启动初始化配置

对于 Topsfuture 自研芯片，第一阶段不建议大改写盘逻辑，而是复用 rpi-imager 的通用能力，只替换：

- 默认镜像仓库 JSON
- 公司名称和图标
- 设备列表
- 系统镜像列表
- AppImage 输出文件名

---
## 基础准备
### 配置开发环境

推荐主机系统：

```bash
Ubuntu 22.04 / Ubuntu 24.04 x86_64
```

推荐 IDE：

```text
VS Code
Qt Creator 可选
```

VS Code 推荐插件：

```text
C/C++
CMake Tools
CMake
Qt Extension Pack
QML
clangd
CodeLLDB
ShellCheck
GitLens
YAML
Error Lens
```

### 拉取 rpi-imager 源码

```bash
git clone --branch v2.0.9 --depth 1 https://github.com/raspberrypi/rpi-imager.git
cd rpi-imager
```

建议新建 Topsfuture 定制分支：

```bash
git checkout -b tps-imager
```

---

### 构建官方 Qt 环境

rpi-imager 主线使用 Qt 6。官方 Linux 构建方式推荐使用项目自带脚本构建指定版本 Qt。

安装必要依赖：

```bash
sudo apt install --no-install-recommends build-essential cmake git libgnutls28-dev
```

执行：

```bash
sudo ./qt/build-qt.sh
```

该步骤会将 rpi-imager 所需的 Qt 安装到 `/opt/Qt/` 目录。


### 构建原版 AppImage

执行：

```bash
./create-appimage.sh
```

如果要显式指定 x86_64：

```bash
./create-appimage.sh --arch=x86_64
```

如果是在 ARM64 Ubuntu 主机上构建：

```bash
./create-appimage.sh --arch=aarch64
```

构建完成后，目录下会出现类似：

```text
Raspberry_Pi_Imager-*.AppImage
```

赋予执行权限并启动：

```bash
chmod +x Raspberry_Pi_Imager-*.AppImage
./Raspberry_Pi_Imager-*.AppImage
```

如果需要调试输出：

```bash
./Raspberry_Pi_Imager-*.AppImage --debug
```

### 使用自定义镜像仓库测试

在不改源码的情况下，可以先用 `--repo` 加载 Topsfuture 自定义镜像列表：

```bash
./Raspberry_Pi_Imager-*.AppImage --repo ./topsfuture-os-list.json
```

或者使用 HTTP URL：

```bash
./Raspberry_Pi_Imager-*.AppImage --repo http://192.168.57.33:8000/topsfuture-os-list.json
```

这一步用于验证：

- JSON 能否被正常解析
- Topsfuture 设备是否显示
- Topsfuture Ubuntu 镜像是否显示
- 镜像能否下载
- SHA256 是否校验通过
- 镜像是否能成功写入 SD / U 盘 / eMMC
- 板卡是否能从该介质启动


### Topsfuture 镜像仓库 JSON 示例

示例文件：`topsfuture-os-list.json`

```json
{
  "imager": {
    "latest_version": "2.0.0",
    "url": "https://downloads.topsfuture.com/imager",
    "devices": [
      {
        "name": "Topsfuture EA6530 Board",
        "tags": ["ea6530"],
        "default": true,
        "icon": "https://downloads.topsfuture.com/icons/ea6530.png",
        "description": "Topsfuture EA6530 RISC-V + NPU development board",
        "matching_type": "inclusive",
        "architecture": "riscv64",
        "capabilities": ["ethernet", "wifi", "ssh"]
      }
    ]
  },
  "os_list": [
    {
      "name": "Topsfuture Ubuntu 22.04",
      "description": "Ubuntu 22.04 image for Topsfuture EA6530 board",
      "url": "https://downloads.topsfuture.com/images/topsfuture-ubuntu-22.04.img.xz",
      "icon": "https://downloads.topsfuture.com/icons/ubuntu.png",
      "website": "https://www.topsfuture.com",
      "release_date": "2026-04-27",
      "extract_size": 8589934592,
      "extract_sha256": "aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa",
      "image_download_size": 2147483648,
      "image_download_sha256": "bbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbb",
      "devices": ["ea6530"],
      "init_format": "cloudinit",
      "architecture": "riscv64",
      "capabilities": ["ethernet", "wifi", "ssh"]
    }
  ]
}
```

如果当前镜像暂时不支持用户名、密码、Wi-Fi、SSH 初始化配置，可以先写：

```json
"init_format": "none"
```

如果要支持用户名、密码、hostname、SSH、Wi-Fi，建议写：

```json
"init_format": "cloudinit"
```

---

## 8. 生成镜像大小和 SHA256

假设原始镜像为：

```bash
topsfuture-ubuntu-22.04.img
```

压缩为 `.img.xz`：

```bash
xz -T0 -z -k topsfuture-ubuntu-22.04.img
```

获取解压后镜像大小：

```bash
stat -c%s topsfuture-ubuntu-22.04.img
```

获取解压后镜像 SHA256：

```bash
sha256sum topsfuture-ubuntu-22.04.img
```

获取压缩后镜像大小：

```bash
stat -c%s topsfuture-ubuntu-22.04.img.xz
```

获取压缩后镜像 SHA256：

```bash
sha256sum topsfuture-ubuntu-22.04.img.xz
```

对应填入 JSON：

```json
"extract_size": 8589934592,
"extract_sha256": "解压后的 img sha256",
"image_download_size": 2147483648,
"image_download_sha256": "压缩后的 img.xz sha256"
```

---

## 9. 本地 HTTP 仓库测试

建立本地测试目录：

```bash
mkdir -p ~/topsfuture-imager-repo
cd ~/topsfuture-imager-repo
```

放入：

```text
topsfuture-os-list.json
topsfuture-ubuntu-22.04.img.xz
```

启动 HTTP 服务：

```bash
python3 -m http.server 8000
```

假设开发机 IP 是 `192.168.57.33`，那么：

```text
http://192.168.57.33:8000/topsfuture-os-list.json
http://192.168.57.33:8000/topsfuture-ubuntu-22.04.img.xz
```

测试启动：

```bash
./Raspberry_Pi_Imager-*.AppImage --repo http://192.168.57.33:8000/topsfuture-os-list.json
```

---

## 10. 制作 Topsfuture 公司版 AppImage

目标是让用户直接双击公司版 AppImage，不需要手动传 `--repo`。

### 10.1 修改默认镜像仓库

打开：

```bash
vim src/config.h
```

找到：

```cpp
#define OSLIST_URL "https://downloads.raspberrypi.com/os_list_imagingutility_v4.json"
```

改为：

```cpp
#define OSLIST_URL "https://downloads.topsfuture.com/imager/topsfuture-os-list.json"
```

开发阶段也可以临时写局域网地址：

```cpp
#define OSLIST_URL "http://192.168.57.33:8000/topsfuture-os-list.json"
```

正式发布必须换成 HTTPS 地址。

---

### 10.2 修改应用名称

打开：

```bash
vim src/main.cpp
```

搜索：

```cpp
app.setOrganizationName("Raspberry Pi");
app.setOrganizationDomain("raspberrypi.com");
app.setApplicationName("Raspberry Pi Imager");
```

改为：

```cpp
app.setOrganizationName("Topsfuture");
app.setOrganizationDomain("topsfuture.com");
app.setApplicationName("Topsfuture Imager");
```

继续搜索：

```cpp
parser.setApplicationDescription("Raspberry Pi Imager GUI");
```

改为：

```cpp
parser.setApplicationDescription("Topsfuture Imager GUI");
```

---

### 10.3 修改桌面入口名称

打开：

```bash
vim debian/com.raspberrypi.rpi-imager.desktop
```

建议第一版改成：

```ini
[Desktop Entry]
Type=Application
Version=1.5
Name=Topsfuture Imager
Name[zh_CN]=Topsfuture 镜像烧录工具
Comment=Tool for writing Topsfuture system images to SD cards and storage devices
Comment[zh_CN]=用于向 SD 卡、U 盘和存储设备写入 Topsfuture 系统镜像的工具
Icon=rpi-imager
Exec=rpi-imager %F
Categories=Utility;
StartupNotify=false
MimeType=application/vnd.raspberrypi.imager-manifest+json;
```

第一版建议保留：

```ini
Icon=rpi-imager
Exec=rpi-imager %F
```

原因是内部二进制、安装路径、CMake target、polkit、desktop 文件之间可能存在关联。先只改显示名称，不要一次性改掉所有内部命名。

---

### 10.4 替换图标

官方 Linux 图标路径：

```bash
src/linux/icon/rpi-imager.svg
```

使用公司 logo 覆盖：

```bash
cp /path/to/topsfuture-logo.svg src/linux/icon/rpi-imager.svg
```

第一版建议保留文件名 `rpi-imager.svg`，只替换内容。

---

### 10.5 关闭遥测和版本检查

公司版建议关闭默认遥测和官方版本检查，避免数据上报到 Raspberry Pi 官方服务。

可以修改 `create-appimage.sh` 的 CMake 参数，或者直接执行：

```bash
sed -i 's|-DCMAKE_INSTALL_PREFIX=/usr $CMAKE_EXTRA_FLAGS|-DCMAKE_INSTALL_PREFIX=/usr -DENABLE_TELEMETRY=OFF -DENABLE_CHECK_VERSION=OFF $CMAKE_EXTRA_FLAGS|' create-appimage.sh
```

也可以手动确认 CMake 参数包含：

```bash
-DENABLE_TELEMETRY=OFF
-DENABLE_CHECK_VERSION=OFF
```

---

### 10.6 修改 AppImage 输出文件名

执行：

```bash
sed -i 's/Raspberry_Pi_Imager/Topsfuture_Imager/g' create-appimage.sh
```

之后输出文件名会从：

```text
Raspberry_Pi_Imager-*.AppImage
```

变成：

```text
Topsfuture_Imager-*.AppImage
```

---

## 11. 重新构建 Topsfuture AppImage

执行：

```bash
./create-appimage.sh
```

构建完成后：

```bash
ls -lh *.AppImage
chmod +x Topsfuture_Imager-*.AppImage
```

启动测试：

```bash
./Topsfuture_Imager-*.AppImage --debug
```

这次不要加 `--repo`。

预期效果：

```text
应用名称显示为 Topsfuture Imager
默认设备列表显示 Topsfuture EA6530 Board
默认系统列表显示 Topsfuture Ubuntu 22.04
默认下载地址来自 Topsfuture JSON
```

---

## 12. OS Customisation 适配

如果需要像 Raspberry Pi Imager 一样支持：

- hostname
- username
- password
- SSH
- Wi-Fi
- locale
- timezone

则 JSON 中必须启用：

```json
"init_format": "cloudinit"
```

同时 Topsfuture Ubuntu 镜像内必须支持 cloud-init。

### 12.1 镜像内安装必要组件

在目标 rootfs 中安装：

```bash
sudo apt update
sudo apt install -y \
  cloud-init \
  netplan.io \
  openssh-server \
  network-manager \
  wpasupplicant
```

如果是纯 Server 系统，也可以使用 `systemd-networkd`，但为了兼容 Wi-Fi，建议第一版使用：

```text
NetworkManager + netplan + wpasupplicant
```

---

### 12.2 确保 cloud-init 读取 boot 分区

rpi-imager 会在 boot 分区写入类似文件：

```text
user-data
meta-data
network-config
vendor-data
```

目标 Ubuntu 系统首次启动时，cloud-init 必须能读取这些文件。

推荐做法之一是使用 NoCloud 数据源。

在 rootfs 中创建：

```bash
mkdir -p /etc/cloud/cloud.cfg.d
vim /etc/cloud/cloud.cfg.d/90_topsfuture_nocloud.cfg
```

写入：

```yaml
datasource_list: [ NoCloud, None ]

datasource:
  NoCloud:
    seedfrom: file:///boot/firmware/
```

如果 boot 分区挂载在 `/boot`，则写：

```yaml
datasource_list: [ NoCloud, None ]

datasource:
  NoCloud:
    seedfrom: file:///boot/
```

关键要求是：第一次启动时，cloud-init 能在该目录下找到 `user-data`、`meta-data` 和 `network-config`。

---

### 12.3 确保 boot 分区自动挂载

检查目标系统 `/etc/fstab`，确保 boot 分区挂载到 cloud-init 配置里的路径。

示例：

```text
LABEL=bootfs  /boot/firmware  vfat  defaults  0  1
```

或者：

```text
LABEL=CIDATA  /boot/firmware  vfat  defaults  0  1
```

也可以使用 UUID：

```text
UUID=xxxx-xxxx  /boot/firmware  vfat  defaults  0  1
```

---

### 12.4 启用服务

在目标 rootfs 中执行：

```bash
systemctl enable cloud-init-local.service
systemctl enable cloud-init.service
systemctl enable cloud-config.service
systemctl enable cloud-final.service
systemctl enable ssh.service
systemctl enable NetworkManager.service
```

如果在 x86 Ubuntu 上 chroot RISC-V rootfs，需要先准备 qemu：

```bash
sudo apt install -y qemu-user-static binfmt-support
sudo cp /usr/bin/qemu-riscv64-static /mnt/rootfs/usr/bin/
sudo chroot /mnt/rootfs /bin/bash
```

---

## 13. 手动验证 cloud-init

写盘完成后，挂载 boot 分区：

```bash
sudo mkdir -p /mnt/tps-boot
sudo mount /dev/sdX1 /mnt/tps-boot
```

手动写入 `meta-data`：

```bash
sudo tee /mnt/tps-boot/meta-data > /dev/null <<'EOF'
instance-id: topsfuture-test-001
local-hostname: tps-board
EOF
```

手动写入 `user-data`：

```bash
sudo tee /mnt/tps-boot/user-data > /dev/null <<'EOF'
#cloud-config
hostname: tps-board
manage_etc_hosts: true

users:
  - name: tps
    groups: sudo,adm,dialout,video,audio,netdev
    shell: /bin/bash
    lock_passwd: false
    plain_text_password: tps123456
    sudo: ALL=(ALL) NOPASSWD:ALL

ssh_pwauth: true
disable_root: false
EOF
```

手动写入有线网络配置：

```bash
sudo tee /mnt/tps-boot/network-config > /dev/null <<'EOF'
network:
  version: 2
  ethernets:
    eth0:
      dhcp4: true
      optional: true
EOF
```

卸载：

```bash
sudo umount /mnt/tps-boot
```

插入板卡启动后，测试：

```bash
ssh tps@板子IP
```

密码：

```text
tps123456
```

如果能登录，说明镜像 cloud-init 链路是通的。

---

## 14. 构建产物测试清单

每次发布 Topsfuture Imager 前，建议检查：

```text
[ ] AppImage 能在 Ubuntu 22.04 启动
[ ] AppImage 能在 Ubuntu 24.04 启动
[ ] 应用名称显示 Topsfuture Imager
[ ] 图标显示 Topsfuture logo
[ ] 默认加载 Topsfuture JSON
[ ] 不加 --repo 时能显示 Topsfuture 设备
[ ] 不加 --repo 时能显示 Topsfuture Ubuntu 镜像
[ ] 镜像下载正常
[ ] 镜像 SHA256 校验通过
[ ] 写盘成功
[ ] 写盘后分区结构正确
[ ] 板卡能启动
[ ] cloud-init 用户名生效
[ ] cloud-init 密码生效
[ ] SSH 生效
[ ] hostname 生效
[ ] 有线 DHCP 生效
[ ] Wi-Fi 配置生效
[ ] 没有向 Raspberry Pi 官方服务请求镜像列表
[ ] 遥测和版本检查已关闭
```

---

## 15. 常见问题

### 15.1 编译时报找不到 Qt

现象：

```text
Missing suitable Qt library
```

处理：

```bash
sudo ./qt/build-qt.sh
```

确认 Qt 安装在：

```bash
ls /opt/Qt
```

然后重新执行：

```bash
./create-appimage.sh
```

---

### 15.2 AppImage 启动后还是显示 Raspberry Pi 镜像

检查：

```bash
grep -n "OSLIST_URL" src/config.h
```

确认已经改成 Topsfuture JSON：

```cpp
#define OSLIST_URL "https://downloads.topsfuture.com/imager/topsfuture-os-list.json"
```

如果曾经运行过旧版本，可能有缓存。可以尝试删除用户缓存目录后重新启动。

---

### 15.3 JSON 能加载，但镜像不显示

优先检查：

```json
"devices": ["ea6530"]
```

是否和设备定义中的 tag 对应：

```json
"tags": ["ea6530"]
```

如果系统镜像项的 `devices` 和设备项的 `tags` 对不上，可能被过滤掉。

---

### 15.4 下载失败

先用浏览器或 wget 测试：

```bash
wget https://downloads.topsfuture.com/images/topsfuture-ubuntu-22.04.img.xz
```

如果 wget 都失败，说明不是 imager 问题，而是服务器、URL、证书或网络问题。

---

### 15.5 SHA256 校验失败

重新计算：

```bash
sha256sum topsfuture-ubuntu-22.04.img
sha256sum topsfuture-ubuntu-22.04.img.xz
```

确认 JSON 中：

```json
"extract_sha256": "解压后 img 的 sha256",
"image_download_sha256": "压缩包 img.xz 的 sha256"
```

不要把两者填反。

---

### 15.6 写盘成功但板卡不启动

这通常不是 imager 问题，而是镜像或启动链路问题。检查：

```bash
lsblk
sudo fdisk -l /dev/sdX
sudo mount /dev/sdX1 /mnt
ls /mnt
```

重点确认：

- 分区表是否正确
- boot 分区是否存在
- bootloader 文件是否存在
- rootfs 分区是否存在
- `/etc/fstab` 是否正确
- U-Boot / SPL / firmware 是否写在正确位置
- 板卡启动拨码是否选择了对应介质

---

### 15.7 OS Customisation 页面不出现

检查 JSON：

```json
"init_format": "cloudinit"
```

如果是：

```json
"init_format": "none"
```

则表示该系统镜像不支持初始化配置。

---

### 15.8 写盘后 boot 分区没有 user-data

可能原因：

- JSON 没有设置 `init_format`
- 选择的是本地 custom image 而不是 JSON 里的系统项
- 当前流程没有启用 OS Customisation
- Imager 版本和 JSON 字段不匹配

建议从在线 JSON 里的系统项开始测试，不要先用本地自定义镜像入口。

---

### 15.9 boot 分区有 user-data，但启动后配置不生效

说明 tps-imager 侧基本正常，问题在目标系统 cloud-init。

检查目标板：

```bash
cloud-init status --long
journalctl -u cloud-init-local.service
journalctl -u cloud-init.service
journalctl -u cloud-config.service
journalctl -u cloud-final.service
```

查看 cloud-init 日志：

```bash
cat /var/log/cloud-init.log
cat /var/log/cloud-init-output.log
```

确认 NoCloud 数据源是否被识别：

```bash
cloud-id
```

---

## 16. 建议的提交结构

建议将 Topsfuture 定制修改集中提交，便于后续跟随上游主线。

```text
commit 1: add Topsfuture default repository
commit 2: brand application name and desktop metadata
commit 3: replace icon assets
commit 4: disable telemetry and upstream version check
commit 5: rename AppImage output artifact
commit 6: add Topsfuture build documentation
```

不要在同一个提交里同时改 UI、写盘逻辑、cloud-init、品牌化，否则后续排查问题会很困难。

---

## 17. 推荐目录结构

可以在仓库里增加：

```text
docs/
  rpi-imager-build-guide.md
  topsfuture-os-list-example.json
  cloudinit-test/
    user-data
    meta-data
    network-config
scripts/
  build-topsfuture-appimage.sh
  check-os-list-json.sh
  update-image-sha256.sh
assets/
  topsfuture-logo.svg
```

---

## 18. 一键构建脚本示例

可以新建：

```bash
scripts/build-topsfuture-appimage.sh
```

内容示例：

```bash
#!/usr/bin/env bash
set -euo pipefail

echo "[1/4] Checking source tree..."
test -f create-appimage.sh
test -f src/config.h

echo "[2/4] Cleaning previous AppImage outputs..."
rm -f Topsfuture_Imager-*.AppImage

echo "[3/4] Building AppImage..."
./create-appimage.sh --arch=x86_64

echo "[4/4] Done."
ls -lh Topsfuture_Imager-*.AppImage
```

赋予权限：

```bash
chmod +x scripts/build-topsfuture-appimage.sh
```

执行：

```bash
./scripts/build-topsfuture-appimage.sh
```

---

## 19. 后续扩展方向

第一版建议只做：

```text
默认仓库替换
品牌替换
AppImage 打包
cloud-init 通用初始化
```

后续再考虑：

```text
Topsfuture 专用初始化选项
NPU 服务开关
CAN / SPI / I2C / UART 配置
ROS2 预装包选择
apt 源配置
自动扩容 rootfs
板卡型号自动识别
USB fastboot / 厂商协议烧录
日志导出功能
失败重试和诊断报告
```

---

## 20. 参考资料

- rpi-imager GitHub 仓库https://github.com/raspberrypi/rpi-imager
- rpi-imager Linux 构建说明https://github.com/raspberrypi/rpi-imager/blob/main/CONTRIBUTING.md
- rpi-imager OS customisation 格式说明https://github.com/raspberrypi/rpi-imager/blob/main/doc/os_customisation_formats.md
- rpi-imager schema noteshttps://github.com/raspberrypi/rpi-imager/blob/main/doc/schema-notes.md
- cloud-init NoCloud 数据源说明
  https://docs.cloud-init.io/en/latest/reference/datasources/nocloud.html
