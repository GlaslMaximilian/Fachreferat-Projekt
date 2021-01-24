import tensorflow as tf
import tensorflowjs as tfjs
from tensorflow import keras

(train_img, train_label),(test_img,test_label) = keras.dataset.mnist.load_data()

train_img = train_img.reshape([-1,28,28,1])
test_img = test_img.reshape([-1,28,28,1])
train_img = train_img/255.0
test_img = test_img/255.0

train_label = keras.utils.to_categorical(train_label)
test_label = keras.utils.to_categorical(test_label) 