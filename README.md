# **3DINV**

**3D Indoor Navigation Viewer.**</br>
  When navigating indoor spaces using a map application, the user will expect to no longer move forward in a situation facing the wall. However, in a real map application, when you meet a wall, you often pass through a wall and move to the next room. These problems are caused by the data used to build indoor viewer. Mostly, that "data" is collect point by point. So it might be can't distinguish wall between an point and the other and the distance between two point might be quite long. And it will cause problems such as sudden dropping or teleporting.

  In this project, we propose a viewer that restricts user's movement more strictly by using IndoorGML data. IndoorGML is a language that defines indoor space data including network. By using this data to constrain the space the user can move, the above mentioned problem can be solved.

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
This project is licensed under the Apache License - see the [LICENSE](https://github.com/STEMLab/3DINV/blob/master/LICENSE) file for details
