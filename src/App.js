import React, { Component } from 'react';
import './App.css';
import Clarifai from 'clarifai';
import Navigation from './components/navigation/navigation.js';
import FaceRecognition from './components/FaceRecognition/FaceRecognition.js';
import Logo from './components/Logo/logo.js';
import ImageLinkForm from './components/ImageLinkForm/ImageLinkForm.js';
import SignIn from './components/SignIn/SignIn.js';
import Register from './components/Register/Register.js';
import Rank from './components/Rank/Rank.js';
import Particles from 'react-particles-js';

const app = new Clarifai.App({
  apiKey: '6d2fa176ba7a4a4aa2894321676216ef'
 });

const particleOptions = {
  particles: {
    number: {
      value: 110,
      density: {
        enable: true,
        value_area: 800
      }
    }
  }
}

class App extends Component {
  constructor() {
    super();
    this.state = {
      input: '',
      imageUrl: '',
      box: {}, 
      route:'signin',
      isSignedIn: false
    }
  }

  calculateFaceBox = (data) => {
    const face = data.outputs[0].data.regions[0].region_info.bounding_box;
    const image = document.getElementById('inputimage');
    const width = Number(image.width);
    const height = Number(image.height);
    console.log(width, height);
    return {
      leftCol: face.left_col * width,
      topRow: face.top_row * height,
      rightCol: width - (face.right_col * width),
      bottomRow: height - (face.bottom_row * height)
    }
  }

  onInputChange = (event) => {
    this.setState({ input: event.target.value });
  }

  onEnterPress = (event) => {
    if (this.state.input.length > 0 && event.key === 'Enter') {
      this.setState({ input: event.target.value });
      this.onButtonSubmit();
    }
  }

  onButtonSubmit = () => {
    this.setState({imageUrl: this.state.input});
    app.models
      .predict(Clarifai.FACE_DETECT_MODEL, this.state.input)
      .then(response => {
        // do something with response
        this.displayFace(this.calculateFaceBox(response));
      },
      err => {
        // there was an error
        console.log(err);
      }
    );
  }

  onRouteChange = (route) => {
    if(route === 'signout') {
      this.setState({isSignedIn: false});
    } else if (route === 'home') {
      this.setState({isSignedIn: true});
    }
    this.setState({ route: route});
  }

  displayFace = (box) => {
    this.setState( { box: box });
  }

  render () {
    return (
      <div className="App">
        <Particles className='particles'
          params={particleOptions} />
        <Navigation isSignedIn={this.state.isSignedIn} onRouteChange={this.onRouteChange}/>
        {this.state.route === 'home' 
          ? <div>
              <Logo />
              <Rank />
              <ImageLinkForm onInputChange={this.onInputChange} onButtonSubmit={this.onButtonSubmit} onEnterPress= {this.onEnterPress}/>
              <FaceRecognition box= {this.state.box} imageUrl={this.state.imageUrl}/>
            </div>
          : 
            this.state.route ==='signin' || this.state.route === 'signout'
              ? <SignIn onRouteChange={this.onRouteChange}/>
              : <Register onRouteChange={this.onRouteChange}/>
        }
      </div>
    );
  }
}

export default App;
