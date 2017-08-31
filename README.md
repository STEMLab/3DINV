# **3DINV**

**3D Indoor Navigation Viewer.**</br>
 When navigating indoor spaces using a map application, the user will expect to no longer move forward in a situation facing the wall. However, in a real map application, when you meet a wall, you often pass through a wall and move to the next room. In addition, when you move the camera with the mouse wheel, it does not give you the feeling that you are moving in space continuously, but it gives you the discrete changing scene.

There are two main reasons why the current indoor viewer has the above problems.

First, the viewer can not detect the collision of the user's movement route with the wall or other structure. In other words, the indoor viewer does not have a function for detecting collision.

And discrete shooting the search space is another cause. Since the camera is fixed at a regular interval and shot 360 degrees, the camera is not moving continuously as in the real world, but rather it stops at each point and looks around the building.

To solve these problems, we should use network information to define the camera moving path.
This indoor network information is predefined in indoorGML data.
The user will browse the indoor space only through the predefined network, which can prevent the collision and give continuity to the indoor space seen by the user. Through this, the project can solve the problems that the indoor viewer is currently facing, and establish a more comfortable browsing environment.

Specific specifications for this project can be found [here]( https://www.overleaf.com/read/hxtcpypzhchw).

## Getting Started
### Installing
1. The viewer which made by this project is based on Cesium.</br>
You need to download and install [Ceisium](https://cesiumjs.org/downloads.html) and [Node.js](https://nodejs.org/en/).</br>
Make one of root directory and download Cesium in it are recommended.
2. Open a command shell in root directory and download and install the required modules by executing `npm install`.
3. Download this project on root directory.</br>
Make sure `node_modules` is overwrite `node_modules` which installing by 2 in the root directory. This folder have addition file for *GML to JSON*.
4. Start the web server by executing `node server.js`.

## Running the tests
This project provides 'Demo.html' as an example of a project, but since this does not provide gml or json files, you should have your own gml or json files for running deom.</br></br>
If you have an json file that converted from gml : </br>
1. Change the contents of lines 13, 19, 24, 26 and 28 in `3DINV/Cesium/js/main.js` to match your json file.
2. Launch a browser and open html file. http://localhost:8080/Cesium/Apps/Demo.html


If you have an gml file : </br>
1. Convert gml to json using `3DINV/gmltoJSON/gmlToJson.js`.</br>
Input the file paths in 24 line and 26 line in `gmlToJson.js`.
2. move `gmlToJson.js` to root directory and start the web server by executing `node gmlToJon.js`.
3. Open the web, and Move to "localhost:8080". Then you can get json file.
4. Restarting web server using `server.js` and follow the step in case of having json file to run the demo.


## Authors
* Mouna Harrach - Engineering student in French National School of Geomatics (harrach dot mouna at hotmail dot com)
* Suhee Jung - Engineering student in Pusan National University (lalune1120 at hotmail dot com)
* Eun Kwon - Engineering student in Pusan National University (mount_e at naver dot com)

## License
This project is licensed under the Apache License - see the LICENSE.md file for details
