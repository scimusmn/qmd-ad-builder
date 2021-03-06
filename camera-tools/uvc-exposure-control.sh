#!/bin/sh

# Manually sets exposure
# of UVC compliant USB Camera.

# Requires uvc-ctrl [http://www.dm9.se/?p=734]
# and dependency libusb [http://www.dm9.se/?p=659]
# Copies of both are included in this directory, but
# need to be installed before running this script.

# This script assumes the camera
# you're targeting is Device #3 and
# the desired exposure time is 25 ms.
# Adjust the commands as neccessary for
# your situation.

# Debug tip - If script isn't working,
# try resetting usb connection to
# the camera with following command.
# $ sudo killall VDCAssistant

# enumerate available devices
uvc-ctrl -e

# set auto-exposure mode to 'manual' on Device #3
uvc-ctrl -s 1 3 3

# set absolute exposure to 27 milliseconds on Device #3
uvc-ctrl -s 27 4 3

# keep shell window open...
$SHELL
