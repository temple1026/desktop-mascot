from websocket_server import WebsocketServer
import json

import random
from ast import literal_eval
# import logging

class Websocket_Server():

    def __init__(self, host, port):
        # self.server = WebsocketServer(port, host=host, loglevel=logging.DEBUG)
        self.server = WebsocketServer(port, host=host)
    
    # クライアント接続時に呼ばれる関数
    def new_client(self, client, server):
        print("new client connected and was given id {}".format(client['id']))
        # 全クライアントにメッセージを送信
        # self.server.send_message_to_all("hey all, a new client has joined us")

    # クライアント切断時に呼ばれる関数
    def client_left(self, client, server):
        print("client({}) disconnected".format(client['id']))

    # クライアントからメッセージを受信したときに呼ばれる関数
    def message_received(self, client, server, message):
        send_message = ""
        if "mylive2d" in message:
            # message_dict = json.loads(str("\"" + message + "\""))
            message_dict = literal_eval(message)
            # print(type(message_dict), type(message))
            # print(message_dict)
            if message_dict["id"] == "mylive2d":
                if random.randrange(10) > 5:
                    print("smile")
                    send_message = json.dumps({"id":"mylive2d", "text":"smile"})
                else:
                    print("idle")
                    send_message = json.dumps({"id":"mylive2d", "text":"normal"})
                    
        self.server.send_message_to_all(send_message)
    
    # サーバーを起動する
    def run(self):
        # クライアント接続時のコールバック関数にself.new_client関数をセット
        self.server.set_fn_new_client(self.new_client)
        # クライアント切断時のコールバック関数にself.client_left関数をセット
        self.server.set_fn_client_left(self.client_left)
        # メッセージ受信時のコールバック関数にself.message_received関数をセット
        self.server.set_fn_message_received(self.message_received) 
        self.server.run_forever()

IP_ADDR = "localhost" # IPアドレスを指定
PORT=7700 # ポートを指定
ws_server = Websocket_Server(IP_ADDR, PORT)
ws_server.run()
