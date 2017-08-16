# GML to JSON
  **This project is for browsing indoor spaces with 3D visualization tools (Cesium)**
  
## How you use
 1. Please download the node_modules folder.
 2. Input file path in 24 line and 26 line.
  2.1. "YOUR GML FILE PATH" is file path what you want to convert.
  2.2. "YOUR JSON FILE PATH" is file path what you want to get.
 3. Move your path of node js into the gmltoJSON folder.
 4. Open the node js bash, and input "node server.js"
 5. Open the web, and Move to "localhost:8080"
 6. you can get JSON file
 
## How to modify file name
 1. In the gmltoJSON folder, open the server.js file.
 2. 24 line, you can modify "./addstair.gml" to name of your gml file what you want to convert.
 3. 26 line, you can modify "addstair.json" to name of your json file what you want to get.
 
## To be done in the future
 1. Modify the way to execute. I want to run it through "locally" or only main "server.js".
 2. Refactoring. You should modify your file name easily.


## Authors
  * Eun Kwon - Pusan National University (mount_e@naver.com)