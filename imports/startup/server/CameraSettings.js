import { Meteor } from 'meteor/meteor';
import UVCControl from 'uvc-control';

//   UVC Options
// • autoExposureMode
// • autoExposurePriority
// • absoluteExposureTime
// • absoluteFocus
// • absoluteZoom
// • absolutePanTilt
// • autoFocus
// • brightness
// • contrast
// • saturation
// • sharpness
// • whiteBalanceTemperature
// • backlightCompensation
// • gain
// • autoWhiteBalance

// On startup
Meteor.startup(() => {
  let camera = null;
  let currentVendorId = Meteor.settings.public.camVendorId;
  let currentProductId = Meteor.settings.public.camProductId;
  let startExposure = Meteor.settings.public.camStartExposure;

  // TODO: Here, we should automatically set
  // the settings we know we'll never change. (e.g., exposure mode)
  // Only expose the settings that are actually
  // useful from environment to enviroment.
  // (this might be ONLY exposure)

  function connectToCamera() {

    if (camera != null) {
      camera.close();
      camera = null;
    }

    // TODO- these vendor/product ids should come
    // from settings file or settings UI
    if (!currentVendorId  || !currentProductId) {
      console.log('Warning. Exiting camera control. Both camVendorId & camProductId must exist in settings.');
      return;
    }

    console.log('CameraSettings -> Connecting Camera', currentVendorId, currentProductId);
    camera = new UVCControl(currentVendorId, currentProductId);

    // Allow manual exposure
    camera.set('autoExposureMode', 1, function(error) {
      if (error) return console.log('ERROR exposure mode', error);
      console.log('autoExposureMode Set Successfully.');
    });

    if (startExposure) {
      updateExposure(startExposure);
    }

  }

  function updateExposure(exposure) {
    if (camera) {

      camera.range('absoluteExposureTime', function(error, range) {
          if (error) return console.log('ERROR exposure range:', error);
          console.log('absoluteExposureRange:', range);
        });

      camera.set('absoluteExposureTime', exposure, function(error) {

        if (error) return console.log('ERROR exposure set:', error);
        console.log('absoluteExposureRange:', exposure);

      });
    } else {
      console.log('Camera not ready. Unable to set exposure.');
    }

  }

  // Init
  Meteor.setTimeout(()=> {

    connectToCamera();

  }, 10001);

  /*
   * Expose methods
   * to client.
   */
  Meteor.methods({

    setTargetUVCDevice: function(deviceInfo) {
      check(deviceInfo, Object);
      console.log('Meteor.methods.setTargetUVCDevice', deviceInfo);

      // Convert string to hex code
      const hexVendor = parseInt(deviceInfo.vendorId, 16);
      const hexProduct = parseInt(deviceInfo.productId, 16);

      if (hexVendor != currentVendorId || hexProduct != currentProductId) {

        currentVendorId = hexVendor;
        currentProductId = hexProduct;

      }

    },

    setAbsoluteExposure: function(exposure) {

      check(exposure, Number);

      // temp - Do not allow external updating
      // updateExposure(exposure);

    },

  });

});
