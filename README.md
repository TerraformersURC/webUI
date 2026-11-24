# **Running the UI with the Jetson**

Tested Compatibility: Humble, Jazzy

### Dependencies

- Rosapi: `sudo apt install ros-${ROS_DISTRO}-rosapi` skip until end, then run to verify its installed. should be installed by rosbridge-suite
- Rosbridge Suite: `sudo apt-get install ros-${ROS_DISTRO}-rosbridge-suite`
- Web Video Server: `sudo apt install ros-${ROS_DISTRO}-web-video-server`
- npx serve:`sudo apt install npm`

### Launch Script

- Run from workspace root where ./webUI is a direct sub-directory
- You may have to use multiple terminal windows as some commands may block (even with the &), all terminals used must run lines 1 and 2 (source both things)

```jsx
source /opt/ros/${ROS_DISTRO}/setup.bash
source install/setup.bash
ros2 run rosapi rosapi_node &
ros2 run rosbridge_server rosbridge_websocket &
ros2 run web_video_server web_video_server &
npx serve ./webUI 
```

The first time running this will prompt you to install serve, install it. Open http://localhost:3000 in a web browser (tested in Firefox).

# **Running the UI with Simulation (on one laptop)**

Tested Compatibility: Humble

Known Incompatibility: Jazzy

### Dependencies

- Rosapi: `sudo apt install ros-${ROS_DISTRO}-rosapi` skip until end, then run to verify its installed. should be installed by rosbridge-suite
- Rosbridge Suite: `sudo apt-get install ros-${ROS_DISTRO}-rosbridge-suite`
- Web Video Server: `sudo apt install ros-${ROS_DISTRO}-web-video-server`
- npx serve:`sudo apt install npm`
- ROS Xacro: `sudo apt install ros-${ROS_DISTRO}-xacro`
- Gazebo ROS (incompatible with Jazzy): `sudo apt install ros-humble-gazebo-ros-pkgs`
- Joint State Publisher: `sudo apt install ros-humble-joint-state-publisher`

### Launch Script

- Run from workspace root where ./webUI is a direct sub-directory
- You may have to use multiple terminal windows as some commands may block (even with the &), all terminals used must run lines 1 and 2

```jsx
source /opt/ros/${ROS_DISTRO}/setup.bash
source install/setup.bash
ros2 run rosapi rosapi_node &
ros2 run rosbridge_server rosbridge_websocket &
ros2 launch rover_gazebo launch_gazebo.launch.xml &
ros2 run web_video_server web_video_server &
npx serve ./webUI
```

The first time running this will prompt you to install serve, install it. Open http://localhost:3000 in a web browser (tested in Firefox).
