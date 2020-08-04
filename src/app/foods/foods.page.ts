import { Component, OnInit, Input } from '@angular/core';
import { ModalController, ToastController } from '@ionic/angular';

import { Dish } from '../home/dish';
import { DISHES } from '../home/dishlist';

@Component({
  selector: 'app-foods',
  templateUrl: './foods.page.html',
  styleUrls: ['./foods.page.scss'],
})
export class FoodsPage implements OnInit {

  @Input() food1: number;
  @Input() food2: number;
  @Input() food3: number;

  constructor(private modalController: ModalController, public toastController: ToastController) { }

  ngOnInit() {
  }

  Foods = DISHES;

  async closeModal(){
    await this.modalController.dismiss();
  }

  async presentToast(){
    const toast = await this.toastController.create({
      message: 'Your feedback has been saved',
      duration: 2000
    });
    toast.present();
  }

}
