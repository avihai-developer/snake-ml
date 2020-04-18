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
    this.model.add(tf.layers.dense({units: 16, inputShape: [4]}));
    this.model.add(tf.layers.dense({units: 16, inputShape: [16]}));
    this.model.add(tf.layers.dense({units: 4, inputShape: [16]}));
    this.model.compile({loss: 'meanSquaredError', optimizer: tf.train.sgd(0.01)});
  }

  async fit(aboveHead, belowHead, leftHead, rightHead, scoreUp, scoreDown, scoreLeft, scoreRight) {
    const inputData = tf.tensor2d([[aboveHead, belowHead, leftHead, rightHead]], [1, 4]);
    const outputData = tf.tensor2d([[scoreUp, scoreDown, scoreLeft, scoreRight]], [1, 4]);
    await this.model.fit(inputData, outputData, {epochs: 25});
  }

  async getPredictions(aboveHead, belowHead, leftHead, rightHead) {
    return this.model.predict(tf.tensor2d([[aboveHead, belowHead, leftHead, rightHead]], [1, 4])).dataSync();
  }

}
