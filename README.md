# qmd-ad-builder
Learn to recognize red flags in advertising by constructing your own questionable advertisement.


### Launch Instructions

1) If Meteor isn't installed on your machine, install via Terminal: `curl https://install.meteor.com/ | sh`
2) Run `meteor npm install` from project directory
3) Run `meteor --settings settings-kiosk.json` from project directory.
4) Navigate Google Chrome to `http://localhost:3000/`


### Notes
• Pressing the `D` key brings up the debug view.

• On debug screen you can drag the corners of the quad in the upper-left to fit the area to map for tracking. This remaps the (potentially) distorted coordinates from the camera onto the poster space.

• If USB camera is not being recognized after plugging in, try running these two commands in succession:

  `sudo killall VDCAssistant`
  
  `sudo killall AppleCameraAssistant`
