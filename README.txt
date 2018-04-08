## owncloud_bookmarks

Cloned from the (apparently abandoned) plugin on the Google Chrome App Store: 
> https://chrome.google.com/webstore/detail/owncloud-bookmarks/eomolhpeokmbnincelpkagpapjpeeckc

Slowly hacking it to make it work with Firefox

#### History

* **0.15** Add Bookmark hasn't worked since porting it over to firefox.  There's still some permissions issues (Can't get the active tab synchronously, and can't open a popup window *unless* I open the active tab synchronously.  Will hack on it a bit more later on.  For now, it just opens a new tab with the bookmarklet.)
* **0.14** Initially just had to poke a few things in the manifest to get it to work properly.  