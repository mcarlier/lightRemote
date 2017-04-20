# lightRemote
Server Node for Footfall installation.

Communication between :
    Footfall openframework program (on computer A) https://github.com/mcarlier/FootFall
    NodeJS server (on computer A) https://github.com/mcarlier/lightRemote/tree/master/Raspberry_LightManager
    lightManager.py (on Raspberry pi) https://github.com/mcarlier/lightRemote

/!\ nodeJs server need Raspberry pi Ip (in index.js l.5).
/!\ nodeJs server computerA Ip (in index.html l.49).
/!\ lightManager.py need Raspberry pi Ip (in lightManager.py l.12)

Run the 3 app then connect on the node server using : http://computerAIP:8080
