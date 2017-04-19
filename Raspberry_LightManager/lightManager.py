import wiringpi
import time
import math
import OSC
import threading

io = wiringpi.GPIO(wiringpi.GPIO.WPI_MODE_PINS)
io.pinMode(1,io.PWM_OUTPUT)
io.pwmWrite(1,0)
bright = 0
brightTarget = 0;
receive_address = '10.0.0.25', 9001

io.pwmWrite(1,bright)

def sign(a,b):
    if(a < b):
        return 1
    else:
        return -1

def updateBright():
    # global bright
    # for i in range(bright,newBright,sign(bright,newBright)):
    #     io.pwmWrite(1,int(newBright*600/100))
    #     time.sleep(0.015)
    # bright = newBright
    global bright
    if(bright!=brightTarget):
        bright +=sign(bright,brightTarget)*1
        io.pwmWrite(1,int(bright*700/100))
        time.sleep(0.015)


# OSC Server. there are three different types of server.
s = OSC.ThreadingOSCServer(receive_address)
# this registers a 'default' handler (for unmatched messages)
s.addDefaultHandlers()

# define a message-handler function for the server to call.
def printing_handler(addr, tags, stuff, source):
    global brightTarget
    global bright
    if addr=='/light':
        print "New target light ", stuff[0]
        brightTarget = int(stuff[0])
    if addr=='/getlight':
        client = OSC.OSCClient()
        msg = OSC.OSCMessage()
        msg.setAddress("/getlight")
        msg.append(bright)
        client.sendto(msg, (source[0], 8080))
        msg.clearData()
        print "Send ",msg, "value: ",bright, source[0]


s.addMsgHandler("/light", printing_handler)
s.addMsgHandler("/getlight", printing_handler)

def main():
    # Start OSCServer
    print "Starting OSCServer"
    st = threading.Thread(target=s.serve_forever)
    st.start()
    try:
        while 1:
            updateBright()
    except KeyboardInterrupt:
        s.running = False
        print("Stop!")

main()
