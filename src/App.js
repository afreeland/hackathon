import React, { Component } from 'react';
import logo from './logo.svg';
import './App.css';
import axios from 'axios';

let apiUrl = 'http://localhost:8000';

let webcamStream;

//var uriBase = "https://westcentralus.api.cognitive.microsoft.com/face/v1.0/detect";

class ImageCapture extends Component {
  constructor(props){
    super(props);
    this.state = {
      webcamStream: null,
      getUserMedia: null
    }

    this.init();
    this.startWebcam = this.startWebcam.bind(this);
    this.stopWebcam = this.stopWebcam.bind(this);
    this.snapshot = this.snapshot.bind(this);
  }

  init(){
    this.state.getUserMedia = ( navigator.getUserMedia ||
                             navigator.webkitGetUserMedia ||
                             navigator.mozGetUserMedia ||
                             navigator.msGetUserMedia || navigator.mediaDevices.getUserMedia);
  }

  componentDidMount(){
    this.startWebcam();
  }

  startWebcam(){
    let self = this;
    if (navigator.getUserMedia) {
           navigator.getUserMedia (

              // constraints
              {
                 video: true,
                 audio: false
              },

              // successCallback
              function(localMediaStream) {
                  let video = document.querySelector('video');
                  video.src = window.URL.createObjectURL(localMediaStream);
                  webcamStream = localMediaStream;
              },

              // errorCallback
              function(err) {
                 console.log("The following error occured: " + err);
              }
           );
        } else {
          console.log("getUserMedia not supported");
        }
  }

  stopWebcam(){
    webcamStream.stop();
  }

  snapshot(){
    // Get the canvas and obtain a context for
    // drawing in it
    let canvas = this.myCanvas;
    let ctx = canvas.getContext('2d');
    // Draws current image from the video element into the canvas
    ctx.drawImage(this.video, 0,0, canvas.width, canvas.height);
  }

  render(){

    return (
      <div>
            {/*<p>
              <button onClick={this.startWebcam}>Start WebCam</button>
              <button onClick={this.stopWebcam}>Stop WebCam</button> 
                <button onClick={this.snapshot}>Take Snapshot</button> 
              </p>*/}
              <video onClick={this.snapshot} width="400" height="400" id="video" controls autoPlay ref={(video) => { this.video = video; }} ></video>
            <p> Screenshots : </p>
          <canvas  id="myCanvas" width="400" height="350" ref={(canvas) => { this.myCanvas = canvas; }} ></canvas>
      </div>
    )
  }
}



class Register extends Component {
  constructor(props){
    super(props);

    this.snapshot = this.snapshot.bind(this);

    this.state = {

    };

    this.submit = this.submit.bind(this);
  }

  snapshot(){
    // Get the canvas and obtain a context for
    // drawing in it
    let canvas = document.getElementById('RegisterCanvas');
    let ctx = canvas.getContext('2d');
    // Draws current image from the video element into the canvas
    ctx.drawImage(document.getElementById('video'), 0,0, canvas.width, canvas.height);
  }

  submit(e){
    let self = this;
    e.preventDefault();
    e.nativeEvent.stopImmediatePropagation();
    let canvas = document.getElementById('RegisterCanvas');
    var img    = canvas.toDataURL("image/png");

    let data = {
      firstName: document.getElementById('fName').value,
      lastName: document.getElementById('lName').value,
      summoner: document.getElementById('summoner').value,
      img: img
    }
    console.log(data);

    axios.post(apiUrl + '/register', data)
      .then((res) => {
        console.log(res.data);
        self.props.setUser(res.data);


      })
      .catch( (err) => {
        console.error(err);
      })
  }

  render(){
    return(
      <div className="container-fluid">
        <div className="row">
          <div className="col-6">
            <ImageCapture />
          </div>
          <div className="col-6">
            <form>
              <div className="form-row">
                <label htmlFor="fName">First Name</label>
                <input type="text" placeholder="Ash" id="fName"/>
              </div>
              <div className="form-row">
                <label htmlFor="lName">Last Name</label>
                <input type="text" placeholder="Ketchum" id="lName"/>
              </div>

              <div className="form-row">
                <label htmlFor="summoner">Summoner</label>
                <input type="summoner" placeholder="thafr33" id="summoner"/>
              </div>

              <div className="form-row">
                <div className="btn btn-primary" onClick={this.snapshot}>Take Snapshot =)</div>
                <canvas id="RegisterCanvas" width="400" height="350"></canvas>
              </div>

              <button type="submit" onClick={this.submit} className="btn btn-primary">Register</button>

            </form>
          </div>
        </div>
        
        
      </div>
    )
  }
}

class AutoLogin extends Component {
  constructor(props){
    super(props);
  }

  render(){
    return (
      <div>
        TODO: Auto-Login
      </div>

    )
  }
}

class Login extends Component{
  constructor(props){
    super(props);
    this.state = {
      registering: false
    }

    this.setRegistration = this.setRegistration.bind(this);
    this.fetchSummoner = this.fetchSummoner.bind(this);
  }

  setRegistration(val){
    this.setState({
      registering: val
    })
  }

  fetchSummoner(){
    let self =this;
    axios.get(apiUrl + '/summoner/' + document.getElementById('summoner').value)
      .then( (req) => {
        if(req.data.summoner){
          self.props.setUser(req.data);

          axios.get(apiUrl + '/get_and_populate_matches?name=' + req.data.summoner)
            .then( () => {

            })
            .catch((err) => {
              console.error(err);
            })
        }else{
          console.error('boooo no summoner, we failed you');
        }


        
      })
      .catch( (err) => {
        console.error(err);
      })
  }
  
  render(){
    let _register = this.setRegistration;
    let displayedComp = (this.state.registering === false) ? <AutoLogin /> : <Register setUser={this.props.setUser}/>
    return(
      <div className="container">
        <p className="App-intro">
          To get started, Login or Register below.
        </p>
        <input type="text" placeholder="Summoner Name" id="summoner"/>
        <div className="btn btn-primary" onClick={this.fetchSummoner} >Login</div>

        <div className="btn btn-primary" onClick={() => { _register(true) }}>Register</div>
        {displayedComp}
      </div>
    )
  }

}

class Authenticated extends Component {
  constructor(props){
    super(props);
  }
  render(){
    return (
      <div className="Authd">
        
        <div className="container-fluid">
          <div className="row">
            <div className="col-sm-3">
               <img src={this.props.user.img} width="200px" alt="Work plz =)" />
            </div>
            <div className="col-sm-3 summoner-title">
               <h2>Welcome Summoner</h2>
               <h3>{this.props.user.summoner}</h3>
            </div>
            <div className="col-sm-6">
              <div className="btn btn-primary" onClick={() => { this.props.setUser(null) } }>Logout</div>
            </div>
          </div>
        </div>
       
          
      </div>
    )
  }
}

class App extends Component {
  constructor(props){
    super(props);
    this.state = {
      user: null
    }

    this.setUser = this.setUser.bind(this);
  }

  setUser(user){
    this.setState({
      user: user
    })
  }

  render() {
    return (
      <div className="App">
        <header className="App-header">
          <img src="lol-logo.png" className="App-logo" alt="logo" />

        </header>

         { (this.state.user === null) ? <Login setUser={this.setUser}/> : <Authenticated user={this.state.user} setUser={this.setUser} />}
        
         
 
      </div>
    );
  }
}

export default App;
