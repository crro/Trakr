// Copyright (c) 2011 The Chromium Authors. All rights reserved.
// Use of this source code is governed by a BSD-style license that can 
// found in the LICENSE file.

// Called when the user clicks on the browser action.
chrome.browserAction.onClicked.addListener(function(tab) {
	// No tabs or host permissions needed!
	console.log('Making this shit work');
	chrome.tabs.executeScript({
    	code: 'trakr.enable = trakr.enable ? false : true;'
	}); 
});