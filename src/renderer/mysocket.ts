import { MyModel } from "./mymodel"

export class mySocket extends WebSocket{
  mymodel: MyModel = null;

  constructor(url: string, mymodel: MyModel){
    super(url);
    this.mymodel = mymodel;

    this.addEventListener("open", function(event){
      console.log("Connection successed.");
    });

    this.addEventListener("message", function(event){
      var msg = JSON.parse(event.data);
      switch(msg.id){
        case "mylive2d":
          if(msg.text == "smile"){
            console.log(msg.text);
            this.mymodel.startMotion("Smile", 0, 3);
          }
      }
    }.bind(this));
  }

  public askAction(){
      var msg = {
      type: "message",
      text: "mylive2d",
      id: "mylive2d",
      date: Date.now()
      }

      this.send(JSON.stringify(msg));
  }
}