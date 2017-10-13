# SRejects Stream Overlay  
This is my stream overlay. Its still largely a work in progress but much of
the scoffolding is done.


# Basic Configuring
The main config file can be found as `/config/config.js` and may be edited to suit
your needs. Its commented to indicate what each value does.  

More in-depth configuration instructions for each widget can be found within the
widget's resource directory(`/widgets/{widget}/CONFIG.md`)


# OBS-Studio Setup

### Required command-line parameters
Various widgets violate certain web-browser based security protocols; namely,
cross-site access. For typical webpages, cross-site access can be a security
issue, but since this is being ran locally that isn't a concern and thus such
security measures are a hindrance.  

To use this overlay, OBS-Studio needs to be executed with a few command-line
parameters that disable certain security protocols:

> `--user-dir="PATH" --disable-web-security --allow-file-access-from-files --unsafely-treat-insecure-origin-as-secure=file:// --unsafely-allow-protected-media-identifier-for-domain=*`  
> where `PATH` is a directory of with the OBS-Studio BrowserSource used by the
overlay will store information.  

* `--user-dir="path"`: required for all other command-line parameters to have effect  
* `--disable-web-security`: allows for cross-site access
* `--allow-file-access-from-files`: Allows widgets to access the file system  
* `--unsafely-treat-insecure-origin-as-secure=file://`: required to access hardware information
* `--unsafely-allow-protected-media-identifier-for-domain=*`: Allows widgets to retrieve hardware information(such as the name of audio devices) without having to prompt the user

Its recommended to create a shortcut/symlink that executes OBS-Studio with the
command line parameters from above.

### Setup and run Configure page
1. Create a BrowserSource on your first scene; use the `Create New` option and give it a name.  
2. In the `Properties` window that appears, input the URL as `file://__PATH__/overlay/configure.html` where `__PATH__` is the path to the overlay directory  
3. Set the width property to 1024 and the height property to 720  
3. Click `OK`  
4. Under `Sources` click on the BrowserSource then right-click it  
5. Select "Interact"  
6. Follow the instructions until it navigates you to the overlay page  
7. Close the interact window  
8. Right-click the BrowserSource under `Sources` again  
9. Set the path to `file://__PATH__/overlay/overlay.html` where `__PATH__` is the path to the overlay directory.  

_You can repeat steps 2-9 as needed to run the reconfigure page_  

After the BrowserSource has been configured, add it to all major scenes:  
1. Select a scene  
2. Create a BrowserSource for the scene  
3. Select `Add Existing` and select the BrowserSource from above  
4. Repeat steps 1-3 for all major scenes
