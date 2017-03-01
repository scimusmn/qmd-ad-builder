import { BrowserPolicy } from 'meteor/browser-policy-common';

// e.g., BrowserPolicy.content.allowOriginForAll( 's3.amazonaws.com' );
BrowserPolicy.content.allowFontOrigin('data:');

// This allows local camera access.
BrowserPolicy.content.allowImageOrigin('blob:');
const constructedCsp = BrowserPolicy.content._constructCsp();
BrowserPolicy.content.setPolicy(constructedCsp + ' media-src blob:;');
