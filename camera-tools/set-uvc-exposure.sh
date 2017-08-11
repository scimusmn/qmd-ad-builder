#!/bin/sh

# Manually sets exposure
# of UVC compliant USB Camera.

# Requires uvc-ctrl [http://www.dm9.se/?p=734]
# and dependency libusb [http://www.dm9.se/?p=659]
# Copies of both are included in this directory, but
# need to be installed on your machine.

# This script assumes the camera
# you're targeting is Device #3 and
# the desired exposure time is 25 ms.

# Adjust the commands as neccessary
# to match your camera and lighting.

# Note - If script isn't working,
# try resetting usb connection to
# the camera with following command.
# -> sudo killall VDCAssistant

# enumerate available devices
uvc-ctrl -e

# set auto-exposure mode to 'manual' on Device #3
uvc-ctrl -s 1 3 3

# set absolute exposure to 25 milliseconds on Device #3
uvc-ctrl -s 25 4 3

# keep shell window open...
$SHELL