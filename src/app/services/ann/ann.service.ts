import {Injectable} from '@angular/core';
import * as tf from '@tensorflow/tfjs';

@Injectable({
  providedIn: 'root'
})
export class AnnService {

  model;

  constructor() { }

  createModel() {
    this.model = tf.sequential();
    this.model.add(tf.layers.dense({units: 12, inputShape: [6]}));
    this.model.add(tf.layers.dense({units: 12, inputShape: [12]}));
    this.model.add(tf.layers.dense({units: 4, inputShape: [12]}));
    this.model.compile({loss: 'meanSquaredError', optimizer: 'sgd'});
  }

  async fit(aboveHead, belowHead, leftHead, rightHead, foodX, foodY, scoreUp, scoreDown, scoreLeft, scoreRight) {
    console.log('fit');
    const inputData = tf.tensor2d([[aboveHead, belowHead, leftHead, rightHead, foodX, foodY]], [1, 6]);
    const outputData = tf.tensor2d([[scoreUp, scoreDown, scoreLeft, scoreRight]], [1, 4]);
    await this.model.fit(inputData, outputData);
  }

  async getPrediction(aboveHead, belowHead, leftHead, rightHead, foodX, foodY) {
    const prediction = await this.model.predict(tf.tensor2d([[aboveHead, belowHead, leftHead, rightHead, foodX, foodY]], [1, 6])).dataSync();
    console.log('prediction', prediction);
    return prediction.indexOf(Math.max(...prediction));
  }

}
