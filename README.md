# qmd-ad-builder
Learn to recognize red flags in advertising by constructing your own questionable advertisement.

## Install Instructions
1) If Meteor isn't installed on your machine, install via Terminal: `curl https://install.meteor.com/ | sh`
2) Clone this repo from desired directory. `git clone https://github.com/scimusmn/qmd-ad-builder.git`
2) Run `meteor npm install` from project directory.

## Launch Instructions
1) Using Terminal, change directories into project. e.g. `cd ~/Desktop/qmd-ad-builder`
2) Run `meteor --settings settings-kiosk.json` from project directory.
3) Navigate Google Chrome to `http://localhost:3000/`


## Usage Notes
• Pressing the `D` key toggles the debug view. Pressing the `LEFT` and `RIGHT` keys cycle through assets for 'active' item.

• In debug mode, you can drag the corners of the quad in the upper-left so it fits the area you'd like to track. This remaps the distorted coordinates from the camera space into the poster space.

• If USB camera is not recognized after plugging in, try running these two commands in succession:
```
  sudo killall VDCAssistant
  sudo killall AppleCameraAssistant
```
