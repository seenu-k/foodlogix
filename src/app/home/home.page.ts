import { Component } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Camera, CameraOptions } from '@ionic-native/camera/ngx';
import { ModalController } from '@ionic/angular';
import { FoodsPage } from '../foods/foods.page';

import { Dish } from './dish';
import { DISHES } from './dishlist';
import { DATA } from './data';

const subscriptionKey = '58c79d29f4c0464d944b5e64cb14b1bb';
const uriBase = 'https://westcentralus.api.cognitive.microsoft.com/face/v1.0/detect';
const myparams = {
  'returnFaceId': 'true',
  'returnFaceLandmarks': 'false',
  'returnFaceAttributes': 'age,gender,headPose,smile,facialHair,glasses,' +
      'emotion,hair,makeup,occlusion,accessories,blur,exposure,noise'
};
const options = {
  uri: uriBase,
  params: myparams,
  headers: {
      'Content-Type': 'application/octet-stream',
      'Ocp-Apim-Subscription-Key' : subscriptionKey
  }
};



@Component({
  selector: 'app-home',
  templateUrl: 'home.page.html',
  styleUrls: ['home.page.scss'],
})
export class HomePage {
  costInput = 100;
  hungInput = 60;
  heightInput = 1.75;
  weightInput = 65;
  happinessInput = 0.5;
  neutralInput = 0.5;
  sorrowInput = 0;
  cardCol = "";

  cameraoptions: CameraOptions = {
    quality: 50,
    destinationType: this.camera.DestinationType.DATA_URL,
    encodingType: this.camera.EncodingType.JPEG,
    mediaType: this.camera.MediaType.PICTURE,
    cameraDirection: this.camera.Direction.FRONT
  }
  b64toBlob(b64DataStr: string, contentType = '', sliceSize = 512){
    const byteCharacters = atob(b64DataStr);
    const byteArrays = [];
  
    for (let offset = 0; offset < byteCharacters.length; offset += sliceSize) {
      const slice = byteCharacters.slice(offset, offset + sliceSize);
  
      const byteNumbers = new Array(slice.length);
      for (let i = 0; i < slice.length; i++) {
        byteNumbers[i] = slice.charCodeAt(i);
      }
  
      const byteArray = new Uint8Array(byteNumbers);
      byteArrays.push(byteArray);
    }
  
    const blob = new Blob(byteArrays, { type: contentType });
    return blob;
  };

  constructor(public httpClient: HttpClient, private camera: Camera, public modalController: ModalController) {}
  onCam() {
    this.camera.getPicture(this.cameraoptions).then((imageData) => {
      this.cardCol="danger";
      //let base64Image = 'data:image/jpeg;base64,' + imageData;
      let imgblob = this.b64toBlob(imageData);
      this.httpClient.post(uriBase, imgblob, options).subscribe(data => {
        //console.log(data);
        this.happinessInput = data[0].faceAttributes.emotion.happiness;
        this.neutralInput = data[0].faceAttributes.emotion.neutral;
        this.sorrowInput = data[0].faceAttributes.emotion.sadness;
        this.cardCol = "success";
      });
    }, (err) => {
      console.log("HelloError");
      console.log(err);
    });
  }

  async presentModal(f1: number, f2: number, f3: number){
    const modal = await this.modalController.create({
      component: FoodsPage,
      componentProps: {'food1': f1, 'food2': f2, 'food3': f3}
    });
    return await modal.present();
  }

  onSuggest(){
    var i=0;
    var BMI, BMIFactor, CTemp;
    var C = new Array(DATA.length);
    var a1=200; //HungerSatiation
    var a2=50; //HealthBMI
    var a3=20; //SweetnessEmotions
    for(i=0; i<DATA.length; i++){
      if(DISHES[i].cost<=this.costInput){
        BMI = ((this.weightInput/(this.heightInput*this.heightInput))-21.75)/8;
        if(BMI<=0){
          BMIFactor = 0;
        }
        else{
          BMIFactor = BMI;
        }
        //C[i][1] = i;
        CTemp = a1*Math.abs((this.hungInput/100)-DATA[i][1])+a2*Math.abs(BMIFactor-DATA[i][2])+a3*Math.abs(this.happinessInput-DATA[i][3]);
        C[i] = [i, CTemp];
      }
    }
    C.sort(function(a,b){
      return a[1] - b[1];
    });
    this.presentModal(C[0][0], C[1][0], C[2][0]);
  }
}
